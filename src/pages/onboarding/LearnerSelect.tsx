import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useSession } from '@/lib/session';

interface LearnerRow {
  id: string;
  nickname: string;
  band: string;
  avatar: string;
  xp: number;
  streakDays: number;
  practiceDollars: number;
}

const AVATAR_EMOJI: Record<string, string> = {
  owl: '🦉', fox: '🦊', bear: '🐻', panda: '🐼', butterfly: '🦋',
  turtle: '🐢', lion: '🦁', frog: '🐸', rocket: '🚀', star: '⭐',
  seedling: '🌱', chart: '📈',
};

const DEMO_FAMILY_EMAIL = 'demo@stackly.app';

export default function LearnerSelect() {
  const nav = useNavigate();
  const { user } = useSession();
  const [learners, setLearners] = useState<LearnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // If parent is logged in, fetch their learners directly
  useEffect(() => {
    if (user?.role === 'parent') {
      api.get<LearnerRow[]>('/auth/learners')
        .then(setLearners)
        .catch(() => setError('Could not load learners'))
        .finally(() => setLoading(false));
    } else {
      // Prompt to log in as parent first - or demo
      setLoading(false);
    }
  }, [user]);

  if (loading) return <Spinner />;

  if (!user || user.role !== 'parent') {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 gap-6">
        <h1 className="font-display text-2xl font-bold text-ink">Learner sign-in</h1>
        <p className="text-ink/70 text-center">A parent needs to be signed in to show the learner list.</p>
        <button onClick={() => nav('/login-parent')}
          className="bg-primary text-white font-semibold rounded-2xl py-3 px-8 hover:bg-primary/90 min-h-[44px]">
          Parent sign in
        </button>
        <p className="text-ink/50 text-sm">
          Want to try the demo?{' '}
          <button onClick={() => nav('/login-parent?demo=1')} className="text-primary underline">
            Use demo account
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center p-6 pt-12">
      <div className="w-full max-w-md">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Who's learning today?</h1>
        <p className="text-ink/60 mb-6">Tap your name and enter your PIN.</p>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="flex flex-col gap-3">
          {learners.map((l) => (
            <button key={l.id}
              onClick={() => nav(`/pin-login/${l.id}`)}
              className="bg-surface border border-ink/8 rounded-2xl px-4 py-3 flex items-center gap-4
                         hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98] transition-all
                         text-left min-h-[44px]"
            >
              <span className="text-3xl">{AVATAR_EMOJI[l.avatar] ?? '🌱'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink">{l.nickname}</p>
                <p className="text-xs text-ink/50 capitalize">{l.band} · {l.xp} XP · ${l.practiceDollars} Practice</p>
              </div>
              <span className="text-ink/30 text-xl">›</span>
            </button>
          ))}
        </div>

        {learners.length === 0 && (
          <p className="text-ink/50 text-sm mt-4">No learners yet - add one from your parent account.</p>
        )}

        <button onClick={() => nav('/onboarding/add-learner')}
          className="mt-6 w-full border-2 border-dashed border-primary/40 text-primary font-semibold
                     rounded-2xl py-3 hover:bg-primary/5 min-h-[44px]">
          + Add a learner
        </button>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
