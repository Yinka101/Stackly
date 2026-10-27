import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import type { PathSummary } from './types';

export default function PathMap() {
  const [paths, setPaths]     = useState<PathSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const nav = useNavigate();

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    api.get<PathSummary[]>('/lessons/paths')
      .then(setPaths)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8"
         aria-busy="true" aria-label="Loading learning paths">
      {[0, 1].map((i) => (
        <div key={i} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1"><Skeleton className="h-6 w-48 mb-2" /><Skeleton className="h-4 w-64" /></div>
          </div>
          <Skeleton className="h-2" />
          {[0,1,2].map((j) => <Skeleton key={j} className="h-14 ml-10" />)}
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <ErrorState
        title="Couldn't load lessons"
        message="Check your connection and try again."
        onRetry={load}
      />
    </div>
  );

  if (paths.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <EmptyState
        emoji="📚"
        title="No lessons yet"
        body="Check back soon - new lessons are coming!"
      />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">
      <h1 className="font-display text-2xl font-bold text-ink">Learn</h1>

      {paths.map((path) => {
        const pct = path.totalXp > 0 ? Math.round((path.earnedXp / path.totalXp) * 100) : 0;
        const done = path.lessons.filter((l) => l.status === 'done').length;
        const total = path.lessons.length;

        return (
          <section key={path.id} className="flex flex-col gap-4" aria-label={path.title}>
            {/* Path header */}
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">{path.emoji}</span>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-lg font-bold text-ink">{path.title}</h2>
                <p className="text-sm text-ink/60 text-pretty">{path.description}</p>
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2 py-1 shrink-0 tabular-nums">
                {pct}%
              </span>
            </div>

            {/* Progress bar - labelled for screen readers */}
            <div
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${path.title} progress: ${done} of ${total} lessons complete`}
              className="h-2 bg-ink/8 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-primary rounded-full transition-all duration-700 motion-reduce:transition-none"
                style={{ width: `${pct}%` }}
              />
            </div>
            {/* Text fallback for charts */}
            <p className="sr-only">{done} of {total} lessons complete ({pct}%)</p>

            {/* Lesson nodes */}
            <div className="flex flex-col gap-0" role="list">
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
  const isDone    = lesson.status === 'done';
  const isCurrent = lesson.status === 'current';
  const isLocked  = lesson.status === 'locked';

  const statusLabel = isDone ? 'completed' : isCurrent ? 'ready to start' : 'locked';
  const ariaLabel = `${lesson.title} - ${statusLabel}${isDone ? `, +${lesson.xpReward} XP earned` : ''}`;

  return (
    <div className="flex gap-3" role="listitem">
      {/* Spine dot */}
      <div className="flex flex-col items-center w-8 shrink-0">
        <div
          aria-hidden="true"
          className={[
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0',
            isDone    && 'bg-primary border-primary text-white',
            isCurrent && 'bg-accent border-accent text-ink',
            isLocked  && 'bg-ink/8 border-ink/15 text-ink/30',
          ].filter(Boolean).join(' ')}
        >
          {isDone ? '✓' : lesson.order}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-[24px] my-1 ${isDone ? 'bg-primary/40' : 'bg-ink/10'}`} />
        )}
      </div>

      {/* Card - single focusable element */}
      <button
        onClick={onClick}
        disabled={isLocked}
        aria-label={ariaLabel}
        aria-disabled={isLocked}
        className={[
          'flex-1 mb-3 text-left rounded-2xl px-4 py-3 border transition-all min-h-[56px]',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isDone    && 'bg-primary/5 border-primary/20 hover:bg-primary/10',
          isCurrent && 'bg-accent/10 border-accent/40 hover:bg-accent/20 shadow-sm',
          isLocked  && 'bg-ink/3 border-ink/8 cursor-not-allowed opacity-60',
        ].filter(Boolean).join(' ')}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">{lesson.emoji}</span>
          <span className={`font-semibold text-sm ${isLocked ? 'text-ink/40' : 'text-ink'}`}>
            {lesson.title}
          </span>
          {isDone    && <span className="ml-auto text-xs text-primary font-semibold tabular-nums">+{lesson.xpReward} XP</span>}
          {isCurrent && <span className="ml-auto text-xs font-semibold text-amber-700">Start →</span>}
          {isLocked  && <span className="ml-auto text-base" aria-hidden="true">🔒</span>}
        </div>
        <p className="text-xs text-ink/50 mt-0.5 ml-7">{lesson.durationMins} min</p>
      </button>
    </div>
  );
}
