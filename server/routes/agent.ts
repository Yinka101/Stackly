/**
 * agent.ts — Agentic commerce HTTP routes.
 *
 * POST /agent/run         — start a new agent plan from a learner message
 * GET  /agent/plans       — list this learner's plans (newest first)
 * GET  /agent/plans/:id   — get a single plan with full steps
 * GET  /agent/audit       — recent audit log for this learner (parent-visible too)
 *
 * Parent-only:
 * GET  /agent/settings         — get family agent settings
 * PUT  /agent/settings         — update weekly cap / agent toggle
 * GET  /agent/pending-requests — orders awaiting parent approval
 */

import { Hono } from 'hono';
import { db, agentPlans, agentAuditLog, familySettings, learners, paypalOrders } from '../db/index.js';
import { eq, desc, and } from 'drizzle-orm';
import { nanoid } from '../utils/nanoid.js';
import { runAgent, type PlanStep } from '../ai/agentLoop.js';
import { sessionMiddleware, requireLearner, requireParent } from '../middleware/session.js';
import { checkRateLimit } from '../ai/rateLimiter.js';
import { moderateInput } from '../ai/prompts.js';
import type { Band } from '../ai/prompts.js';

const router = new Hono();
router.use('*', sessionMiddleware);

// ── Learner routes ────────────────────────────────────────────────────────────

router.post('/run', requireLearner, async (c) => {
  const session = c.get('session') as { ownerId: string; familyId: string };
  const actor = c.get('actor') as { id: string; band: string; family_id: string };
  const learnerId = actor.id;
  const familyId = actor.family_id ?? session.familyId;

  // Rate limit: 10 agent runs per minute per learner
  const rl = checkRateLimit(learnerId, 10);
  if (!rl.ok) return c.json({ error: 'Too many requests. Please slow down.' }, 429);

  const body = await c.req.json() as { message?: string };
  const userMessage = (body.message ?? '').slice(0, 500).trim();
  if (!userMessage) return c.json({ error: 'Message is required' }, 400);

  // Moderate input
  const mod = moderateInput(userMessage);
  if (!mod.ok) return c.json({ error: mod.reason }, 400);

  // Need a parentId — get from the learner's family
  const [learnerRow] = await db.select().from(learners).where(eq(learners.id, learnerId)).limit(1);
  if (!learnerRow) return c.json({ error: 'Learner not found' }, 404);

  // Find the parent (first user in the family)
  const parentRows = await db
    .select()
    .from(db._.$inferSelect ? (db as unknown as { _: { $inferSelect: unknown } })._ : learners)
    .limit(1)
    .catch(() => []);

  // Simpler: use family_id from session; parentId from paypalOrders or use familyId as proxy
  // For agent runs, parentId is stored on the plan for reference — we use familyId to look up settings
  const planId = nanoid();
  const now = new Date();

  // Create the plan row
  await db.insert(agentPlans).values({
    id: planId,
    learnerId,
    familyId,
    userMessage,
    status: 'thinking',
    planSteps: '[]',
    createdAt: now,
    updatedAt: now,
  });

  const ctx = {
    planId,
    learnerId,
    familyId,
    parentId: familyId, // used for cap checks; parentId resolved server-side on approval
  };

  // Run the agent (async — returns once complete)
  const result = await runAgent(userMessage, ctx, learnerRow.band as Band);

  return c.json({
    planId,
    status: result.status,
    summary: result.summary,
    steps: result.steps,
  });
});

router.get('/plans', requireLearner, async (c) => {
  const actor = c.get('actor') as { id: string };
  const rows = await db
    .select()
    .from(agentPlans)
    .where(eq(agentPlans.learnerId, actor.id))
    .orderBy(desc(agentPlans.createdAt))
    .limit(20);

  return c.json(rows.map((r) => ({
    id: r.id,
    status: r.status,
    userMessage: r.userMessage,
    kitId: r.kitId,
    orderId: r.orderId,
    summary: r.reasoning,
    steps: JSON.parse(r.planSteps) as PlanStep[],
    createdAt: r.createdAt,
  })));
});

router.get('/plans/:id', requireLearner, async (c) => {
  const actor = c.get('actor') as { id: string };
  const [row] = await db
    .select()
    .from(agentPlans)
    .where(and(eq(agentPlans.id, c.req.param('id')), eq(agentPlans.learnerId, actor.id)))
    .limit(1);

  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({ ...row, steps: JSON.parse(row.planSteps) as PlanStep[] });
});

router.get('/audit', requireLearner, async (c) => {
  const actor = c.get('actor') as { id: string };
  const rows = await db
    .select()
    .from(agentAuditLog)
    .where(eq(agentAuditLog.learnerId, actor.id))
    .orderBy(desc(agentAuditLog.createdAt))
    .limit(50);
  return c.json(rows);
});

// ── Parent routes ─────────────────────────────────────────────────────────────

router.get('/settings', requireParent, async (c) => {
  const session = c.get('session') as { familyId: string };
  const [settings] = await db
    .select()
    .from(familySettings)
    .where(eq(familySettings.familyId, session.familyId))
    .limit(1);

  return c.json(settings ?? {
    familyId: session.familyId,
    agentEnabled: true,
    weeklyCapCents: 1000,
  });
});

router.put('/settings', requireParent, async (c) => {
  const session = c.get('session') as { familyId: string };
  const body = await c.req.json() as { agentEnabled?: boolean; weeklyCapCents?: number };

  const now = new Date();
  const existing = await db
    .select()
    .from(familySettings)
    .where(eq(familySettings.familyId, session.familyId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(familySettings)
      .set({
        ...(body.agentEnabled !== undefined ? { agentEnabled: body.agentEnabled } : {}),
        ...(body.weeklyCapCents !== undefined ? { weeklyCapCents: body.weeklyCapCents } : {}),
        updatedAt: now,
      })
      .where(eq(familySettings.familyId, session.familyId));
  } else {
    await db.insert(familySettings).values({
      familyId: session.familyId,
      agentEnabled: body.agentEnabled ?? true,
      weeklyCapCents: body.weeklyCapCents ?? 1000,
      updatedAt: now,
    });
  }

  return c.json({ ok: true });
});

router.get('/pending-requests', requireParent, async (c) => {
  const session = c.get('session') as { familyId: string };

  // Get all pending_agent orders for this family's learners
  const rows = await db
    .select({
      orderId: paypalOrders.id,
      learnerId: paypalOrders.learnerId,
      kitId: paypalOrders.kitId,
      amountUsd: paypalOrders.amountUsd,
      practiceDollarsAwarded: paypalOrders.practiceDollarsAwarded,
      status: paypalOrders.status,
      createdAt: paypalOrders.createdAt,
    })
    .from(paypalOrders)
    .innerJoin(learners, eq(learners.id, paypalOrders.learnerId))
    .where(
      and(
        eq(learners.familyId, session.familyId),
        eq(paypalOrders.status, 'pending_agent'),
      ),
    )
    .orderBy(desc(paypalOrders.createdAt));

  return c.json(rows);
});

// ── Family audit (parent can see all tool calls) ──────────────────────────────

router.get('/family-audit', requireParent, async (c) => {
  const session = c.get('session') as { familyId: string };

  const rows = await db
    .select({
      id: agentAuditLog.id,
      planId: agentAuditLog.planId,
      learnerId: agentAuditLog.learnerId,
      tool: agentAuditLog.tool,
      durationMs: agentAuditLog.durationMs,
      createdAt: agentAuditLog.createdAt,
      // omit input/output to avoid personal data in the list
    })
    .from(agentAuditLog)
    .innerJoin(agentPlans, eq(agentPlans.id, agentAuditLog.planId))
    .where(eq(agentPlans.familyId, session.familyId))
    .orderBy(desc(agentAuditLog.createdAt))
    .limit(100);

  return c.json(rows);
});

export default router;
