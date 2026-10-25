import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const AVATAR: Record<string, string> = {
  owl:'🦉',fox:'🦊',bear:'🐻',panda:'🐼',butterfly:'🦋',
  turtle:'🐢',lion:'🦁',frog:'🐸',rocket:'🚀',star:'⭐',seedling:'🌱',chart:'📈',
};

interface LearnerSummary {
  learnerId: string;
  nickname: string;
  band: string;
  avatar: string;
  xp: number;
  streakDays: number;
  practiceDollars: number;
  lessonsThisWeek: number;
  pdGained: number;
  coachNote: string;
}

export default function FamilySummary() {
  const [summaries, setSummaries] = useState<LearnerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<LearnerSummary[]>('/family/summary')
      .then(setSummaries)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingCards />;
  if (error) return <p className="text-red-500 text-sm">{error}</p>;
  if (!summaries.length) return (
    <p className="text-ink/50 text-sm text-center py-10">
      No learners yet. Add one using the button above.
    </p>
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-ink/40 uppercase tracking-wide font-semibold">This week</p>
      {summaries.map((s) => (
        <div key={s.learnerId}
          className="bg-surface border border-ink/8 rounded-2xl p-4 flex flex-col gap-3">
          {/* Top row */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">{AVATAR[s.avatar] ?? '🌱'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-ink">{s.nickname}</p>
              <p className="text-xs text-ink/50 capitalize">{s.band}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink/40">XP</p>
              <p className="font-bold text-ink">{s.xp.toLocaleString()}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Lessons" value={String(s.lessonsThisWeek)} sub="this week" />
            <Stat label="Streak" value={`${s.streakDays}d`} sub="current" />
            <Stat
              label="Practice $"
              value={`$${s.practiceDollars}`}
              sub={s.pdGained > 0 ? `+$${s.pdGained} gained` : 'no change'}
              highlight={s.pdGained > 0}
            />
          </div>

          {/* Coach note */}
          <div className="bg-accent/10 rounded-xl px-3 py-2.5">
            <p className="text-xs font-semibold text-ink/60 mb-1">Coach's note</p>
            <p className="text-sm text-ink/80 leading-relaxed">{s.coachNote}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className="bg-ink/4 rounded-xl px-2 py-2 text-center">
      <p className="text-xs text-ink/40 mb-0.5">{label}</p>
      <p className={`font-bold text-sm ${highlight ? 'text-primary' : 'text-ink'}`}>{value}</p>
      <p className="text-[10px] text-ink/40">{sub}</p>
    </div>
  );
}

function LoadingCards() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2].map((i) => (
        <div key={i} className="bg-surface border border-ink/8 rounded-2xl p-4 animate-pulse">
          <div className="h-4 bg-ink/8 rounded w-1/3 mb-3" />
          <div className="h-3 bg-ink/8 rounded w-2/3 mb-2" />
          <div className="h-3 bg-ink/8 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
