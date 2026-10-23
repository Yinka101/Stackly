import { Hono } from 'hono';
import { db, profiles, holdings, trades } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { nanoid } from '../utils/nanoid.js';

const router = new Hono();

// Mock price feed — in practice you'd call a free market data API
// Prices are in Practice-Dollar cents (100 = $1 Practice)
const MOCK_PRICES: Record<string, { name: string; priceCents: number; change1d: number }> = {
  AAPL: { name: 'Apple', priceCents: 18900, change1d: 1.2 },
  MSFT: { name: 'Microsoft', priceCents: 37500, change1d: -0.5 },
  GOOGL: { name: 'Alphabet', priceCents: 16200, change1d: 0.8 },
  AMZN: { name: 'Amazon', priceCents: 19800, change1d: -1.1 },
  TSLA: { name: 'Tesla', priceCents: 24300, change1d: 2.4 },
};

// GET /portfolio/:profileId
router.get('/:profileId', async (c) => {
  const profileId = c.req.param('profileId');
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, profileId));
  if (!profile) return c.json({ error: 'profile not found' }, 404);

  const held = await db.select().from(holdings).where(eq(holdings.profileId, profileId));

  const positions = held.map((h) => {
    const price = MOCK_PRICES[h.ticker];
    const currentPriceCents = price?.priceCents ?? 0;
    const marketValueCents = Math.round(h.shares * currentPriceCents);
    const costBasisCents = Math.round(h.shares * h.avgCostCents);
    return {
      ticker: h.ticker,
      name: price?.name ?? h.ticker,
      shares: h.shares,
      avgCostCents: h.avgCostCents,
      currentPriceCents,
      marketValueCents,
      gainLossCents: marketValueCents - costBasisCents,
      change1d: price?.change1d ?? 0,
    };
  });

  const totalMarketValueCents = positions.reduce((s, p) => s + p.marketValueCents, 0);

  return c.json({
    profileId,
    practiceDollars: profile.practiceDollars,
    totalMarketValueCents,
    positions,
    prices: MOCK_PRICES,
  });
});

// POST /portfolio/:profileId/trade
// Body: { ticker, side, shares }
router.post('/:profileId/trade', async (c) => {
  const profileId = c.req.param('profileId');
  const body = await c.req.json<{ ticker?: string; side?: string; shares?: number }>();
  const { ticker, side, shares } = body;

  if (!ticker || !side || shares == null || shares <= 0) {
    return c.json({ error: 'ticker, side, and shares (>0) required' }, 400);
  }
  if (side !== 'buy' && side !== 'sell') {
    return c.json({ error: 'side must be buy or sell' }, 400);
  }
  if (!MOCK_PRICES[ticker]) {
    return c.json({ error: `unknown ticker: ${ticker}` }, 400);
  }

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, profileId));
  if (!profile) return c.json({ error: 'profile not found' }, 404);

  const priceCents = MOCK_PRICES[ticker].priceCents;
  const totalCents = Math.round(priceCents * shares);

  if (side === 'buy') {
    if (profile.practiceDollars * 100 < totalCents) {
      return c.json({ error: 'insufficient Practice Dollars' }, 400);
    }
    // Deduct
    await db
      .update(profiles)
      .set({ practiceDollars: profile.practiceDollars - Math.ceil(totalCents / 100) })
      .where(eq(profiles.id, profileId));

    // Upsert holding
    const [existing] = await db
      .select()
      .from(holdings)
      .where(and(eq(holdings.profileId, profileId), eq(holdings.ticker, ticker)));

    if (existing) {
      const newShares = existing.shares + shares;
      const newAvg = Math.round(
        (existing.shares * existing.avgCostCents + shares * priceCents) / newShares
      );
      await db
        .update(holdings)
        .set({ shares: newShares, avgCostCents: newAvg })
        .where(and(eq(holdings.profileId, profileId), eq(holdings.ticker, ticker)));
    } else {
      await db.insert(holdings).values({
        id: nanoid(),
        profileId,
        ticker,
        shares,
        avgCostCents: priceCents,
      });
    }
  } else {
    // sell
    const [existing] = await db
      .select()
      .from(holdings)
      .where(and(eq(holdings.profileId, profileId), eq(holdings.ticker, ticker)));

    if (!existing || existing.shares < shares) {
      return c.json({ error: 'not enough shares to sell' }, 400);
    }
    const newShares = existing.shares - shares;
    if (newShares < 0.0001) {
      await db
        .delete(holdings)
        .where(and(eq(holdings.profileId, profileId), eq(holdings.ticker, ticker)));
    } else {
      await db
        .update(holdings)
        .set({ shares: newShares })
        .where(and(eq(holdings.profileId, profileId), eq(holdings.ticker, ticker)));
    }
    // Credit
    await db
      .update(profiles)
      .set({ practiceDollars: profile.practiceDollars + Math.floor(totalCents / 100) })
      .where(eq(profiles.id, profileId));
  }

  // Log trade
  await db.insert(trades).values({
    id: nanoid(),
    profileId,
    ticker,
    side,
    shares,
    priceCents,
    createdAt: new Date(),
  });

  const [updated] = await db.select().from(profiles).where(eq(profiles.id, profileId));
  return c.json({ ok: true, practiceDollars: updated.practiceDollars });
});

export default router;
