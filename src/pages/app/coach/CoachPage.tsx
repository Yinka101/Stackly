import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/lib/session';
import Seedling from '@/assets/Seedling';
import { useCoach } from './useCoach';
import QuizCard from './QuizCard';
import PortfolioReview from './PortfolioReview';

import AgentCoach from './AgentCoach';

type Tab = 'chat' | 'quiz' | 'review' | 'agent';

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

export default function CoachPage() {
  const { user } = useSession();
  const { messages, loading, error, sendMessage } = useCoach();
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const band = (user?.band ?? 'builders') as keyof typeof STARTERS;

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
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <Seedling mood="happy" size={40} />
          <div>
            <h1 className="font-display font-bold text-xl text-ink">Coach Penny</h1>
            <p className="text-xs text-ink/50">Ask me anything about money • Practice only</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-ink/6 rounded-xl p-1 gap-1">
          {(['chat', 'agent', 'quiz', 'review'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all min-h-[36px] ${
                activeTab === tab
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink/50 hover:text-ink'
              }`}
            >
              {tab === 'chat' ? '💬 Chat' : tab === 'agent' ? '✨ Agent' : tab === 'quiz' ? '🎯 Quiz' : '📊 Review'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'chat' && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Seedling mood="thinking" size={20} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-sm'
                      : 'bg-surface border border-ink/8 text-ink rounded-tl-sm'
                  }`}
                >
                  {msg.content || (msg.streaming ? (
                    <span className="flex gap-1 items-center h-5">
                      <span className="w-1.5 h-1.5 bg-ink/30 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-ink/30 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-ink/30 rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                  ) : null)}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Starter questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex gap-2 flex-wrap">
              {(STARTERS[band] ?? STARTERS.builders).map((q) => (
                <button
                  key={q}
                  onClick={() => { void sendMessage(q); }}
                  className="px-3 py-2 bg-primary/8 text-primary rounded-full text-xs font-semibold
                             hover:bg-primary/15 active:scale-95 transition-all min-h-[36px]"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {error && (
            <p className="px-4 pb-1 text-xs text-red-500">{error}</p>
          )}

          {/* Input */}
          <div className="px-4 pb-4 pt-2 flex-shrink-0 flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Ask Penny anything…"
              disabled={loading}
              className="flex-1 resize-none rounded-2xl border-2 border-ink/10 bg-surface px-4 py-3
                         text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-primary
                         disabled:opacity-50 min-h-[48px] max-h-[120px] transition-colors"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center
                         hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-40 flex-shrink-0"
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
        <div className="flex-1 overflow-y-auto">
          <AgentCoach />
        </div>
      )}

      {activeTab === 'quiz' && (
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <QuizCard />
        </div>
      )}

      {activeTab === 'review' && (
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <PortfolioReview />
        </div>
      )}
    </div>
  );
}
