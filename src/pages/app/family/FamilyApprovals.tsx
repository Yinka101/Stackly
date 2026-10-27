import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface ApprovalRow {
  orderId: string;
  learnerId: string;
  learnerNickname: string;
  learnerAvatar: string;
  kitId: string;
  amountUsd: number;
  practiceDollarsAwarded: number;
  status: string;
  createdAt: string;
  completedAt?: string;
}

interface ApprovalsData {
  pending: ApprovalRow[];
  history: ApprovalRow[];
}

const KIT_NAMES: Record<string, string> = {
  'kit-starter': 'Starter Kit',
  'kit-basic': 'Basic Kit',
  'kit-plus': 'Plus Kit',
  'kit-pro': 'Pro Kit',
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending_agent: { label: 'Waiting for you',  color: 'text-amber-600 bg-amber-50' },
  approved:      { label: 'Approved',          color: 'text-green-600 bg-green-50' },
  completed:     { label: 'Completed',         color: 'text-green-700 bg-green-50' },
  declined:      { label: 'Declined',          color: 'text-red-600 bg-red-50' },
  failed:        { label: 'Failed',            color: 'text-red-500 bg-red-50' },
};

export default function FamilyApprovals() {
  const [data, setData] = useState<ApprovalsData>({ pending: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [declineId, setDeclineId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [toast, setToast] = useState('');

  const load = useCallback(() => {
    api.get<ApprovalsData>('/family/approvals')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const approve = async (orderId: string) => {
    setActing(orderId);
    try {
      await api.post(`/family/approvals/${orderId}/approve`, {});
      showToast('Approved! Practice dollars awarded.');
      load();
    } catch (e: unknown) {
      showToast((e as Error).message ?? 'Something went wrong');
    } finally {
      setActing(null);
    }
  };

  const decline = async (orderId: string) => {
    setActing(orderId);
    try {
      await api.post(`/family/approvals/${orderId}/decline`, { reason: declineReason });
      showToast('Request declined.');
      setDeclineId(null);
      setDeclineReason('');
      load();
    } catch (e: unknown) {
      showToast((e as Error).message ?? 'Something went wrong');
    } finally {
      setActing(null);
    }
  };

  if (loading) return <p className="text-ink/40 text-sm text-center py-8">Loading…</p>;

  return (
    <div className="flex flex-col gap-5">
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-ink text-white text-sm
                        px-4 py-2 rounded-xl shadow-lg z-50 pointer-events-none">
          {toast}
        </div>
      )}

      {/* Pending */}
      <section>
        <h2 className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-3">
          Pending approval {data.pending.length > 0 && `(${data.pending.length})`}
        </h2>

        {data.pending.length === 0 ? (
          <div className="bg-surface border border-ink/8 rounded-2xl p-5 text-center">
            <p className="text-2xl mb-1">✅</p>
            <p className="text-sm text-ink/50">No pending requests</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {data.pending.map((row) => (
              <div key={row.orderId}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-ink">{row.learnerNickname}</p>
                    <p className="text-sm text-ink/60">
                      Wants the <strong>{KIT_NAMES[row.kitId] ?? row.kitId}</strong> -
                      ${row.amountUsd.toFixed(2)} real · ${row.practiceDollarsAwarded} Practice
                    </p>
                    <p className="text-xs text-ink/40 mt-0.5">
                      Requested {new Date(row.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xl font-bold text-amber-600">${row.amountUsd.toFixed(2)}</span>
                </div>

                {declineId === row.orderId ? (
                  <div className="flex flex-col gap-2">
                    <input
                      className="input text-sm"
                      placeholder="Optional reason (shown to Coach)"
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => void decline(row.orderId)}
                        disabled={acting === row.orderId}
                        className="flex-1 bg-red-500 text-white rounded-xl py-2 text-sm font-semibold
                                   disabled:opacity-50 hover:bg-red-600 transition-colors"
                      >
                        {acting === row.orderId ? 'Declining…' : 'Confirm decline'}
                      </button>
                      <button
                        onClick={() => setDeclineId(null)}
                        className="px-3 bg-ink/8 text-ink rounded-xl py-2 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => void approve(row.orderId)}
                      disabled={acting === row.orderId}
                      className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-semibold
                                 disabled:opacity-50 hover:bg-primary/90 transition-colors"
                    >
                      {acting === row.orderId ? 'Approving…' : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => setDeclineId(row.orderId)}
                      disabled={acting === row.orderId}
                      className="flex-1 bg-ink/8 text-ink/70 rounded-xl py-2.5 text-sm font-semibold
                                 disabled:opacity-50 hover:bg-ink/12 transition-colors"
                    >
                      ✕ Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History */}
      {data.history.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-3">History</h2>
          <div className="flex flex-col gap-2">
            {data.history.map((row) => {
              const s = STATUS_LABEL[row.status] ?? { label: row.status, color: 'text-ink/50 bg-ink/5' };
              return (
                <div key={row.orderId}
                  className="bg-surface border border-ink/8 rounded-xl px-4 py-3
                             flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{row.learnerNickname}</p>
                    <p className="text-xs text-ink/50">
                      {KIT_NAMES[row.kitId] ?? row.kitId} · ${row.amountUsd.toFixed(2)}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${s.color}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
