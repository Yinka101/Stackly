/**
 * invest.ts — paper-trading API routes
 * EDUCATIONAL USE ONLY — Practice Dollars, not real money.
 */

import { Hono } from 'hono';
import { db } from '../db/index';
import { learners, holdings, trades, replaySessions } from '../db/schema';
import { requireLearner } from '../middleware/session';
import { buy, sell, summarise, type Portfolio } from '../engine/trading';
import { getTickers, getTickerInfo, lastCloseCents, getPriceFile } from '../data/marketPrices';
import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from '../utils/nanoid';

const invest = new Hono();

// ── Market data ───────────────────────────────────────────────────────────────

/** GET /invest/tickers — list all available tickers */
invest.get('/tickers', async (c) => {
  const file = getPriceFile();
  const tickers = getTickers().map(ticker => {
    const info = getTickerInfo(ticker);
    return { ticker, name: info?.name ?? ticker, lastClose: info?.lastClose ?? 0 };
  });
  return c.json({
    tickers,
    source: file.source,
    disclaimer: file.disclaimer,
    attribution: file.source === 'fin-node' ? file.attribution : undefined,
    generatedAt: file.generatedAt,
  });
});

/** GET /invest/tickers/:ticker — bars for one ticker */
invest.get('/tickers/:ticker', async (c) => {
  const { ticker } = c.req.param();
  const asOf = c.req.query('asOf');
  const info = getTickerInfo(ticker.toUpperCase(), asOf);
  if (!info) return c.json({ error: 'Ticker not found' }, 404);
  const file = getPriceFile();
  return c.json({ ...info, disclaimer: file.disclaimer });
});

// ── Portfolio ─────────────────────────────────────────────────────────────────

/** GET /invest/portfolio — holdings, cash, P&L */
invest.get('/portfolio', requireLearner, async (c) => {
  const actor = c.get('actor') as { id: string };
  const learnerId = actor.id;

  const learner = await db.select().from(learners).where(eq(learners.id, learnerId)).get();
  if (!learner) return c.json({ error: 'Learner not found' }, 404);

  const rows = await db.select().from(holdings).where(eq(holdings.learnerId, learnerId)).all();

  const portfolio: Portfolio = {
    cashCents: learner.practiceDollars * 100,
    positions: rows.map(r => ({
      ticker: r.ticker,
      shares: r.shares,
      avgCostCents: r.avgCostCents,
    })),
  };

  const prices: Record<string, number> = {};
  for (const row of rows) {
    const p = lastCloseCents(row.ticker);
    if (p) prices[row.ticker] = p;
  }

  const summary = summarise(portfolio, prices);
  const file = getPriceFile();

  return c.json({ ...summary, disclaimer: file.disclaimer, source: file.source });
});

/** GET /invest/trades — trade history */
invest.get('/trades', requireLearner, async (c) => {
  const actor = c.get('actor') as { id: string };
  const rows = await db
    .select()
    .from(trades)
    .where(eq(trades.learnerId, actor.id))
    .orderBy(desc(trades.createdAt))
    .limit(200)
    .all();
  return c.json({ trades: rows });
});

// ── Trading ───────────────────────────────────────────────────────────────────

/** POST /invest/trade — buy or sell */
invest.post('/trade', requireLearner, async (c) => {
  const actor = c.get('actor') as { id: string };
  const learnerId = actor.id;

  const body = await c.req.json() as {
    side: 'buy' | 'sell';
    ticker: string;
    shares?: number;
    dollars?: number;
    reflection?: string;
    replayDate?: string;   // YYYY-MM-DD if in replay mode
  };

  const { side, ticker, shares, dollars, reflection, replayDate } = body;

  if (!['buy', 'sell'].includes(side)) return c.json({ error: 'side must be buy or sell' }, 400);
  if (!ticker) return c.json({ error: 'ticker required' }, 400);
  if (side === 'buy' && (!reflection || reflection.trim().length < 5)) {
    return c.json({ error: 'Please write a short reason for this buy (at least 5 characters).' }, 400);
  }

  const priceCents = lastCloseCents(ticker.toUpperCase(), replayDate);
  if (!priceCents) return c.json({ error: `No price data for ${ticker}` }, 400);

  const learner = await db.select().from(learners).where(eq(learners.id, learnerId)).get();
  if (!learner) return c.json({ error: 'Learner not found' }, 404);

  const holdingRows = await db.select().from(holdings).where(eq(holdings.learnerId, learnerId)).all();
  const portfolio: Portfolio = {
    cashCents: learner.practiceDollars * 100,
    positions: holdingRows.map(r => ({ ticker: r.ticker, shares: r.shares, avgCostCents: r.avgCostCents })),
  };

  const result = side === 'buy'
    ? buy(portfolio, ticker.toUpperCase(), priceCents, { shares, dollars })
    : sell(portfolio, ticker.toUpperCase(), priceCents, shares!);

  if (!result.ok) return c.json({ error: result.error }, 400);

  // Persist
  await db.transaction(async (tx) => {
    // Update cash
    await tx.update(learners)
      .set({ practiceDollars: Math.round(result.newPortfolio.cashCents / 100) })
      .where(eq(learners.id, learnerId))
      .run();

    // Update holding
    const pos = result.newPortfolio.positions.find(p => p.ticker === ticker.toUpperCase());
    const existing = holdingRows.find(h => h.ticker === ticker.toUpperCase());

    if (pos) {
      if (existing) {
        await tx.update(holdings)
          .set({ shares: pos.shares, avgCostCents: pos.avgCostCents })
          .where(and(eq(holdings.learnerId, learnerId), eq(holdings.ticker, ticker.toUpperCase())))
          .run();
      } else {
        await tx.insert(holdings).values({
          id: nanoid(),
          learnerId,
          ticker: ticker.toUpperCase(),
          shares: pos.shares,
          avgCostCents: pos.avgCostCents,
        }).run();
      }
    } else if (existing) {
      // Position closed
      await tx.delete(holdings)
        .where(and(eq(holdings.learnerId, learnerId), eq(holdings.ticker, ticker.toUpperCase())))
        .run();
    }

    // Log trade
    await tx.insert(trades).values({
      id: nanoid(),
      learnerId,
      ticker: ticker.toUpperCase(),
      side,
      shares: result.sharesFilled,
      priceCents,
      reflection: reflection ?? null,
      replayDate: replayDate ?? null,
      createdAt: new Date(),
    }).run();
  });

  return c.json({ ok: true, sharesFilled: result.sharesFilled, costCents: result.costCents });
});

// ── Replay ────────────────────────────────────────────────────────────────────

/** POST /invest/replay/start — start a new replay session */
invest.post('/replay/start', requireLearner, async (c) => {
  const actor = c.get('actor') as { id: string };
  const { startDate } = await c.req.json() as { startDate: string };

  if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return c.json({ error: 'startDate must be YYYY-MM-DD' }, 400);
  }

  // Deactivate existing replay
  await db.update(replaySessions)
    .set({ active: false })
    .where(and(eq(replaySessions.learnerId, actor.id), eq(replaySessions.active, true)))
    .run();

  const id = nanoid();
  await db.insert(replaySessions).values({
    id,
    learnerId: actor.id,
    startDate,
    currentDate: startDate,
    cashCents: 100000, // $1,000 fresh for replay
    active: true,
    createdAt: new Date(),
  }).run();

  return c.json({ replayId: id, currentDate: startDate });
});

/** GET /invest/replay — get active replay session */
invest.get('/replay', requireLearner, async (c) => {
  const actor = c.get('actor') as { id: string };
  const session = await db.select().from(replaySessions)
    .where(and(eq(replaySessions.learnerId, actor.id), eq(replaySessions.active, true)))
    .get();

  if (!session) return c.json({ active: false });

  const prices: Record<string, number> = {};
  for (const ticker of getTickers()) {
    const p = lastCloseCents(ticker, session.currentDate);
    if (p) prices[ticker] = p;
  }

  return c.json({ active: true, session, prices });
});

/** POST /invest/replay/advance — advance by 1 day or 1 week */
invest.post('/replay/advance', requireLearner, async (c) => {
  const actor = c.get('actor') as { id: string };
  const { step } = await c.req.json() as { step: 'day' | 'week' };

  const session = await db.select().from(replaySessions)
    .where(and(eq(replaySessions.learnerId, actor.id), eq(replaySessions.active, true)))
    .get();

  if (!session) return c.json({ error: 'No active replay session' }, 404);

  const current = new Date(session.currentDate);
  const days = step === 'week' ? 7 : 1;
  current.setDate(current.getDate() + days);
  const newDate = current.toISOString().slice(0, 10);

  // Don't advance past today
  const today = new Date().toISOString().slice(0, 10);
  const finalDate = newDate > today ? today : newDate;

  await db.update(replaySessions)
    .set({ currentDate: finalDate })
    .where(eq(replaySessions.id, session.id))
    .run();

  return c.json({ currentDate: finalDate, reachedToday: finalDate === today });
});

export default invest;
