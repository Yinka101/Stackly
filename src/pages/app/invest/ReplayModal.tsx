/**
 * ReplayModal - lets the learner pick a historical start month and begin a
 * Replay session. Called from InvestPage History tab.
 */
import { useState } from 'react';
import { api } from '@/lib/api';

interface Props {
  onStarted: (replayId: string, currentDate: string) => void;
  onClose: () => void;
}

// Generate last 18 months of options (YYYY-MM-01)
function getMonthOptions() {
  const opts: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 3; i <= 20; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    opts.push({ value, label });
  }
  return opts;
}

const MONTHS = getMonthOptions();

export default function ReplayModal({ onStarted, onClose }: Props) {
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.post<{ replayId: string; currentDate: string }>(
        '/invest/replay/start',
        { startDate: selectedMonth }
      );
      onStarted(data.replayId, data.currentDate);
    } catch (e) {
      setError((e as Error).message ?? 'Could not start replay. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog" aria-modal="true" aria-label="Start Replay">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-ink">▶ Replay Mode</h2>
            <p className="text-sm text-ink/60 mt-1">
              Travel back in time and trade through a historical month with $1,000 of Practice Dollars.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="text-ink/40 hover:text-ink text-2xl leading-none ml-2 transition-colors">×</button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          🎓 <strong>Educational only.</strong> Prices are synthetic and do not reflect real market data.
          No real money is involved.
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-ink/80">Pick a starting month</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border-2 border-ink/15 rounded-xl px-4 py-3 text-ink bg-white focus:outline-none focus:border-primary transition-colors"
          >
            {MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border-2 border-ink/20 text-ink font-semibold rounded-2xl py-3 hover:bg-ink/5 transition-colors">
            Cancel
          </button>
          <button onClick={() => void handleStart()} disabled={loading}
            className="flex-1 bg-primary text-white font-display font-bold rounded-2xl py-3 hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {loading ? 'Starting…' : '▶ Start Replay'}
          </button>
        </div>
      </div>
    </div>
  );
}
