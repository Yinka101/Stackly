import { useState } from 'react';
import { api } from '@/lib/api';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const TOPICS = ['compound growth', 'diversification', 'risk and reward', 'index funds', 'PayPal fees', 'spotting scams'];

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
      setQuiz({
        question: 'What does compound growth mean?',
        options: ['Earning interest on interest', 'Buying shares', 'Paying fees', 'Opening a bank account'],
        correctIndex: 0,
        explanation: 'Compound growth means your earnings also earn more - like a snowball getting bigger as it rolls.',
      });
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
