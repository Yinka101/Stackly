import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useFadeIn } from './useFadeIn';
import Seedling from '@/assets/Seedling';

export default function CtaSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { ref, visible } = useFadeIn();

  return (
    <section
      ref={(el) => {
        sectionRef.current = el;
        (ref as React.MutableRefObject<HTMLElement | null>).current = el;
      }}
      className="py-24 px-4 sm:px-6 bg-[var(--color-surface-raised)]"
      aria-labelledby="cta-heading"
    >
      <div
        className="max-w-xl mx-auto text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(24px)',
          transition: 'opacity 0.55s ease, transform 0.55s ease',
        }}
      >
        <Seedling mood="celebrating" size={80} className="mx-auto mb-6" />
        <h2
          id="cta-heading"
          className="font-display font-bold text-[var(--color-ink)] mb-4"
          style={{ fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em' }}
        >
          The best time to start
          <br />
          learning is right now.
        </h2>
        <p className="text-[var(--color-ink-muted)] mb-8 max-w-sm mx-auto">
          No email. No credit card. Pick your level and start your first lesson in 30 seconds.
        </p>
        <Link
          to="/onboarding"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[var(--radius-2xl)] bg-[var(--color-primary)] text-white font-bold text-lg min-h-[56px] hover:bg-[var(--color-primary-dark)] transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2 shadow-lg shadow-[var(--color-primary)]/25"
        >
          Start free →
        </Link>
        <p className="text-xs text-[var(--color-ink-muted)] mt-4">
          Parent approval required for any real payments.
        </p>
      </div>
    </section>
  );
}
