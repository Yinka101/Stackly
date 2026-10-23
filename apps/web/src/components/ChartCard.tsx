import type { ReactNode } from 'react';
import Card from './Card';

interface DataPoint {
  label: string;
  value: number;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: DataPoint[];
  color?: string;
  children?: ReactNode;
}

export default function ChartCard({ title, subtitle, data, color = 'var(--color-primary)', children }: ChartCardProps) {
  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card elevated>
      <div className="mb-4">
        <h3 className="font-bold font-display text-ink text-lg">{title}</h3>
        {subtitle && <p className="text-sm text-ink-muted">{subtitle}</p>}
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-2 h-32" role="img" aria-label={`Bar chart: ${title}`}>
        {data.map((point) => {
          const pct = (point.value / max) * 100;
          return (
            <div key={point.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{ height: `${pct}%`, backgroundColor: color, minHeight: 4 }}
                title={`${point.label}: ${point.value}`}
              />
              <span className="text-xs text-ink-muted truncate max-w-full">{point.label}</span>
            </div>
          );
        })}
      </div>

      {children && <div className="mt-4 pt-4 border-t border-[var(--color-border)]">{children}</div>}
    </Card>
  );
}
