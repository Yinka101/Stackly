import { useState, useRef } from 'react';
import { useFadeIn } from './useFadeIn';

const FAQS = [
  {
    q: 'Is this free?',
    a: 'Yes. Every lesson, the paper portfolio, and the AI coach are completely free. Parents can optionally top up Practice Dollars with a real PayPal payment — but that\'s a choice, not a requirement.',
  },
  {
    q: 'Does my child use real money?',
    a: 'No. The entire investing experience uses Practice Dollars. There are no real trades, no brokerage accounts, and no real money at risk. Every investing screen is labeled "educational only."',
  },
  {
    q: 'How does the PayPal part work?',
    a: 'Lessons explain what PayPal is and how payments work. When a child is ready to try a real transaction, a parent initiates and approves it from their own PayPal account. Kids never enter payment details.',
  },
  {
    q: 'What does the AI coach do — and not do?',
    a: 'Penny answers questions about money, investing, and financial concepts in plain language matched to your child\'s age. Penny will not recommend buying or selling specific investments, and every response includes a reminder that it is not financial advice.',
  },
  {
    q: 'What personal data do you collect from children?',
    a: 'We collect a nickname, an age band (not an exact age), and a chosen avatar. No email address, no photo, no real name, no location data. We do not share any child data with third parties or show it to other users.',
  },
  {
    q: 'Who built this and why?',
    a: 'Stackly was built during a hackathon by a developer who wanted to learn about money as a kid but had no tools that made sense. The full code is open source on GitHub under the MIT license.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const bodyId = `faq-${q.slice(0, 10).replace(/\s/g, '-')}`;

  return (
    <div className="border-b border-[var(--color-border)] last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="w-full text-left flex items-center justify-between gap-4 py-5 px-1 font-semibold text-[var(--color-ink)] hover:text-[var(--color-primary)] transition-colors min-h-[56px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2 rounded-sm"
      >
        <span>{q}</span>
        <span
          aria-hidden="true"
          className="shrink-0 text-xl font-light"
          style={{
            transform: open ? 'rotate(45deg)' : 'none',
            transition: 'transform 0.2s ease',
            color: 'var(--color-primary)',
          }}
        >
          +
        </span>
      </button>
      <div
        id={bodyId}
        role="region"
        aria-labelledby={bodyId}
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.25s ease',
        }}
      >
        <div className="overflow-hidden">
          <p className="pb-5 px-1 text-[var(--color-ink-muted)] text-sm leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FaqSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { ref, visible } = useFadeIn();

  return (
    <section
      id="faq"
      ref={(el) => {
        sectionRef.current = el;
        (ref as React.MutableRefObject<HTMLElement | null>).current = el;
      }}
      className="py-20 px-4 sm:px-6"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-2xl mx-auto">
        <div
          className="text-center mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          <h2
            id="faq-heading"
            className="font-display font-bold text-[var(--color-ink)] mb-3"
            style={{ fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em' }}
          >
            Common questions
          </h2>
        </div>

        <div
          className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] px-6 shadow-sm"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
          }}
        >
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
}
