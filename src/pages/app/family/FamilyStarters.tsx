import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface StarterRow {
  learnerId: string;
  nickname: string;
  band: string;
  avatar: string;
  questions: string[];
}

const AVATAR: Record<string, string> = {
  owl:'🦉',fox:'🦊',bear:'🐻',panda:'🐼',butterfly:'🦋',
  turtle:'🐢',lion:'🦁',frog:'🐸',rocket:'🚀',star:'⭐',seedling:'🌱',chart:'📈',
};

export default function FamilyStarters() {
  const [starters, setStarters] = useState<StarterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    api.get<StarterRow[]>('/family/starters')
      .then(setStarters)
      .finally(() => setLoading(false));
  }, []);

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1800);
  };

  if (loading) return <p className="text-ink/40 text-sm text-center py-8">Generating questions…</p>;

  if (!starters.length) return (
    <p className="text-ink/50 text-sm text-center py-10">No learners yet.</p>
  );

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-ink/40 leading-relaxed">
        Questions to start a conversation with your child this week, based on what they learned.
        Tap any question to copy it.
      </p>

      {starters.map((s) => (
        <div key={s.learnerId} className="bg-surface border border-ink/8 rounded-2xl p-4">
          {/* Learner header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{AVATAR[s.avatar] ?? '🌱'}</span>
            <div>
              <p className="font-semibold text-ink text-sm">{s.nickname}</p>
              <p className="text-xs text-ink/40 capitalize">{s.band}</p>
            </div>
          </div>

          {/* Questions */}
          <div className="flex flex-col gap-2">
            {s.questions.map((q, i) => (
              <button
                key={i}
                onClick={() => copy(q)}
                className={`w-full text-left px-3 py-3 rounded-xl text-sm text-ink/80 leading-snug
                            border transition-all
                            ${copied === q
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-ink/4 border-transparent hover:bg-ink/8 hover:border-ink/12'}`}
              >
                <span className="text-ink/30 mr-2 font-bold">{i + 1}.</span>
                {q}
                {copied === q && <span className="ml-2 text-xs text-primary font-semibold">Copied!</span>}
              </button>
            ))}
          </div>
        </div>
      ))}

      <p className="text-xs text-ink/30 text-center">
        Questions are generated from this week's lessons and Coach conversations.
      </p>
    </div>
  );
}
