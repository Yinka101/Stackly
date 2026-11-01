import { useState } from 'react';
import { api } from '@/lib/api';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const TOPICS = ['compound growth', 'diversification', 'risk and reward', 'index funds', 'PayPal fees', 'spotting scams'];

const FALLBACK_QUESTIONS: Record<string, QuizQuestion> = {
  'compound growth': {
    question: 'What does compound growth mean?',
    options: ['Earning interest on your interest', 'Buying shares in a company', 'Paying monthly fees', 'Opening a savings account'],
    correctIndex: 0,
    explanation: 'Compound growth means your earnings also earn more over time - like a snowball that gets bigger as it rolls downhill.',
  },
  'diversification': {
    question: 'Why do investors spread money across different assets?',
    options: ['To reduce risk if one investment falls', 'To earn more fees', 'To avoid paying taxes', 'To buy more of one stock'],
    correctIndex: 0,
    explanation: 'Diversification reduces risk. If one investment drops, others may hold steady or rise, protecting your overall portfolio.',
  },
  'risk and reward': {
    question: 'What is the general relationship between risk and reward in investing?',
    options: ['Higher risk usually offers higher potential reward', 'Lower risk always gives higher reward', 'Risk and reward are unrelated', 'Only large companies have risk'],
    correctIndex: 0,
    explanation: 'Higher-risk investments can offer bigger returns, but also bigger losses. Lower-risk options are more stable but grow more slowly.',
  },
  'index funds': {
    question: 'What does an index fund track?',
    options: ['A group of stocks representing a market or sector', 'A single company\'s shares', 'Government bonds only', 'Real estate prices'],
    correctIndex: 0,
    explanation: 'An index fund tracks a collection of stocks (like the S&P 500) giving you broad market exposure without picking individual stocks.',
  },
  'PayPal fees': {
    question: 'When does PayPal typically charge a fee to the seller?',
    options: ['When receiving a payment for goods or services', 'When sending money to a friend', 'When checking your balance', 'When logging in'],
    correctIndex: 0,
    explanation: 'PayPal charges sellers a small percentage (usually around 2-3%) when they receive payments for goods or services.',
  },
  'spotting scams': {
    question: 'Which of these is a common sign of an online scam?',
    options: ['Urgency - "Act now or lose your money!"', 'A company asking you to verify your identity', 'A website with a padlock in the address bar', 'An email confirming your purchase'],
    correctIndex: 0,
    explanation: 'Scammers create urgency to stop you thinking clearly. Legitimate businesses never pressure you to act immediately or risk losing money.',
  },
};

export default function QuizCard() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setQuiz(null);
    setSelected(null);
    try {
      const data = await api.post<QuizQuestion>('/ai/quiz', { topic });
      setQuiz(data);
    } catch {
      setQuiz(FALLBACK_QUESTIONS[topic] ?? FALLBACK_QUESTIONS['compound growth']);
    } finally {
      setLoading(false);
    }
  };

  const correct = selected !== null && selected === quiz?.correctIndex;
  const wrong   = selected !== null && selected !== quiz?.correctIndex;

  return (
    <div className="bg-surface rounded-2xl p-5 border border-ink/8 space-y-4">
      <h3 className="font-display font-bold text-ink text-lg">Quiz me!</h3>

      <div className="flex gap-2 flex-wrap">
        {TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              topic === t
                ? 'bg-primary text-white'
                : 'bg-ink/8 text-ink/70 hover:bg-primary/10'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <button
        onClick={() => { void generate(); }}
        disabled={loading}
        className="w-full bg-primary text-white font-display font-semibold rounded-xl py-3
                   hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
      >
        {loading ? 'Generating…' : 'Get a question'}
      </button>

      {quiz && (
        <div className="space-y-3">
          <p className="font-semibold text-ink">{quiz.question}</p>
          <div className="space-y-2">
            {quiz.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect  = i === quiz.correctIndex;
              let cls = 'w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all min-h-[44px] ';
              if (selected === null) {
                cls += 'border-ink/10 bg-ink/4 hover:border-primary/40 hover:bg-primary/5';
              } else if (isCorrect) {
                cls += 'border-green-500 bg-green-50 text-green-800';
              } else if (isSelected) {
                cls += 'border-red-400 bg-red-50 text-red-700';
              } else {
                cls += 'border-ink/10 bg-ink/4 opacity-50';
              }
              return (
                <button
                  key={i}
                  onClick={() => selected === null && setSelected(i)}
                  disabled={selected !== null}
                  className={cls}
                >
                  {isCorrect && selected !== null ? '✓ ' : isSelected ? '✗ ' : ''}{opt}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className={`rounded-xl p-4 text-sm ${correct ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
              <p className="font-bold mb-1">{correct ? '🎉 That\'s right!' : '🤔 Not quite…'}</p>
              <p>{quiz.explanation}</p>
            </div>
          )}

          {selected !== null && (
            <button
              onClick={() => { void generate(); }}
              className="w-full border-2 border-primary text-primary font-semibold rounded-xl py-2.5
                         hover:bg-primary/5 active:scale-95 transition-all min-h-[44px] text-sm"
            >
              Try another question
            </button>
          )}
        </div>
      )}
    </div>
  );
}
