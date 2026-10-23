/**
 * AI coach route — wraps OpenAI Chat API with band-aware system prompt.
 * The prompt enforces reading level and prohibits financial advice.
 */
import { Hono } from 'hono';
import { db, chatMessages } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { nanoid } from '../utils/nanoid.js';

type Band = 'sprouts' | 'builders' | 'investors';

const BAND_PROMPTS: Record<Band, string> = {
  sprouts: `You are Penny, a friendly money coach for kids aged 7-10. Use very simple words (grade 3 reading level). Keep answers to 2-3 short sentences. Use fun comparisons like "it's like a piggy bank". NEVER recommend buying or selling any specific investment. NEVER give personal financial advice. Always remind kids to ask a grown-up about real money decisions.`,

  builders: `You are Penny, a friendly money coach for kids aged 11-14. Use clear language at a grade 6 reading level. Give helpful explanations with real examples. Keep answers to 3-5 sentences. NEVER recommend buying or selling any specific investment. NEVER give personal financial advice. Remind learners that Stackly uses practice money only and is for education.`,

  investors: `You are Penny, a money coach for young adults aged 15-24. Write at a grade 9 reading level. Explain concepts clearly, use real-world comparisons, and cover nuance where helpful. NEVER recommend buying or selling any specific security. NEVER give personal financial advice. Always clarify when something is educational only. Encourage consulting a licensed financial advisor for real decisions.`,
};

const router = new Hono();

// POST /ai/ask
// Body: { profileId, band, message, history? }
router.post('/ask', async (c) => {
  const body = await c.req.json<{
    profileId?: string;
    band?: string;
    message?: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
  }>();

  const { profileId, band, message, history = [] } = body;
  if (!profileId || !band || !message) {
    return c.json({ error: 'profileId, band and message are required' }, 400);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return c.json({ error: 'AI coach not configured (missing OPENAI_API_KEY)' }, 503);
  }

  const systemPrompt = BAND_PROMPTS[(band as Band) ?? 'builders'];

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.slice(-6), // keep last 6 turns for context
    { role: 'user' as const, content: message.slice(0, 800) },
  ];

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    return c.json({ error: `AI request failed: ${text}` }, 502);
  }

  type OAIResponse = { choices: { message: { content: string } }[] };
  const data = (await resp.json()) as OAIResponse;
  const reply = data.choices[0]?.message?.content ?? 'Sorry, I could not respond right now.';

  // Persist both turns
  await db.insert(chatMessages).values([
    {
      id: nanoid(),
      profileId,
      role: 'user',
      content: message.slice(0, 800),
      createdAt: new Date(),
    },
    {
      id: nanoid(),
      profileId,
      role: 'assistant',
      content: reply,
      createdAt: new Date(),
    },
  ]);

  return c.json({ reply });
});

// GET /ai/history/:profileId — last 20 messages
router.get('/history/:profileId', async (c) => {
  const msgs = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.profileId, c.req.param('profileId')));
  return c.json(msgs.slice(-20));
});

export default router;
