import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '@/lib/session';
import Seedling from '@/assets/Seedling';
import { Skeleton } from '@/components/ui/Skeleton';
import CelebrationModal from '@/components/ui/CelebrationModal';
import SoundToggle from '@/components/ui/SoundToggle';

const BAND_MISSIONS: Record<string, string[]> = {
  sprouts: [
    'Watch "What is money?" and answer 2 questions',
    'Buy 1 share of your favourite company with Practice Dollars',
    'Ask Penny: "Why do people save money?"',
  ],
  builders: [
    'Complete the "How PayPal works" lesson',
    'Check how much your portfolio grew this week',
    'Ask Penny to explain compound interest',
  ],
  investors: [
    'Read the "Risk vs reward" lesson and pass the quiz',
    'Rebalance your portfolio — is it still 60/40?',
    'Ask Penny to compare index funds and single stocks',
  ],
};

const XP_PER_LEVEL = 500;

function xpToLevel(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const progress = ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  return { level, progress };
}

function XPRing({ xp }: { xp: number }) {
  const { level, progress } = xpToLevel(xp);
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (progress / 100) * circ;
  const remaining = XP_PER_LEVEL - (xp % XP_PER_LEVEL);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* role=img + aria-label makes this accessible without a separate text element */}
      <div
        role="img"
        aria-label={`Level ${level}, ${Math.round(progress)}% to next level, ${remaining} XP to go`}
        className="relative w-24 h-24"
      >
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90" aria-hidden="true">
          <circle cx="48" cy="48" r={r} fill="none"
            stroke="var(--color-ink)" strokeOpacity="0.08" strokeWidth="8" />
          <circle cx="48" cy="48" r={r} fill="none"
            stroke="var(--color-primary)" strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            className="transition-[stroke-dasharray] duration-700 motion-reduce:transition-none" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-xl text-ink leading-none">{level}</span>
          <span className="text-[10px] text-ink/50 leading-none">Level</span>
        </div>
      </div>
      <p className="text-xs text-ink/60 tabular-nums">{xp} XP</p>
    </div>
  );
}

function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="bg-surface rounded-2xl p-4 flex flex-col items-center gap-1
                    border border-ink/8 min-h-[80px]">
      <span className="text-2xl" aria-hidden="true">{emoji}</span>
      <p className="font-display font-bold text-ink text-lg tabular-nums leading-tight">{value}</p>
      <p className="text-xs text-ink/50">{label}</p>
    </div>
  );
}

const QUICK_LINKS = [
  { emoji: '📚', label: 'Continue learning', to: '/app/learn' },
  { emoji: '📈', label: 'Check portfolio',   to: '/app/invest' },
  { emoji: '🤖', label: 'Ask Penny',         to: '/app/coach?tab=chat' },
  { emoji: '💳', label: 'PayPal Lab',        to: '/app/paypal' },
];

const FIRST_VISIT_KEY = 'stackly_first_visit_celebrated';

export default function LearnerHome() {
  const { user, loading } = useSession();
  const [showCelebration, setShowCelebration] = useState(false);

  // First-visit celebration
  useEffect(() => {
    if (!loading && user?.role === 'learner') {
      if (!localStorage.getItem(FIRST_VISIT_KEY)) {
        localStorage.setItem(FIRST_VISIT_KEY, '1');
        setShowCelebration(true);
      }
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6" aria-busy="true" aria-label="Loading home screen">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="flex-1"><Skeleton className="h-7 w-48 mb-2" /><Skeleton className="h-4 w-24" /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
        </div>
        <Skeleton className="h-32" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16" /><Skeleton className="h-16" />
          <Skeleton className="h-16" /><Skeleton className="h-16" />
        </div>
      </div>
    );
  }

  const band      = user?.band ?? 'sprouts';
  const missions  = BAND_MISSIONS[band] ?? BAND_MISSIONS.sprouts;
  const todayMission = missions[new Date().getDay() % missions.length];
  const xp        = user?.xp ?? 0;
  const streak    = user?.streakDays ?? 0;
  const pd        = user?.practiceDollars ?? 1000;
  const nickname  = user?.nickname ?? 'Learner';

  const bandLabel: Record<string, string> = {
    sprouts: 'Sprouts (ages 7–10)',
    builders: 'Builders (ages 11–14)',
    investors: 'Investors (ages 15–24)',
  };

  return (
    <>
      {showCelebration && (
        <CelebrationModal
          title={`Welcome, ${nickname}!`}
          body="Your money learning adventure starts now. Complete missions to earn XP and level up!"
          xp={50}
          onClose={() => setShowCelebration(false)}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Seedling mood="happy" className="w-14 h-14 shrink-0" aria-hidden="true" />
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">
                Hey, {nickname}! 👋
              </h1>
              <p className="text-ink/60 text-sm">{bandLabel[band]}</p>
            </div>
          </div>
          <SoundToggle />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3" role="region" aria-label="Your stats">
          <StatCard emoji="🔥" label="Streak" value={`${streak}d`} />
          <StatCard emoji="💵" label="Practice $" value={`$${pd.toLocaleString()}`} />
          <div className="bg-surface rounded-2xl p-4 flex flex-col items-center gap-1
                          border border-ink/8">
            <XPRing xp={xp} />
          </div>
        </div>

        {/* Today's mission */}
        <section
          aria-label="Today's mission"
          className="bg-primary/8 border border-primary/20 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl" aria-hidden="true">🎯</span>
            <h2 className="font-display font-semibold text-ink text-lg">Today's mission</h2>
          </div>
          <p className="text-ink/80 leading-relaxed text-pretty">{todayMission}</p>
          <Link
            to="/app/learn"
            className="inline-block mt-4 bg-primary text-white font-semibold rounded-xl
                       px-5 py-2.5 hover:bg-primary/90 active:scale-95 transition-all
                       min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary
                       focus-visible:ring-offset-2"
          >
            Start now →
          </Link>
        </section>

        {/* Penny Agent shortcut */}
        <Link
          to="/app/coach?tab=agent"
          className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20
                     rounded-2xl p-4 flex items-center gap-3 hover:border-primary/40
                     active:scale-[0.98] transition-all min-h-[56px]
                     focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <span className="text-3xl" aria-hidden="true">✨</span>
          <div>
            <p className="font-display font-semibold text-sm text-ink">Talk to Penny's Agent</p>
            <p className="text-xs text-ink/60">Say "help me start a lemonade stand" →</p>
          </div>
        </Link>

        {/* Quick links */}
        <nav aria-label="Quick links" className="grid grid-cols-2 gap-3">
          {QUICK_LINKS.map((lnk) => (
            <Link
              key={lnk.to}
              to={lnk.to}
              className="bg-surface border border-ink/8 rounded-2xl p-4 flex items-center gap-3
                         hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]
                         transition-all min-h-[56px] focus-visible:ring-2 focus-visible:ring-primary
                         focus-visible:ring-offset-2"
            >
              <span className="text-2xl" aria-hidden="true">{lnk.emoji}</span>
              <span className="font-semibold text-sm text-ink">{lnk.label}</span>
            </Link>
          ))}
        </nav>

        {/* Educational disclaimer */}
        <p className="text-xs text-ink/40 text-center leading-relaxed text-balance">
          All investing on Stackly uses Practice Dollars — not real money.
          This is for learning only.
        </p>
      </div>
    </>
  );
}
