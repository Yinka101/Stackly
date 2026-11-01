/**
 * AI Coach routes — server-side only, keys in env.
 *
 * POST /ai/stream      — SSE streaming chat (ask anything)
 * POST /ai/quiz        — structured quiz question (JSON response)
 * POST /ai/explain     — explain a trade
 * POST /ai/review      — review portfolio vs diversification principles
 * GET  /ai/history     — last 30 messages for this learner
 */
import { Hono } from 'hono';
import { db, chatMessages, learners, holdings, trades } from '../db/index.js';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from '../utils/nanoid.js';
import { buildSystemPrompt, moderateInput, moderateOutput, OFFLINE_RESPONSES, type Band } from '../ai/prompts.js';
import { streamCompletion, completeText as complete, isConfigured } from '../ai/provider.js';
import { checkRateLimit } from '../ai/rateLimiter.js';
import { sessionMiddleware, requireLearner } from '../middleware/session.js';

const router = new Hono();
router.use('*', sessionMiddleware);
router.use('*', requireLearner);

// ── offline quiz bank ─────────────────────────────────────────────────────────
const OFFLINE_QUIZ_BANK: Record<string, { question: string; options: string[]; correctIndex: number; explanation: string }> = {
  'compound growth':  { question: 'What does compound growth mean?', options: ['Earning interest on your interest', 'Buying shares', 'Paying fees', 'Opening an account'], correctIndex: 0, explanation: 'Compound growth means your earnings also earn more over time.' },
  'diversification':  { question: 'Why spread money across different assets?', options: ['To reduce risk if one investment falls', 'To earn more fees', 'To avoid taxes', 'To buy one stock more'], correctIndex: 0, explanation: 'Diversification reduces risk - if one investment drops, others may hold steady.' },
  'risk and reward':  { question: 'What is the general relationship between risk and potential reward?', options: ['Higher risk, higher potential reward', 'Lower risk, higher reward', 'They are unrelated', 'Only large companies have risk'], correctIndex: 0, explanation: 'Higher-risk investments can offer bigger returns but also bigger losses.' },
  'index funds':      { question: 'What does an index fund track?', options: ['A group of stocks representing a market', 'One company only', 'Government bonds only', 'Real estate prices'], correctIndex: 0, explanation: 'An index fund tracks a collection of stocks, giving broad market exposure.' },
  'PayPal fees':      { question: 'When does PayPal charge a fee to the seller?', options: ['When receiving payment for goods or services', 'When sending to a friend', 'When checking balance', 'When logging in'], correctIndex: 0, explanation: 'PayPal charges sellers a small percentage when they receive payments for goods or services.' },
  'spotting scams':   { question: 'Which is a common sign of an online scam?', options: ['"Act now or lose your money!"', 'A padlock in the address bar', 'A purchase confirmation email', 'A company verifying your identity'], correctIndex: 0, explanation: 'Scammers create urgency to stop you thinking clearly. Legitimate businesses never pressure you to act immediately.' },
};

function offlineQuiz(topic: string) {
  const key = Object.keys(OFFLINE_QUIZ_BANK).find(k => topic.toLowerCase().includes(k.toLowerCase())) ?? 'compound growth';
  return OFFLINE_QUIZ_BANK[key];
}

// ── helpers ───────────────────────────────────────────────────────────────────

async function getLearnerContext(learnerId: string): Promise<string> {
  const rows = await db.select().from(learners).where(eq(learners.id, learnerId)).limit(1);
  const learner = rows[0];
  if (!learner) return '';

  const holdingRows = await db.select().from(holdings).where(eq(holdings.learnerId, learnerId));
  const tradeRows = await db
    .select()
    .from(trades)
    .where(eq(trades.learnerId, learnerId))
    .orderBy(desc(trades.createdAt))
    .limit(10);

  const holdingSummary = holdingRows.length
    ? holdingRows.map((h) => `${h.ticker}: ${h.shares.toFixed(4)} shares`).join(', ')
    : 'No holdings yet.';

  const recentTrades = tradeRows.length
    ? tradeRows.map((t) => `${t.side.toUpperCase()} ${t.shares} ${t.ticker}`).join('; ')
    : 'No trades yet.';

  // Log without personal data
  console.log(`[coach] context built for learnerId ${learnerId.slice(0, 8)}...`);

  return [
    `Learner band: ${learner.band}`,
    `Practice dollars: $${learner.practiceDollars}`,
    `Holdings: ${holdingSummary}`,
    `Recent trades: ${recentTrades}`,
    `XP: ${learner.xp}`,
    `Streak: ${learner.streakDays} days`,
  ].join('\n');
}

async function getHistory(learnerId: string, limit = 8) {
  const rows = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.learnerId, learnerId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
  return rows.reverse().map((r) => ({
    role: r.role as 'user' | 'assistant',
    content: r.content,
  }));
}

async function saveMessages(learnerId: string, user: string, assistant: string) {
  const now = new Date();
  await db.insert(chatMessages).values([
    { id: nanoid(), learnerId, role: 'user',      content: user.slice(0, 1000), createdAt: now },
    { id: nanoid(), learnerId, role: 'assistant', content: assistant.slice(0, 2000), createdAt: now },
  ]);
}

// ── POST /ai/stream ───────────────────────────────────────────────────────────
router.post('/stream', async (c) => {
  const session = c.get('session')!;
  const learnerId = session.ownerId;

  const { allowed, retryAfterMs } = checkRateLimit(learnerId, 'chat');
  if (!allowed) {
    return c.json(
      { error: `Too many requests. Try again in ${Math.ceil(retryAfterMs / 1000)}s.` },
      429,
    );
  }

  const body = await c.req.json<{ message?: string; lessonContext?: string }>().catch(() => ({}));
  const rawMessage = (body.message ?? '').trim();
  if (!rawMessage) return c.json({ error: 'message required' }, 400);

  const modResult = moderateInput(rawMessage);
  if (!modResult.safe) {
    const safeReplies: Record<string, string> = {
      injection:
        "It looks like you're trying to change my instructions — I can't do that! I'm here to help you learn about money. What would you like to know?",
      personal_data:
        "Please don't share personal information like addresses or phone numbers here. I don't store that kind of data. What money question can I help with?",
      too_long:
        "That message is a bit too long for me! Could you break it into a shorter question?",
    };
    return c.json({ reply: safeReplies[modResult.reason] ?? safeReplies.injection });
  }

  const learnerRows = await db.select().from(learners).where(eq(learners.id, learnerId)).limit(1);
  const learner = learnerRows[0];
  if (!learner) return c.json({ error: 'Learner not found' }, 404);

  const band = learner.band as Band;
  const context = await getLearnerContext(learnerId);
  const systemPrompt = buildSystemPrompt(band, context + (body.lessonContext ? `\n\nCurrent lesson context:\n${body.lessonContext}` : ''));
  const history = await getHistory(learnerId);

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history,
    { role: 'user' as const, content: rawMessage },
  ];

  // Stream SSE
  const encoder = new TextEncoder();
  let fullReply = '';

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of streamCompletion(messages)) {
        fullReply += chunk.delta;
        const data = JSON.stringify({ delta: chunk.delta, done: chunk.done });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        if (chunk.done) break;
      }
      // Persist after stream ends
      const safeReply = moderateOutput(fullReply);
      await saveMessages(learnerId, rawMessage, safeReply).catch(() => {});
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': c.req.header('origin') ?? '*',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
});

// ── POST /ai/quiz ─────────────────────────────────────────────────────────────
router.post('/quiz', async (c) => {
  const session = c.get('session')!;
  const learnerId = session.ownerId;

  const { allowed } = checkRateLimit(learnerId, 'quiz');
  if (!allowed) return c.json({ error: 'Rate limited' }, 429);

  const body = await c.req.json<{ topic?: string }>().catch(() => ({}));
  const topic = (body.topic ?? 'investing basics').slice(0, 200);

  if (!isConfigured()) return c.json(offlineQuiz(topic));

  const learnerRows = await db.select().from(learners).where(eq(learners.id, learnerId)).limit(1);
  const band = (learnerRows[0]?.band ?? 'builders') as Band;

  const systemPrompt = buildSystemPrompt(band);
  const userPrompt = `Generate a quiz question about: "${topic}".
Respond with ONLY a JSON object in this exact shape:
{
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 0,
  "explanation": "..."
}
No markdown, no extra text. The explanation should be encouraging and teach the concept.`;

  const raw = await complete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('no json');
    const parsed = JSON.parse(jsonMatch[0]) as {
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    };
    // Basic validation
    if (!parsed.question || !Array.isArray(parsed.options) || parsed.options.length < 2) {
      throw new Error('invalid shape');
    }
    return c.json(parsed);
  } catch {
    return c.json(offlineQuiz(topic));
  }
});

// ── POST /ai/explain ──────────────────────────────────────────────────────────
router.post('/explain', async (c) => {
  const session = c.get('session')!;
  const learnerId = session.ownerId;

  const { allowed } = checkRateLimit(learnerId, 'review');
  if (!allowed) return c.json({ error: 'Rate limited' }, 429);

  const body = await c.req.json<{
    ticker?: string;
    side?: string;
    shares?: number;
    priceCents?: number;
    reflection?: string;
  }>().catch(() => ({}));

  if (!isConfigured()) return c.json({ explanation: OFFLINE_RESPONSES.explain });

  const learnerRows = await db.select().from(learners).where(eq(learners.id, learnerId)).limit(1);
  const band = (learnerRows[0]?.band ?? 'builders') as Band;

  const tradeDesc = `${body.side?.toUpperCase() ?? 'BUY'} ${body.shares ?? 1} shares of ${body.ticker ?? 'a company'} at $${((body.priceCents ?? 0) / 100).toFixed(2)}. Learner's reason: "${body.reflection ?? 'no reason given'}"`;

  const systemPrompt = buildSystemPrompt(band);
  const userPrompt = `Explain this paper trade to the learner in a helpful, educational way. Tell them what happened, what it means for their portfolio, and one thing to think about next time. NEVER say whether this was a good or bad trade as an investment decision — only explain the mechanics and learning points.\n\nTrade: ${tradeDesc}`;

  const raw = await complete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  const explanation = moderateOutput(raw);
  await saveMessages(learnerId, `Explain this trade: ${tradeDesc}`, explanation).catch(() => {});
  return c.json({ explanation });
});

// ── POST /ai/review ───────────────────────────────────────────────────────────
router.post('/review', async (c) => {
  const session = c.get('session')!;
  const learnerId = session.ownerId;

  const { allowed } = checkRateLimit(learnerId, 'review');
  if (!allowed) return c.json({ error: 'Rate limited' }, 429);

  if (!isConfigured()) return c.json({ review: OFFLINE_RESPONSES.review });

  const context = await getLearnerContext(learnerId);
  const learnerRows = await db.select().from(learners).where(eq(learners.id, learnerId)).limit(1);
  const band = (learnerRows[0]?.band ?? 'builders') as Band;

  const systemPrompt = buildSystemPrompt(band, context);
  const userPrompt = `Review this learner's practice portfolio. 
- Comment on diversification: are they spread across different types of companies and sectors?
- Are they over-concentrated in one ticker?
- Give 2–3 encouraging feedback points and 1 thing to think about.
- NEVER recommend buying or selling specific securities.
- NEVER say this is good or bad as a real investment — this is practice money only.
- Frame everything as a learning observation.`;

  const raw = await complete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  const review = moderateOutput(raw);
  await saveMessages(learnerId, 'Review my portfolio', review).catch(() => {});
  return c.json({ review });
});

// ── GET /ai/history ───────────────────────────────────────────────────────────
router.get('/history', async (c) => {
  const session = c.get('session')!;
  const learnerId = session.ownerId;

  const rows = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.learnerId, learnerId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(30);

  return c.json(rows.reverse());
});

export default router;
