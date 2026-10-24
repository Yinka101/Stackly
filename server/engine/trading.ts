/**
 * trading.ts — pure trading engine (no I/O, no DB)
 * All monetary values are in Practice Dollars (integer cents to avoid float drift).
 * External callers convert: dollars * 100 = cents.
 * "Shares" support up to 6 decimal places (fractional).
 *
 * EDUCATIONAL USE ONLY — practice money, not financial advice.
 */

export interface Position {
  ticker:        string;
  shares:        number;   // fractional, max 6dp
  avgCostCents:  number;   // integer cents per share at purchase
}

export interface Portfolio {
  cashCents:    number;        // Practice Dollars × 100
  positions:    Position[];
}

export interface TradeResult {
  ok:           boolean;
  error?:       string;
  newPortfolio: Portfolio;
  costCents:    number;        // total cost of this trade
  sharesFilled: number;
}

export interface PnLRow {
  ticker:         string;
  shares:         number;
  avgCostCents:   number;
  currentPriceCents: number;
  marketValueCents:  number;
  unrealisedPnLCents: number;
  unrealisedPct:  number;
  allocationPct:  number;
}

export interface PortfolioSummary {
  cashCents:          number;
  totalValueCents:    number;
  totalCostCents:     number;
  unrealisedPnLCents: number;
  unrealisedPct:      number;
  rows:               PnLRow[];
}

// ── helpers ──────────────────────────────────────────────────────────────────

/** Round shares to 6 decimal places */
function r6(n: number) { return Math.round(n * 1e6) / 1e6; }

/** Round cents to nearest integer */
function rc(n: number) { return Math.round(n); }

function clonePortfolio(p: Portfolio): Portfolio {
  return {
    cashCents: p.cashCents,
    positions: p.positions.map(pos => ({ ...pos })),
  };
}

// ── buy ───────────────────────────────────────────────────────────────────────

/**
 * Buy `shares` (or `dollars` worth) of `ticker` at `priceCents` (last close).
 * Pass either `shares` or `dollars` — not both.
 * No leverage. Cash must cover the full cost.
 */
export function buy(
  portfolio: Portfolio,
  ticker: string,
  priceCents: number,
  options: { shares?: number; dollars?: number },
): TradeResult {
  if (priceCents <= 0) return fail(portfolio, 'Invalid price');
  if (!ticker)         return fail(portfolio, 'Ticker required');

  let sharesFilled: number;
  if (options.dollars !== undefined) {
    if (options.dollars <= 0) return fail(portfolio, 'Amount must be positive');
    sharesFilled = r6(options.dollars / (priceCents / 100));
  } else if (options.shares !== undefined) {
    if (options.shares <= 0) return fail(portfolio, 'Shares must be positive');
    sharesFilled = r6(options.shares);
  } else {
    return fail(portfolio, 'Provide shares or dollars');
  }

  const costCents = rc(sharesFilled * priceCents);

  if (costCents > portfolio.cashCents) {
    return fail(portfolio, `Not enough Practice Dollars (need $${(costCents / 100).toFixed(2)}, have $${(portfolio.cashCents / 100).toFixed(2)})`);
  }

  const next = clonePortfolio(portfolio);
  next.cashCents -= costCents;

  const existing = next.positions.find(p => p.ticker === ticker);
  if (existing) {
    // Weighted-average cost basis
    const totalShares = r6(existing.shares + sharesFilled);
    existing.avgCostCents = rc(
      (existing.shares * existing.avgCostCents + sharesFilled * priceCents) / totalShares,
    );
    existing.shares = totalShares;
  } else {
    next.positions.push({ ticker, shares: sharesFilled, avgCostCents: priceCents });
  }

  return { ok: true, newPortfolio: next, costCents, sharesFilled };
}

// ── sell ──────────────────────────────────────────────────────────────────────

/**
 * Sell `shares` of `ticker` at `priceCents`.
 * No shorting — learner must own at least that many shares.
 */
export function sell(
  portfolio: Portfolio,
  ticker: string,
  priceCents: number,
  shares: number,
): TradeResult {
  if (priceCents <= 0)  return fail(portfolio, 'Invalid price');
  if (shares <= 0)      return fail(portfolio, 'Shares must be positive');

  const pos = portfolio.positions.find(p => p.ticker === ticker);
  if (!pos)             return fail(portfolio, `You don't own any ${ticker}`);
  if (r6(shares) > pos.shares) {
    return fail(portfolio, `You only own ${pos.shares} shares of ${ticker}`);
  }

  const proceeds = rc(shares * priceCents);
  const next = clonePortfolio(portfolio);
  next.cashCents += proceeds;

  const nextPos = next.positions.find(p => p.ticker === ticker)!;
  nextPos.shares = r6(nextPos.shares - shares);
  if (nextPos.shares < 1e-6) {
    // Remove position if effectively zero
    next.positions = next.positions.filter(p => p.ticker !== ticker);
  }

  return { ok: true, newPortfolio: next, costCents: -proceeds, sharesFilled: shares };
}

// ── summary ───────────────────────────────────────────────────────────────────

/**
 * Compute portfolio summary given a price map {ticker: lastCloseCents}.
 */
export function summarise(
  portfolio: Portfolio,
  prices: Record<string, number>,
): PortfolioSummary {
  const rows: PnLRow[] = [];
  let totalMarketCents = 0;
  let totalCostCents   = 0;

  for (const pos of portfolio.positions) {
    const priceCents = prices[pos.ticker] ?? pos.avgCostCents;
    const marketValue = rc(pos.shares * priceCents);
    const costBasis   = rc(pos.shares * pos.avgCostCents);
    const pnl         = marketValue - costBasis;
    const pct         = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

    rows.push({
      ticker:              pos.ticker,
      shares:              pos.shares,
      avgCostCents:        pos.avgCostCents,
      currentPriceCents:   priceCents,
      marketValueCents:    marketValue,
      unrealisedPnLCents:  pnl,
      unrealisedPct:       Math.round(pct * 100) / 100,
      allocationPct:       0, // filled below
    });

    totalMarketCents += marketValue;
    totalCostCents   += costBasis;
  }

  const totalValueCents = totalMarketCents + portfolio.cashCents;

  // Fill allocations
  for (const row of rows) {
    row.allocationPct = totalValueCents > 0
      ? Math.round((row.marketValueCents / totalValueCents) * 10000) / 100
      : 0;
  }

  const unrealisedPnL = totalMarketCents - totalCostCents;
  const unrealisedPct = totalCostCents > 0
    ? Math.round((unrealisedPnL / totalCostCents) * 10000) / 100
    : 0;

  return {
    cashCents:          portfolio.cashCents,
    totalValueCents,
    totalCostCents,
    unrealisedPnLCents: unrealisedPnL,
    unrealisedPct,
    rows,
  };
}

// ── compound growth (what-if calculator) ─────────────────────────────────────

export interface GrowthPoint {
  year:         number;
  valueDollars: number;
}

export function compoundGrowth(
  principalDollars: number,
  annualRatePct: number,
  years: number,
  monthlyContributionDollars = 0,
): GrowthPoint[] {
  const rate = annualRatePct / 100;
  const points: GrowthPoint[] = [];
  let value = principalDollars;

  for (let y = 0; y <= years; y++) {
    points.push({ year: y, valueDollars: Math.round(value * 100) / 100 });
    // Monthly compounding for next year
    const monthlyRate = rate / 12;
    for (let m = 0; m < 12; m++) {
      value = (value + monthlyContributionDollars) * (1 + monthlyRate);
    }
  }
  return points;
}

// ── replay helpers ────────────────────────────────────────────────────────────

/**
 * Given a sorted array of {date, close} bars and a target date,
 * return the bar at or before that date (last close principle).
 */
export function priceAtDate(bars: { date: string; close: number }[], targetDate: string): number | null {
  let last: number | null = null;
  for (const bar of bars) {
    if (bar.date > targetDate) break;
    last = bar.close;
  }
  return last;
}

// ── internal ──────────────────────────────────────────────────────────────────

function fail(portfolio: Portfolio, error: string): TradeResult {
  return { ok: false, error, newPortfolio: portfolio, costCents: 0, sharesFilled: 0 };
}
