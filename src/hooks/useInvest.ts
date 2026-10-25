import { useState, useEffect, useCallback } from 'react';

export interface PnLRow {
  ticker: string;
  shares: number;
  avgCostCents: number;
  currentPriceCents: number;
  marketValueCents: number;
  unrealisedPnLCents: number;
  unrealisedPct: number;
  allocationPct: number;
}

export interface PortfolioSummary {
  cashCents: number;
  totalValueCents: number;
  totalCostCents: number;
  unrealisedPnLCents: number;
  unrealisedPct: number;
  rows: PnLRow[];
  disclaimer: string;
  source: string;
}

export interface TradeRow {
  id: string;
  ticker: string;
  side: 'buy' | 'sell';
  shares: number;
  priceCents: number;
  reflection: string | null;
  replayDate: string | null;
  createdAt: number;
}

export interface TickerInfo {
  ticker: string;
  name: string;
  lastClose: number;
  bars: { date: string; close: number }[];
  disclaimer: string;
}

const BASE = '/api/invest';

function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  return fetch(`${BASE}${path}`, { credentials: 'include', ...opts })
    .then(r => r.json() as Promise<T>);
}

export function usePortfolio() {
  const [data, setData] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    apiFetch<PortfolioSummary>('/portfolio')
      .then(d => { setData(d); setError(null); })
      .catch(() => setError('Could not load portfolio'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { void reload(); }, [reload]);
  return { data, loading, error, reload };
}

export function useTickers() {
  const [tickers, setTickers] = useState<{ ticker: string; name: string; lastClose: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    apiFetch<{ tickers: typeof tickers }>('/tickers')
      .then(d => { setTickers(d.tickers); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);
  return { tickers, loading, error };
}

export function useTickerBars(ticker: string | null) {
  const [info, setInfo] = useState<TickerInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticker) { setInfo(null); return; }
    setLoading(true);
    apiFetch<TickerInfo>(`/tickers/${ticker}`)
      .then(setInfo)
      .finally(() => setLoading(false));
  }, [ticker]);
  return { info, loading };
}

export function useTrades() {
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    apiFetch<{ trades: TradeRow[] }>('/trades')
      .then(d => setTrades(d.trades))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { void reload(); }, [reload]);
  return { trades, loading, reload };
}

export async function executeTrade(body: {
  side: 'buy' | 'sell';
  ticker: string;
  shares?: number;
  dollars?: number;
  reflection?: string;
  replayDate?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${BASE}/trade`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json() as { ok?: boolean; error?: string };
  if (!res.ok) return { ok: false, error: data.error ?? 'Trade failed' };
  return { ok: true };
}
