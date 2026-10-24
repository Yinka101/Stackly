import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Seedling from '@/assets/Seedling';
import { clsx } from '@/lib/clsx';

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-[var(--color-surface)]/95 backdrop-blur-md shadow-sm border-b border-[var(--color-border)]'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" aria-label="Stackly home">
          <Seedling mood="happy" size={36} />
          <span className="font-display font-bold text-xl text-[var(--color-ink)] tracking-tight">Stackly</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-semibold text-[var(--color-ink-muted)]">
          <a href="#how-it-works" className="hover:text-[var(--color-primary)] transition-colors">How it works</a>
          <a href="#for-parents" className="hover:text-[var(--color-primary)] transition-colors">For parents</a>
          <a href="#faq" className="hover:text-[var(--color-primary)] transition-colors">FAQ</a>
        </nav>

        <Link
          to="/onboarding"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-[var(--radius-xl)] bg-[var(--color-primary)] text-white font-semibold text-sm min-h-[44px] hover:bg-[var(--color-primary-dark)] transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2"
        >
          Start free
        </Link>
      </div>
    </header>
  );
}
