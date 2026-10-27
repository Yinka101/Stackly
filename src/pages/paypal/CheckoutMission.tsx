/**
 * CheckoutMission - Mission 3: real PayPal sandbox checkout flow.
 * Learner → picks kit → asks parent → parent approves → PayPal popup → receipt.
 * Handles cancel, decline, network error, closed popup without getting stuck.
 */
import { useState, useEffect } from 'react';
import { usePayPalOrder } from './usePayPalOrder';
import { useSse } from './useSse';
import { BehindTheScenes } from './BehindTheScenes';
import { request } from '@/utils/api';
import type { AgeBand } from '@/lib/session';

interface Kit {
  id: string;
  name: string;
  description: string;
  emoji: string;
  priceUsd: string;
  practiceDollarsAwarded: number;
}

interface Props {
  band: AgeBand;
  learnerId: string;
  onComplete: () => void;
  onBack: () => void;
}

const STAGE_LABELS: Record<string, string> = {
  idle:             'Pick a kit',
  creating:         'Creating order…',
  pending_approval: 'Ask a parent',
  approved:         'Ready to checkout',
  popup_open:       'PayPal checkout open',
  capturing:        'Capturing payment…',
  completed:        'All done!',
  cancelled:        'Cancelled',
  declined:         'Payment declined',
  error:            'Something went wrong',
};

const COACH_TIPS: Record<string, Record<AgeBand, string>> = {
  idle: {
    sprouts:   'Pick something to pretend-buy. This is practice - no real money!',
    builders:  'Each kit is a pretend purchase. You\'ll go through the full PayPal checkout just like a real transaction.',
    investors: 'You\'re about to run a full PayPal Orders v2 flow in the sandbox environment. Pick a kit to initiate.',
  },
  pending_approval: {
    sprouts:   'A grown-up has to say yes first. That\'s a rule to keep you safe!',
    builders:  'PayPal rule: a parent has to approve before the checkout opens. Ask them to check the Family tab.',
    investors: 'This mirrors real-world parental controls and supervised spending. The parent session must approve before the PayPal redirect.',
  },
  popup_open: {
    sprouts:   'Log in with the pretend PayPal account your teacher gave you.',
    builders:  'Use the sandbox buyer account from the PayPal developer dashboard to approve the payment.',
    investors: 'In the sandbox, use a Personal sandbox account (not the Business one) to act as the buyer.',
  },
  capturing: {
    sprouts:   'PayPal is checking everything is OK…',
    builders:  'The server is calling PayPal\'s capture endpoint to confirm the payment.',
    investors: 'POST /v2/checkout/orders/{id}/capture - finalises the authorised payment.',
  },
};

export function CheckoutMission({ band, learnerId, onComplete, onBack }: Props) {
  const [kits, setKits] = useState<Kit[]>([]);
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null);
  const [showTip, setShowTip] = useState(false);

  const order = usePayPalOrder();
  const { events } = useSse(order.orderId);

  // React to SSE events from the server - advance the order stage automatically
  useEffect(() => {
    if (!events.length) return;
    const last = events[events.length - 1];
    if (last.type === 'parent_approved' && order.stage === 'pending_approval') {
      // approveLink already in order state from createOrder; re-confirm with SSE payload
      order.onParentApproved(order.approveLink ?? '');
    }
    if (last.type === 'parent_declined' && order.stage === 'pending_approval') {
      order.setStageDeclined();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  // Load kits
  useEffect(() => {
    request<{ kits: Kit[] }>('/paypal/kits')
      .then(d => setKits(d.kits))
      .catch(() => {});
  }, []);

  const tipKey = order.stage === 'idle' ? 'idle'
    : order.stage === 'pending_approval' ? 'pending_approval'
    : order.stage === 'popup_open' ? 'popup_open'
    : order.stage === 'capturing' ? 'capturing'
    : 'idle';

  const coachTip = COACH_TIPS[tipKey]?.[band];

  const handleSelectKit = async (kit: Kit) => {
    setSelectedKit(kit);
    await order.createOrder(kit.id, learnerId);
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">← Back</button>
        <h2 className="font-bold text-lg text-[var(--ink)]">Mission 3: Pay at a Checkout</h2>
      </div>

      {/* Disclaimer banner */}
      <div className="bg-[var(--accent)]/15 border border-[var(--accent)]/30 rounded-xl px-4 py-2 text-sm text-[var(--ink)]">
        🧪 <strong>Sandbox mode</strong> - Practice money only, not financial advice. No real money will move.
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Left: main flow */}
        <div className="flex flex-col gap-4">
          {/* Stage indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${
              order.stage === 'completed' ? 'bg-green-500' :
              order.stage === 'error' || order.stage === 'declined' ? 'bg-red-500' :
              'bg-[var(--primary)] animate-pulse'
            }`} />
            <span className="text-sm font-medium text-[var(--ink-muted)]">{STAGE_LABELS[order.stage]}</span>
          </div>

          {/* Kit picker */}
          {order.stage === 'idle' && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-[var(--ink-muted)]">Pick a practice kit to buy:</p>
              {kits.map(kit => (
                <button
                  key={kit.id}
                  onClick={() => void handleSelectKit(kit)}
                  className="card text-left hover:border-[var(--primary)] hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{kit.emoji}</span>
                    <div>
                      <p className="font-semibold text-[var(--ink)]">{kit.name}</p>
                      <p className="text-sm text-[var(--ink-muted)]">{kit.description}</p>
                      <p className="text-sm font-bold text-[var(--primary)] mt-1">
                        ${kit.priceUsd} → {kit.practiceDollarsAwarded} Practice Dollars
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Creating */}
          {order.stage === 'creating' && (
            <div className="card flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
              <p className="text-[var(--ink-muted)]">Creating your order with PayPal…</p>
            </div>
          )}

          {/* Pending approval */}
          {order.stage === 'pending_approval' && selectedKit && (
            <div className="card flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedKit.emoji}</span>
                <div>
                  <p className="font-semibold text-[var(--ink)]">{selectedKit.name}</p>
                  <p className="text-sm text-[var(--ink-muted)]">${selectedKit.priceUsd}</p>
                </div>
              </div>
              <p className="text-[var(--ink)] font-medium">
                ⏳ Waiting for a parent to approve…
              </p>
              <p className="text-sm text-[var(--ink-muted)]">
                Ask a parent to open Stackly and check the <strong>Family</strong> tab. They'll see an approval card waiting for them.
              </p>
              <p className="text-xs text-[var(--ink-muted)]/70">Order ID: {order.orderId}</p>
            </div>
          )}

          {/* Approved - ready to open popup */}
          {order.stage === 'approved' && (
            <div className="card flex flex-col gap-3">
              <p className="text-[var(--ink)] font-semibold">✅ Parent approved!</p>
              <p className="text-sm text-[var(--ink-muted)]">
                Click the button below to open PayPal. Log in with a sandbox buyer account to complete the checkout.
              </p>
              <button
                onClick={order.openPopup}
                className="py-3 rounded-xl bg-[#0070BA] text-white font-bold"
              >
                Open PayPal Checkout →
              </button>
            </div>
          )}

          {/* Popup open */}
          {order.stage === 'popup_open' && (
            <div className="card flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-[#0070BA] border-t-transparent animate-spin" />
                <p className="text-[var(--ink)] font-medium">PayPal checkout is open in a new window…</p>
              </div>
              <p className="text-sm text-[var(--ink-muted)]">
                Complete the payment in the PayPal window. This page will update automatically.
              </p>
              <button
                onClick={order.reset}
                className="text-sm text-[var(--ink-muted)] underline"
              >
                Cancel and start over
              </button>
            </div>
          )}

          {/* Capturing */}
          {order.stage === 'capturing' && (
            <div className="card flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
              <p className="text-[var(--ink-muted)]">Capturing your payment…</p>
            </div>
          )}

          {/* Completed */}
          {order.stage === 'completed' && order.result && (
            <div className="card border-2 border-green-500/30 bg-green-50 flex flex-col gap-3">
              <p className="text-2xl text-center">🎉</p>
              <p className="font-bold text-center text-[var(--ink)]">Payment complete!</p>
              <div className="bg-white rounded-xl p-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--ink-muted)]">Kit</span>
                  <span className="font-medium">{selectedKit?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ink-muted)]">Amount</span>
                  <span className="font-medium">${selectedKit?.priceUsd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ink-muted)]">Practice Dollars earned</span>
                  <span className="font-bold text-[var(--primary)]">+{order.result.practiceDollarsAwarded} PD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ink-muted)]">XP earned</span>
                  <span className="font-bold text-[var(--accent)]">+{order.result.xpAwarded} XP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ink-muted)]">Order ID</span>
                  <span className="font-mono text-xs">{order.result.orderId}</span>
                </div>
              </div>
              <button
                onClick={onComplete}
                className="py-3 rounded-xl bg-[var(--primary)] text-white font-bold"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Cancelled */}
          {order.stage === 'cancelled' && (
            <div className="card flex flex-col gap-3">
              <p className="font-semibold text-[var(--ink)]">⬅️ You cancelled the payment</p>
              <p className="text-sm text-[var(--ink-muted)]">No money was moved. You can try again whenever you like.</p>
              <button onClick={order.reset} className="py-3 rounded-xl bg-[var(--primary)] text-white font-bold">
                Try again
              </button>
            </div>
          )}

          {/* Declined */}
          {order.stage === 'declined' && (
            <div className="card flex flex-col gap-3">
              <p className="font-semibold text-[var(--ink)]">❌ Payment declined</p>
              <p className="text-sm text-[var(--ink-muted)]">{order.error ?? 'PayPal declined the payment. Try a different sandbox buyer account.'}</p>
              <button onClick={order.reset} className="py-3 rounded-xl bg-[var(--primary)] text-white font-bold">
                Try again
              </button>
            </div>
          )}

          {/* Error */}
          {order.stage === 'error' && (
            <div className="card border-2 border-red-300 flex flex-col gap-3">
              <p className="font-semibold text-red-700">Something went wrong</p>
              <p className="text-sm text-[var(--ink-muted)]">{order.error}</p>
              <button onClick={order.reset} className="py-3 rounded-xl bg-[var(--primary)] text-white font-bold">
                Start over
              </button>
            </div>
          )}

          {/* Coach tip */}
          {coachTip && (
            <div>
              <button
                onClick={() => setShowTip(t => !t)}
                className="flex items-center gap-2 text-sm text-[var(--primary)] font-medium"
              >
                🌱 {showTip ? 'Hide coach tip' : 'Coach tip'}
              </button>
              {showTip && (
                <div className="mt-2 bg-[var(--primary)]/8 border border-[var(--primary)]/20 rounded-xl px-4 py-3 text-sm text-[var(--ink)]">
                  {coachTip}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Behind the scenes */}
        <BehindTheScenes events={events} band={band} />
      </div>
    </div>
  );
}
