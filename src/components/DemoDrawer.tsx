/**
 * DemoDrawer - floating help button visible in demo/dev mode.
 *
 * Shows sandbox credentials, PayPal test cards, and a one-click demo reset.
 * Only renders when VITE_DEMO_MODE=true (set on Render for the judge demo).
 */

import { useState } from 'react';
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '/api';

const SHOW = import.meta.env.VITE_DEMO_MODE === 'true';

interface Cred { label: string; value: string }

const CREDS: Cred[] = [
  { label: 'Parent email',    value: 'demo@stackly.app' },
  { label: 'Parent password', value: 'demo1234' },
  { label: 'Learner Sam PIN', value: '1111  (Sprouts, 7–10)' },
  { label: 'Learner Ben PIN', value: '2222  (Builders, 11–14)' },
  { label: 'Learner Ivy PIN', value: '3333  (Investors, 15–24)' },
];

const PAYPAL_CARDS: Cred[] = [
  { label: 'PayPal sandbox buyer', value: 'sb-buyer@sandbox.paypal.com' },
  { label: 'PayPal sandbox card',  value: '4032037167452523  Exp 03/26  CVV 111' },
];

function CopyRow({ label, value }: Cred) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value.split('  ')[0]).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-xs text-gray-500 shrink-0 w-36">{label}</span>
      <span className="text-xs font-mono bg-gray-100 rounded px-2 py-0.5 flex-1 truncate">{value}</span>
      <button
        onClick={copy}
        className="text-xs text-indigo-600 hover:underline shrink-0 min-h-[32px] px-1"
        aria-label={`Copy ${label}`}
      >
        {copied ? '✓' : 'copy'}
      </button>
    </div>
  );
}

export function DemoDrawer() {
  const [open, setOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  if (!SHOW) return null;

  const handleReset = async () => {
    setResetting(true);
    setResetMsg('');
    try {
      const res = await fetch(`${API_BASE}/auth/demo-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'reset-demo' }),
      });
      const data = await res.json() as { ok?: boolean; message?: string; error?: string };
      setResetMsg(data.ok ? '✅ ' + (data.message ?? 'Reset complete') : '❌ ' + (data.error ?? 'Reset failed'));
    } catch {
      setResetMsg('❌ Network error - check the API is running');
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white text-sm font-semibold rounded-full px-4 py-2 shadow-lg hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 min-h-[44px]"
        aria-label="Open demo help drawer"
      >
        🎓 Demo
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Demo credentials and controls"
        className={`fixed bottom-0 right-0 z-50 w-full max-w-sm bg-white rounded-t-2xl shadow-2xl transition-transform duration-200 ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100">
          <h2 className="font-bold text-base text-gray-800">Judge demo credentials</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close demo drawer"
          >
            ×
          </button>
        </div>

        <div className="px-4 py-3 overflow-y-auto max-h-[60vh]">
          <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mb-3">
            All data is sandboxed. No real payments are processed.
          </p>

          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sign-in credentials</h3>
          {CREDS.map(c => <CopyRow key={c.label} {...c} />)}

          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4 mb-1">PayPal sandbox</h3>
          {PAYPAL_CARDS.map(c => <CopyRow key={c.label} {...c} />)}
          <p className="text-xs text-gray-400 mt-1">
            Use PayPal environment: Sandbox. Any amount under $10 completes instantly.
          </p>

          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4 mb-1">Demo reset</h3>
          <p className="text-xs text-gray-500 mb-2">
            Resets all practice dollars to $10.00 and clears XP. Safe to run before a demo.
          </p>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="w-full bg-red-50 text-red-700 border border-red-200 rounded-lg py-2 text-sm font-medium hover:bg-red-100 disabled:opacity-50 min-h-[44px]"
          >
            {resetting ? 'Resetting…' : '🔄 Reset demo data'}
          </button>
          {resetMsg && (
            <p className="text-xs mt-2 text-gray-700" role="status">{resetMsg}</p>
          )}

          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4 mb-1">If it's slow</h3>
          <p className="text-xs text-gray-500">
            The API is on Render's free tier and may take up to 30 seconds to wake up after inactivity. Wait 30 seconds and try again - it will be instant after that.
          </p>
        </div>
      </aside>
    </>
  );
}
