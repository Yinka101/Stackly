/**
 * PayPalLabPage - the learner-facing PayPal Lab.
 * Four missions unlocked sequentially. Parents see approval cards.
 */
import { useState } from 'react';
import { useSession } from '@/lib/session';
import { GuidedSimMission } from './GuidedSimMission';
import { CheckoutMission } from './CheckoutMission';
import { SpotTheScamMission } from './SpotTheScamMission';
import { ActivityFeed } from './ActivityFeed';
import { ParentApprovalCard } from './ParentApprovalCard';
import { sendMoneySteps, requestMoneySteps } from './missionData';
import type { AgeBand } from '@/lib/session';

type ActiveMission = null | 1 | 2 | 3 | 4;

interface Mission {
  id: 1 | 2 | 3 | 4;
  emoji: string;
  title: string;
  blurb: Record<AgeBand, string>;
  type: 'sim' | 'live' | 'game';
}

const MISSIONS: Mission[] = [
  {
    id: 1,
    emoji: '💸',
    title: 'Send money safely',
    blurb: {
      sprouts:   'See how to send pretend money to a friend step by step.',
      builders:  'Walk through a simulated PayPal send-money flow and learn what each screen means.',
      investors: 'Understand the full send-money UX and the checks PayPal runs before executing a transfer.',
    },
    type: 'sim',
  },
  {
    id: 2,
    emoji: '🙋',
    title: 'Request money',
    blurb: {
      sprouts:   'Learn how to ask for money back without feeling weird.',
      builders:  'Send a money request and see what the payer receives.',
      investors: 'Explore the money request flow and its differences from a formal invoice.',
    },
    type: 'sim',
  },
  {
    id: 3,
    emoji: '🛒',
    title: 'Pay at a checkout',
    blurb: {
      sprouts:   'Pick a pretend kit, ask a parent, and go through a real PayPal checkout!',
      builders:  'Run the full sandbox checkout: create order, get parent approval, pay with PayPal, see the receipt.',
      investors: 'Execute a complete PayPal Orders v2 lifecycle in the sandbox: create, approve, capture.',
    },
    type: 'live',
  },
  {
    id: 4,
    emoji: '🕵️',
    title: 'Spot the scam',
    blurb: {
      sprouts:   'Can you tell which messages are tricks? Test yourself with 6 examples.',
      builders:  'Six real-world scam scenarios. Can you spot all of them before a scammer tricks you?',
      investors: 'Six social-engineering scenarios. Identify the attack vector and safe response for each.',
    },
    type: 'game',
  },
];

export function PayPalLabPage() {
  const { user } = useSession();
  const [active, setActive] = useState<ActiveMission>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const band = (user?.band ?? 'builders');
  const learnerId = user?.id ?? '';
  const familyId = user?.familyId ?? '';
  const isParent = user?.role === 'parent';

  const handleComplete = (id: number) => {
    setCompleted(prev => new Set([...prev, id]));
    setActive(null);
  };

  // ── Active mission views ──────────────────────────────────────────────────
  if (active === 1) {
    return (
      <div className="p-4">
        <GuidedSimMission
          steps={sendMoneySteps}
          band={band}
          onComplete={() => handleComplete(1)}
          onBack={() => setActive(null)}
        />
      </div>
    );
  }

  if (active === 2) {
    return (
      <div className="p-4">
        <GuidedSimMission
          steps={requestMoneySteps}
          band={band}
          onComplete={() => handleComplete(2)}
          onBack={() => setActive(null)}
        />
      </div>
    );
  }

  if (active === 3) {
    return (
      <div className="p-4">
        <CheckoutMission
          band={band}
          learnerId={learnerId}
          onComplete={() => handleComplete(3)}
          onBack={() => setActive(null)}
        />
      </div>
    );
  }

  if (active === 4) {
    return (
      <div className="p-4">
        <SpotTheScamMission
          band={band}
          onComplete={() => handleComplete(4)}
          onBack={() => setActive(null)}
        />
      </div>
    );
  }

  // ── Mission hub ───────────────────────────────────────────────────────────
  return (
    <div className="p-4 max-w-2xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink)]">PayPal Lab</h1>
        <p className="text-[var(--ink-muted)] mt-1">
          Learn how PayPal works by doing it yourself - safely, with practice money.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-[var(--accent)]/15 border border-[var(--accent)]/30 rounded-xl px-4 py-2 text-sm text-[var(--ink)]">
        🧪 All transactions use PayPal Sandbox (test mode). Practice money only - not financial advice.
      </div>

      {/* Parent: approval cards */}
      {isParent && (
        <ParentApprovalCard
          familyId={familyId}
          onApproved={() => {}}
        />
      )}

      {/* Mission cards */}
      <div className="flex flex-col gap-3">
        {MISSIONS.map((m, i) => {
          const locked = i > 0 && !completed.has(i); // each mission unlocks the next
          const done = completed.has(m.id);

          return (
            <button
              key={m.id}
              onClick={() => !locked && setActive(m.id)}
              disabled={locked}
              className={`card text-left transition-all ${
                locked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:-translate-y-0.5'
              } ${done ? 'border-2 border-green-400/50' : ''}`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{done ? '✅' : locked ? '🔒' : m.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[var(--ink)]">
                      Mission {m.id}: {m.title}
                    </p>
                    {m.type === 'live' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0070BA]/10 text-[#0070BA] uppercase">
                        Live sandbox
                      </span>
                    )}
                    {m.type === 'game' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--ink)] uppercase">
                        Game
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--ink-muted)] mt-0.5">{m.blurb[band]}</p>
                </div>
                {!locked && !done && (
                  <span className="text-[var(--ink-muted)] text-lg mt-1">→</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Activity feed */}
      <ActivityFeed />
    </div>
  );
}
