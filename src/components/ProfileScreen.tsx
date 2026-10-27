import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { api, type Profile } from '@/utils/api';
import { toast } from 'sonner';

interface Props { profile: Profile; onBalanceChange: () => void; onLogout: () => void }

const PACKAGES = [
  { index: 0, label: '100 Practice Dollars', usd: '$1.00 USD', emoji: '💰' },
  { index: 1, label: '500 Practice Dollars', usd: '$5.00 USD', emoji: '💵' },
  { index: 2, label: '1,000 Practice Dollars', usd: '$10.00 USD', emoji: '🤑' },
];

const BAND_LABELS: Record<string, string> = {
  sprouts: 'Sprouts (7–10)',
  builders: 'Builders (11–14)',
  investors: 'Investors (15–24)',
};

export default function ProfileScreen({ profile, onBalanceChange, onLogout }: Props) {
  const [showPayPal, setShowPayPal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [approveUrl, setApproveUrl] = useState('');
  const [captureStep, setCaptureStep] = useState(false);

  async function startTopUp(pkgIndex: number) {
    setBusy(true);
    try {
      const { orderId: id, approveUrl: url } = await api.createOrder({
        profileId: profile.id,
        packageIndex: pkgIndex,
      });
      setOrderId(id);
      setApproveUrl(url);
      setCaptureStep(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function capture() {
    if (!orderId) return;
    setBusy(true);
    try {
      const result = await api.captureOrder(orderId);
      toast.success(`+${result.practiceDollarsAwarded} Practice Dollars added!`);
      setShowPayPal(false);
      setOrderId('');
      setApproveUrl('');
      onBalanceChange();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="px-4 py-6 pb-24 max-w-md mx-auto">
      {/* Profile card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm mb-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">{profile.avatar}</div>
          <div>
            <div className="font-bold text-slate-900 text-lg">{profile.nickname}</div>
            <div className="text-sm text-slate-500">{BAND_LABELS[profile.band]}</div>
          </div>
        </div>
        <div className="flex items-center justify-between bg-blue-50 rounded-2xl p-4">
          <div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-0.5">Practice Dollars</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">${profile.practiceDollars.toFixed(2)}</div>
          </div>
          <button
            onClick={() => setShowPayPal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Add more
          </button>
        </div>
      </div>

      {/* PayPal info */}
      <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-600 mb-5">
        <p className="font-semibold text-slate-800 mb-1">About Practice Dollars</p>
        <p>Practice Dollars are imaginary money used only inside Stackly. They cannot be withdrawn or used for real purchases. Adding Practice Dollars is a small sandbox payment approved by a parent.</p>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-3 rounded-2xl border-2 border-slate-200 text-slate-500 font-semibold text-sm hover:border-slate-300 hover:text-slate-700 transition-colors"
      >
        Switch profile
      </button>

      {/* PayPal modal */}
      <AnimatePresence>
        {showPayPal && (
          <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 p-4">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-bold text-slate-900">Add Practice Dollars</h4>
                <button onClick={() => { setShowPayPal(false); setOrderId(''); setApproveUrl(''); }} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 mb-4 font-medium">
                A parent or guardian must approve this payment in the PayPal sandbox.
                Kids never enter payment details.
              </div>

              {!orderId ? (
                <>
                  <p className="text-sm text-slate-600 mb-4">Choose a package:</p>
                  <div className="flex flex-col gap-2 mb-4">
                    {PACKAGES.map((pkg) => (
                      <button
                        key={pkg.index}
                        onClick={() => { void startTopUp(pkg.index); }}
                        disabled={busy}
                        className="flex items-center gap-3 px-4 py-3.5 bg-slate-50 hover:bg-blue-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-all text-left"
                      >
                        <span className="text-2xl">{pkg.emoji}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 text-sm">{pkg.label}</div>
                          <div className="text-xs text-slate-400">{pkg.usd} sandbox payment</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : !captureStep ? (
                <>
                  <p className="text-sm text-slate-700 mb-4">
                    Open the PayPal sandbox link below, have a parent log in with a sandbox buyer account, and approve the payment. Then come back and tap "I approved it".
                  </p>
                  <a
                    href={approveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm mb-3 hover:bg-blue-700 transition-colors"
                  >
                    Open PayPal Sandbox <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setCaptureStep(true)}
                    className="w-full py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:border-blue-300 transition-colors"
                  >
                    I approved it - claim my dollars
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-700 mb-4">
                    Click below to capture the payment and receive your Practice Dollars.
                  </p>
                  <button
                    onClick={() => { void capture(); }}
                    disabled={busy}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-40"
                  >
                    {busy ? 'Capturing…' : 'Confirm - Add Practice Dollars'}
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
