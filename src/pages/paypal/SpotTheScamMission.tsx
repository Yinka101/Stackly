/**
 * SpotTheScamMission - Mission 4: 6 client-side scam identification exercises.
 */
import { useState } from 'react';
import { scamExamples } from './missionData';
import type { AgeBand } from '@/lib/session';

interface Props {
  band: AgeBand;
  onComplete: () => void;
  onBack: () => void;
}

type Answer = 'scam' | 'safe' | null;

export function SpotTheScamMission({ band, onComplete, onBack }: Props) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState<Answer>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [showFlags, setShowFlags] = useState(false);

  const example = scamExamples[idx];
  const isCorrect = answer !== null && (
    (answer === 'scam' && example.isScam) ||
    (answer === 'safe' && !example.isScam)
  );
  const revealed = answer !== null;

  const handleAnswer = (a: Answer) => {
    if (revealed) return;
    setAnswer(a);
    if (
      (a === 'scam' && example.isScam) ||
      (a === 'safe' && !example.isScam)
    ) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (idx === scamExamples.length - 1) {
      setDone(true);
    } else {
      setIdx(i => i + 1);
      setAnswer(null);
      setShowFlags(false);
    }
  };

  if (done) {
    const perfect = score === scamExamples.length;
    return (
      <div className="flex flex-col gap-4 max-w-lg mx-auto text-center">
        <span className="text-5xl">{perfect ? '🏆' : score >= 4 ? '⭐' : '🌱'}</span>
        <h2 className="font-bold text-2xl text-[var(--ink)]">
          {perfect ? 'Perfect score!' : score >= 4 ? 'Nice work!' : 'Good effort!'}
        </h2>
        <p className="text-[var(--ink-muted)]">
          You spotted <strong>{score} out of {scamExamples.length}</strong> correctly.
        </p>
        {score < scamExamples.length && (
          <p className="text-sm text-[var(--ink-muted)]">
            Review the red flags on any you missed - they&apos;re the same tricks scammers use in real life.
          </p>
        )}
        <button
          onClick={onComplete}
          className="py-3 rounded-xl font-bold mt-2"
          style={{ backgroundColor: '#2d7a4f', color: '#ffffff' }}
        >
          Finish mission →
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">← Back</button>
        <div className="flex-1 h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.round(((idx) / scamExamples.length) * 100)}%`, backgroundColor: '#2d7a4f' }}
          />
        </div>
        <span className="text-xs text-[var(--ink-muted)]">{idx + 1}/{scamExamples.length}</span>
      </div>

      <div className="card flex flex-col gap-4 animate-fade-in">
        <div className="flex items-start gap-3">
          <span className="text-3xl">🔍</span>
          <h2 className="font-bold text-lg text-[var(--ink)]">Is this a scam?</h2>
        </div>

        {/* Scenario */}
        <div className="bg-[var(--surface-2)] rounded-xl px-4 py-3 text-sm text-[var(--ink)] leading-relaxed">
          {example.scenario[band]}
        </div>

        {/* Answer buttons */}
        <div className="grid grid-cols-2 gap-3">
          {(['scam', 'safe'] as const).map(opt => {
            const selected = answer === opt;
            const correct = opt === 'scam' ? example.isScam : !example.isScam;
            let cls = 'py-4 rounded-xl font-bold border-2 transition-all ';
            if (!revealed) {
              cls += opt === 'scam'
                ? 'border-red-300 text-red-700 hover:bg-red-50'
                : 'border-green-400 text-green-700 hover:bg-green-50';
            } else if (selected && correct) {
              cls += 'border-green-500 bg-green-100 text-green-800';
            } else if (selected && !correct) {
              cls += 'border-red-500 bg-red-100 text-red-800';
            } else if (!selected && correct) {
              cls += 'border-green-500 bg-green-50 text-green-800';
            } else {
              cls += 'border-[var(--surface-2)] text-[var(--ink-muted)] opacity-50';
            }

            return (
              <button key={opt} className={cls} onClick={() => handleAnswer(opt)} disabled={revealed}>
                {opt === 'scam' ? '🚨 It\'s a scam' : '✅ Looks safe'}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {revealed && (
          <div className={`rounded-xl px-4 py-3 flex flex-col gap-2 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className="font-semibold text-sm">
              {isCorrect ? '✅ Correct!' : `❌ ${example.isScam ? 'This was a scam.' : 'This one was safe.'}`}
            </p>
            <p className="text-sm text-[var(--ink-muted)]">{example.safeAction[band]}</p>

            <button
              onClick={() => setShowFlags(f => !f)}
              className="text-xs text-[var(--primary)] font-medium text-left"
            >
              {showFlags ? 'Hide red flags' : '🚩 See the red flags'}
            </button>

            {showFlags && (
              <ul className="flex flex-col gap-1 mt-1">
                {example.redFlags.map((f, i) => (
                  <li key={i} className="text-xs text-[var(--ink-muted)] flex gap-2">
                    <span className="text-red-500">•</span> {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {revealed && (
        <button
          onClick={handleNext}
          className="py-3 rounded-xl font-bold"
          style={{ backgroundColor: '#2d7a4f', color: '#ffffff' }}
        >
          {idx === scamExamples.length - 1 ? 'See results →' : 'Next →'}
        </button>
      )}

      <p className="text-xs text-center text-[var(--ink-muted)]">Practice money only - not financial advice</p>
    </div>
  );
}
