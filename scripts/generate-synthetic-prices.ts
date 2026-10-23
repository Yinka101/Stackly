/**
 * generate-synthetic-prices.ts
 * ----------------------------
 * Generates a CC0-licensed synthetic price dataset for 25 tickers.
 * Prices are NOT real market data. They are simulated using geometric
 * Brownian motion seeded from a fixed random seed so results are
 * reproducible. Starting prices are approximate and publicly known
 * round numbers — not precise historical closes.
 *
 * LICENSE: CC0 1.0 Universal (public domain dedication).
 * This file and the data it produces may be used, copied, modified,
 * distributed, and performed for any purpose without permission.
 *
 * DISCLAIMER: Synthetic educational data only. Not real prices.
 * Not investment advice. For Stackly educational use only.
 *
 * Usage: bun scripts/generate-synthetic-prices.ts
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

const OUT_PATH = join(__dirname, '../apps/api/src/data/market/prices-fallback.json');
mkdirSync(dirname(OUT_PATH), { recursive: true });

// Seeded pseudo-random (mulberry32 — public domain)
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Box-Muller normal variate
function makeNormal(rand: () => number) {
  return function (): number {
    const u = 1 - rand();
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
}

interface TickerSpec {
  name: string;
  startPrice: number;
  annualDrift: number;   // expected annual return (decimal)
  annualVol: number;     // annual volatility (decimal)
  seed: number;
}

// 20 stocks + 5 ETF-like instruments
// Start prices are approximate public knowledge round numbers, not precise closes.
const SPECS: TickerSpec[] = [
  { name: 'AAPL',  startPrice: 180,  annualDrift: 0.18, annualVol: 0.28, seed: 1001 },
  { name: 'MSFT',  startPrice: 375,  annualDrift: 0.16, annualVol: 0.25, seed: 1002 },
  { name: 'GOOGL', startPrice: 140,  annualDrift: 0.14, annualVol: 0.27, seed: 1003 },
  { name: 'AMZN',  startPrice: 175,  annualDrift: 0.20, annualVol: 0.30, seed: 1004 },
  { name: 'META',  startPrice: 370,  annualDrift: 0.22, annualVol: 0.35, seed: 1005 },
  { name: 'TSLA',  startPrice: 200,  annualDrift: 0.10, annualVol: 0.65, seed: 1006 },
  { name: 'NVDA',  startPrice: 550,  annualDrift: 0.40, annualVol: 0.60, seed: 1007 },
  { name: 'JPM',   startPrice: 195,  annualDrift: 0.12, annualVol: 0.22, seed: 1008 },
  { name: 'BAC',   startPrice: 34,   annualDrift: 0.10, annualVol: 0.25, seed: 1009 },
  { name: 'WMT',   startPrice: 165,  annualDrift: 0.10, annualVol: 0.18, seed: 1010 },
  { name: 'DIS',   startPrice: 90,   annualDrift: 0.06, annualVol: 0.28, seed: 1011 },
  { name: 'NFLX',  startPrice: 450,  annualDrift: 0.15, annualVol: 0.38, seed: 1012 },
  { name: 'UBER',  startPrice: 65,   annualDrift: 0.18, annualVol: 0.40, seed: 1013 },
  { name: 'CRM',   startPrice: 220,  annualDrift: 0.12, annualVol: 0.32, seed: 1014 },
  { name: 'INTC',  startPrice: 35,   annualDrift: -0.05, annualVol: 0.35, seed: 1015 },
  { name: 'XOM',   startPrice: 110,  annualDrift: 0.08, annualVol: 0.22, seed: 1016 },
  { name: 'CVX',   startPrice: 155,  annualDrift: 0.07, annualVol: 0.20, seed: 1017 },
  { name: 'GS',    startPrice: 460,  annualDrift: 0.12, annualVol: 0.24, seed: 1018 },
  { name: 'AMD',   startPrice: 150,  annualDrift: 0.20, annualVol: 0.55, seed: 1019 },
  { name: 'ORCL',  startPrice: 125,  annualDrift: 0.14, annualVol: 0.26, seed: 1020 },
  // ETF-like instruments (lower vol)
  { name: 'SPY',   startPrice: 480,  annualDrift: 0.11, annualVol: 0.15, seed: 2001 },
  { name: 'QQQ',   startPrice: 415,  annualDrift: 0.14, annualVol: 0.18, seed: 2002 },
  { name: 'BLK',   startPrice: 800,  annualDrift: 0.11, annualVol: 0.22, seed: 2003 },
  { name: 'AVGO',  startPrice: 850,  annualDrift: 0.25, annualVol: 0.40, seed: 2004 },
  { name: 'TSM',   startPrice: 120,  annualDrift: 0.15, annualVol: 0.35, seed: 2005 },
];

// Trading days in the past 2 years (approx 504)
function tradingDays(fromDaysAgo: number): string[] {
  const days: string[] = [];
  const end = new Date('2026-10-22'); // day before today
  const cursor = new Date(end);
  cursor.setDate(cursor.getDate() - fromDaysAgo);

  while (cursor <= end) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push(cursor.toISOString().slice(0, 10));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

const DAYS = tradingDays(730);
const dt = 1 / 252; // one trading day

interface DayBar { date: string; close: number; }

function simulate(spec: TickerSpec, days: string[]): DayBar[] {
  const rand = mulberry32(spec.seed);
  const normal = makeNormal(rand);
  let price = spec.startPrice;
  const mu = spec.annualDrift;
  const sigma = spec.annualVol;

  return days.map(date => {
    const z = normal();
    price = price * Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * z);
    price = Math.round(price * 100) / 100;
    return { date, close: price };
  });
}

const tickers: Record<string, DayBar[]> = {};
for (const spec of SPECS) {
  tickers[spec.name] = simulate(spec, DAYS);
}

const output = {
  generatedAt: new Date().toISOString(),
  source: 'synthetic' as const,
  license: 'CC0-1.0',
  attribution: 'Synthetic data generated by Stackly for educational use. Not real market data.',
  disclaimer: 'SYNTHETIC DATA ONLY — not real prices, not real-time, not investment advice. ' +
    'Starting prices are approximate publicly known round numbers, not precise historical closes. ' +
    'Price paths are simulated. For Stackly educational use only.',
  tickers,
};

writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
console.log(`Written ${SPECS.length} tickers × ${DAYS.length} days to ${OUT_PATH}`);
