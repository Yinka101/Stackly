import { useState, useRef, useEffect, useId } from 'react';
import { useSession } from '@/lib/session';
import { useSearchParams } from 'react-router-dom';
import Seedling from '@/assets/Seedling';
import { useCoach } from './useCoach';
import QuizCard from './QuizCard';
import PortfolioReview from './PortfolioReview';
import AgentCoach from './AgentCoach';
import EmptyState from '@/components/ui/EmptyState';

type Tab = 'chat' | 'agent' | 'quiz' | 'review';

const STARTERS: Record<string, string[]> = {
  sprouts: [
    'What is a stock?',
    'Why do people save money?',
    'What is PayPal?',
    'How does a bank work?',
  ],
  builders: [
    'Explain compound growth',
    'What is diversification?',
    'How does PayPal make money?',
    'What is risk in investing?',
  ],
  investors: [
    'Compare index funds vs picking stocks',
    'Explain the difference between risk and volatility',
    'What are the main fees to watch for?',
    'How does fear affect investing decisions?',
  ],
};

const TAB_META: { id: Tab; label: string; short: string }[] = [
  { id: 'chat',   label: '💬 Chat',    short: 'Chat'   },
  { id: 'agent',  label: '✨ Agent',   short: 'Agent'  },
  { id: 'quiz',   label: '🎯 Quiz',    short: 'Quiz'   },
  { id: 'review', label: '📊 Review',  short: 'Review' },
];

export default function CoachPage() {
  const { user } = useSession();
  const { messages, loading, error, sendMessage } = useCoach();
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  // Honour ?tab= from URL (e.g. from LearnerHome agent shortcut)
  const initialTab = (searchParams.get('tab') as Tab | null) ?? 'chat';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const inputId    = useId();
  const band       = (user?.band ?? 'builders') as keyof typeof STARTERS;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    void sendMessage(input.trim());
    setInput('');
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100dvh-4rem)] md:max-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0 border-b border-ink/6">
        <div className="flex items-center gap-3 mb-4">
          <Seedling mood="happy" size={40} aria-hidden="true" />
          <div>
            <h1 className="font-display font-bold text-xl text-ink">Coach Penny</h1>
            <p className="text-xs text-ink/50">Ask me anything about money · Practice only</p>
          </div>
        </div>

        {/* Tab bar */}
        <div role="tablist" aria-label="Coach sections"
             className="flex bg-ink/6 rounded-xl p-1 gap-1">
          {TAB_META.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`coach-tab-${t.id}`}
              aria-selected={activeTab === t.id}
              aria-controls={`coach-panel-${t.id}`}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all
                min-h-[40px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset
                ${activeTab === t.id
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink/50 hover:text-ink'}`}
            >
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.short}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      {activeTab === 'chat' && (
        <div id="coach-panel-chat" role="tabpanel" aria-labelledby="coach-tab-chat"
             className="flex flex-col flex-1 min-h-0">

          {/* Messages — aria-live so screen readers announce new responses */}
          <div
            className="flex-1 overflow-y-auto px-4 py-2 space-y-3"
            aria-live="polite"
            aria-label="Conversation with Penny"
          >
            {messages.length === 0 && !loading && (
              <EmptyState
                emoji="💬"
                title="Say hi to Penny!"
                body="Ask any money or investing question below."
              />
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {msg.role === 'assistant' && (
                  <div aria-hidden="true"
                       className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10
                                  flex items-center justify-center">
                    <Seedling mood="thinking" size={20} />
                  </div>
                )}
                <div
                  role={msg.role === 'assistant' ? 'status' : undefined}
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed text-pretty ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-sm'
                      : 'bg-surface border border-ink/8 text-ink rounded-tl-sm'
                  }`}
                >
                  {msg.content || (msg.streaming ? (
                    <span aria-label="Penny is thinking" className="flex gap-1 items-center h-5">
                      <span aria-hidden className="w-1.5 h-1.5 bg-ink/30 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span aria-hidden className="w-1.5 h-1.5 bg-ink/30 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span aria-hidden className="w-1.5 h-1.5 bg-ink/30 rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                  ) : null)}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Starter chips */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex gap-2 flex-wrap" aria-label="Suggested questions">
              {(STARTERS[band] ?? STARTERS.builders).map((q) => (
                <button
                  key={q}
                  onClick={() => { void sendMessage(q); }}
                  className="px-3 py-2 bg-primary/8 text-primary rounded-full text-xs font-semibold
                             hover:bg-primary/15 active:scale-95 transition-all min-h-[36px]
                             focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {error && (
            <p role="alert" className="px-4 pb-1 text-xs text-red-600">{error}</p>
          )}

          {/* Input */}
          <div className="px-4 pb-4 pt-2 flex-shrink-0 flex gap-2 items-end">
            <label htmlFor={inputId} className="sr-only">
              Message Penny
            </label>
            <textarea
              id={inputId}
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Ask Penny anything…"
              disabled={loading}
              aria-describedby={error ? 'coach-error' : undefined}
              className="flex-1 resize-none rounded-2xl border-2 border-ink/10 bg-surface px-4 py-3
                         text-sm text-ink placeholder:text-ink/30 focus:outline-none
                         focus:border-primary focus-visible:ring-2 focus-visible:ring-primary
                         disabled:opacity-50 min-h-[48px] max-h-[120px] transition-colors"
              style={{ fieldSizing: 'content' }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center
                         hover:bg-primary/90 active:scale-95 transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0
                         focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'agent' && (
        <div id="coach-panel-agent" role="tabpanel" aria-labelledby="coach-tab-agent"
             className="flex-1 overflow-y-auto">
          <AgentCoach />
        </div>
      )}

      {activeTab === 'quiz' && (
        <div id="coach-panel-quiz" role="tabpanel" aria-labelledby="coach-tab-quiz"
             className="flex-1 overflow-y-auto px-4 py-3">
          <QuizCard />
        </div>
      )}

      {activeTab === 'review' && (
        <div id="coach-panel-review" role="tabpanel" aria-labelledby="coach-tab-review"
             className="flex-1 overflow-y-auto px-4 py-3">
          <PortfolioReview />
        </div>
      )}
    </div>
  );
}
