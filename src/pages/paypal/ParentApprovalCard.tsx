/**
 * ParentApprovalCard — shown to the parent when a learner has requested a kit purchase.
 * Fetches pending orders for the family and allows approval.
 */
import { useState, useEffect } from 'react';
import { request } from '@/utils/api';

interface PendingOrder {
  orderId: string;
  kitId: string;
  kitName: string;
  amountUsd: number;
  learnerNickname: string;
  learnerId: string;
  practiceDollarsAwarded: number;
}

interface Props {
  familyId: string;
  onApproved: (orderId: string, approveLink: string) => void;
}

export function ParentApprovalCard({ familyId: _familyId, onApproved }: Props) {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [declining, setDeclining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await request<{ orders: PendingOrder[] }>('/paypal/pending');
      setOrders(data.orders ?? []);
    } catch {
      setError('Could not load pending approvals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const decline = async (orderId: string) => {
    setDeclining(orderId);
    setError(null);
    try {
      await request<{ declined: boolean }>(`/paypal/orders/${orderId}/decline`, { method: 'POST' });
      setOrders(prev => prev.filter(o => o.orderId !== orderId));
    } catch (e) {
      setError((e as Error).message ?? 'Could not decline. Please try again.');
    } finally {
      setDeclining(null);
    }
  };

  const approve = async (orderId: string) => {
    setApproving(orderId);
    setError(null);
    try {
      const data = await request<{ approved: boolean; approveLink: string }>(
        `/paypal/orders/${orderId}/approve`,
        { method: 'POST' }
      );
      if (data.approved) {
        onApproved(orderId, data.approveLink);
        setOrders(prev => prev.filter(o => o.orderId !== orderId));
      }
    } catch (e) {
      setError((e as Error).message ?? 'Could not approve. Please try again.');
    } finally {
      setApproving(null);
    }
  };

  if (loading) return (
    <div className="card animate-pulse h-24 bg-[var(--surface-2)]" />
  );

  if (orders.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-bold text-[var(--ink)]">Waiting for your approval</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {orders.map(order => (
        <div key={order.orderId} className="card border-2 border-[var(--accent)]/40 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-[var(--ink)]">{order.learnerNickname} wants to buy</p>
              <p className="text-[var(--ink-muted)]">{order.kitName} — <strong>${order.amountUsd.toFixed(2)} USD</strong></p>
              <p className="text-sm text-[var(--primary)] mt-1">
                Earns {order.practiceDollarsAwarded} Practice Dollars
              </p>
            </div>
            <span className="text-2xl">🧾</span>
          </div>

          {/* Plain-language explanation */}
          <p className="text-sm text-[var(--ink-muted)] bg-[var(--surface-2)] rounded-xl px-3 py-2">
            This is a sandbox (test) transaction. No real money will move. You&apos;ll log in to a PayPal sandbox account to complete the demo.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => void decline(order.orderId)}
              disabled={declining === order.orderId || approving === order.orderId}
              className="flex-1 py-3 rounded-xl border-2 border-red-300 text-red-600 font-bold disabled:opacity-50 hover:bg-red-50 transition-colors"
            >
              {declining === order.orderId ? 'Declining…' : '❌ Decline'}
            </button>
            <button
              onClick={() => void approve(order.orderId)}
              disabled={approving === order.orderId || declining === order.orderId}
              className="flex-1 py-3 rounded-xl bg-[var(--primary)] text-white font-bold disabled:opacity-50"
            >
              {approving === order.orderId ? 'Approving…' : '✅ Approve'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
