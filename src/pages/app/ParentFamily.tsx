import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import AgentSettings from './AgentSettings';

interface LearnerRow { id: string; nickname: string; band: string; avatar: string; xp: number; streakDays: number; practiceDollars: number; }
const AVATAR_EMOJI: Record<string, string> = { owl:'🦉',fox:'🦊',bear:'🐻',panda:'🐼',butterfly:'🦋',turtle:'🐢',lion:'🦁',frog:'🐸',rocket:'🚀',star:'⭐',seedling:'🌱',chart:'📈' };

export default function ParentFamily() {
  const nav = useNavigate();
  const [learners, setLearners] = useState<LearnerRow[]>([]);

  useEffect(() => {
    api.get<LearnerRow[]>('/auth/learners').then(setLearners).catch(() => {});
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">My family</h1>
        <button onClick={() => nav('/onboarding/add-learner')}
          className="bg-primary text-white font-semibold rounded-xl px-4 py-2 text-sm hover:bg-primary/90 min-h-[44px]">
          + Add learner
        </button>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {learners.map((l) => (
          <div key={l.id} className="bg-surface border border-ink/8 rounded-2xl px-4 py-4 flex items-center gap-4">
            <span className="text-3xl">{AVATAR_EMOJI[l.avatar] ?? '🌱'}</span>
            <div className="flex-1">
              <p className="font-semibold text-ink">{l.nickname}</p>
              <p className="text-xs text-ink/50 capitalize">{l.band} · {l.xp} XP · ${l.practiceDollars} Practice</p>
            </div>
            <span className="text-xs bg-ink/5 text-ink/60 rounded-lg px-2 py-1 capitalize">{l.band}</span>
          </div>
        ))}
      </div>

      <AgentSettings />
    </div>
  );
}
