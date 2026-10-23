import { useSession } from '@/lib/session';
import Seedling from '@/assets/Seedling';

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

// Simple SVG progress ring
function XPRing({ xp }: { xp: number }) {
  const { level, progress } = xpToLevel(xp);
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (progress / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--color-ink,#1e2d40)" strokeOpacity="0.08" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--color-primary,#3d9970)" strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ marginTop: '-76px' }}>
        <span className="font-display font-bold text-xl text-ink">{level}</span>
        <span className="text-xs text-ink/50">Level</span>
      </div>
      <p className="text-xs text-ink/60">{xp} XP total</p>
    </div>
  );
}

export default function LearnerHome() {
  const { user } = useSession();
  const band = user?.band ?? 'sprouts';
  const missions = BAND_MISSIONS[band] ?? BAND_MISSIONS.sprouts;
  // Pick today's mission deterministically
  const todayMission = missions[new Date().getDay() % missions.length];

  const xp = user?.xp ?? 0;
  const streak = user?.streakDays ?? 0;
  const pd = user?.practiceDollars ?? 1000;
  const nickname = user?.nickname ?? 'Learner';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Greeting */}
      <div className="flex items-center gap-4">
        <Seedling mood="happy" className="w-14 h-14 shrink-0" />
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Hey, {nickname}! 👋
          </h1>
          <p className="text-ink/60 text-sm capitalize">{band} learner</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard emoji="🔥" label="Streak" value={`${streak}d`} />
        <StatCard emoji="💵" label="Practice $" value={`$${pd.toLocaleString()}`} />
        <div className="bg-surface rounded-2xl p-4 flex flex-col items-center gap-1 border border-ink/8 relative">
          <XPRing xp={xp} />
        </div>
      </div>

      {/* Today's mission */}
      <div className="bg-primary/8 border border-primary/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🎯</span>
          <h2 className="font-display font-semibold text-ink text-lg">Today's mission</h2>
        </div>
        <p className="text-ink/80 leading-relaxed">{todayMission}</p>
        <button className="mt-4 bg-primary text-white font-semibold rounded-xl px-5 py-2.5
                           hover:bg-primary/90 active:scale-95 transition-all text-sm min-h-[44px]">
          Start now →
        </button>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <QuickCard emoji="📚" label="Continue learning" href="/app/learn" />
        <QuickCard emoji="📈" label="Check portfolio" href="/app/invest" />
        <QuickCard emoji="🤖" label="Ask Penny" href="/app/coach" />
        <QuickCard emoji="💳" label="PayPal Lab" href="/app/paypal" />
      </div>

      {/* Educational reminder */}
      <p className="text-xs text-ink/40 text-center leading-relaxed">
        All investing on Stackly uses Practice Dollars — not real money.
        This is educational only.
      </p>
    </div>
  );
}

function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="bg-surface rounded-2xl p-4 flex flex-col items-center gap-1 border border-ink/8">
      <span className="text-2xl">{emoji}</span>
      <p className="font-display font-bold text-ink text-lg">{value}</p>
      <p className="text-xs text-ink/50">{label}</p>
    </div>
  );
}

function QuickCard({ emoji, label, href }: { emoji: string; label: string; href: string }) {
  return (
    <a href={href}
      className="bg-surface border border-ink/8 rounded-2xl p-4 flex items-center gap-3
                 hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98] transition-all min-h-[44px]">
      <span className="text-2xl">{emoji}</span>
      <span className="font-semibold text-sm text-ink">{label}</span>
    </a>
  );
}
