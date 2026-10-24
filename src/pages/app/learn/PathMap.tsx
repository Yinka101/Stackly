import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import type { PathSummary } from './types';

export default function PathMap() {
  const [paths, setPaths] = useState<PathSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    api.get<PathSummary[]>('/lessons/paths')
      .then(setPaths)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">
      {[0,1].map(i => <div key={i} className="h-40 rounded-2xl bg-ink/5 animate-pulse" />)}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">
      <h1 className="font-display text-2xl font-bold text-ink">Learn</h1>

      {paths.map((path) => {
        const pct = path.totalXp > 0 ? Math.round((path.earnedXp / path.totalXp) * 100) : 0;
        return (
          <section key={path.id} className="flex flex-col gap-4">
            {/* Path header */}
            <div className="flex items-center gap-3">
              <span className="text-3xl">{path.emoji}</span>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-lg font-bold text-ink">{path.title}</h2>
                <p className="text-sm text-ink/60">{path.description}</p>
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2 py-1 shrink-0">
                {pct}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-ink/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Lesson nodes — vertical spine */}
            <div className="flex flex-col gap-0">
              {path.lessons.map((lesson, idx) => (
                <LessonNode
                  key={lesson.id}
                  lesson={lesson}
                  isLast={idx === path.lessons.length - 1}
                  onClick={() => lesson.status !== 'locked' && nav(`/app/learn/${lesson.id}`)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function LessonNode({ lesson, isLast, onClick }: {
  lesson: PathSummary['lessons'][0];
  isLast: boolean;
  onClick: () => void;
}) {
  const isDone = lesson.status === 'done';
  const isCurrent = lesson.status === 'current';
  const isLocked = lesson.status === 'locked';

  return (
    <div className="flex gap-3">
      {/* Spine */}
      <div className="flex flex-col items-center w-8 shrink-0">
        <button
          onClick={onClick}
          disabled={isLocked}
          aria-label={`${lesson.title}${isLocked ? ' (locked)' : ''}`}
          className={[
            'w-8 h-8 rounded-full flex items-center justify-center text-base font-bold border-2 transition-all shrink-0',
            isDone  && 'bg-primary border-primary text-white',
            isCurrent && 'bg-accent border-accent text-ink animate-pulse',
            isLocked && 'bg-ink/8 border-ink/15 text-ink/30 cursor-not-allowed',
          ].filter(Boolean).join(' ')}
        >
          {isDone ? '✓' : lesson.order}
        </button>
        {!isLast && <div className={`w-0.5 flex-1 min-h-[24px] my-1 ${isDone ? 'bg-primary/40' : 'bg-ink/10'}`} />}
      </div>

      {/* Card */}
      <button
        onClick={onClick}
        disabled={isLocked}
        className={[
          'flex-1 mb-3 text-left rounded-2xl px-4 py-3 border transition-all',
          isDone   && 'bg-primary/5 border-primary/20 hover:bg-primary/10',
          isCurrent && 'bg-accent/10 border-accent/40 hover:bg-accent/20 shadow-sm',
          isLocked  && 'bg-ink/3 border-ink/8 cursor-not-allowed opacity-60',
        ].filter(Boolean).join(' ')}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{lesson.emoji}</span>
          <span className={`font-semibold text-sm ${isLocked ? 'text-ink/40' : 'text-ink'}`}>
            {lesson.title}
          </span>
          {isDone && <span className="ml-auto text-xs text-primary font-semibold">+{lesson.xpReward} XP</span>}
          {isCurrent && <span className="ml-auto text-xs text-accent-dark font-semibold">Start →</span>}
          {isLocked && <span className="ml-auto text-base">🔒</span>}
        </div>
        <p className="text-xs text-ink/50 mt-0.5 ml-7">{lesson.durationMins} min</p>
      </button>
    </div>
  );
}
