import { useRef, useState } from 'react';
import { useFadeIn } from './useFadeIn';
import { useTheme } from '@/lib/theme';
import type { AgeBand } from '@/lib/theme';

const BANDS: {
  id: AgeBand;
  label: string;
  ages: string;
  tagline: string;
  emoji: string;
  topics: string[];
  bg: string;
  border: string;
}[] = [
  {
    id: 'sprouts',
    label: 'Sprouts',
    ages: 'Ages 7–10',
    tagline: 'Big ideas, small words.',
    emoji: '🌱',
    topics: ['What is money?', 'How does PayPal work?', 'Saving vs. spending', 'Your first Practice Dollars'],
    bg: '#f0fdf4',
    border: '#86efac',
  },
  {
    id: 'builders',
    label: 'Builders',
    ages: 'Ages 11–14',
    tagline: 'Start building your money brain.',
    emoji: '🏗️',
    topics: ['How investing works', 'Reading a stock chart', 'Sending a PayPal payment', 'Compound growth explained'],
    bg: '#fffbeb',
    border: '#fcd34d',
  },
  {
    id: 'investors',
    label: 'Investors',
    ages: 'Ages 15–24',
    tagline: 'Think like a grown-up investor.',
    emoji: '🚀',
    topics: ['Risk vs. return', 'Index funds vs. picking stocks', 'PayPal\'s API under the hood', 'Building a paper portfolio'],
    bg: '#eff6ff',
    border: '#93c5fd',
  },
];

export default function PickLevelSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { ref, visible } = useFadeIn();
  const { theme, setTheme } = useTheme();
  const [hovered, setHovered] = useState<AgeBand | null>(null);

  const activeBand = hovered ?? theme;

  return (
    <section
      id="pick-level"
      ref={(el) => {
        sectionRef.current = el;
        (ref as React.MutableRefObject<HTMLElement | null>).current = el;
      }}
      className="py-20 px-4 sm:px-6 bg-[var(--color-surface-raised)]"
      aria-labelledby="level-heading"
    >
      <div className="max-w-5xl mx-auto">
        <div
          className="text-center mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          <h2
            id="level-heading"
            className="font-display font-bold text-[var(--color-ink)] mb-3"
            style={{ fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em' }}
          >
            Pick your level
          </h2>
          <p className="text-[var(--color-ink-muted)] max-w-md mx-auto">
            Hover or tap a card to see how Stackly changes just for you.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {BANDS.map((band, i) => {
            const isActive = activeBand === band.id;
            return (
              <button
                key={band.id}
                onMouseEnter={() => setHovered(band.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(band.id)}
                onBlur={() => setHovered(null)}
                onClick={() => setTheme(band.id)}
                aria-pressed={theme === band.id}
                aria-label={`Choose ${band.label} level, ${band.ages}`}
                className="text-left rounded-[var(--radius-2xl)] border-2 p-6 cursor-pointer transition-all duration-200 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2"
                style={{
                  backgroundColor: isActive ? band.bg : 'var(--color-surface)',
                  borderColor: isActive ? band.border : 'var(--color-border)',
                  transform: isActive ? 'translateY(-4px)' : 'none',
                  boxShadow: isActive ? `0 8px 24px -4px ${band.border}` : '0 1px 3px rgba(0,0,0,0.05)',
                  opacity: visible ? 1 : 0,
                  transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background-color 0.25s ease`,
                }}
              >
                <div className="text-3xl mb-3" aria-hidden="true">{band.emoji}</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="font-display font-bold text-lg text-[var(--color-ink)]">{band.label}</h3>
                  <span className="text-xs text-[var(--color-ink-muted)] font-medium">{band.ages}</span>
                </div>
                <p className="text-sm text-[var(--color-ink-muted)] mb-4">{band.tagline}</p>
                <ul className="space-y-1.5">
                  {band.topics.map((t) => (
                    <li key={t} className="text-xs text-[var(--color-ink-muted)] flex gap-2 items-start">
                      <span className="text-[var(--color-primary)] font-bold mt-0.5" aria-hidden="true">→</span>
                      {t}
                    </li>
                  ))}
                </ul>
                {theme === band.id && (
                  <div className="mt-4 text-xs font-semibold text-[var(--color-primary)]">
                    ✓ Your current level
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
