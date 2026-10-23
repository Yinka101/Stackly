import { useFadeIn } from './useFadeIn';
import { useRef } from 'react';

const PILLARS = [
  {
    icon: '🎓',
    title: 'Real lessons',
    color: 'var(--color-primary-light)',
    textColor: 'var(--color-primary-dark)',
    points: [
      'What is PayPal and how does it make money?',
      'What is a stock, and why do prices move?',
      'How does compound growth turn $5 into $38?',
      'Quizzes that match your reading level',
    ],
  },
  {
    icon: '📈',
    title: 'Paper trading',
    color: 'var(--color-accent-light)',
    textColor: '#92400e',
    points: [
      'Start with 1,000 Practice Dollars',
      'Buy and sell real tickers — fake money',
      'See your portfolio grow (or shrink)',
      'Every screen is labelled "educational only"',
    ],
  },
  {
    icon: '🤖',
    title: 'AI coach',
    color: '#e0e7ff',
    textColor: '#3730a3',
    points: [
      'Ask anything about money in plain English',
      'Answers adapt to your age and level',
      'Never tells you to buy or sell anything',
      'Always reminds you it\'s not real advice',
    ],
  },
];

export default function PillarsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { ref, visible } = useFadeIn();

  return (
    <section
      ref={(el) => {
        sectionRef.current = el;
        (ref as React.MutableRefObject<HTMLElement | null>).current = el;
      }}
      className="py-20 px-4 sm:px-6"
      aria-labelledby="pillars-heading"
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
            id="pillars-heading"
            className="font-display font-bold text-[var(--color-ink)] mb-3"
            style={{ fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em' }}
          >
            Everything in one place
          </h2>
          <p className="text-[var(--color-ink-muted)] max-w-md mx-auto">
            Most money apps teach you to track. Stackly teaches you to understand.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {PILLARS.map((pillar, i) => (
            <div
              key={pillar.title}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(28px)',
                transition: `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s`,
              }}
              className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6 shadow-sm"
            >
              <div
                className="w-12 h-12 rounded-[var(--radius-xl)] flex items-center justify-center text-2xl mb-4"
                style={{ backgroundColor: pillar.color }}
                aria-hidden="true"
              >
                {pillar.icon}
              </div>
              <h3
                className="font-display font-bold text-lg mb-3"
                style={{ color: 'var(--color-ink)' }}
              >
                {pillar.title}
              </h3>
              <ul className="space-y-2">
                {pillar.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-sm text-[var(--color-ink-muted)]">
                    <span
                      className="mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white"
                      style={{ backgroundColor: pillar.textColor }}
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
