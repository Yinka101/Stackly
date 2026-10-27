/**
 * BehindTheScenes - streams PayPal events from SSE in plain language,
 * with technical name in small text for older learners.
 */
import { useEffect, useRef } from 'react';
import type { SseEvent } from './useSse';
import type { AgeBand } from '@/lib/session';

interface Props {
  events: SseEvent[];
  band: AgeBand;
}

export function BehindTheScenes({ events, band }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events.length]);

  if (events.length === 0) {
    return (
      <div className="card bg-[var(--surface-2)] flex flex-col gap-2">
        <h3 className="font-bold text-sm text-[var(--ink-muted)] uppercase tracking-wide">Behind the scenes</h3>
        <p className="text-sm text-[var(--ink-muted)]">Events will appear here as they happen…</p>
      </div>
    );
  }

  return (
    <div className="card bg-[var(--surface-2)] flex flex-col gap-3">
      <h3 className="font-bold text-sm text-[var(--ink-muted)] uppercase tracking-wide">Behind the scenes</h3>
      <ol className="flex flex-col gap-3">
        {events.filter(e => e.type !== 'connected').map((e, i) => (
          <li key={i} className="flex gap-3 animate-fade-in">
            {/* Timeline dot */}
            <div className="flex flex-col items-center pt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] shrink-0" />
              {i < events.length - 2 && <div className="w-0.5 flex-1 bg-[var(--surface-3)] mt-1" />}
            </div>
            <div className="flex flex-col gap-0.5 pb-2">
              <span className="font-semibold text-sm text-[var(--ink)]">{e.label}</span>
              <span className="text-sm text-[var(--ink-muted)]">{e.detail}</span>
              {e.tech && band !== 'sprouts' && (
                <span className="text-[11px] font-mono text-[var(--ink-muted)]/60 mt-0.5">{e.tech}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div ref={bottomRef} />
    </div>
  );
}
