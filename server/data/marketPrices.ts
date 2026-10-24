/**
 * marketPrices.ts
 * ---------------
 * Loads price data at runtime. Priority:
 *   1. apps/api/src/data/market/prices.json  (fetched by scripts/fetch-prices.ts, gitignored)
 *   2. apps/api/src/data/market/prices-fallback.json  (synthetic CC0 data, committed)
 *
 * DISCLAIMER: Delayed sample data / synthetic data only.
 * Not real-time. Not investment advice. Educational use only.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface DayBar { date: string; close: number; }

export interface PriceFile {
  generatedAt: string;
  source: 'fin-node' | 'synthetic';
  attribution: string;
  disclaimer: string;
  tickers: Record<string, DayBar[]>;
}

const LIVE_PATH     = join(__dirname, '../../Stackly/apps/api/src/data/market/prices.json');
const FALLBACK_PATH = join(__dirname, '../../Stackly/apps/api/src/data/market/prices-fallback.json');

let _cache: PriceFile | null = null;
let _loadedAt = 0;
const TTL_MS = 4 * 3600 * 1000; // re-read from disk every 4 hours

export function getPriceFile(): PriceFile {
  if (_cache && Date.now() - _loadedAt < TTL_MS) return _cache;

  const path = existsSync(LIVE_PATH) ? LIVE_PATH : FALLBACK_PATH;
  try {
    _cache = JSON.parse(readFileSync(path, 'utf8')) as PriceFile;
    _loadedAt = Date.now();
    return _cache;
  } catch {
    throw new Error('Could not load market price data');
  }
}

export function getTickers(): string[] {
  return Object.keys(getPriceFile().tickers);
}

export function getBars(ticker: string): DayBar[] {
  return getPriceFile().tickers[ticker] ?? [];
}

/** Last close price in cents for a ticker, or null if not found */
export function lastCloseCents(ticker: string, asOfDate?: string): number | null {
  const bars = getBars(ticker);
  if (!bars.length) return null;
  if (!asOfDate) return Math.round((bars.at(-1)!.close) * 100);
  // replay: find last bar on or before asOfDate
  let last: number | null = null;
  for (const bar of bars) {
    if (bar.date > asOfDate) break;
    last = Math.round(bar.close * 100);
  }
  return last;
}

export interface TickerInfo {
  ticker: string;
  name: string;
  lastClose: number;   // dollars
  bars: DayBar[];
}

// Human-readable names for UI (widely known — no buy/sell implication)
const NAMES: Record<string, string> = {
  AAPL: 'Apple',         MSFT: 'Microsoft',     GOOGL: 'Alphabet',
  AMZN: 'Amazon',        META: 'Meta',           TSLA: 'Tesla',
  NVDA: 'NVIDIA',        JPM: 'JPMorgan Chase',  BAC: 'Bank of America',
  WMT: 'Walmart',        DIS: 'Disney',          NFLX: 'Netflix',
  UBER: 'Uber',          CRM: 'Salesforce',      INTC: 'Intel',
  XOM: 'ExxonMobil',     CVX: 'Chevron',         GS: 'Goldman Sachs',
  AMD: 'AMD',            ORCL: 'Oracle',
  SPY: 'S&P 500 Index Fund (sample)', QQQ: 'Nasdaq 100 Index Fund (sample)',
  BLK: 'BlackRock',      AVGO: 'Broadcom',       TSM: 'TSMC',
};

export function getTickerInfo(ticker: string, asOfDate?: string): TickerInfo | null {
  const bars = getBars(ticker);
  if (!bars.length) return null;
  let lastClose = bars.at(-1)!.close;
  if (asOfDate) {
    for (const bar of bars) {
      if (bar.date > asOfDate) break;
      lastClose = bar.close;
    }
  }
  return { ticker, name: NAMES[ticker] ?? ticker, lastClose, bars };
}
