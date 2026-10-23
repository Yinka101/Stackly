import { useState } from 'react';
import { usePortfolio, useTickers, useTrades } from '@/hooks/useInvest';
import DisclaimerBadge from './invest/DisclaimerBadge';
import AllocationDonut from './invest/AllocationDonut';
import PerformanceChart from './invest/PerformanceChart';
import HoldingsGrid from './invest/HoldingsGrid';
import TradeModal from './invest/TradeModal';
import WhatIfCalc from './invest/WhatIfCalc';

type Tab = 'overview' | 'market' | 'history' | 'whatif';

interface TradeTarget {
  ticker: string;
  name: string;
  lastClose: number;
  side: 'buy' | 'sell';
  ownedShares?: number;
}

export default function InvestPage() {
  const { data: portfolio, loading: pLoading, reload: reloadPortfolio } = usePortfolio();
  const { tickers, loading: tLoading } = useTickers();
  const { trades, reload: reloadTrades } = useTrades();
  const [tab, setTab] = useState<Tab>('overview');
  const [tradeTarget, setTradeTarget] = useState<TradeTarget | null>(null);

  function openTrade(ticker: string, side: 'buy' | 'sell') {
    const info = tickers.find(t => t.ticker === ticker);
    const pos  = portfolio?.rows.find(r => r.ticker === ticker);
    if (!info) return;
    setTradeTarget({ ticker, name: info.name, lastClose: info.lastClose, side, ownedShares: pos?.shares });
  }

  function onTradeSuccess() {
    setTradeTarget(null);
    void reloadPortfolio();
    void reloadTrades();
  }

  const cashDollars = (portfolio?.cashCents ?? 0) / 100;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'market',   label: 'Market' },
    { id: 'history',  label: 'History' },
    { id: 'whatif',   label: 'What-if' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-[var(--color-ink)]">Invest</h1>
          <p className="text-sm text-[var(--color-ink-muted)]">Practice portfolio</p>
        </div>
        {portfolio && (
          <div className="text-right">
            <p className="text-2xl font-bold text-[var(--color-ink)]">
              ${(portfolio.totalValueCents / 100).toFixed(2)}
            </p>
            <p className={`text-sm font-semibold ${portfolio.unrealisedPnLCents >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {portfolio.unrealisedPnLCents >= 0 ? '+' : ''}${(portfolio.unrealisedPnLCents / 100).toFixed(2)} ({portfolio.unrealisedPct.toFixed(2)}%)
            </p>
          </div>
        )}
      </div>

      <DisclaimerBadge />

      {/* Cash balance */}
      <div className="bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-border)] flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--color-ink-muted)] font-semibold uppercase tracking-wide">Practice cash</p>
          <p className="text-xl font-bold">${cashDollars.toFixed(2)}</p>
        </div>
        <span className="text-3xl" aria-hidden>🪙</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--color-surface)] rounded-xl p-1 border border-[var(--color-border)]">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === t.id ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {pLoading && <p className="text-sm text-[var(--color-ink-muted)]">Loading portfolio…</p>}
          {portfolio && portfolio.rows.length === 0 && (
            <div className="bg-[var(--color-surface)] rounded-2xl p-8 text-center border border-[var(--color-border)]">
              <p className="text-4xl mb-3">🌱</p>
              <p className="font-semibold">No holdings yet</p>
              <p className="text-sm text-[var(--color-ink-muted)] mt-1">Go to the Market tab to make your first practice trade.</p>
            </div>
          )}
          {portfolio && portfolio.rows.length > 0 && (
            <>
              <div className="bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-border)]">
                <h2 className="font-display font-bold text-sm mb-3 uppercase tracking-wide text-[var(--color-ink-muted)]">Allocation</h2>
                <AllocationDonut rows={portfolio.rows} cashCents={portfolio.cashCents} totalValueCents={portfolio.totalValueCents} />
              </div>
              <div className="bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-border)]">
                <h2 className="font-display font-bold text-sm mb-3 uppercase tracking-wide text-[var(--color-ink-muted)]">Performance</h2>
                <PerformanceChart rows={portfolio.rows} cashCents={portfolio.cashCents} />
              </div>
              <div className="bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-border)]">
                <h2 className="font-display font-bold text-sm mb-3 uppercase tracking-wide text-[var(--color-ink-muted)]">Holdings</h2>
                <HoldingsGrid rows={portfolio.rows} onTrade={openTrade} />
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'market' && (
        <div className="space-y-2">
          {tLoading && <p className="text-sm text-[var(--color-ink-muted)]">Loading tickers…</p>}
          {tickers.map(t => {
            const pos = portfolio?.rows.find(r => r.ticker === t.ticker);
            return (
              <div
                key={t.ticker}
                className="bg-[var(--color-surface)] rounded-xl p-3 border border-[var(--color-border)] flex items-center justify-between"
              >
                <div>
                  <p className="font-mono font-bold text-sm">{t.ticker}</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">{t.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-sm">${t.lastClose.toFixed(2)}</p>
                    {pos && <p className="text-xs text-[var(--color-ink-muted)]">{pos.shares.toFixed(3)} owned</p>}
                  </div>
                  <button
                    onClick={() => openTrade(t.ticker, 'buy')}
                    className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1.5 rounded-lg font-semibold min-h-[36px]"
                  >
                    Buy
                  </button>
                  {pos && (
                    <button
                      onClick={() => openTrade(t.ticker, 'sell')}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg font-semibold min-h-[36px]"
                    >
                      Sell
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <p className="text-xs text-center text-[var(--color-ink-muted)] mt-2">
            {tickers.length > 0 && `Sample data · ${tickers.length} tickers`}
          </p>
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
          {trades.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-4xl mb-2">📋</p>
              <p className="text-sm text-[var(--color-ink-muted)]">No trades yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm" aria-label="Trade history">
              <thead className="bg-[var(--color-canvas)]">
                <tr>
                  {['Date', 'Ticker', 'Side', 'Shares', 'Price', 'Reflection'].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map(t => (
                  <tr key={t.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-canvas)]">
                    <td className="px-3 py-2 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2 font-mono font-bold">{t.ticker}</td>
                    <td className={`px-3 py-2 font-semibold text-xs ${t.side === 'buy' ? 'text-green-600' : 'text-red-500'}`}>{t.side.toUpperCase()}</td>
                    <td className="px-3 py-2">{t.shares.toFixed(4)}</td>
                    <td className="px-3 py-2">${(t.priceCents / 100).toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs text-[var(--color-ink-muted)] max-w-[140px] truncate" title={t.reflection ?? ''}>{t.reflection ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'whatif' && <WhatIfCalc />}

      {/* Trade modal */}
      {tradeTarget && (
        <TradeModal
          {...tradeTarget}
          cashDollars={cashDollars}
          onClose={() => setTradeTarget(null)}
          onSuccess={onTradeSuccess}
        />
      )}
    </div>
  );
}
