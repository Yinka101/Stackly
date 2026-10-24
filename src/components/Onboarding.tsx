import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { Band } from '@/utils/api';

const BANDS: { key: Band; label: string; ages: string; emoji: string; color: string }[] = [
  { key: 'sprouts', label: 'Sprouts', ages: '7–10', emoji: '🌱', color: 'from-emerald-400 to-teal-500' },
  { key: 'builders', label: 'Builders', ages: '11–14', emoji: '🏗️', color: 'from-sky-400 to-blue-500' },
  { key: 'investors', label: 'Investors', ages: '15–24', emoji: '📈', color: 'from-violet-400 to-purple-500' },
];

const AVATARS = ['🦉', '🐸', '🦊', '🐝', '🦋', '🦁', '🐬', '🦄'];

interface Props {
  onDone: (data: { nickname: string; band: Band; avatar: string }) => Promise<unknown>;
}

export default function Onboarding({ onDone }: Props) {
  const [step, setStep] = useState<'band' | 'nickname'>('band');
  const [band, setBand] = useState<Band | null>(null);
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleDone() {
    if (!band || !nickname.trim()) return;
    setBusy(true);
    setError('');
    try {
      await onDone({ nickname: nickname.trim(), band, avatar });
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">💰</div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Stackly</h1>
          <p className="text-slate-500 mt-1 text-sm">Your money school</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'band' && (
            <motion.div
              key="band"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-xl font-semibold text-slate-800 mb-1 text-center">
                Which group are you in?
              </h2>
              <p className="text-sm text-slate-500 text-center mb-6">Pick your age range</p>
              <div className="flex flex-col gap-3">
                {BANDS.map((b) => (
                  <button
                    key={b.key}
                    onClick={() => setBand(b.key)}
                    className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all text-left
                      ${band === b.key
                        ? 'border-blue-500 bg-white shadow-md shadow-blue-100'
                        : 'border-transparent bg-white/70 hover:bg-white hover:border-blue-200'
                      }`}
                  >
                    <span className="text-3xl">{b.emoji}</span>
                    <div>
                      <div className="font-semibold text-slate-900">{b.label}</div>
                      <div className="text-xs text-slate-500">Ages {b.ages}</div>
                    </div>
                    {band === b.key && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => band && setStep('nickname')}
                disabled={!band}
                className="mt-6 w-full py-3.5 rounded-2xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2
                  disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 'nickname' && (
            <motion.div
              key="nickname"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-xl font-semibold text-slate-800 mb-1 text-center">
                What's your nickname?
              </h2>
              <p className="text-xs text-slate-400 text-center mb-5">
                No real name, no email — just a fun nickname
              </p>

              {/* Avatar picker */}
              <div className="grid grid-cols-4 gap-2 mb-5">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`h-14 rounded-xl text-2xl flex items-center justify-center transition-all
                      ${avatar === a ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-white/70 hover:bg-white'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="e.g. MoneyWiz99"
                value={nickname}
                maxLength={20}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 outline-none text-slate-900 bg-white text-base mb-4"
              />

              {error && (
                <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('band')}
                  className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold hover:border-slate-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => { void handleDone(); }}
                  disabled={!nickname.trim() || busy}
                  className="flex-1 py-3.5 rounded-2xl bg-blue-600 text-white font-semibold
                    disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  {busy ? 'Starting…' : "Let's go!"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
