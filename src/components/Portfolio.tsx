import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, X } from 'lucide-react';
import { api, type Portfolio as PortfolioData, type Profile } from '@/utils/api';
import { toast } from 'sonner';

interface Props { profile: Profile; onBalanceChange: () => void }

const TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

function fmt(cents: number) {
  return (cents / 100).toFixed(2);
}

export default function Portfolio({ profile, onBalanceChange }: Props) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tradeModal, setTradeModal] = useState<null | { ticker: string; side: 'buy' | 'sell' }>(null);
  const [shares, setShares] = useState('1');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    void api.getPortfolio(profile.id).then((p) => { setData(p); setLoading(false); });
  }, [profile.id]);

  useEffect(() => { load(); }, [load]);

  async function executeTrade() {
    if (!tradeModal || !data) return;
    const s = parseFloat(shares);
    if (isNaN(s) || s <= 0) { toast.error('Enter a valid number of shares'); return; }
    setBusy(true);
    try {
      const result = await api.trade(profile.id, { ticker: tradeModal.ticker, side: tradeModal.side, shares: s });
      toast.success(`${tradeModal.side === 'buy' ? 'Bought' : 'Sold'} ${s} share(s) of ${tradeModal.ticker}`);
      setTradeModal(null);
      load();
      onBalanceChange();
      // Update local balance immediately
      if (data) {
        setData({ ...data, practiceDollars: result.practiceDollars });
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading portfolio…</div>
  );
  if (!data) return null;

  const totalValue = data.practiceDollars + data.totalMarketValueCents / 100;

  return (
    <div className="px-4 py-6 pb-24 max-w-md mx-auto">
      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl px-3 py-2 mb-5 font-medium">
        Educational only. Practice Dollars are not real money. No real trades are made.
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-5 text-white mb-5 shadow-lg shadow-blue-200">
        <div className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">Total Value</div>
        <div className="text-4xl font-bold tabular-nums tracking-tight">
          ${totalValue.toFixed(2)}
        </div>
        <div className="text-sm opacity-80 mt-1">Practice Dollars</div>
        <div className="flex gap-4 mt-4 text-sm">
          <div>
            <div className="opacity-70 text-xs">Cash</div>
            <div className="font-semibold">${data.practiceDollars.toFixed(2)}</div>
          </div>
          <div>
            <div className="opacity-70 text-xs">Invested</div>
            <div className="font-semibold">${fmt(data.totalMarketValueCents)}</div>
          </div>
        </div>
      </div>

      {/* Market */}
      <h3 className="text-base font-bold text-slate-800 mb-3">Market</h3>
      <div className="flex flex-col gap-2 mb-6">
        {TICKERS.map((ticker) => {
          const price = data.prices[ticker];
          const held = data.positions.find((p) => p.ticker === ticker);
          return (
            <div key={ticker} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                {ticker.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 text-sm">{price.name}</div>
                <div className="text-xs text-slate-500">{ticker} {held ? `· ${held.shares} shares` : ''}</div>
              </div>
              <div className="text-right mr-2">
                <div className="font-bold text-slate-900 tabular-nums text-sm">${fmt(price.priceCents)}</div>
                <div className={`text-xs font-medium tabular-nums ${price.change1d >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {price.change1d >= 0 ? '+' : ''}{price.change1d.toFixed(1)}%
                </div>
              </div>
              <button
                onClick={() => { setTradeModal({ ticker, side: 'buy' }); setShares('1'); }}
                className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
              >
                <ShoppingCart className="w-4 h-4 text-blue-600" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Holdings */}
      {data.positions.length > 0 && (
        <>
          <h3 className="text-base font-bold text-slate-800 mb-3">Your Holdings</h3>
          <div className="flex flex-col gap-2">
            {data.positions.map((pos) => (
              <motion.div
                key={pos.ticker}
                layout
                className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-slate-900">{pos.ticker}</span>
                    <span className="text-xs text-slate-500 ml-2">{pos.shares} shares</span>
                  </div>
                  <button
                    onClick={() => { setTradeModal({ ticker: pos.ticker, side: 'sell' }); setShares('1'); }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 font-medium transition-colors"
                  >
                    Sell
                  </button>
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <div><span className="text-slate-400">Value</span> <span className="text-slate-800 font-semibold">${fmt(pos.marketValueCents)}</span></div>
                  <div className={pos.gainLossCents >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                    {pos.gainLossCents >= 0 ? <TrendingUp className="inline w-3 h-3 mr-0.5" /> : <TrendingDown className="inline w-3 h-3 mr-0.5" />}
                    {pos.gainLossCents >= 0 ? '+' : ''}${fmt(Math.abs(pos.gainLossCents))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Trade modal */}
      {tradeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 p-4">
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-bold text-slate-900">
                {tradeModal.side === 'buy' ? 'Buy' : 'Sell'} {tradeModal.ticker}
              </h4>
              <button onClick={() => setTradeModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-sm text-slate-500 mb-2">
              Price: <strong className="text-slate-900">${fmt(data.prices[tradeModal.ticker]?.priceCents ?? 0)}</strong> /share
            </div>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 outline-none text-lg font-bold tabular-nums mb-2"
              placeholder="Shares"
            />
            <div className="text-sm text-slate-500 mb-5">
              Total: <strong className="text-slate-900">
                ${((parseFloat(shares) || 0) * (data.prices[tradeModal.ticker]?.priceCents ?? 0) / 100).toFixed(2)}
              </strong> Practice Dollars
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3 mb-4">
              Educational only. No real money is involved.
            </p>
            <button
              onClick={() => { void executeTrade(); }}
              disabled={busy}
              className={`w-full py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-colors
                ${tradeModal.side === 'buy' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-500 hover:bg-red-600'}
                disabled:opacity-40`}
            >
              <DollarSign className="w-4 h-4" />
              {busy ? 'Processing…' : `Confirm ${tradeModal.side === 'buy' ? 'Buy' : 'Sell'}`}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
