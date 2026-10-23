import { Hono } from 'hono';

// Static lesson catalog — no DB needed for MVP
// Content adapts per band in the AI coach; these are the structured stubs.

export type Lesson = {
  id: string;
  title: string;
  band: string;
  topic: 'paypal' | 'investing' | 'money-basics';
  durationMins: number;
  summary: string;
  steps: LessonStep[];
};

type LessonStep = {
  heading: string;
  body: string; // plain text, grade-appropriate per band
  quiz?: { question: string; options: string[]; answer: number };
};

const LESSONS: Lesson[] = [
  // ── Sprouts (grade 3) ──────────────────────────────────────
  {
    id: 'sp-paypal-1',
    band: 'sprouts',
    topic: 'paypal',
    title: 'What Is PayPal?',
    durationMins: 3,
    summary: 'Learn how PayPal lets people send money safely over the internet.',
    steps: [
      {
        heading: 'Money on the internet',
        body: 'PayPal is like a piggy bank that lives on the internet. Your grown-up can put money in it and send it to friends or buy things safely.',
        quiz: {
          question: 'What does PayPal do?',
          options: ['Makes pizza', 'Sends money safely online', 'Plays music'],
          answer: 1,
        },
      },
      {
        heading: 'How a payment works',
        body: 'When your grown-up wants to pay for something, they tap "Pay with PayPal". PayPal moves the money in a flash — no cash needed!',
      },
    ],
  },
  {
    id: 'sp-invest-1',
    band: 'sprouts',
    topic: 'investing',
    title: 'What Is Investing?',
    durationMins: 4,
    summary: 'Discover how money can grow over time like a plant.',
    steps: [
      {
        heading: 'Seeds and money',
        body: 'Imagine planting a seed. Over time it grows into a big tree. Investing is like planting your money. You wait, and it can grow bigger!',
        quiz: {
          question: 'Investing is most like:',
          options: ['Spending all your coins now', 'Planting a seed and waiting', 'Giving money away'],
          answer: 1,
        },
      },
      {
        heading: 'Practice Dollars',
        body: 'In Stackly you use Practice Dollars to try investing. It is pretend money so you can learn without any risk.',
      },
    ],
  },
  // ── Builders (grade 6) ────────────────────────────────────
  {
    id: 'bu-paypal-1',
    band: 'builders',
    topic: 'paypal',
    title: 'How PayPal Moves Money',
    durationMins: 5,
    summary: 'Understand the steps a PayPal payment takes from sender to receiver.',
    steps: [
      {
        heading: 'The payment pipeline',
        body: 'When you click Pay, PayPal checks your balance or card, deducts the amount, and sends an instant notification to the seller. The whole thing takes seconds.',
        quiz: {
          question: 'What happens first when you click Pay?',
          options: ['Money arrives at seller', 'PayPal checks your balance', 'Bank sends a cheque'],
          answer: 1,
        },
      },
      {
        heading: 'Buyer & seller protection',
        body: 'PayPal keeps a record of every transaction. If something goes wrong, you can open a dispute. That record is why PayPal is trusted by millions of shoppers.',
      },
    ],
  },
  {
    id: 'bu-invest-1',
    band: 'builders',
    topic: 'investing',
    title: 'Stocks: Owning a Slice of a Company',
    durationMins: 6,
    summary: 'Learn what a stock is and why prices go up and down.',
    steps: [
      {
        heading: 'What is a stock?',
        body: 'A stock is a tiny piece of a company. If a company has 1,000 shares and you own 10, you own 1% of it. When the company does well, your shares are worth more.',
        quiz: {
          question: 'If you own 5 out of 100 shares, what percentage do you own?',
          options: ['1%', '5%', '50%'],
          answer: 1,
        },
      },
      {
        heading: 'Why prices change',
        body: 'Stock prices move because of supply and demand. If lots of people want to buy a stock and few want to sell, the price goes up.',
      },
    ],
  },
  // ── Investors (grade 9) ───────────────────────────────────
  {
    id: 'in-paypal-1',
    band: 'investors',
    topic: 'paypal',
    title: 'PayPal Under the Hood',
    durationMins: 7,
    summary: "Explore how PayPal's REST API powers payments — the same API you could build with.",
    steps: [
      {
        heading: 'REST APIs and fintech',
        body: 'PayPal exposes its payments engine through a REST API. Developers create an Order, the buyer approves it, and the developer captures the funds. Each step is a separate HTTP request with a JSON payload.',
        quiz: {
          question: 'Which step comes last in the PayPal Orders flow?',
          options: ['Create order', 'Capture order', 'Buyer approval'],
          answer: 1,
        },
      },
      {
        heading: 'OAuth 2.0 client credentials',
        body: 'Before making any API call, your server exchanges its Client ID and Secret for a short-lived Bearer token. This keeps your credentials off the client.',
      },
    ],
  },
  {
    id: 'in-invest-1',
    band: 'investors',
    topic: 'investing',
    title: 'Diversification and Risk',
    durationMins: 8,
    summary: "Understand why spreading investments across assets reduces risk without killing returns.",
    steps: [
      {
        heading: 'Correlation and portfolio theory',
        body: "Harry Markowitz showed that combining assets with low correlation reduces a portfolio's total risk. When one asset falls, another may not — smoothing your overall return.",
        quiz: {
          question: 'Low-correlation assets in a portfolio tend to:',
          options: ['Increase total risk', 'Reduce total risk', 'Have no effect on risk'],
          answer: 1,
        },
      },
      {
        heading: 'The risk/return trade-off',
        body: 'Higher potential returns almost always come with higher risk. Your job as an investor is to find the combination that fits your goals and timeline.',
      },
    ],
  },
];

const router = new Hono();

// GET /lessons?band=sprouts
router.get('/', (c) => {
  const band = c.req.query('band');
  const filtered = band ? LESSONS.filter((l) => l.band === band) : LESSONS;
  // Return metadata only (no steps) in the list
  return c.json(
    filtered.map(({ id, title, band, topic, durationMins, summary }) => ({
      id, title, band, topic, durationMins, summary,
    }))
  );
});

// GET /lessons/:id
router.get('/:id', (c) => {
  const lesson = LESSONS.find((l) => l.id === c.req.param('id'));
  if (!lesson) return c.json({ error: 'lesson not found' }, 404);
  return c.json(lesson);
});

export default router;
