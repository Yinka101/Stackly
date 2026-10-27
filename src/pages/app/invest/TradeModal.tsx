import { useState } from 'react';
import { executeTrade } from '@/hooks/useInvest';

interface Props {
  ticker: string;
  name: string;
  lastClose: number;   // dollars
  side: 'buy' | 'sell';
  ownedShares?: number;
  cashDollars: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TradeModal({ ticker, name, lastClose, side, ownedShares = 0, cashDollars, onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<'shares' | 'dollars'>(side === 'sell' ? 'shares' : 'dollars');
  const [amount, setAmount] = useState('');
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parsed = parseFloat(amount);
  const shares  = mode === 'shares' ? parsed : parsed / lastClose;
  const cost    = mode === 'shares' ? parsed * lastClose : parsed;
  const valid   = !isNaN(parsed) && parsed > 0;

  async function submit() {
    if (!valid) { setError('Enter a valid amount'); return; }
    if (side === 'buy' && reflection.trim().length < 5) {
      setError('Please write your reason (at least 5 characters)');
      return;
    }
    setLoading(true);
    setError('');
    const result = await executeTrade({
      side,
      ticker,
      shares: mode === 'shares' ? parsed : undefined,
      dollars: mode === 'dollars' ? parsed : undefined,
      reflection: side === 'buy' ? reflection : undefined,
    });
    setLoading(false);
    if (!result.ok) { setError(result.error ?? 'Trade failed'); return; }
    onSuccess();
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trade-modal-title"
    >
      <div className="bg-[var(--color-canvas)] rounded-2xl w-full max-w-sm p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="trade-modal-title" className="font-display font-bold text-lg">
            {side === 'buy' ? '🛒 Buy' : '📤 Sell'} {ticker}
          </h2>
          <button onClick={onClose} className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] text-xl leading-none" aria-label="Close">×</button>
        </div>

        <p className="text-sm text-[var(--color-ink-muted)] mb-4">
          {name} · last close <strong>${lastClose.toFixed(2)}</strong>
        </p>

        <p className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2 mb-4">
          🎓 Practice money only - not a real trade.
        </p>

        {/* Amount toggle (buy only) */}
        {side === 'buy' && (
          <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)] mb-3">
            {(['dollars', 'shares'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${mode === m ? 'bg-[var(--color-primary)] text-white' : 'bg-transparent text-[var(--color-ink-muted)]'}`}
              >
                {m === 'dollars' ? '$ Amount' : '# Shares'}
              </button>
            ))}
          </div>
        )}

        {/* Amount input */}
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1" htmlFor="trade-amount">
            {mode === 'dollars' ? 'Practice Dollars to spend' : 'Number of shares'}
          </label>
          <input
            id="trade-amount"
            type="number"
            min="0"
            step={mode === 'shares' ? '0.001' : '1'}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="input w-full"
            placeholder={mode === 'dollars' ? 'e.g. 50' : 'e.g. 0.5'}
          />
          {valid && (
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              ≈ {shares.toFixed(4)} shares · ${cost.toFixed(2)} total
              {side === 'buy' && ` · $${(cashDollars - cost).toFixed(2)} remaining`}
            </p>
          )}
        </div>

        {/* Reflection (buy only) */}
        {side === 'buy' && (
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1" htmlFor="trade-reflection">
              Why are you buying this? <span className="text-red-500">*</span>
            </label>
            <textarea
              id="trade-reflection"
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              rows={2}
              maxLength={200}
              className="input w-full resize-none"
              placeholder="e.g. I think this company makes useful products people keep buying."
            />
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              This helps you think before you trade. Required. Not stored publicly.
            </p>
          </div>
        )}

        {/* Sell info */}
        {side === 'sell' && ownedShares > 0 && (
          <p className="text-xs text-[var(--color-ink-muted)] mb-4">
            You own {ownedShares.toFixed(4)} shares.
          </p>
        )}

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[var(--color-border)] font-semibold text-sm">
            Cancel
          </button>
          <button
            onClick={() => { void submit(); }}
            disabled={loading || !valid}
            className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-sm disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Processing…' : side === 'buy' ? 'Confirm buy' : 'Confirm sell'}
          </button>
        </div>
      </div>
    </div>
  );
}
