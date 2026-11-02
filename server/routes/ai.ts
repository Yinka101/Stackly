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
type QuizQ = { question: string; options: string[]; correctIndex: number; explanation: string };
const OFFLINE_QUIZ_BANK: Record<string, QuizQ[]> = {
  'compound growth': [
    { question: 'What does compound growth mean?', options: ['Earning interest on your interest', 'Buying shares', 'Paying fees', 'Opening an account'], correctIndex: 0, explanation: 'Compound growth means your earnings also earn more over time.' },
    { question: 'You invest $100 at 10%. With compound growth, what do you earn on in year 2?', options: ['$110', '$100', '$120', '$90'], correctIndex: 0, explanation: 'Year 2 interest is calculated on $110 (original + year 1 interest), not just $100.' },
    { question: 'Which best describes compound growth?', options: ['A savings account that pays interest on past interest too', 'A wallet with cash', 'A gift card', 'A piggy bank'], correctIndex: 0, explanation: 'Compounding means each interest payment becomes part of the principal that earns even more interest.' },
    { question: 'Why does starting to save early help with compound growth?', options: ['More time means more compounding cycles', 'Banks reward young people', 'Early savers pay less tax', 'Interest rates are higher for children'], correctIndex: 0, explanation: 'Time is the most powerful ingredient in compounding. The earlier you start, the more cycles of growth you get.' },
    { question: 'What is the Rule of 72?', options: ['Divide 72 by the interest rate to find years to double your money', 'The max number of stocks to own', 'A PayPal fee rule', 'The retirement age'], correctIndex: 0, explanation: 'At 8% interest: 72 / 8 = 9 years to double your money through compounding.' },
  ],
  'diversification': [
    { question: 'Why spread money across different assets?', options: ['To reduce risk if one investment falls', 'To earn more fees', 'To avoid taxes', 'To buy one stock more'], correctIndex: 0, explanation: 'Diversification reduces risk - if one investment drops, others may hold steady.' },
    { question: 'What does "don\'t put all eggs in one basket" mean for investing?', options: ['Spread investments so one loss does not ruin you', 'Buy as many stocks as possible', 'Only invest in food companies', 'Keep all money in cash'], correctIndex: 0, explanation: 'If all your money is in one investment and it fails, you lose everything. Diversification protects you.' },
    { question: 'Which portfolio is most diversified?', options: ['Stocks, bonds, real estate, and international shares', 'Five tech stocks', 'One large company', 'Cash in two currencies'], correctIndex: 0, explanation: 'True diversification spans different asset types and sectors, not just different companies in one industry.' },
    { question: 'What is an easy way for a beginner to diversify instantly?', options: ['Buy an index fund tracking hundreds of companies', 'Pick two stocks you like', 'Save cash only', 'Buy only bonds'], correctIndex: 0, explanation: 'An index fund gives you a tiny share of hundreds of companies in one purchase.' },
    { question: 'Owning shares in both an umbrella company and a sunscreen company is good diversification because:', options: ['One does well in rain, the other in sunshine', 'Both are cheap', 'They pay high dividends', 'They are in the same industry'], correctIndex: 0, explanation: 'When conditions hurt one, they help the other. That balance is the point of diversification.' },
  ],
  'risk and reward': [
    { question: 'What is the general relationship between risk and reward?', options: ['Higher risk, higher potential reward', 'Lower risk, higher reward', 'They are unrelated', 'Only large companies have risk'], correctIndex: 0, explanation: 'Higher-risk investments can offer bigger returns but also bigger losses.' },
    { question: 'Which investment is typically lowest risk?', options: ['Government bonds', 'A startup stock', 'Cryptocurrency', 'A new business idea'], correctIndex: 0, explanation: 'Government bonds are backed by the government and considered very low risk, though returns are lower.' },
    { question: 'Someone promises 50% return in 30 days with zero risk. This is probably:', options: ['A scam', 'A great opportunity', 'A normal investment', 'A government scheme'], correctIndex: 0, explanation: 'Guaranteed very high returns with no risk is a classic scam signal. Real investments always carry some risk.' },
    { question: 'What does "volatility" mean?', options: ['How much an investment value goes up and down', 'How fast you can sell', 'The broker fees', 'The age of a company'], correctIndex: 0, explanation: 'A volatile investment swings up and down a lot. High volatility means higher risk.' },
    { question: 'Why might a young person choose riskier investments than an older person?', options: ['They have more time to recover from losses', 'Young people pay less tax', 'Risky investments are cheaper', 'Banks prefer young investors'], correctIndex: 0, explanation: 'Time is the key. A young investor can ride out market dips and wait for recovery.' },
  ],
  'index funds': [
    { question: 'What does an index fund track?', options: ['A group of stocks representing a market', 'One company only', 'Government bonds only', 'Real estate prices'], correctIndex: 0, explanation: 'An index fund tracks a collection of stocks, giving broad market exposure without picking individual stocks.' },
    { question: 'Why are index funds popular with beginners?', options: ['Low cost, automatic diversification, no stock-picking needed', 'They guarantee profit', 'Only available to wealthy investors', 'They pay daily dividends'], correctIndex: 0, explanation: 'Index funds are simple, cheap, and diversified by design.' },
    { question: 'What is the S&P 500?', options: ['An index of the 500 largest US companies', 'A savings account', 'A PayPal payment plan', 'A government bond'], correctIndex: 0, explanation: 'The S&P 500 tracks 500 large US companies. Many index funds mirror this index.' },
    { question: 'How does an index fund differ from an actively managed fund?', options: ['It tracks a market index automatically instead of having a manager pick stocks', 'It always beats the market', 'It is managed daily by experts', 'It invests in one company'], correctIndex: 0, explanation: 'Index funds follow a preset index mechanically. Active funds have managers making daily decisions - and charge higher fees.' },
    { question: 'If the market rises 8% in a year, a total market index fund will roughly:', options: ['Rise about 8% too', 'Rise 80%', 'Stay flat', 'Fall 8%'], correctIndex: 0, explanation: 'Index funds mirror the market they track, minus small fees.' },
  ],
  'PayPal fees': [
    { question: 'When does PayPal charge a fee to the seller?', options: ['When receiving payment for goods or services', 'When sending to a friend', 'When checking balance', 'When logging in'], correctIndex: 0, explanation: 'PayPal charges sellers a small percentage when they receive payments for goods or services.' },
    { question: 'You sell a $20 item. PayPal charges 3%. How much do you keep?', options: ['$19.40', '$20.00', '$17.00', '$18.50'], correctIndex: 0, explanation: '3% of $20 is $0.60, so you keep $19.40. Always factor fees into your pricing.' },
    { question: 'Why does PayPal charge sellers but not friends sending money to each other?', options: ['Business payments are a commercial service; friend transfers are personal', 'PayPal is a charity', 'Friend transfers are taxed instead', 'Sellers earn more'], correctIndex: 0, explanation: 'PayPal earns revenue from commercial transactions. Person-to-person transfers are a free service to attract users.' },
    { question: 'What is a transaction fee?', options: ['A small charge taken from each payment processed', 'A fee to open an account', 'A penalty for late payment', 'A government tax'], correctIndex: 0, explanation: 'A transaction fee is a cut taken from each payment - PayPal\'s is a percentage plus a small fixed amount.' },
    { question: 'You sell items for $10 each with a $2 profit margin. PayPal takes $0.60 per sale. Your real profit per item is:', options: ['$1.40', '$2.00', '$0.60', '$10.00'], correctIndex: 0, explanation: '$2.00 minus $0.60 in fees = $1.40 real profit. Always price with fees in mind.' },
  ],
  'spotting scams': [
    { question: 'Which is a common sign of an online scam?', options: ['"Act now or lose your money!"', 'A padlock in the address bar', 'A purchase confirmation email', 'A company verifying your identity'], correctIndex: 0, explanation: 'Scammers create urgency to stop you thinking clearly. Legitimate businesses never pressure you to act immediately.' },
    { question: 'You receive an email saying you won a lottery you never entered. This is:', options: ['A scam', 'A genuine prize', 'A government rebate', 'A bank error'], correctIndex: 0, explanation: 'Unsolicited prize notifications are almost always scams designed to steal your details or charge a "processing fee".' },
    { question: 'What does "phishing" mean?', options: ['Tricking someone into giving personal details through a fake site or email', 'A type of investment', 'A PayPal payment method', 'Searching for cheap products'], correctIndex: 0, explanation: 'Phishing uses fake emails or websites that look real to steal your passwords or card numbers.' },
    { question: 'A seller asks you to pay via gift cards. You should:', options: ['Refuse - gift card payments are a major scam red flag', 'Pay immediately', 'Pay half by gift card', 'Pay if under $50'], correctIndex: 0, explanation: 'Legitimate businesses never ask for gift card payments. Scammers love them because they are untraceable.' },
    { question: 'Which URL is most likely to be the real PayPal website?', options: ['https://paypal.com', 'http://paypa1.com/login', 'https://paypal-secure-login.net', 'paypal.com.verify-account.ru'], correctIndex: 0, explanation: 'Always check the exact domain. Scammers use lookalike URLs with extra words, number swaps, or wrong endings.' },
  ],
};

const lastQuizIndex: Record<string, number> = {};
function offlineQuiz(topic: string): QuizQ {
  const key = Object.keys(OFFLINE_QUIZ_BANK).find(k => topic.toLowerCase().includes(k.toLowerCase())) ?? 'compound growth';
  const bank = OFFLINE_QUIZ_BANK[key];
  const last = lastQuizIndex[key] ?? -1;
  let idx = Math.floor(Math.random() * bank.length);
  if (bank.length > 1 && idx === last) idx = (idx + 1) % bank.length;
  lastQuizIndex[key] = idx;
  return bank[idx];
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
