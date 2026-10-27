import { useRef } from 'react';
import { useFadeIn } from './useFadeIn';

const STEPS = [
  {
    num: '01',
    emoji: '📖',
    title: 'Learn',
    body: 'Short lessons teach you how money moves - what PayPal is, what investing means, and why starting early matters. Written for your age, not your parents\'.',
  },
  {
    num: '02',
    emoji: '💸',
    title: 'Practice',
    body: 'Use Practice Dollars to send a fake PayPal payment or buy shares in a paper portfolio. You can\'t lose real money. Make mistakes on purpose - that\'s how it works.',
  },
  {
    num: '03',
    emoji: '🤝',
    title: 'Do it for real - with a parent',
    body: 'Ready to try a real PayPal payment? A parent approves it from their account. You learn; they stay in control. No card details, no surprises.',
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { ref, visible } = useFadeIn();

  return (
    <section
      id="how-it-works"
      ref={(el) => {
        sectionRef.current = el;
        (ref).current = el;
      }}
      className="py-20 px-4 sm:px-6 bg-[var(--color-surface-raised)]"
      aria-labelledby="hiw-heading"
    >
      <div className="max-w-5xl mx-auto">
        <div
          className="text-center mb-14"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          <h2
            id="hiw-heading"
            className="font-display font-bold text-[var(--color-ink)] mb-3"
            style={{ fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em' }}
          >
            Three steps. That's it.
          </h2>
          <p className="text-[var(--color-ink-muted)] max-w-md mx-auto">
            No app to download. No account to verify. Pick your level and start in 30 seconds.
          </p>
        </div>

        <ol className="grid sm:grid-cols-3 gap-6 list-none p-0">
          {STEPS.map((step, i) => (
            <li
              key={step.num}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(28px)',
                transition: `opacity 0.5s ease ${i * 0.1 + 0.1}s, transform 0.5s ease ${i * 0.1 + 0.1}s`,
              }}
              className="relative bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6 shadow-sm"
            >
              {/* Step number badge */}
              <div className="absolute -top-3 left-5 bg-[var(--color-primary)] text-white text-xs font-bold px-3 py-1 rounded-pill">
                {step.num}
              </div>

              <div
                className="text-4xl mb-4 mt-2"
                role="img"
                aria-label={step.title}
              >
                {step.emoji}
              </div>

              <h3 className="font-display font-bold text-[var(--color-ink)] mb-2 text-lg">
                {step.title}
              </h3>
              <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
