import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PnLRow } from '@/hooks/useInvest';

const PALETTE = [
  '#4ade80', '#60a5fa', '#f59e0b', '#f87171', '#a78bfa',
  '#34d399', '#fb923c', '#38bdf8', '#e879f9', '#fbbf24',
];

interface Props {
  rows: PnLRow[];
  cashCents: number;
  totalValueCents: number;
}

export default function AllocationDonut({ rows, cashCents, totalValueCents }: Props) {
  const cashPct = totalValueCents > 0
    ? Math.round((cashCents / totalValueCents) * 10000) / 100
    : 100;

  const data = [
    ...rows.map(r => ({ name: r.ticker, value: r.allocationPct })),
    { name: 'Cash', value: cashPct },
  ].filter(d => d.value > 0);

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="75%"
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: unknown) => `${(v as number).toFixed(1)}%`}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v: string) => <span style={{ fontSize: 12 }}>{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
