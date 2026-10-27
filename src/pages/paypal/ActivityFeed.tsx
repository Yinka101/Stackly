/**
 * ActivityFeed - shows completed PayPal orders with receipts.
 */
import { useState, useEffect } from 'react';
import { request } from '@/utils/api';

interface OrderRecord {
  id: string;
  kitId: string;
  kitName: string;
  amountUsd: number;
  practiceDollarsAwarded: number;
  xpAwarded: number;
  status: string;
  completedAt: string | null;
}

export function ActivityFeed() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request<{ orders: OrderRecord[] }>('/paypal/activity')
      .then(d => setOrders(d.orders ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card animate-pulse h-20 bg-[var(--surface-2)]" />;

  if (orders.length === 0) {
    return (
      <div className="card text-center flex flex-col gap-2 py-8">
        <span className="text-3xl">🧾</span>
        <p className="text-[var(--ink-muted)]">No activity yet - complete Mission 3 to see your first receipt here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-bold text-[var(--ink)]">Activity</h3>
      {orders.map(o => (
        <div key={o.id} className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-xl">
            🧾
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-[var(--ink)]">{o.kitName}</p>
            <p className="text-xs text-[var(--ink-muted)]">
              {o.completedAt ? new Date(o.completedAt).toLocaleDateString() : '-'}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm text-[var(--primary)]">+{o.practiceDollarsAwarded} PD</p>
            <p className="text-xs text-[var(--ink-muted)]">${o.amountUsd.toFixed(2)}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            o.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {o.status}
          </span>
        </div>
      ))}
    </div>
  );
}
