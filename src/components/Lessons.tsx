import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, ChevronLeft, Clock, CheckCircle2 } from 'lucide-react';
import { api, type LessonMeta, type Lesson } from '@/utils/api';
import type { Profile } from '@/utils/api';

interface Props { profile: Profile }

const TOPIC_COLORS = {
  paypal: 'bg-blue-100 text-blue-700',
  investing: 'bg-emerald-100 text-emerald-700',
  'money-basics': 'bg-amber-100 text-amber-700',
};

export default function Lessons({ profile }: Props) {
  const [list, setList] = useState<LessonMeta[]>([]);
  const [active, setActive] = useState<Lesson | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('stackly_completed') ?? '[]') as string[]);
    } catch { return new Set(); }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api.getLessons(profile.band).then((l) => { setList(l); setLoading(false); });
  }, [profile.band]);

  function openLesson(id: string) {
    void api.getLesson(id).then((l) => {
      setActive(l);
      setStepIdx(0);
      setSelected(null);
      setAnswered(false);
    });
  }

  function next() {
    if (!active) return;
    if (stepIdx < active.steps.length - 1) {
      setStepIdx(stepIdx + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      // Lesson done
      const next = new Set([...completed, active.id]);
      setCompleted(next);
      localStorage.setItem('stackly_completed', JSON.stringify([...next]));
      setActive(null);
    }
  }

  const step = active?.steps[stepIdx];
  const canProceed = !step?.quiz || answered;

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading lessons…</div>
  );

  return (
    <div className="px-4 py-6 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Lessons</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {completed.size} of {list.length} complete
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* Lesson list */}
        {!active && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            {list.map((l) => (
              <button
                key={l.id}
                onClick={() => openLesson(l.id)}
                className="flex items-start gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-left hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  {completed.has(l.id)
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    : <BookOpen className="w-5 h-5 text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TOPIC_COLORS[l.topic]}`}>
                      {l.topic === 'paypal' ? 'PayPal' : l.topic === 'investing' ? 'Investing' : 'Money Basics'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {l.durationMins} min
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm">{l.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{l.summary}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mt-1" />
              </button>
            ))}
          </motion.div>
        )}

        {/* Active lesson */}
        {active && step && (
          <motion.div
            key="lesson"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Progress bar */}
            <div className="h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                animate={{ width: `${((stepIdx + 1) / active.steps.length) * 100}%` }}
              />
            </div>

            <button
              onClick={() => setActive(null)}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-5"
            >
              <ChevronLeft className="w-4 h-4" /> Back to lessons
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-3">{step.heading}</h3>
            <p className="text-slate-700 leading-relaxed mb-6">{step.body}</p>

            {/* Quiz */}
            {step.quiz && (
              <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                <p className="font-semibold text-slate-800 mb-3 text-sm">{step.quiz.question}</p>
                <div className="flex flex-col gap-2">
                  {step.quiz.options.map((opt, i) => {
                    const isSelected = selected === i;
                    const isCorrect = i === step.quiz!.answer;
                    const showResult = answered;
                    return (
                      <button
                        key={i}
                        disabled={answered}
                        onClick={() => { setSelected(i); setAnswered(true); }}
                        className={`text-left px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all
                          ${!showResult ? 'bg-white border-slate-200 hover:border-blue-300' : ''}
                          ${showResult && isCorrect ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : ''}
                          ${showResult && isSelected && !isCorrect ? 'bg-red-50 border-red-300 text-red-600' : ''}
                          ${showResult && !isSelected && !isCorrect ? 'bg-white border-slate-200 text-slate-400' : ''}
                        `}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <p className={`mt-3 text-sm font-medium ${selected === step.quiz.answer ? 'text-emerald-600' : 'text-red-500'}`}>
                    {selected === step.quiz.answer ? 'Correct!' : `Not quite - the answer is: ${step.quiz.options[step.quiz.answer]}`}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={next}
              disabled={!canProceed}
              className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2
                disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {stepIdx < active.steps.length - 1 ? 'Next' : 'Finish lesson'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
