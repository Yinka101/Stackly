import { useEffect, useRef } from 'react';
import type { Badge } from './types';
import Seedling from '@/assets/Seedling';

interface Props {
  xpEarned: number;
  newBadges: Badge[];
  onClose: () => void;
}

export default function CelebrationModal({ xpEarned, newBadges, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Focus the close button when modal opens
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lesson complete"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(26,39,68,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className={[
          'bg-surface rounded-3xl p-8 max-w-sm w-full flex flex-col items-center gap-5 shadow-2xl text-center',
          !prefersReduced && 'animate-pop-in',
        ].filter(Boolean).join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mascot */}
        <div className={!prefersReduced ? 'animate-bounce-once' : ''}>
          <Seedling mood="celebrating" className="w-24 h-24" />
        </div>

        {/* Title */}
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Lesson done! 🎉</h2>
          <p className="text-ink/60 mt-1 text-sm">You earned</p>
        </div>

        {/* XP pill */}
        <div className={[
          'bg-primary text-white font-display text-3xl font-bold px-8 py-3 rounded-2xl',
          !prefersReduced && 'animate-xp-pop',
        ].filter(Boolean).join(' ')}>
          +{xpEarned} XP
        </div>

        {/* Badges */}
        {newBadges.length > 0 && (
          <div className="w-full">
            <p className="text-sm font-semibold text-ink/60 mb-2">New badge{newBadges.length > 1 ? 's' : ''}!</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {newBadges.map((b) => (
                <div key={b.id} className="bg-accent/20 text-ink font-semibold text-sm rounded-xl px-3 py-2 flex items-center gap-1.5">
                  <span>{b.emoji}</span>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue button */}
        <button
          ref={closeRef}
          onClick={onClose}
          className="w-full bg-primary text-white font-display font-bold text-lg rounded-2xl py-4
                     hover:bg-primary/90 active:scale-95 transition-all focus-visible:outline-2
                     focus-visible:outline-offset-2 focus-visible:outline-primary min-h-[56px]"
        >
          Keep going →
        </button>
      </div>
    </div>
  );
}
