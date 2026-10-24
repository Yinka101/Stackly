import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, AlertCircle } from 'lucide-react';
import { api, type Profile } from '@/utils/api';

interface Props { profile: Profile }

type Msg = { role: 'user' | 'assistant'; content: string };

const STARTERS: Record<string, string[]> = {
  sprouts: [
    'What is a bank?',
    'Why do people save money?',
    'What is PayPal?',
  ],
  builders: [
    'How does a stock market work?',
    'What is interest?',
    'How does PayPal keep money safe?',
  ],
  investors: [
    'What is the difference between stocks and bonds?',
    'How does compound interest work?',
    'Explain the PayPal checkout API',
  ],
};

export default function Coach({ profile }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput('');
    setError('');
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setBusy(true);
    try {
      const { reply } = await api.askCoach({
        profileId: profile.id,
        band: profile.band,
        message: content,
        history: next.slice(-6),
      });
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError((e as Error).message);
      setMessages(next.slice(0, -1)); // remove optimistic user message
    } finally {
      setBusy(false);
    }
  }

  const starters = STARTERS[profile.band] ?? STARTERS.builders;

  return (
    <div className="flex flex-col h-dvh pb-16">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Penny</div>
            <div className="text-xs text-slate-500">Your AI money coach</div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
        <p className="text-xs text-amber-700 text-center max-w-md mx-auto">
          Educational only. Penny never gives personal financial advice or recommends specific investments.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-md mx-auto w-full">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-5 pb-8">
            <div className="text-4xl">🤖</div>
            <p className="text-slate-500 text-sm text-center">
              Ask Penny anything about money, PayPal, or investing.
            </p>
            <div className="flex flex-col gap-2 w-full">
              {starters.map((q) => (
                <button
                  key={q}
                  onClick={() => { void send(q); }}
                  className="px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-sm text-blue-700 font-medium text-left transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white border border-slate-100 text-slate-800 shadow-sm rounded-bl-sm'
                  }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {busy && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-slate-300 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-xl p-3 mb-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-2 pt-2 bg-white border-t border-slate-100 max-w-md mx-auto w-full">
        <div className="flex gap-2 items-end">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { void send(); } }}
            placeholder="Ask Penny a question…"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 outline-none text-sm"
          />
          <button
            onClick={() => { void send(); }}
            disabled={!input.trim() || busy}
            className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white disabled:opacity-40 hover:bg-blue-700 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
