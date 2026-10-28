/**
 * family.ts — Parent-only family management routes.
 *
 * GET  /family/summary            — weekly summary per learner (lessons, streak, PD change, coach note)
 * GET  /family/approvals          — pending + recent approval history
 * POST /family/approvals/:id/approve  — approve a pending agent purchase request
 * POST /family/approvals/:id/decline  — decline a pending agent purchase request
 * GET  /family/starters           — 3 conversation-starter questions per learner
 * GET  /family/settings           — get family controls (cap, coach toggle, reading level)
 * PUT  /family/settings           — update family controls
 * GET  /family/export/:learnerId  — export learner data as JSON (privacy)
 * DELETE /family/learners/:learnerId — permanently delete a learner (privacy)
 */

import { Hono } from 'hono';
import { db } from '../db/index.js';
import {
  learners, users, lessonProgress, trades, holdings,
  chatMessages, paypalOrders, agentPlans, agentAuditLog,
  familySettings, sessions,
} from '../db/schema.js';
import { eq, and, desc, gte, sql } from 'drizzle-orm';
import { sessionMiddleware, requireParent } from '../middleware/session.js';
import { completeText, isConfigured } from '../ai/provider.js';
import { nanoid } from '../utils/nanoid.js';
import { emitOrderEvent } from './paypal.js';

const router = new Hono();
router.use('*', sessionMiddleware);
router.use('*', requireParent);

// ── helpers ───────────────────────────────────────────────────────────────────

function weekAgo(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
}

async function assertLearnerInFamily(learnerId: string, familyId: string) {
  const [row] = await db
    .select({ id: learners.id })
    .from(learners)
    .where(and(eq(learners.id, learnerId), eq(learners.familyId, familyId)))
    .limit(1);
  return row ?? null;
}

// ── GET /family/summary ───────────────────────────────────────────────────────
// Returns an array: one object per learner with this week's stats + a coach note.
router.get('/summary', async (c) => {
  const session = c.get('session') as { familyId: string };

  const familyLearners = await db
    .select()
    .from(learners)
    .where(eq(learners.familyId, session.familyId));

  const since = weekAgo();

  const results = await Promise.all(familyLearners.map(async (l) => {
    // Lessons completed this week
    const lessonsThisWeek = await db
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.learnerId, l.id), gte(lessonProgress.completedAt, since)));

    // Practice Dollar change this week (completed paypal orders)
    const completedOrders = await db
      .select({ pd: paypalOrders.practiceDollarsAwarded })
      .from(paypalOrders)
      .where(
        and(
          eq(paypalOrders.learnerId, l.id),
          eq(paypalOrders.status, 'completed'),
          gte(paypalOrders.createdAt, since),
        ),
      );
    const pdGained = completedOrders.reduce((s, o) => s + o.pd, 0);

    // Recent chat for coach note
    const recentChat = await db
      .select({ role: chatMessages.role, content: chatMessages.content })
      .from(chatMessages)
      .where(and(eq(chatMessages.learnerId, l.id), gte(chatMessages.createdAt, since)))
      .orderBy(desc(chatMessages.createdAt))
      .limit(20);

    // Recent lesson IDs for context
    const lessonIds = lessonsThisWeek.map((lp) => lp.lessonId).slice(0, 5);

    // Generate coach note via AI (or fallback)
    let coachNote = '';
    if (isConfigured() && (recentChat.length > 0 || lessonIds.length > 0)) {
      const chatSummary = recentChat
        .slice(0, 10)
        .map((m) => `${m.role}: ${m.content.slice(0, 120)}`)
        .join('\n');
      const prompt = `You are writing a brief, plain-language weekly note for a parent about their child's learning this week.
Child's age band: ${l.band}
Lessons completed this week: ${lessonIds.length > 0 ? lessonIds.join(', ') : 'none'}
Streak: ${l.streakDays} days
Recent Coach conversations (excerpt):
${chatSummary || 'No conversations this week.'}

Write 2–3 sentences max. Be warm, specific, and encouraging. Mention what the child learned or asked about.
Do NOT mention specific dollar amounts or financial advice. Do NOT use the child's name.`;
      coachNote = await completeText([
        { role: 'system', content: 'You write parent-facing weekly learning summaries for a financial literacy app for kids.' },
        { role: 'user', content: prompt },
      ]).catch(() => '');
    }

    if (!coachNote) {
      coachNote = lessonIds.length > 0
        ? `Completed ${lessonIds.length} lesson${lessonIds.length > 1 ? 's' : ''} this week and kept a ${l.streakDays}-day streak going.`
        : l.streakDays > 0
          ? `Maintained a ${l.streakDays}-day learning streak this week.`
          : 'No activity this week — a gentle nudge might help!';
    }

    return {
      learnerId: l.id,
      nickname: l.nickname,
      band: l.band,
      avatar: l.avatar,
      xp: l.xp,
      streakDays: l.streakDays,
      practiceDollars: l.practiceDollars,
      lessonsThisWeek: lessonsThisWeek.length,
      pdGained,
      coachNote: coachNote.trim(),
    };
  }));

  return c.json(results);
});

// ── GET /family/approvals ─────────────────────────────────────────────────────
// Returns pending agent requests + last 20 resolved ones.
router.get('/approvals', async (c) => {
  const session = c.get('session') as { familyId: string };

  const rows = await db
    .select({
      orderId: paypalOrders.id,
      learnerId: paypalOrders.learnerId,
      learnerNickname: learners.nickname,
      learnerAvatar: learners.avatar,
      kitId: paypalOrders.kitId,
      amountUsd: paypalOrders.amountUsd,
      practiceDollarsAwarded: paypalOrders.practiceDollarsAwarded,
      status: paypalOrders.status,
      createdAt: paypalOrders.createdAt,
      completedAt: paypalOrders.completedAt,
    })
    .from(paypalOrders)
    .innerJoin(learners, eq(learners.id, paypalOrders.learnerId))
    .where(eq(learners.familyId, session.familyId))
    .orderBy(desc(paypalOrders.createdAt))
    .limit(40);

  const pending = rows.filter((r) => r.status === 'pending_agent');
  const history = rows.filter((r) => r.status !== 'pending_agent').slice(0, 20);

  return c.json({ pending, history });
});

// ── POST /family/approvals/:id/approve ───────────────────────────────────────
router.post('/approvals/:id/approve', async (c) => {
  const session = c.get('session') as { familyId: string; ownerId: string };
  const orderId = c.req.param('id');

  // Verify ownership
  const [order] = await db
    .select()
    .from(paypalOrders)
    .innerJoin(learners, eq(learners.id, paypalOrders.learnerId))
    .where(and(eq(paypalOrders.id, orderId), eq(learners.familyId, session.familyId)))
    .limit(1);

  if (!order) return c.json({ error: 'Order not found' }, 404);
  if (order.paypal_orders.status !== 'pending_agent') {
    return c.json({ error: 'Order is not pending approval' }, 409);
  }

  // Mark approved — parent will then complete the PayPal checkout separately
  await db
    .update(paypalOrders)
    .set({ status: 'approved', completedAt: new Date() })
    .where(eq(paypalOrders.id, orderId));

  // Award practice dollars immediately on approval (not waiting for PayPal capture in demo)
  await db
    .update(learners)
    .set({
      practiceDollars: sql`practice_dollars + ${order.paypal_orders.practiceDollarsAwarded}`,
      xp: sql`xp + ${order.paypal_orders.xpAwarded}`,
    })
    .where(eq(learners.id, order.paypal_orders.learnerId));

  // Notify the learner's screen via SSE so it auto-advances
  emitOrderEvent(orderId, {
    type: 'parent_approved',
    label: '✅ Parent approved',
    detail: 'Your parent approved the purchase. Practice dollars awarded!',
    tech: 'POST /family/approvals/:id/approve',
  });

  return c.json({ ok: true, practiceDollarsAwarded: order.paypal_orders.practiceDollarsAwarded });
});

// ── POST /family/approvals/:id/decline ───────────────────────────────────────
router.post('/approvals/:id/decline', async (c) => {
  const session = c.get('session') as { familyId: string };
  const orderId = c.req.param('id');

  const [order] = await db
    .select()
    .from(paypalOrders)
    .innerJoin(learners, eq(learners.id, paypalOrders.learnerId))
    .where(and(eq(paypalOrders.id, orderId), eq(learners.familyId, session.familyId)))
    .limit(1);

  if (!order) return c.json({ error: 'Order not found' }, 404);
  if (order.paypal_orders.status !== 'pending_agent') {
    return c.json({ error: 'Order is not pending approval' }, 409);
  }

  const body = await c.req.json<{ reason?: string }>().catch(() => ({}));
  await db
    .update(paypalOrders)
    .set({ status: 'declined', completedAt: new Date() })
    .where(eq(paypalOrders.id, orderId));

  // Log the decline reason in the agent plan if one exists
  const planRows = await db
    .select()
    .from(agentPlans)
    .where(eq(agentPlans.orderId, orderId))
    .limit(1);
  if (planRows[0]) {
    await db
      .update(agentPlans)
      .set({
        status: 'declined',
        reasoning: body.reason ? `Declined: ${body.reason}` : 'Declined by parent',
        updatedAt: new Date(),
      })
      .where(eq(agentPlans.id, planRows[0].id));
  }

  // Notify learner screen via SSE
  emitOrderEvent(orderId, {
    type: 'parent_declined',
    label: '❌ Parent declined',
    detail: body.reason ? `Declined: ${body.reason}` : 'Your parent declined this purchase.',
    tech: 'POST /family/approvals/:id/decline',
  });

  return c.json({ ok: true });
});

// ── GET /family/starters ──────────────────────────────────────────────────────
// Three conversation-starter questions the parent can ask the child this week.
router.get('/starters', async (c) => {
  const session = c.get('session') as { familyId: string };
  const since = weekAgo();

  const familyLearners = await db
    .select()
    .from(learners)
    .where(eq(learners.familyId, session.familyId));

  const results = await Promise.all(familyLearners.map(async (l) => {
    const recentLessons = await db
      .select({ lessonId: lessonProgress.lessonId })
      .from(lessonProgress)
      .where(and(eq(lessonProgress.learnerId, l.id), gte(lessonProgress.completedAt, since)))
      .limit(5);

    const recentTrades = await db
      .select({ ticker: trades.ticker, side: trades.side })
      .from(trades)
      .where(and(eq(trades.learnerId, l.id), gte(trades.createdAt, since)))
      .limit(5);

    let questions: string[] = [];

    if (isConfigured()) {
      const context = [
        recentLessons.length > 0 ? `Completed lessons this week: ${recentLessons.map((r) => r.lessonId).join(', ')}` : 'No lessons this week.',
        recentTrades.length > 0 ? `Paper trades this week: ${recentTrades.map((t) => `${t.side} ${t.ticker}`).join(', ')}` : 'No trades this week.',
        `Age band: ${l.band}`,
      ].join('\n');

      const prompt = `Based on what this child learned this week, suggest exactly 3 conversation-starter questions a parent can ask them at dinner.

${context}

Rules:
- Each question should be open-ended and curiosity-driven
- Appropriate for age band: ${l.band} (sprouts=7–10, builders=11–14, investors=15–24)
- Connect to what they actually did this week if possible, or to general money concepts if nothing this week
- No financial advice, no yes/no questions
- Output ONLY a JSON array of 3 strings, nothing else: ["Q1", "Q2", "Q3"]`;

      const raw = await completeText([
        { role: 'system', content: 'You generate age-appropriate conversation starters for parents of kids learning about money.' },
        { role: 'user', content: prompt },
      ]).catch(() => '');

      try {
        const match = raw.match(/\[[\s\S]*\]/);
        if (match) questions = JSON.parse(match[0]) as string[];
      } catch { /* fall through */ }
    }

    // Fallback questions by band
    if (questions.length < 3) {
      const fallbacks: Record<string, string[]> = {
        sprouts: [
          'If you had $10 to save, what would you be saving it for?',
          'What\'s the difference between something you need and something you want?',
          'If you started a lemonade stand, what would you need to buy first?',
        ],
        builders: [
          'If you invested $100 in one company this week, which one and why?',
          'What does it mean when a company\'s stock price goes down — is that always bad?',
          'If you were earning money, what percentage would you save first?',
        ],
        investors: [
          'What\'s one thing you learned this week that surprised you about how markets work?',
          'How does compound interest change your thinking about saving early?',
          'What\'s the difference between diversification and just owning a lot of different things?',
        ],
      };
      questions = fallbacks[l.band] ?? fallbacks.builders;
    }

    return {
      learnerId: l.id,
      nickname: l.nickname,
      band: l.band,
      avatar: l.avatar,
      questions: questions.slice(0, 3),
    };
  }));

  return c.json(results);
});

// ── GET /family/settings ──────────────────────────────────────────────────────
router.get('/settings', async (c) => {
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
    readingLevelOverride: null,
  });
});

// ── PUT /family/settings ──────────────────────────────────────────────────────
router.put('/settings', async (c) => {
  const session = c.get('session') as { familyId: string };
  const body = await c.req.json<{
    agentEnabled?: boolean;
    weeklyCapCents?: number;
    readingLevelOverride?: string | null;
  }>().catch(() => ({}));

  const validBands = ['sprouts', 'builders', 'investors', null, ''];
  if (body.readingLevelOverride !== undefined && !validBands.includes(body.readingLevelOverride)) {
    return c.json({ error: 'Invalid readingLevelOverride' }, 400);
  }

  const now = new Date();
  const [existing] = await db
    .select()
    .from(familySettings)
    .where(eq(familySettings.familyId, session.familyId))
    .limit(1);

  const patch = {
    ...(body.agentEnabled !== undefined ? { agentEnabled: body.agentEnabled } : {}),
    ...(body.weeklyCapCents !== undefined ? { weeklyCapCents: body.weeklyCapCents } : {}),
    ...(body.readingLevelOverride !== undefined
      ? { readingLevelOverride: body.readingLevelOverride || null }
      : {}),
    updatedAt: now,
  };

  if (existing) {
    await db.update(familySettings).set(patch).where(eq(familySettings.familyId, session.familyId));
  } else {
    await db.insert(familySettings).values({
      familyId: session.familyId,
      agentEnabled: body.agentEnabled ?? true,
      weeklyCapCents: body.weeklyCapCents ?? 1000,
      readingLevelOverride: body.readingLevelOverride ?? null,
      updatedAt: now,
    });
  }

  return c.json({ ok: true });
});

// ── GET /family/export/:learnerId ─────────────────────────────────────────────
// Returns all data held for a learner as a JSON blob (GDPR-style export).
router.get('/export/:learnerId', async (c) => {
  const session = c.get('session') as { familyId: string };
  const learnerId = c.req.param('learnerId');

  if (!(await assertLearnerInFamily(learnerId, session.familyId))) {
    return c.json({ error: 'Learner not found' }, 404);
  }

  const [learnerRow] = await db.select().from(learners).where(eq(learners.id, learnerId)).limit(1);
  const holdingRows = await db.select().from(holdings).where(eq(holdings.learnerId, learnerId));
  const tradeRows = await db.select().from(trades).where(eq(trades.learnerId, learnerId));
  const progressRows = await db.select().from(lessonProgress).where(eq(lessonProgress.learnerId, learnerId));
  const chatRows = await db.select().from(chatMessages).where(eq(chatMessages.learnerId, learnerId));
  const orderRows = await db.select().from(paypalOrders).where(eq(paypalOrders.learnerId, learnerId));
  const planRows = await db.select().from(agentPlans).where(eq(agentPlans.learnerId, learnerId));

  const exportData = {
    exportedAt: new Date().toISOString(),
    learner: {
      id: learnerRow?.id,
      nickname: learnerRow?.nickname,
      band: learnerRow?.band,
      avatar: learnerRow?.avatar,
      xp: learnerRow?.xp,
      streakDays: learnerRow?.streakDays,
      practiceDollars: learnerRow?.practiceDollars,
      createdAt: learnerRow?.createdAt,
    },
    holdings: holdingRows,
    trades: tradeRows,
    lessonProgress: progressRows,
    chatHistory: chatRows,
    orders: orderRows,
    agentPlans: planRows,
  };

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="stackly-export-${learnerId.slice(0, 8)}.json"`,
    },
  });
});

// ── DELETE /family/learners/:learnerId ────────────────────────────────────────
// Permanently deletes a learner and all their data. Irreversible.
router.delete('/learners/:learnerId', async (c) => {
  const session = c.get('session') as { familyId: string };
  const learnerId = c.req.param('learnerId');

  if (!(await assertLearnerInFamily(learnerId, session.familyId))) {
    return c.json({ error: 'Learner not found' }, 404);
  }

  // Delete in dependency order (FK constraints)
  await db.delete(agentAuditLog).where(eq(agentAuditLog.learnerId, learnerId));
  await db.delete(agentPlans).where(eq(agentPlans.learnerId, learnerId));
  await db.delete(chatMessages).where(eq(chatMessages.learnerId, learnerId));
  await db.delete(lessonProgress).where(eq(lessonProgress.learnerId, learnerId));
  await db.delete(trades).where(eq(trades.learnerId, learnerId));
  await db.delete(holdings).where(eq(holdings.learnerId, learnerId));
  // paypalOrders has FK to users(parent_id) not learners — nullify learnerId reference via status
  await db.update(paypalOrders).set({ status: 'deleted' }).where(eq(paypalOrders.learnerId, learnerId));
  await db.delete(sessions).where(and(eq(sessions.ownerId, learnerId), eq(sessions.role, 'learner')));
  await db.delete(learners).where(eq(learners.id, learnerId));

  return c.json({ ok: true });
});

export default router;
