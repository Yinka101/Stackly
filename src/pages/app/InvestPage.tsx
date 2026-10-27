import { useState } from 'react';
import { usePortfolio, useTickers, useTrades } from '@/hooks/useInvest';
import DisclaimerBadge from './invest/DisclaimerBadge';
import AllocationDonut from './invest/AllocationDonut';
import PerformanceChart from './invest/PerformanceChart';
import HoldingsGrid from './invest/HoldingsGrid';
import TradeModal from './invest/TradeModal';
import WhatIfCalc from './invest/WhatIfCalc';
import ReplayModal from './invest/ReplayModal';
import { Skeleton } from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';

type Tab = 'overview' | 'market' | 'history' | 'whatif';

interface TradeTarget {
  ticker: string;
  name: string;
  lastClose: number;
  side: 'buy' | 'sell';
  ownedShares?: number;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'market',   label: 'Market'   },
  { id: 'history',  label: 'History'  },
  { id: 'whatif',   label: 'What-if'  },
];

export default function InvestPage() {
  const { data: portfolio, loading: pLoading, error: pError, reload: reloadPortfolio } = usePortfolio();
  const { tickers, loading: tLoading, error: tError } = useTickers();
  const { trades, reload: reloadTrades } = useTrades();
  const [tab, setTab]               = useState<Tab>('overview');
  const [tradeTarget, setTradeTarget] = useState<TradeTarget | null>(null);
  const [showReplay, setShowReplay]   = useState(false);

  function openTrade(ticker: string, side: 'buy' | 'sell') {
    const info = tickers.find((t) => t.ticker === ticker);
    const pos  = portfolio?.rows.find((r) => r.ticker === ticker);
    if (!info) return;
    setTradeTarget({ ticker, name: info.name, lastClose: info.lastClose, side, ownedShares: pos?.shares });
  }

  function onTradeSuccess() {
    setTradeTarget(null);
    void reloadPortfolio();
    void reloadTrades();
  }

  const cashDollars = (portfolio?.cashCents ?? 0) / 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Invest</h1>
          <p className="text-sm text-ink/60">Practice portfolio</p>
        </div>
        {pLoading ? (
          <Skeleton className="h-10 w-28" />
        ) : portfolio && (
          <div className="text-right" aria-live="polite">
            <p className="text-2xl font-bold text-ink tabular-nums">
              ${(portfolio.totalValueCents / 100).toFixed(2)}
            </p>
            <p className={`text-sm font-semibold tabular-nums ${portfolio.unrealisedPnLCents >= 0 ? 'text-green-700' : 'text-red-600'}`}
               aria-label={`${portfolio.unrealisedPnLCents >= 0 ? 'Up' : 'Down'} $${Math.abs(portfolio.unrealisedPnLCents / 100).toFixed(2)} (${portfolio.unrealisedPct.toFixed(2)}%)`}>
              {portfolio.unrealisedPnLCents >= 0 ? '+' : ''}${(portfolio.unrealisedPnLCents / 100).toFixed(2)} ({portfolio.unrealisedPct.toFixed(2)}%)
            </p>
          </div>
        )}
      </div>

      <DisclaimerBadge />

      {/* Cash balance */}
      <div className="bg-surface rounded-2xl p-4 border border-border flex items-center justify-between">
        <div>
          <p className="text-xs text-ink/60 font-semibold uppercase tracking-wide">Practice cash</p>
          {pLoading
            ? <Skeleton className="h-7 w-24 mt-1" />
            : <p className="text-xl font-bold tabular-nums">${cashDollars.toFixed(2)}</p>
          }
        </div>
        <span className="text-3xl" aria-hidden="true">🪙</span>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Portfolio sections"
           className="flex gap-1 bg-surface rounded-xl p-1 border border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors min-h-[44px]
              focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
              ${tab === t.id
                ? 'bg-primary text-white'
                : 'text-ink/60 hover:text-ink'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div id={`panel-overview`} role="tabpanel" aria-labelledby="tab-overview"
           hidden={tab !== 'overview'} className="space-y-4">
        {pLoading && (
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
            <Skeleton className="h-24" />
          </div>
        )}
        {pError && !pLoading && (
          <ErrorState title="Couldn't load portfolio" onRetry={reloadPortfolio} />
        )}
        {!pLoading && !pError && portfolio?.rows.length === 0 && (
          <EmptyState
            emoji="🌱"
            title="No holdings yet"
            body="Go to the Market tab to make your first practice trade."
            action={{ label: 'Go to Market', onClick: () => setTab('market') }}
          />
        )}
        {!pLoading && !pError && portfolio && portfolio.rows.length > 0 && (
          <>
            <div className="bg-surface rounded-2xl p-4 border border-border">
              <h2 className="font-display font-bold text-sm mb-3 uppercase tracking-wide text-ink/60">Allocation</h2>
              <AllocationDonut rows={portfolio.rows} cashCents={portfolio.cashCents} totalValueCents={portfolio.totalValueCents} />
              {/* Text alternative for chart */}
              <details className="mt-3">
                <summary className="text-xs text-ink/50 cursor-pointer hover:text-ink">
                  View as table
                </summary>
                <table className="w-full text-xs mt-2" aria-label="Portfolio allocation">
                  <thead><tr><th className="text-left py-1">Asset</th><th className="text-right py-1">Value</th><th className="text-right py-1">%</th></tr></thead>
                  <tbody>
                    {portfolio.rows.map((r) => (
                      <tr key={r.ticker} className="border-t border-border/50">
                        <td className="py-1 font-mono">{r.ticker}</td>
                        <td className="py-1 text-right tabular-nums">${(r.marketValueCents / 100).toFixed(2)}</td>
                        <td className="py-1 text-right tabular-nums">{((r.marketValueCents / portfolio.totalValueCents) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                    <tr className="border-t border-border/50">
                      <td className="py-1 font-mono">Cash</td>
                      <td className="py-1 text-right tabular-nums">${(portfolio.cashCents / 100).toFixed(2)}</td>
                      <td className="py-1 text-right tabular-nums">{((portfolio.cashCents / portfolio.totalValueCents) * 100).toFixed(1)}%</td>
                    </tr>
                  </tbody>
                </table>
              </details>
            </div>
            <div className="bg-surface rounded-2xl p-4 border border-border">
              <h2 className="font-display font-bold text-sm mb-3 uppercase tracking-wide text-ink/60">Performance</h2>
              <PerformanceChart rows={portfolio.rows} cashCents={portfolio.cashCents} />
            </div>
            <div className="bg-surface rounded-2xl p-4 border border-border">
              <h2 className="font-display font-bold text-sm mb-3 uppercase tracking-wide text-ink/60">Holdings</h2>
              <HoldingsGrid rows={portfolio.rows} onTrade={openTrade} />
            </div>
          </>
        )}
      </div>

      <div id="panel-market" role="tabpanel" aria-labelledby="tab-market"
           hidden={tab !== 'market'} className="space-y-2">
        {tLoading && (
          <div className="space-y-2">
            {[0,1,2,3].map((i) => <Skeleton key={i} className="h-16" />)}
          </div>
        )}
        {tError && !tLoading && (
          <ErrorState title="Couldn't load market data" onRetry={() => window.location.reload()} />
        )}
        {!tLoading && !tError && tickers.length === 0 && (
          <EmptyState emoji="📊" title="No tickers available" body="Market data is loading." />
        )}
        {!tLoading && !tError && tickers.map((t) => {
          const pos = portfolio?.rows.find((r) => r.ticker === t.ticker);
          return (
            <div
              key={t.ticker}
              className="bg-surface rounded-xl p-3 border border-border flex items-center justify-between min-h-[56px]"
            >
              <div>
                <p className="font-mono font-bold text-sm">{t.ticker}</p>
                <p className="text-xs text-ink/60">{t.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-1">
                  <p className="font-semibold text-sm tabular-nums">${t.lastClose.toFixed(2)}</p>
                  {pos && <p className="text-xs text-ink/50 tabular-nums">{pos.shares.toFixed(3)} owned</p>}
                </div>
                <button
                  onClick={() => openTrade(t.ticker, 'buy')}
                  aria-label={`Buy ${t.name} at $${t.lastClose.toFixed(2)}`}
                  className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2
                             rounded-lg font-semibold min-h-[44px] min-w-[44px]
                             focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-1
                             transition-colors"
                >
                  Buy
                </button>
                {pos && (
                  <button
                    onClick={() => openTrade(t.ticker, 'sell')}
                    aria-label={`Sell ${t.name}`}
                    className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2
                               rounded-lg font-semibold min-h-[44px] min-w-[44px]
                               focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1
                               transition-colors"
                  >
                    Sell
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {!tLoading && tickers.length > 0 && (
          <p className="text-xs text-center text-ink/40 mt-2">
            Synthetic practice data · {tickers.length} tickers · Not real prices
          </p>
        )}
      </div>

      <div id="panel-history" role="tabpanel" aria-labelledby="tab-history"
           hidden={tab !== 'history'}>
        {/* Replay entry point */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-ink/60">Trade history from your practice portfolio.</p>
          <button
            onClick={() => setShowReplay(true)}
            className="flex items-center gap-2 bg-accent/15 hover:bg-accent/25 text-accent-dark font-semibold text-sm px-4 py-2 rounded-xl transition-colors min-h-[44px]"
          >
            ▶ Time Replay
          </button>
        </div>
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          {trades.length === 0 ? (
            <EmptyState emoji="📋" title="No trades yet" body="Your trade history will appear here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Trade history">
                <thead className="bg-canvas">
                  <tr>
                    {['Date', 'Ticker', 'Side', 'Shares', 'Price', 'Reflection'].map((h) => (
                      <th key={h} scope="col"
                          className="text-left px-3 py-2 text-xs font-semibold text-ink/60 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr key={t.id} className="border-t border-border hover:bg-canvas">
                      <td className="px-3 py-2 text-xs tabular-nums">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 font-mono font-bold">{t.ticker}</td>
                      <td className={`px-3 py-2 font-semibold text-xs ${t.side === 'buy' ? 'text-green-700' : 'text-red-600'}`}>
                        {t.side.toUpperCase()}
                      </td>
                      <td className="px-3 py-2 tabular-nums">{t.shares.toFixed(4)}</td>
                      <td className="px-3 py-2 tabular-nums">${(t.priceCents / 100).toFixed(2)}</td>
                      <td className="px-3 py-2 text-xs text-ink/50 max-w-[140px] truncate"
                          title={t.reflection ?? ''}>
                        {t.reflection ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div id="panel-whatif" role="tabpanel" aria-labelledby="tab-whatif"
           hidden={tab !== 'whatif'}>
        <WhatIfCalc />
      </div>

      {/* Replay modal */}
      {showReplay && (
        <ReplayModal
          onStarted={(_id, _date) => {
            setShowReplay(false);
            setTab('history');
            void reloadTrades();
          }}
          onClose={() => setShowReplay(false)}
        />
      )}

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
