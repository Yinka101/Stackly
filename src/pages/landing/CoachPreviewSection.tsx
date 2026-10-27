import { useEffect, useRef, useState } from 'react';
import Seedling from '@/assets/Seedling';

const MESSAGES: { role: 'coach' | 'kid'; text: string }[] = [
  { role: 'kid', text: 'What is compound growth?' },
  {
    role: 'coach',
    text: "Great question! Compound growth means your money earns returns - and then those returns earn returns too. It's like a snowball rolling downhill: the longer it rolls, the bigger it gets.",
  },
  { role: 'kid', text: 'Can you show me an example?' },
  {
    role: 'coach',
    text: "Sure! Say you plant $5 today. At 7% a year, after 10 years it becomes about $9.84. After 20 years it's $19.35 - almost 4× your original $5. The longer you wait, the harder your money works. This is an example to help you understand - not a prediction of real returns.",
  },
  { role: 'kid', text: 'So I should invest now?' },
  {
    role: 'coach',
    text: "Learning now is the first step - and that's exactly what you're doing! Stackly uses practice money, so you can explore without any real risk. When you're ready to use real money, make sure a parent or guardian is involved.",
  },
];

// How fast each character types (ms)
const CHAR_DELAY = 18;
// Pause between messages (ms)
const MSG_PAUSE = 600;

export default function CoachPreviewSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [started, setStarted] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<{ role: 'coach' | 'kid'; text: string }[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Start typewriter when section enters view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisibleMessages(MESSAGES);
      setStarted(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Typewriter logic
  useEffect(() => {
    if (!started || currentIdx >= MESSAGES.length) return;

    const msg = MESSAGES[currentIdx];
    let charIdx = 0;
    let timeout: ReturnType<typeof setTimeout>;

    // For kid messages, reveal instantly; for coach messages, type out
    if (msg.role === 'kid') {
      timeout = setTimeout(() => {
        setVisibleMessages((prev) => [...prev, msg]);
        setCurrentText('');
        setCurrentIdx((i) => i + 1);
      }, MSG_PAUSE);
    } else {
      const typeNext = () => {
        charIdx++;
        setCurrentText(msg.text.slice(0, charIdx));
        if (charIdx < msg.text.length) {
          timeout = setTimeout(typeNext, CHAR_DELAY);
        } else {
          timeout = setTimeout(() => {
            setVisibleMessages((prev) => [...prev, msg]);
            setCurrentText('');
            setCurrentIdx((i) => i + 1);
          }, MSG_PAUSE);
        }
      };
      timeout = setTimeout(typeNext, MSG_PAUSE);
    }
    return () => clearTimeout(timeout);
  }, [started, currentIdx]);

  // Scroll to bottom as messages appear
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [visibleMessages, currentText]);

  const isCoachTyping = started && currentIdx < MESSAGES.length && MESSAGES[currentIdx].role === 'coach';

  return (
    <section
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 bg-[var(--color-surface-raised)]"
      aria-labelledby="coach-heading"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block bg-indigo-100 text-indigo-700 rounded-pill px-4 py-1 text-sm font-semibold mb-4">
            Meet your AI coach
          </span>
          <h2
            id="coach-heading"
            className="font-display font-bold text-[var(--color-ink)] mb-3"
            style={{ fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em' }}
          >
            Ask anything. Get a real answer.
          </h2>
          <p className="text-[var(--color-ink-muted)] max-w-md mx-auto">
            Penny explains money concepts in plain language - matched to your age and learning level.
          </p>
        </div>

        {/* Chat window */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
            <Seedling mood={isCoachTyping ? 'thinking' : 'happy'} size={36} />
            <div>
              <div className="font-semibold text-[var(--color-ink)]">Penny</div>
              <div className="text-xs text-[var(--color-ink-muted)]">Your Stackly coach · Not financial advice</div>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-green-400" aria-hidden="true" />
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            className="flex flex-col gap-4 p-5 h-72 overflow-y-auto"
            aria-live="polite"
            aria-label="Chat conversation with Penny the AI coach"
          >
            {visibleMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'kid' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'coach' && (
                  <Seedling mood="happy" size={28} className="shrink-0 mt-1" />
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-[var(--radius-xl)] text-sm leading-relaxed ${
                    msg.role === 'kid'
                      ? 'bg-[var(--color-primary)] text-white rounded-br-sm'
                      : 'bg-[var(--color-surface-raised)] text-[var(--color-ink)] rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* In-progress coach message */}
            {currentText && (
              <div className="flex gap-3 justify-start">
                <Seedling mood="thinking" size={28} className="shrink-0 mt-1" />
                <div className="max-w-[80%] px-4 py-3 rounded-[var(--radius-xl)] rounded-bl-sm bg-[var(--color-surface-raised)] text-[var(--color-ink)] text-sm leading-relaxed">
                  {currentText}
                  <span className="inline-block w-0.5 h-4 bg-[var(--color-primary)] ml-0.5 animate-pulse" aria-hidden="true" />
                </div>
              </div>
            )}

            {/* Typing indicator before first coach char */}
            {isCoachTyping && !currentText && (
              <div className="flex gap-3 justify-start">
                <Seedling mood="thinking" size={28} className="shrink-0 mt-1" />
                <div className="px-4 py-3 rounded-[var(--radius-xl)] rounded-bl-sm bg-[var(--color-surface-raised)]">
                  <span className="flex gap-1" aria-label="Penny is typing">
                    {[0, 1, 2].map((j) => (
                      <span
                        key={j}
                        className="w-1.5 h-1.5 rounded-full bg-[var(--color-ink-muted)]"
                        style={{ animation: `bounce 1.2s ease ${j * 0.2}s infinite` }}
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Disabled input - this is a preview */}
          <div className="border-t border-[var(--color-border)] px-4 py-3 flex gap-2 items-center">
            <input
              type="text"
              placeholder="Sign up to ask Penny anything…"
              disabled
              aria-label="Chat input - sign up to use"
              className="flex-1 px-4 py-2.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm text-[var(--color-ink-muted)] cursor-not-allowed outline-none"
            />
            <button
              disabled
              aria-label="Send message"
              className="w-10 h-10 rounded-[var(--radius-xl)] bg-[var(--color-primary)] text-white flex items-center justify-center opacity-50 cursor-not-allowed"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
