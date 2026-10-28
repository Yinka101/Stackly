/**
 * GuidedSimMission - shared component for Missions 1 and 2.
 * Steps through a SimStep array with a Stepper, coach tips, and interaction widgets.
 */
import { useState, useEffect, useRef } from 'react';
import type { SimStep } from './missionData';
import type { AgeBand } from '@/lib/session';

interface Props {
  steps: SimStep[];
  band: AgeBand;
  onComplete: () => void;
  onBack: () => void;
}

export function GuidedSimMission({ steps, band, onComplete, onBack }: Props) {
  const [idx, setIdx] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [chosenIdx, setChosenIdx] = useState<number | null>(null);
  const [showTip, setShowTip] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const step = steps[idx];
  const isLast = idx === steps.length - 1;
  const progress = Math.round(((idx + 1) / steps.length) * 100);

  // Reset per-step state
  useEffect(() => {
    setInputVal('');
    setChosenIdx(null);
    setShowTip(false);
    if (step.interaction === 'type') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [idx, step.interaction]);

  const canAdvance = () => {
    if (step.interaction === 'tap') return true;
    if (step.interaction === 'type') return inputVal.trim().length > 0;
    if (step.interaction === 'choose') return chosenIdx !== null;
    return true;
  };

  const handleNext = () => {
    if (!canAdvance()) return;
    if (isLast) { onComplete(); return; }
    setIdx(i => i + 1);
  };

  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto px-4 py-4 pb-8">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]" aria-label="Back">
          ← Back
        </button>
        <div className="flex-1 h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-[var(--ink-muted)] tabular-nums">{idx + 1}/{steps.length}</span>
      </div>

      {/* Step card */}
      <div className="card flex flex-col gap-4 animate-fade-in">
        {/* Visual + title */}
        <div className="flex items-center gap-3">
          <span className="text-4xl" role="img" aria-hidden="true">{step.visual}</span>
          <h2 className="text-xl font-bold text-[var(--ink)]">{step.title[band]}</h2>
        </div>

        {/* Body */}
        <p className="text-[var(--ink-muted)] leading-relaxed">{step.body[band]}</p>

        {/* Interaction widget */}
        {step.interaction === 'type' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--ink-muted)]">{step.inputLabel}</label>
            <input
              ref={inputRef}
              className="input"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Type here…"
              aria-label={step.inputLabel}
            />
          </div>
        )}

        {step.interaction === 'choose' && step.choices && (
          <div className="flex flex-col gap-2">
            {step.choices.map((c, i) => (
              <button
                key={i}
                onClick={() => setChosenIdx(i)}
                className={`px-4 py-3 rounded-xl border-2 text-left transition-all ${
                  chosenIdx === i
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--ink)]'
                    : 'border-[var(--surface-2)] text-[var(--ink-muted)] hover:border-[var(--primary)]/40'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Coach tip toggle */}
        <button
          onClick={() => setShowTip(t => !t)}
          className="flex items-center gap-2 text-sm text-[var(--primary)] font-medium"
          aria-expanded={showTip}
        >
          <span>🌱</span>
          {showTip ? 'Hide tip' : 'Coach tip'}
        </button>

        {showTip && (
          <div className="bg-[var(--primary)]/8 border border-[var(--primary)]/20 rounded-xl px-4 py-3 text-sm text-[var(--ink)]">
            {step.coachTip[band]}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {idx > 0 && (
          <button
            onClick={() => setIdx(i => i - 1)}
            className="flex-1 py-3 rounded-xl border-2 border-[var(--surface-2)] text-[var(--ink-muted)] font-semibold"
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canAdvance()}
          className="flex-1 py-3 rounded-xl bg-[var(--primary)] text-white font-bold disabled:opacity-40 transition-opacity"
        >
          {isLast ? '🎉 Complete' : step.interaction === 'tap' ? 'Tap to continue →' : 'Next →'}
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-center text-[var(--ink-muted)]">
        Practice money only - not financial advice
      </p>
    </div>
  );
}
