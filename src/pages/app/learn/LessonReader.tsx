import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useSession } from '@/lib/session';
import CelebrationModal from './CelebrationModal';
import type { LessonDetail, CompleteResult, Badge } from './types';

type Phase = 'story' | 'try-it' | 'quiz' | 'done';

export default function LessonReader() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { refresh } = useSession();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('story');
  const [storyPage, setStoryPage] = useState(0);
  const [tryItAnswer, setTryItAnswer] = useState<number | null>(null);
  const [sliderVal, setSliderVal] = useState(0);
  const [tryItSubmitted, setTryItSubmitted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null, null]);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean[]>([false, false, false]);
  const [quizCorrect, setQuizCorrect] = useState<(boolean | null)[]>([null, null, null]);
  const [xpEarned, setXpEarned] = useState(0);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<LessonDetail>(`/lessons/${id}`)
      .then((l) => {
        setLesson(l);
        setSliderVal(l.tryIt.min ?? 0);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-lg mx-auto px-4 py-10 flex flex-col gap-4">
      {[0,1,2].map(i => <div key={i} className="h-6 rounded-lg bg-ink/5 animate-pulse" />)}
    </div>
  );
  if (!lesson) return <div className="p-8 text-center text-ink/60">Lesson not found.</div>;

  const storyParagraphs = lesson.story.split('\n\n').filter(Boolean);

  // ── Story phase ──
  if (phase === 'story') {
    const para = storyParagraphs[storyPage];
    const isLast = storyPage === storyParagraphs.length - 1;
    return (
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6 min-h-screen">
        <ProgressBar value={0} total={3} />
        <header className="flex items-center gap-3">
          <span className="text-4xl">{lesson.emoji}</span>
          <div>
            <p className="text-xs text-ink/50 uppercase tracking-wide font-semibold">Story</p>
            <h1 className="font-display text-xl font-bold text-ink">{lesson.title}</h1>
          </div>
        </header>
        <PageIndicator current={storyPage} total={storyParagraphs.length} />
        <div className="flex-1 bg-surface border border-ink/8 rounded-2xl p-6">
          <p className="text-ink leading-relaxed text-lg">{para}</p>
        </div>
        <div className="flex gap-3">
          {storyPage > 0 && (
            <button
              onClick={() => setStoryPage(p => p - 1)}
              className="flex-1 border-2 border-ink/20 text-ink font-semibold rounded-2xl py-4 hover:bg-ink/5 active:scale-95 transition-all min-h-[56px]"
            >← Back</button>
          )}
          <button
            onClick={() => isLast ? setPhase('try-it') : setStoryPage(p => p + 1)}
            className="flex-1 bg-primary text-white font-display font-bold text-lg rounded-2xl py-4 hover:bg-primary/90 active:scale-95 transition-all min-h-[56px]"
          >{isLast ? 'Try it →' : 'Next →'}</button>
        </div>
      </div>
    );
  }

  // ── Try-it phase ──
  if (phase === 'try-it') {
    const { tryIt } = lesson;
    const isSlider = tryIt.type === 'slider';
    let tryCorrect = false;
    if (isSlider) {
      tryCorrect = sliderVal >= (tryIt.correctMin ?? 0) && sliderVal <= (tryIt.correctMax ?? 999);
    } else {
      tryCorrect = tryItAnswer === tryIt.correct;
    }
    return (
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6 min-h-screen">
        <ProgressBar value={1} total={3} />
        <header className="flex items-center gap-3">
          <span className="text-4xl">🎯</span>
          <div>
            <p className="text-xs text-ink/50 uppercase tracking-wide font-semibold">Try it</p>
            <h1 className="font-display text-xl font-bold text-ink">{lesson.title}</h1>
          </div>
        </header>
        <div className="bg-surface border border-ink/8 rounded-2xl p-6 flex flex-col gap-4">
          <p className="font-semibold text-ink">{tryIt.prompt}</p>
          {isSlider ? (
            <div className="flex flex-col gap-2">
              <input
                type="range"
                min={tryIt.min} max={tryIt.max} step={tryIt.step}
                value={sliderVal}
                onChange={(e) => { setSliderVal(Number(e.target.value)); setTryItSubmitted(false); }}
                className="w-full accent-primary"
                disabled={tryItSubmitted}
              />
              <p className="text-center font-display text-2xl font-bold text-ink">{sliderVal}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {(tryIt.options ?? []).map((opt, i) => (
                <button
                  key={i}
                  onClick={() => { setTryItAnswer(i); setTryItSubmitted(false); }}
                  disabled={tryItSubmitted}
                  className={[
                    'text-left px-4 py-3 rounded-xl border-2 transition-all min-h-[44px]',
                    tryItAnswer === i && !tryItSubmitted ? 'border-primary bg-primary/10' : 'border-ink/15 bg-surface hover:border-ink/30',
                    tryItSubmitted && i === tryIt.correct ? 'border-primary bg-primary/15' : '',
                    tryItSubmitted && i === tryItAnswer && i !== tryIt.correct ? 'border-danger bg-danger/10' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {tryItSubmitted && (
            <div className={`rounded-xl p-4 text-sm font-medium ${tryCorrect ? 'bg-primary/10 text-primary-dark' : 'bg-danger/10 text-danger'}`}>
              {tryCorrect ? tryIt.feedbackRight : tryIt.feedbackWrong}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setPhase('story')}
            className="flex-1 border-2 border-ink/20 text-ink font-semibold rounded-2xl py-4 hover:bg-ink/5 active:scale-95 transition-all min-h-[56px]">
            ← Back
          </button>
          {!tryItSubmitted ? (
            <button
              onClick={() => setTryItSubmitted(true)}
              disabled={!isSlider && tryItAnswer === null}
              className="flex-1 bg-primary text-white font-display font-bold text-lg rounded-2xl py-4 hover:bg-primary/90 active:scale-95 transition-all min-h-[56px] disabled:opacity-40"
            >
              Check
            </button>
          ) : (
            <button
              onClick={() => setPhase('quiz')}
              className="flex-1 bg-primary text-white font-display font-bold text-lg rounded-2xl py-4 hover:bg-primary/90 active:scale-95 transition-all min-h-[56px]"
            >
              Quiz →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Quiz phase ──
  if (phase === 'quiz') {
    const allAnswered = quizAnswers.every((a) => a !== null);
    const allSubmitted = quizSubmitted.every(Boolean);
    const score = quizCorrect.filter(Boolean).length;

    const handleSelect = (qi: number, ai: number) => {
      if (quizSubmitted[qi]) return;
      setQuizAnswers((prev) => { const n=[...prev]; n[qi]=ai; return n; });
    };
    const handleCheck = (qi: number) => {
      const correct = quizAnswers[qi] === lesson.quiz[qi].answer;
      setQuizSubmitted((prev) => { const n=[...prev]; n[qi]=true; return n; });
      setQuizCorrect((prev) => { const n=[...prev]; n[qi]=correct; return n; });
    };
    const handleFinish = async () => {
      const result = await api.post<CompleteResult>(`/lessons/${lesson.id}/complete`, {});
      setXpEarned(result.xpEarned);
      setNewBadges(result.newBadges ?? []);
      // Refresh session so LearnerHome XP ring updates before modal closes
      void refresh();
      setCelebrating(true);
    };

    return (
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6 min-h-screen">
        <ProgressBar value={2} total={3} />
        <header className="flex items-center gap-3">
          <span className="text-4xl">🧪</span>
          <div>
            <p className="text-xs text-ink/50 uppercase tracking-wide font-semibold">Quiz</p>
            <h1 className="font-display text-xl font-bold text-ink">{lesson.title}</h1>
          </div>
        </header>

        <div className="flex flex-col gap-5">
          {lesson.quiz.map((q, qi) => (
            <div key={qi} className="bg-surface border border-ink/8 rounded-2xl p-5 flex flex-col gap-3">
              <p className="font-semibold text-ink">Q{qi+1}. {q.question}</p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt, ai) => (
                  <button
                    key={ai}
                    onClick={() => handleSelect(qi, ai)}
                    disabled={quizSubmitted[qi]}
                    className={[
                      'text-left px-4 py-3 rounded-xl border-2 transition-all min-h-[44px] text-sm',
                      quizAnswers[qi] === ai && !quizSubmitted[qi] ? 'border-primary bg-primary/10' : 'border-ink/15 hover:border-ink/30',
                      quizSubmitted[qi] && ai === q.answer ? 'border-primary bg-primary/15' : '',
                      quizSubmitted[qi] && ai === quizAnswers[qi] && ai !== q.answer ? 'border-danger bg-danger/10' : '',
                    ].filter(Boolean).join(' ')}
                  >{opt}</button>
                ))}
              </div>
              {!quizSubmitted[qi] && quizAnswers[qi] !== null && (
                <button onClick={() => handleCheck(qi)}
                  className="self-end bg-ink text-white text-sm font-semibold rounded-xl px-4 py-2 hover:bg-ink/80 transition-all min-h-[44px]">
                  Check
                </button>
              )}
              {quizSubmitted[qi] && (
                <div className={`rounded-xl p-3 text-sm ${quizCorrect[qi] ? 'bg-primary/10 text-primary-dark' : 'bg-danger/10 text-danger'}`}>
                  <span className="font-bold">{quizCorrect[qi] ? '✓ Correct! ' : '✗ Not quite. '}</span>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {allSubmitted && (
          <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4 text-center">
            <p className="font-display text-xl font-bold text-ink">{score}/3 correct</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => setPhase('try-it')}
            className="flex-1 border-2 border-ink/20 text-ink font-semibold rounded-2xl py-4 hover:bg-ink/5 transition-all min-h-[56px]">
            ← Back
          </button>
          {allSubmitted && (
            <button
              onClick={() => { void handleFinish(); }}
              className="flex-1 bg-primary text-white font-display font-bold text-lg rounded-2xl py-4 hover:bg-primary/90 active:scale-95 transition-all min-h-[56px]"
            >
              Finish 🎉
            </button>
          )}
        </div>

        {celebrating && (
          <CelebrationModal
            xpEarned={xpEarned}
            newBadges={newBadges}
            onClose={() => nav('/app/learn')}
          />
        )}
      </div>
    );
  }

  return null;
}

function ProgressBar({ value, total }: { value: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i <= value ? 'bg-primary' : 'bg-ink/10'}`} />
      ))}
    </div>
  );
}

function PageIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all ${i === current ? 'bg-primary w-6' : 'bg-ink/15 w-1.5'}`} />
      ))}
    </div>
  );
}
