import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { PnLRow } from '@/hooks/useInvest';

interface Props {
  rows: PnLRow[];
  cashCents: number;
}

export default function PerformanceChart({ rows, cashCents }: Props) {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  const totalCost   = rows.reduce((s, r) => s + r.shares * r.avgCostCents, 0) / 100;
  const totalMarket = rows.reduce((s, r) => s + r.marketValueCents, 0) / 100;
  const totalValue  = totalMarket + cashCents / 100;

  // Simple two-point chart: cost basis vs current market value
  const chartData = [
    { label: 'Cost basis', value: totalCost + cashCents / 100 },
    { label: 'Current value', value: totalValue },
  ];

  const pnl  = totalMarket - totalCost;
  const gain = pnl >= 0;

  return (
    <div>
      {/* Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setView('chart')}
          className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${view === 'chart' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-ink-muted)]'}`}
        >
          Chart
        </button>
        <button
          onClick={() => setView('table')}
          className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${view === 'table' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-ink-muted)]'}`}
          aria-label="Show accessible data table"
        >
          Data table
        </button>
      </div>

      {view === 'chart' ? (
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${Math.round(v)}`} />
              <Tooltip formatter={(v: unknown) => `$${(v as number).toFixed(2)}`} />
              <ReferenceLine y={totalCost + cashCents / 100} stroke="#94a3b8" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="value"
                stroke={gain ? '#4ade80' : '#f87171'}
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Accessible data table alternative */
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse" aria-label="Portfolio performance data">
            <thead>
              <tr className="bg-[var(--color-surface)]">
                <th className="text-left p-2 border border-[var(--color-border)]">Ticker</th>
                <th className="text-right p-2 border border-[var(--color-border)]">Shares</th>
                <th className="text-right p-2 border border-[var(--color-border)]">Avg cost</th>
                <th className="text-right p-2 border border-[var(--color-border)]">Current</th>
                <th className="text-right p-2 border border-[var(--color-border)]">Value</th>
                <th className="text-right p-2 border border-[var(--color-border)]">P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.ticker} className="hover:bg-[var(--color-surface)]">
                  <td className="p-2 border border-[var(--color-border)] font-mono font-bold">{r.ticker}</td>
                  <td className="p-2 border border-[var(--color-border)] text-right">{r.shares.toFixed(4)}</td>
                  <td className="p-2 border border-[var(--color-border)] text-right">${(r.avgCostCents / 100).toFixed(2)}</td>
                  <td className="p-2 border border-[var(--color-border)] text-right">${(r.currentPriceCents / 100).toFixed(2)}</td>
                  <td className="p-2 border border-[var(--color-border)] text-right">${(r.marketValueCents / 100).toFixed(2)}</td>
                  <td className={`p-2 border border-[var(--color-border)] text-right font-semibold ${r.unrealisedPnLCents >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {r.unrealisedPnLCents >= 0 ? '+' : ''}${(r.unrealisedPnLCents / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="font-bold bg-[var(--color-surface)]">
                <td className="p-2 border border-[var(--color-border)]" colSpan={4}>Total</td>
                <td className="p-2 border border-[var(--color-border)] text-right">${totalValue.toFixed(2)}</td>
                <td className={`p-2 border border-[var(--color-border)] text-right ${pnl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
