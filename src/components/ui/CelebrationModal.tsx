import { useState, useCallback } from 'react';
import Confetti from './Confetti';
import Seedling from '@/assets/Seedling';

interface Props {
  title: string;
  body: string;
  xp?: number;
  onClose: () => void;
}

/** Full-screen celebration overlay with confetti + mascot.
 *  Reduced motion: confetti is skipped; mascot animates with opacity only. */
export default function CelebrationModal({ title, body, xp, onClose }: Props) {
  const [confettiDone, setConfettiDone] = useState(false);
  const handleDone = useCallback(() => setConfettiDone(true), []);

  return (
    <>
      <Confetti active={!confettiDone} onDone={handleDone} />

      {/* Overlay */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-0 z-[998] flex items-center justify-center bg-black/40 backdrop-blur-sm
                   animate-[fade-in_0.2s_ease] motion-reduce:animate-none"
        onClick={onClose}
      >
        <div
          className="bg-surface rounded-3xl shadow-2xl p-8 mx-4 max-w-sm w-full text-center
                     animate-[pop-in_0.35s_cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:animate-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mascot */}
          <div className="flex justify-center mb-4">
            <div className="animate-bounce-once motion-reduce:animate-none">
              <Seedling mood="celebrating" size={72} />
            </div>
          </div>

          <h2 className="font-display font-bold text-2xl text-ink mb-2">{title}</h2>
          <p className="text-ink/70 leading-relaxed mb-4">{body}</p>

          {xp !== undefined && (
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary
                            font-semibold rounded-full px-4 py-2 mb-5 animate-xp-pop motion-reduce:animate-none">
              <span>+{xp} XP</span>
            </div>
          )}

          <button
            autoFocus
            onClick={onClose}
            className="w-full bg-primary text-white font-semibold rounded-xl py-3
                       hover:bg-primary/90 active:scale-95 transition-all min-h-[44px]
                       focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Keep going!
          </button>
        </div>
      </div>
    </>
  );
}
