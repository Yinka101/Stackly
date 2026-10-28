/**
 * agentLoop.ts — Agentic commerce orchestrator.
 *
 * Uses OpenAI function calling (or falls back to a canned plan offline).
 * Max 6 tool-call rounds to prevent runaway loops.
 *
 * Policy enforced here:
 *   - Agent proposes, never executes payments.
 *   - Every purchase goes to parent queue.
 *   - Steps streamed back as PlanStep[] for the frontend timeline.
 */

import { complete } from './provider.js';
import { buildSystemPrompt, moderateInput, type Band } from './prompts.js';
import { TOOL_DEFINITIONS, callTool, type ToolContext } from './tools.js';
import { db, agentPlans, learners } from '../db/index.js';
import { eq } from 'drizzle-orm';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PlanStepKind =
  | 'understood'   // what the agent understood
  | 'tool_call'    // calling a tool
  | 'tool_result'  // result of a tool
  | 'reasoning'    // agent explaining its choice
  | 'proposed'     // final proposal to learner
  | 'error'        // something went wrong
  | 'waiting';     // waiting for parent approval

export interface PlanStep {
  id: string;
  kind: PlanStepKind;
  label: string;          // short, band-appropriate plain English
  detail?: string;        // optional longer text
  tool?: string;
  technicalName?: string; // shown only to Builders/Investors in small text
  ts: number;
}

interface AgentRunResult {
  planId: string;
  steps: PlanStep[];
  status: 'proposed' | 'failed' | 'no_purchase';
  summary: string;        // 1-2 sentence plain English for the chat bubble
}

// ── System prompt extension for the agent ────────────────────────────────────

const AGENT_ADDENDUM = `
You are also a commerce agent for Stackly. You have four tools:
  • list_kits — see what practice kits are available
  • create_purchase_request — propose a kit to the parent (NEVER charges money)
  • get_order_status — check if a request was approved
  • list_recent_activity — see past completed purchases

AGENT RULES (non-negotiable):
1. You can PROPOSE a purchase but you can NEVER execute, confirm or charge one.
2. Every purchase must go to the parent's approval queue.
3. If the learner's goal doesn't need a kit, say so and help them without one.
4. Never call create_purchase_request more than once per conversation.
5. Always call list_kits first to pick the right kit.
6. Explain your choice in plain language the learner can understand.
7. If any tool returns an error, explain it clearly and stop.
`;

// ── Offline fallback ──────────────────────────────────────────────────────────

function offlinePlan(message: string, planId: string): AgentRunResult {
  const steps: PlanStep[] = [
    {
      id: `${planId}-1`,
      kind: 'understood',
      label: 'I heard you!',
      detail: message,
      ts: Date.now(),
    },
    {
      id: `${planId}-2`,
      kind: 'error',
      label: 'I\'m offline right now',
      detail: 'The AI coach isn\'t available. Ask a parent to check the internet connection.',
      ts: Date.now(),
    },
  ];
  return { planId, steps, status: 'failed', summary: 'I\'m offline right now. Please try again in a moment.' };
}

// ── Main agent loop ───────────────────────────────────────────────────────────

export async function runAgent(
  userMessage: string,
  ctx: ToolContext,
  band: Band,
): Promise<AgentRunResult> {
  const MAX_ROUNDS = 6;
  const steps: PlanStep[] = [];
  let stepIdx = 0;

  const makeStep = (kind: PlanStepKind, label: string, opts?: Partial<PlanStep>): PlanStep => ({
    id: `${ctx.planId}-${++stepIdx}`,
    kind,
    label,
    ts: Date.now(),
    ...opts,
  });

  // Persist plan as thinking
  await db.update(agentPlans).set({ status: 'thinking', updatedAt: new Date() }).where(eq(agentPlans.id, ctx.planId));

  // Moderate input
  const mod = moderateInput(userMessage);
  if (!mod.safe) {
    const reason = (mod as { reason?: string }).reason ?? 'I can\'t help with that.';
    const s = makeStep('error', 'I can\'t help with that', { detail: reason });
    steps.push(s);
    await persistSteps(ctx.planId, steps, 'failed', reason);
    return { planId: ctx.planId, steps, status: 'failed', summary: reason };
  }

  // Step 1: understood
  steps.push(makeStep('understood', 'Got it — let me think about this', { detail: userMessage }));

  // Check AI availability
  const { isConfigured: configured } = await import('./provider.js');
  if (!configured()) {
    const result = offlinePlan(userMessage, ctx.planId);
    result.steps = [...steps, ...result.steps.slice(1)];
    await persistSteps(ctx.planId, result.steps, 'failed', 'AI offline');
    return result;
  }

  // Build messages for the LLM
  const systemPrompt = buildSystemPrompt(band) + '\n\n' + AGENT_ADDENDUM;
  const messages: Array<{ role: string; content: string | null; tool_calls?: unknown; tool_call_id?: string; name?: string }> = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  let purchaseProposed = false;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    // Call the LLM
    let response: Awaited<ReturnType<typeof complete>>;
    try {
      response = await complete(messages, TOOL_DEFINITIONS as unknown as Parameters<typeof complete>[1]);
    } catch (err) {
      const s = makeStep('error', 'Something went wrong', { detail: String(err), technicalName: 'LLM_ERROR' });
      steps.push(s);
      await persistSteps(ctx.planId, steps, 'failed', String(err));
      return { planId: ctx.planId, steps, status: 'failed', summary: 'Something went wrong. Please try again.' };
    }

    const choice = response.choices?.[0];
    if (!choice) break;

    // Plain text response (no tool calls) — agent is done
    if (choice.finish_reason === 'stop' || !choice.message?.tool_calls?.length) {
      const text = choice.message?.content ?? '';
      if (text) {
        steps.push(makeStep('proposed', purchaseProposed ? 'Waiting for your parent\'s OK' : 'Here\'s what I think', {
          detail: text,
          kind: purchaseProposed ? 'waiting' : 'proposed',
        }));
      }
      const finalStatus = purchaseProposed ? 'proposed' : 'no_purchase';
      await persistSteps(ctx.planId, steps, finalStatus, text);
      return { planId: ctx.planId, steps, status: finalStatus, summary: text };
    }

    // Tool calls
    for (const tc of choice.message.tool_calls) {
      const toolName = tc.function.name as string;
      let toolArgs: Record<string, unknown> = {};
      try { toolArgs = JSON.parse(tc.function.arguments ?? '{}'); } catch { /* empty args */ }

      // Add tool-call step
      const callStep = makeStep('tool_call', labelForTool(toolName, toolArgs, band), {
        tool: toolName,
        technicalName: `${toolName}(${Object.keys(toolArgs).join(', ')})`,
      });
      steps.push(callStep);
      await persistSteps(ctx.planId, steps, 'thinking', '');

      // Execute the tool
      const result = await callTool(toolName, toolArgs, ctx);

      // Add result step
      const resultLabel = result.ok
        ? resultLabelOk(toolName, result.data, band)
        : `Problem: ${result.error}`;
      const resultStep = makeStep('tool_result', resultLabel, {
        detail: result.ok ? JSON.stringify(result.data, null, 2) : result.error,
        technicalName: `→ ${result.ok ? 'OK' : 'ERROR'}`,
      });
      steps.push(resultStep);

      if (toolName === 'create_purchase_request' && result.ok) purchaseProposed = true;

      // Feed result back to LLM
      messages.push({ role: 'assistant', content: null, tool_calls: choice.message.tool_calls });
      messages.push({
        role: 'tool',
        tool_call_id: tc.id,
        name: toolName,
        content: JSON.stringify(result.ok ? result.data : { error: result.error }),
      });
    }
  }

  // Ran out of rounds
  steps.push(makeStep('error', 'I got a bit lost — let\'s try again', {
    detail: 'The agent reached its thinking limit.',
    technicalName: 'MAX_ROUNDS_EXCEEDED',
  }));
  await persistSteps(ctx.planId, steps, 'failed', 'max rounds exceeded');
  return { planId: ctx.planId, steps, status: 'failed', summary: 'I got a bit lost. Could you rephrase what you\'d like to do?' };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function persistSteps(planId: string, steps: PlanStep[], status: string, summary: string) {
  await db
    .update(agentPlans)
    .set({ planSteps: JSON.stringify(steps), status, reasoning: summary, updatedAt: new Date() })
    .where(eq(agentPlans.id, planId));
}

function labelForTool(tool: string, args: Record<string, unknown>, band: Band): string {
  const isYoung = band === 'sprouts';
  switch (tool) {
    case 'list_kits':
      return isYoung ? 'Looking at what kits are available' : 'Fetching available practice kits';
    case 'create_purchase_request':
      return isYoung
        ? `Asking your parent about the ${args.kit_id as string} kit`
        : `Creating a purchase request for kit: ${args.kit_id as string}`;
    case 'get_order_status':
      return isYoung ? 'Checking if your parent replied' : 'Checking order status';
    case 'list_recent_activity':
      return isYoung ? 'Looking at what you\'ve bought before' : 'Fetching recent activity';
    default:
      return `Calling ${tool}`;
  }
}

function resultLabelOk(tool: string, data: unknown, band: Band): string {
  const isYoung = band === 'sprouts';
  switch (tool) {
    case 'list_kits': {
      const kits = data as Array<{ name: string }>;
      return isYoung ? `Found ${kits.length} kits to choose from!` : `Retrieved ${kits.length} kits`;
    }
    case 'create_purchase_request':
      return isYoung ? 'Sent to your parent for approval!' : 'Purchase request created — awaiting parent approval';
    case 'get_order_status': {
      const d = data as { status: string };
      return isYoung ? `Your request is: ${d.status}` : `Order status: ${d.status}`;
    }
    case 'list_recent_activity': {
      const acts = data as unknown[];
      return isYoung ? `You've done ${acts.length} kit purchases` : `${acts.length} recent purchases found`;
    }
    default:
      return 'Done';
  }
}
