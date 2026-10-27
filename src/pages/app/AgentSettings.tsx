/**
 * AgentSettings - parent controls for the Coach agent.
 * Toggle agent on/off and set a weekly spending cap.
 */
import { useState, useEffect } from 'react';
import { Bot, ShieldCheck, AlertCircle } from 'lucide-react';
import { tokenStore } from '@/lib/api';

interface Settings {
  agentEnabled: boolean;
  weeklyCapCents: number;
}

interface PendingRequest {
  orderId: string;
  learnerId: string;
  kitId: string;
  amountUsd: number;
  practiceDollarsAwarded: number;
  status: string;
  createdAt: string;
}

const BASE = import.meta.env.VITE_API_URL ?? '';

const CAP_OPTIONS = [
  { label: '$5 / week',  cents: 500  },
  { label: '$10 / week', cents: 1000 },
  { label: '$20 / week', cents: 2000 },
  { label: '$50 / week', cents: 5000 },
];

const KIT_NAMES: Record<string, string> = {
  'lemonade-stand': '🍋 Lemonade Stand Kit ($3)',
  'piggy-bank-boost': '🐷 Piggy Bank Boost ($5)',
  'investor-starter': '📈 Investor Starter Pack ($10)',
  'champion-bundle': '🏆 Champion Bundle ($20)',
};

export default function AgentSettings() {
  const [settings, setSettings] = useState<Settings>({ agentEnabled: true, weeklyCapCents: 1000 });
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    void loadSettings();
    void loadPending();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch(`${BASE}/agent/settings`, {
        headers: { Authorization: `Bearer ${tokenStore.get() ?? ''}` },
      });
      if (res.ok) setSettings(await res.json() as Settings);
    } catch { /* ignore */ }
  }

  async function loadPending() {
    try {
      const res = await fetch(`${BASE}/agent/pending-requests`, {
        headers: { Authorization: `Bearer ${tokenStore.get() ?? ''}` },
      });
      if (res.ok) setPending(await res.json() as PendingRequest[]);
    } catch { /* ignore */ }
  }

  async function saveSettings(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch(`${BASE}/agent/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenStore.get() ?? ''}`,
        },
        body: JSON.stringify(next),
      });
      setMsg(res.ok ? 'Saved!' : 'Could not save - try again');
    } catch {
      setMsg('Network error');
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 2000);
    }
  }

  async function handlePendingAction(orderId: string, action: 'approve' | 'decline') {
    // Route through existing PayPal approve/decline endpoints
    const path = action === 'approve' ? `/paypal/approve/${orderId}` : `/paypal/decline/${orderId}`;
    try {
      await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenStore.get() ?? ''}` },
      });
      void loadPending();
    } catch { /* ignore */ }
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-ink text-sm">Coach Agent</p>
          <p className="text-xs text-ink/50">Controls what the AI can propose for your learners</p>
        </div>
        <ShieldCheck className="w-5 h-5 text-green-500 ml-auto" />
      </div>

      <div className="px-5 py-4 flex flex-col gap-5">
        {/* Agent toggle */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink">Allow Coach to suggest purchases</p>
            <p className="text-xs text-ink/50 mt-0.5">When off, the Coach can still chat but cannot request kits</p>
          </div>
          <button
            onClick={() => void saveSettings({ agentEnabled: !settings.agentEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${settings.agentEnabled ? 'bg-primary' : 'bg-ink/20'}`}
            aria-pressed={settings.agentEnabled}
            aria-label="Toggle agent"
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${settings.agentEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Weekly cap */}
        <div>
          <p className="text-sm font-semibold text-ink mb-2">Weekly spending cap</p>
          <div className="flex flex-wrap gap-2">
            {CAP_OPTIONS.map((opt) => (
              <button
                key={opt.cents}
                onClick={() => void saveSettings({ weeklyCapCents: opt.cents })}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                  settings.weeklyCapCents === opt.cents
                    ? 'bg-primary text-white border-primary'
                    : 'bg-transparent text-ink/60 border-[var(--color-border)] hover:border-primary/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {saving && <p className="text-xs text-ink/40 mt-2">Saving…</p>}
          {msg && <p className={`text-xs mt-2 font-medium ${msg === 'Saved!' ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}
        </div>

        {/* Pending requests */}
        {pending.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-ink mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Pending agent requests ({pending.length})
            </p>
            <div className="flex flex-col gap-2">
              {pending.map((req) => (
                <div key={req.orderId} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">{KIT_NAMES[req.kitId] ?? req.kitId}</p>
                    <p className="text-xs text-ink/50">+{req.practiceDollarsAwarded} Practice Dollars</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => void handlePendingAction(req.orderId, 'decline')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[var(--color-border)] text-ink/60 hover:text-red-600 hover:border-red-300 transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => void handlePendingAction(req.orderId, 'approve')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
