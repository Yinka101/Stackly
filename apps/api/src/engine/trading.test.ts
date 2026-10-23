import { describe, it, expect } from 'vitest';
import { buy, sell, summarise, compoundGrowth, priceAtDate } from './trading';
import type { Portfolio } from './trading';

const EMPTY: Portfolio = { cashCents: 100_000, positions: [] }; // $1,000

// ── buy ───────────────────────────────────────────────────────────────────────

describe('buy', () => {
  it('buys whole shares at last close', () => {
    const r = buy(EMPTY, 'AAPL', 18000, { shares: 2 }); // $180.00/share
    expect(r.ok).toBe(true);
    expect(r.sharesFilled).toBe(2);
    expect(r.costCents).toBe(36000);
    expect(r.newPortfolio.cashCents).toBe(64000);
    expect(r.newPortfolio.positions[0]).toMatchObject({ ticker: 'AAPL', shares: 2 });
  });

  it('buys fractional shares by dollar amount', () => {
    const r = buy(EMPTY, 'AAPL', 18000, { dollars: 90 }); // $90 / $180 = 0.5 shares
    expect(r.ok).toBe(true);
    expect(r.sharesFilled).toBeCloseTo(0.5, 5);
    expect(r.newPortfolio.positions[0].shares).toBeCloseTo(0.5, 5);
  });

  it('rejects buy when cash is insufficient', () => {
    const r = buy(EMPTY, 'AAPL', 18000, { shares: 100 }); // $18,000 > $1,000
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/not enough/i);
    expect(r.newPortfolio.cashCents).toBe(100_000); // unchanged
  });

  it('averages cost basis on a second buy', () => {
    const r1 = buy(EMPTY, 'AAPL', 10000, { shares: 1 }); // bought at $100
    const r2 = buy(r1.newPortfolio, 'AAPL', 20000, { shares: 1 }); // bought at $200
    const pos = r2.newPortfolio.positions.find(p => p.ticker === 'AAPL')!;
    expect(pos.shares).toBe(2);
    expect(pos.avgCostCents).toBe(15000); // ($100 + $200) / 2
  });

  it('rejects zero or negative shares', () => {
    expect(buy(EMPTY, 'AAPL', 18000, { shares: 0 }).ok).toBe(false);
    expect(buy(EMPTY, 'AAPL', 18000, { shares: -1 }).ok).toBe(false);
  });

  it('rejects invalid price', () => {
    expect(buy(EMPTY, 'AAPL', 0, { shares: 1 }).ok).toBe(false);
  });
});

// ── sell ──────────────────────────────────────────────────────────────────────

describe('sell', () => {
  function withPosition(): Portfolio {
    return buy(EMPTY, 'AAPL', 18000, { shares: 2 }).newPortfolio;
  }

  it('sells whole shares and credits cash', () => {
    const p = withPosition();
    const r = sell(p, 'AAPL', 20000, 1); // sell 1 share at $200
    expect(r.ok).toBe(true);
    expect(r.newPortfolio.cashCents).toBe(p.cashCents + 20000);
    expect(r.newPortfolio.positions[0].shares).toBe(1);
  });

  it('removes position when all shares sold', () => {
    const p = withPosition();
    const r = sell(p, 'AAPL', 20000, 2);
    expect(r.ok).toBe(true);
    expect(r.newPortfolio.positions).toHaveLength(0);
  });

  it('rejects selling more than owned', () => {
    const p = withPosition();
    const r = sell(p, 'AAPL', 20000, 5);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/only own/i);
  });

  it('rejects selling a ticker not in portfolio', () => {
    const r = sell(EMPTY, 'MSFT', 30000, 1);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/don't own/i);
  });

  it('no shorting — sell exactly owned then reject more', () => {
    const p = withPosition();
    const r1 = sell(p, 'AAPL', 20000, 2);
    const r2 = sell(r1.newPortfolio, 'AAPL', 20000, 0.001);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(false);
  });
});

// ── summarise ─────────────────────────────────────────────────────────────────

describe('summarise', () => {
  it('computes unrealised P&L', () => {
    const r = buy(EMPTY, 'AAPL', 10000, { shares: 2 }); // cost $200
    const summary = summarise(r.newPortfolio, { AAPL: 15000 }); // now $150/share
    expect(summary.rows[0].unrealisedPnLCents).toBe(10000); // +$100
    expect(summary.unrealisedPct).toBeCloseTo(50, 1);
  });

  it('computes allocation percentages summing to ≤ 100', () => {
    let p = buy(EMPTY, 'AAPL', 10000, { shares: 1 }).newPortfolio;
    p = buy(p, 'MSFT', 10000, { shares: 1 }).newPortfolio;
    const summary = summarise(p, { AAPL: 10000, MSFT: 10000 });
    const total = summary.rows.reduce((s, r) => s + r.allocationPct, 0);
    expect(total).toBeLessThanOrEqual(100.01); // floating point tolerance
  });

  it('falls back to avg cost when price is missing', () => {
    const r = buy(EMPTY, 'AAPL', 10000, { shares: 1 });
    const summary = summarise(r.newPortfolio, {}); // no prices
    expect(summary.rows[0].unrealisedPnLCents).toBe(0);
  });
});

// ── compoundGrowth ────────────────────────────────────────────────────────────

describe('compoundGrowth', () => {
  it('returns year-0 value equal to principal', () => {
    const pts = compoundGrowth(1000, 7, 10);
    expect(pts[0].valueDollars).toBe(1000);
  });

  it('grows correctly over 1 year at 12% monthly compounding', () => {
    const pts = compoundGrowth(1000, 12, 1);
    // (1 + 0.01)^12 = 1.12683...
    expect(pts[1].valueDollars).toBeCloseTo(1126.83, 0);
  });

  it('includes monthly contributions', () => {
    const pts = compoundGrowth(0, 0, 1, 100); // $100/month, 0% rate
    expect(pts[1].valueDollars).toBeCloseTo(1200, 0);
  });

  it('returns years+1 data points', () => {
    expect(compoundGrowth(500, 5, 20)).toHaveLength(21);
  });
});

// ── priceAtDate ───────────────────────────────────────────────────────────────

describe('priceAtDate', () => {
  const bars = [
    { date: '2024-01-02', close: 100 },
    { date: '2024-01-03', close: 110 },
    { date: '2024-01-05', close: 120 }, // gap (4th is a weekend)
  ];

  it('returns exact date close', () => {
    expect(priceAtDate(bars, '2024-01-03')).toBe(110);
  });

  it('returns last close before a gap (weekend)', () => {
    expect(priceAtDate(bars, '2024-01-04')).toBe(110);
  });

  it('returns null before first bar', () => {
    expect(priceAtDate(bars, '2024-01-01')).toBeNull();
  });

  it('returns last bar on or after last date', () => {
    expect(priceAtDate(bars, '2024-12-31')).toBe(120);
  });
});
