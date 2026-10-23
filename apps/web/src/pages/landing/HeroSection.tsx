import { useEffect, useState } from 'react';
import Seedling from '@/assets/Seedling';
import GrowthSlider from './GrowthSlider';

export default function HeroSection() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Small delay so the animation feels intentional, not jarring
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="min-h-dvh flex flex-col justify-center pt-16 pb-12 px-4 sm:px-6"
      aria-labelledby="hero-headline"
    >
      <div className="max-w-5xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">

        {/* Left: copy */}
        <div
          style={{
            opacity: show ? 1 : 0,
            transform: show ? 'none' : 'translateY(24px)',
            transition: 'opacity 0.55s ease, transform 0.55s ease',
          }}
        >
          <div className="inline-flex items-center gap-2 bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] rounded-pill px-4 py-1.5 text-sm font-semibold mb-5">
            <Seedling mood="happy" size={22} />
            Free for students
          </div>

          <h1
            id="hero-headline"
            className="font-display font-bold text-[var(--text-3xl)] text-[var(--color-ink)] leading-tight mb-5"
            style={{ letterSpacing: '-0.02em' }}
          >
            Learn money
            <br />
            <span className="text-[var(--color-primary)]">by doing it.</span>
          </h1>

          <p className="text-[var(--text-lg)] text-[var(--color-ink-muted)] leading-relaxed mb-8 max-w-md">
            Practice PayPal and investing with practice money, real
            lessons, and an AI coach. No real money on the line — ever.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              id="start"
              href="/app"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-[var(--radius-2xl)] bg-[var(--color-primary)] text-white font-semibold text-lg min-h-[56px] hover:bg-[var(--color-primary-dark)] transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2 shadow-md shadow-[var(--color-primary)]/25"
            >
              Start free
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] text-[var(--color-ink)] font-semibold text-lg min-h-[56px] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2"
            >
              See how it works
            </a>
          </div>

          <p className="text-xs text-[var(--color-ink-muted)] mt-4">
            No sign-up email. No credit card. Parent approves everything.
          </p>
        </div>

        {/* Right: interactive visual */}
        <div
          style={{
            opacity: show ? 1 : 0,
            transform: show ? 'none' : 'translateY(32px)',
            transition: 'opacity 0.65s ease 0.15s, transform 0.65s ease 0.15s',
          }}
        >
          <GrowthSlider />
        </div>
      </div>
    </section>
  );
}
