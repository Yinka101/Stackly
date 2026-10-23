import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

function compound(
  principal: number,
  ratePct: number,
  years: number,
  monthly: number,
) {
  const rate = ratePct / 100 / 12;
  const points: { year: number; value: number }[] = [];
  let value = principal;
  for (let y = 0; y <= years; y++) {
    points.push({ year: y, value: Math.round(value * 100) / 100 });
    for (let m = 0; m < 12; m++) {
      value = (value + monthly) * (1 + rate);
    }
  }
  return points;
}

export default function WhatIfCalc() {
  const [principal, setPrincipal] = useState(1000);
  const [rate, setRate]           = useState(7);
  const [years, setYears]         = useState(10);
  const [monthly, setMonthly]     = useState(50);

  const data = useMemo(() => compound(principal, rate, years, monthly), [principal, rate, years, monthly]);
  const finalValue = data[data.length - 1]?.value ?? 0;
  const totalContrib = principal + monthly * 12 * years;
  const growth = finalValue - totalContrib;

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)]">
      <h3 className="font-display font-bold text-base mb-1">What-if calculator</h3>
      <p className="text-xs text-[var(--color-ink-muted)] mb-4">
        See how compound growth works over time. This is an example only — not a promise or prediction.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Starting amount
          <input type="number" min={0} value={principal}
            onChange={e => setPrincipal(Number(e.target.value))}
            className="input" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Monthly add
          <input type="number" min={0} value={monthly}
            onChange={e => setMonthly(Number(e.target.value))}
            className="input" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Annual return %
          <input type="number" min={0} max={50} step={0.5} value={rate}
            onChange={e => setRate(Number(e.target.value))}
            className="input" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Years
          <input type="number" min={1} max={40} value={years}
            onChange={e => setYears(Number(e.target.value))}
            className="input" />
        </label>
      </div>

      <div className="h-44 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-primary)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} unit="y" />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${Math.round(v / 1000)}k`} />
            <Tooltip formatter={(v: unknown) => `$${(v as number).toFixed(2)}`} labelFormatter={(l: unknown) => `Year ${l}`} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#growthGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'You put in', value: `$${totalContrib.toLocaleString()}` },
          { label: 'Growth', value: `+$${Math.round(growth).toLocaleString()}` },
          { label: `After ${years}y`, value: `$${Math.round(finalValue).toLocaleString()}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[var(--color-canvas)] rounded-xl p-3">
            <p className="text-xs text-[var(--color-ink-muted)]">{label}</p>
            <p className="font-display font-bold text-sm">{value}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-[var(--color-ink-muted)] mt-3 text-center">
        Example only — not a promise or prediction. Past returns don't guarantee future results.
      </p>
    </div>
  );
}
