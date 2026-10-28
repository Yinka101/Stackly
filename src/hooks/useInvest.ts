import { useState, useEffect, useCallback } from 'react';
import { getApiBase, tokenStore } from '@/lib/api';

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

function authHeaders(): Record<string, string> {
  const token = tokenStore.get();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const base = getApiBase().replace(/\/api$/, '');
  return fetch(`${base}/invest${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...opts?.headers },
  }).then(async r => {
    const data = await r.json() as T;
    if (!r.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${r.status}`);
    return data;
  });
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
  try {
    await apiFetch<{ ok: boolean }>('/trade', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Trade failed' };
  }
}
