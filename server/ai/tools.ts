/**
 * tools.ts — Agent tool definitions and implementations.
 *
 * POLICY:
 *   - list_kits          → read-only, no auth needed
 *   - create_purchase_request → writes a pending paypal_order and plan row.
 *                          NEVER executes a payment. Sends to parent queue.
 *   - get_order_status   → read-only on own learner's orders
 *   - list_recent_activity → read-only on own learner's completed orders
 *
 * Each tool logs to agent_audit_log (no personal data in the log).
 */

import { db, paypalOrders, agentAuditLog, agentPlans, familySettings } from '../db/index.js';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { KITS, type Kit } from '../data/kits.js';
import { nanoid } from '../utils/nanoid.js';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ToolContext {
  planId: string;
  learnerId: string;
  familyId: string;
  parentId: string;
}

export interface ToolResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}

// ── OpenAI function-calling schema ────────────────────────────────────────────

export const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'list_kits',
      description:
        'List all available practice kits the learner can request. Returns kit id, name, description, price and Practice Dollars awarded.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_purchase_request',
      description:
        'Propose a kit purchase to the parent for approval. This NEVER charges any money — it only puts a request into the parent\'s approval queue. Call this only after you have confirmed which kit is right for the learner\'s goal.',
      parameters: {
        type: 'object',
        properties: {
          kit_id: {
            type: 'string',
            description: 'The id of the kit to request (from list_kits)',
          },
          reason: {
            type: 'string',
            description:
              'Plain-language explanation (1–2 sentences) of why this kit fits the learner\'s goal. Shown to the parent.',
          },
        },
        required: ['kit_id', 'reason'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_order_status',
      description:
        'Check the status of a previously created purchase request.',
      parameters: {
        type: 'object',
        properties: {
          order_id: {
            type: 'string',
            description: 'The order id returned by create_purchase_request',
          },
        },
        required: ['order_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'list_recent_activity',
      description:
        'List the learner\'s last 5 completed kit purchases and Practice Dollar balance.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
] as const;

export type ToolName = 'list_kits' | 'create_purchase_request' | 'get_order_status' | 'list_recent_activity';

// ── Audit helper ─────────────────────────────────────────────────────────────

async function audit(
  ctx: ToolContext,
  tool: string,
  input: Record<string, unknown>,
  output: Record<string, unknown>,
  durationMs: number,
) {
  // Log without personal data — no email, no name, no PIN
  await db.insert(agentAuditLog).values({
    id: nanoid(),
    planId: ctx.planId,
    learnerId: ctx.learnerId,
    tool,
    input: JSON.stringify(input),
    output: JSON.stringify(output),
    durationMs,
    createdAt: new Date(),
  });
  console.log(`[agent-audit] tool=${tool} plan=${ctx.planId.slice(0, 8)} ok=${String(output.ok ?? true)}`);
}

// ── Tool implementations ──────────────────────────────────────────────────────

async function listKits(ctx: ToolContext): Promise<ToolResult> {
  const t0 = Date.now();
  const data = KITS.map((k: Kit) => ({
    id: k.id,
    name: k.name,
    description: k.description,
    priceUsd: k.priceUsd,
    practiceDollarsAwarded: k.practiceDollarsAwarded,
    emoji: k.emoji,
  }));
  await audit(ctx, 'list_kits', {}, { ok: true, count: data.length }, Date.now() - t0);
  return { ok: true, data };
}

async function createPurchaseRequest(
  ctx: ToolContext,
  args: { kit_id: string; reason: string },
): Promise<ToolResult> {
  const t0 = Date.now();

  // 1. Check agent is enabled for this family
  const [settings] = await db
    .select()
    .from(familySettings)
    .where(eq(familySettings.familyId, ctx.familyId));

  if (settings && !settings.agentEnabled) {
    const result = { ok: false, error: 'agent_disabled' };
    await audit(ctx, 'create_purchase_request', { kit_id: args.kit_id }, result, Date.now() - t0);
    return { ok: false, error: 'The parent has turned off the AI agent for purchases.' };
  }

  // 2. Check weekly spending cap
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyRows = await db
    .select({ total: sql<number>`sum(amount_usd * 100)` })
    .from(paypalOrders)
    .where(
      and(
        eq(paypalOrders.parentId, ctx.parentId),
        gte(paypalOrders.createdAt, weekAgo),
      ),
    );
  const weeklySpentCents = weeklyRows[0]?.total ?? 0;
  const capCents = settings?.weeklyCapCents ?? 1000;

  // 3. Look up kit
  const kit = KITS.find((k: Kit) => k.id === args.kit_id);
  if (!kit) {
    const result = { ok: false, error: 'kit_not_found' };
    await audit(ctx, 'create_purchase_request', { kit_id: args.kit_id }, result, Date.now() - t0);
    return { ok: false, error: `Kit "${args.kit_id}" not found. Call list_kits to see available kits.` };
  }

  const kitCents = Math.round(parseFloat(kit.priceUsd) * 100);
  if (weeklySpentCents + kitCents > capCents) {
    const remaining = ((capCents - weeklySpentCents) / 100).toFixed(2);
    const result = { ok: false, error: 'cap_exceeded', remaining };
    await audit(ctx, 'create_purchase_request', { kit_id: args.kit_id }, result, Date.now() - t0);
    return {
      ok: false,
      error: `Weekly spending cap reached. $${remaining} remaining this week.`,
    };
  }

  // 4. Check for duplicate pending request
  const dupeRows = await db
    .select()
    .from(paypalOrders)
    .where(
      and(
        eq(paypalOrders.learnerId, ctx.learnerId),
        eq(paypalOrders.kitId, args.kit_id),
        eq(paypalOrders.status, 'pending_agent'),
      ),
    )
    .limit(1);

  if (dupeRows.length > 0) {
    const result = { ok: false, error: 'duplicate_request', orderId: dupeRows[0].id };
    await audit(ctx, 'create_purchase_request', { kit_id: args.kit_id }, result, Date.now() - t0);
    return {
      ok: false,
      error: `There is already a pending request for the ${kit.name}. Order id: ${dupeRows[0].id}`,
    };
  }

  // 5. Create the pending order (no PayPal call yet — parent must approve first)
  const orderId = nanoid();
  const requestId = `agent-${nanoid()}`;
  await db.insert(paypalOrders).values({
    id: orderId,
    requestId,
    kitId: kit.id,
    learnerId: ctx.learnerId,
    parentId: ctx.parentId,
    amountUsd: parseFloat(kit.priceUsd),
    practiceDollarsAwarded: kit.practiceDollarsAwarded,
    xpAwarded: kit.xpAwarded,
    status: 'pending_agent',
    createdAt: new Date(),
  });

  // 6. Update the plan row with the chosen kit and order
  await db
    .update(agentPlans)
    .set({ kitId: kit.id, orderId, updatedAt: new Date() })
    .where(eq(agentPlans.id, ctx.planId));

  const result = {
    ok: true,
    orderId,
    kitName: kit.name,
    priceUsd: kit.priceUsd,
    practiceDollarsAwarded: kit.practiceDollarsAwarded,
    reason: args.reason,
    status: 'pending_parent_approval',
  };
  await audit(ctx, 'create_purchase_request', { kit_id: args.kit_id }, result, Date.now() - t0);
  return { ok: true, data: result };
}

async function getOrderStatus(
  ctx: ToolContext,
  args: { order_id: string },
): Promise<ToolResult> {
  const t0 = Date.now();
  const [order] = await db
    .select()
    .from(paypalOrders)
    .where(
      and(
        eq(paypalOrders.id, args.order_id),
        eq(paypalOrders.learnerId, ctx.learnerId), // learner can only see own orders
      ),
    )
    .limit(1);

  if (!order) {
    const result = { ok: false, error: 'not_found' };
    await audit(ctx, 'get_order_status', { order_id: args.order_id.slice(0, 8) }, result, Date.now() - t0);
    return { ok: false, error: 'Order not found.' };
  }

  const result = {
    ok: true,
    status: order.status,
    kitId: order.kitId,
    amountUsd: order.amountUsd,
    completedAt: order.completedAt?.getTime() ?? null,
  };
  await audit(ctx, 'get_order_status', { order_id: args.order_id.slice(0, 8) }, result, Date.now() - t0);
  return { ok: true, data: result };
}

async function listRecentActivity(ctx: ToolContext): Promise<ToolResult> {
  const t0 = Date.now();
  const rows = await db
    .select()
    .from(paypalOrders)
    .where(
      and(
        eq(paypalOrders.learnerId, ctx.learnerId),
        eq(paypalOrders.status, 'completed'),
      ),
    )
    .orderBy(desc(paypalOrders.createdAt))
    .limit(5);

  const data = rows.map((r) => ({
    orderId: r.id,
    kitId: r.kitId,
    practiceDollarsAwarded: r.practiceDollarsAwarded,
    completedAt: r.completedAt?.getTime() ?? null,
  }));

  await audit(ctx, 'list_recent_activity', {}, { ok: true, count: data.length }, Date.now() - t0);
  return { ok: true, data };
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

export async function callTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<ToolResult> {
  switch (name as ToolName) {
    case 'list_kits':
      return listKits(ctx);
    case 'create_purchase_request':
      return createPurchaseRequest(ctx, args as { kit_id: string; reason: string });
    case 'get_order_status':
      return getOrderStatus(ctx, args as { order_id: string });
    case 'list_recent_activity':
      return listRecentActivity(ctx);
    default:
      return { ok: false, error: `Unknown tool: ${name}. Available tools: list_kits, create_purchase_request, get_order_status, list_recent_activity.` };
  }
}
