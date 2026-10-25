import { useRef } from 'react';
import { useFadeIn } from './useFadeIn';

const ITEMS = [
  {
    icon: '✅',
    title: 'You approve every payment',
    body: 'Any real PayPal transaction goes through your account. Your child learns by watching and helping — never by entering card details themselves.',
  },
  {
    icon: '🎭',
    title: 'Practice money, not real money',
    body: 'The portfolio runs on Practice Dollars. Your child can "lose" their whole portfolio and nothing actually happens — except they learn a lesson.',
  },
  {
    icon: '🔒',
    title: 'Minimal data collected',
    body: 'We ask for a nickname, age band and a fun avatar. No email address, no photo, no location. We never show one child\'s info to another.',
  },
  {
    icon: '🚫',
    title: 'The AI never gives advice',
    body: "The coach explains concepts and answers questions. It won't say \"buy this stock\" or \"move your money here.\" Every answer ends with a reminder it isn't real advice.",
  },
  {
    icon: '📵',
    title: 'No ads, no upsells',
    body: "We don't sell ad space or partner with brokers. There's nothing to upsell a kid into. Our only job is to teach.",
  },
  {
    icon: '📜',
    title: 'MIT-licensed open source',
    body: 'The full code is public on GitHub. If you want to check what we do with data or how the AI prompt is written, you can read it yourself.',
  },
];

export default function ForParentsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { ref, visible } = useFadeIn();

  return (
    <section
      id="for-parents"
      ref={(el) => {
        sectionRef.current = el;
        (ref).current = el;
      }}
      className="py-20 px-4 sm:px-6"
      aria-labelledby="parents-heading"
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
          <span className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] rounded-pill px-4 py-1 text-sm font-semibold mb-4">
            For parents
          </span>
          <h2
            id="parents-heading"
            className="font-display font-bold text-[var(--color-ink)] mb-3"
            style={{ fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em' }}
          >
            Designed for your peace of mind
          </h2>
          <p className="text-[var(--color-ink-muted)] max-w-lg mx-auto">
            We built Stackly to give kids a safe place to make financial mistakes. Here's every safety decision we made — and why.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ITEMS.map((item, i) => (
            <div
              key={item.title}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(24px)',
                transition: `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`,
              }}
              className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-5 shadow-sm"
            >
              <div className="text-2xl mb-3" aria-hidden="true">{item.icon}</div>
              <h3 className="font-display font-semibold text-[var(--color-ink)] mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
