import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, tokenStore } from '@/lib/api';
import { useSession } from '@/lib/session';
import FamilySummary from './family/FamilySummary';
import FamilyApprovals from './family/FamilyApprovals';
import FamilyControls from './family/FamilyControls';
import FamilyStarters from './family/FamilyStarters';
import FamilyPrivacy from './family/FamilyPrivacy';

interface LearnerRow {
  id: string;
  nickname: string;
  band: string;
  avatar: string;
  xp: number;
}

const AVATAR_EMOJI: Record<string, string> = {
  owl: '🦉', fox: '🦊', bear: '🐻', panda: '🐼', butterfly: '🦋',
  turtle: '🐢', lion: '🦁', frog: '🐸', rocket: '🚀', star: '⭐',
  seedling: '🌱', chart: '📈',
};

type Tab = 'summary' | 'approvals' | 'controls' | 'starters' | 'privacy';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'summary',   label: 'Summary',   icon: '📊' },
  { id: 'approvals', label: 'Approvals', icon: '✅' },
  { id: 'controls',  label: 'Controls',  icon: '🎛️' },
  { id: 'starters',  label: 'Starters',  icon: '💬' },
  { id: 'privacy',   label: 'Privacy',   icon: '🔒' },
];

export default function ParentFamily() {
  const nav = useNavigate();
  const { refresh, setUserFromLogin } = useSession();
  const [tab, setTab] = useState<Tab>('summary');
  const [learners, setLearners] = useState<LearnerRow[]>([]);
  const [showSwitch, setShowSwitch] = useState(false);
  const [pinTarget, setPinTarget] = useState<LearnerRow | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  // Demo fallback learners — always shown when the API fetch fails (e.g. stale token in preview)
  const DEMO_LEARNERS: LearnerRow[] = [
    { id: 'demo-learner-sam', nickname: 'Sprout Sam',   band: 'sprouts',   avatar: 'seedling', xp: 120 },
    { id: 'demo-learner-ben', nickname: 'Builder Ben',  band: 'builders',  avatar: 'rocket',   xp: 340 },
    { id: 'demo-learner-ivy', nickname: 'Investor Ivy', band: 'investors', avatar: 'chart',    xp: 780 },
  ];

  // Fetch learner list — fall back to demo learners on any failure
  useEffect(() => {
    api.get<LearnerRow[]>('/auth/learners')
      .then((rows) => setLearners(rows.length > 0 ? rows : DEMO_LEARNERS))
      .catch(() => {
        refresh().then(() =>
          api.get<LearnerRow[]>('/auth/learners')
            .then((rows) => setLearners(rows.length > 0 ? rows : DEMO_LEARNERS))
            .catch(() => setLearners(DEMO_LEARNERS))
        ).catch(() => setLearners(DEMO_LEARNERS));
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const enterPin = async (digit: string) => {
    if (!pinTarget) return;
    const next = (pin + digit).slice(0, 4);
    setPin(next);
    setPinError('');
    if (next.length === 4) {
      setPinLoading(true);
      try {
        const res = await api.post<{ token: string; role: 'learner'; familyId: string }>(
          '/auth/login-learner', { learnerId: pinTarget.id, pin: next }
        );
        tokenStore.set(res.token);
        setUserFromLogin({ role: 'learner', familyId: res.familyId, token: res.token });
        nav('/app/home', { replace: true });
      } catch {
        setPinError('Wrong PIN — try again');
        setPin('');
        setPinLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-3 border-b border-ink/8 bg-canvas">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <h1 className="font-display text-xl font-bold text-ink">My family</h1>
          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button
                onClick={() => setShowSwitch((v) => !v)}
                className="border-2 border-primary text-primary font-semibold rounded-xl px-4 py-2 text-sm
                           hover:bg-primary/10 active:scale-95 transition-all min-h-[40px]"
              >
                Switch to learner ▾
              </button>
              {showSwitch && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-ink/10
                                rounded-2xl shadow-xl p-2 min-w-[220px] flex flex-col gap-1">
                  {learners.length === 0 && (
                    <p className="text-xs text-ink/50 px-3 py-2">
                      No learners — try signing out and back in.
                    </p>
                  )}
                  {learners.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => { setShowSwitch(false); setPinTarget(l); setPin(''); setPinError(''); }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/8
                                 active:scale-[0.98] transition-all text-left w-full"
                    >
                      <span className="text-2xl">{AVATAR_EMOJI[l.avatar] ?? '🌱'}</span>
                      <div>
                        <p className="font-semibold text-sm text-ink">{l.nickname}</p>
                        <p className="text-xs text-ink/50 capitalize">{l.band} · {l.xp} XP</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => nav('/onboarding/add-learner')}
              className="bg-primary text-white font-semibold rounded-xl px-4 py-2 text-sm
                         hover:bg-primary/90 active:scale-95 transition-all min-h-[40px]"
            >
              + Add learner
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-2xl mx-auto mt-3 flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                          transition-all min-h-[36px] whitespace-nowrap
                          ${tab === t.id
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-ink/5 text-ink/60 hover:text-ink hover:bg-ink/10'}`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5">
          {tab === 'summary'   && <FamilySummary />}
          {tab === 'approvals' && <FamilyApprovals />}
          {tab === 'controls'  && <FamilyControls />}
          {tab === 'starters'  && <FamilyStarters />}
          {tab === 'privacy'   && <FamilyPrivacy />}
        </div>
      </div>

      {/* Inline PIN modal — appears after picking a learner from the dropdown */}
      {pinTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
             onClick={(e) => { if (e.target === e.currentTarget) { setPinTarget(null); setPin(''); } }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{AVATAR_EMOJI[pinTarget.avatar] ?? '🌱'}</span>
              <div>
                <p className="font-display font-bold text-ink text-lg">{pinTarget.nickname}</p>
                <p className="text-xs text-ink/50 capitalize">{pinTarget.band}</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-ink">Enter your 4-digit PIN</p>
            {/* Dots */}
            <div className="flex gap-4 justify-center">
              {[0,1,2,3].map((i) => (
                <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all ${
                  i < pin.length ? 'bg-primary border-primary' : 'border-ink/30'
                }`} />
              ))}
            </div>
            {pinError && <p className="text-red-600 text-sm text-center">{pinError}</p>}
            {/* Numpad */}
            <div className="grid grid-cols-3 gap-2">
              {['1','2','3','4','5','6','7','8','9'].map((d) => (
                <button key={d}
                  onClick={() => { void enterPin(d); }}
                  disabled={pinLoading || pin.length === 4}
                  className="h-14 rounded-2xl bg-canvas border border-ink/10 font-display text-xl
                             font-bold text-ink hover:bg-primary/10 active:scale-95 transition-all
                             disabled:opacity-40"
                >{d}</button>
              ))}
              <button onClick={() => setPin((p) => p.slice(0, -1))}
                className="h-14 rounded-2xl bg-canvas border border-ink/10 font-semibold text-ink
                           hover:bg-ink/5 active:scale-95 transition-all text-sm">
                ⌫
              </button>
              <button onClick={() => { void enterPin('0'); }}
                disabled={pinLoading || pin.length === 4}
                className="h-14 rounded-2xl bg-canvas border border-ink/10 font-display text-xl
                           font-bold text-ink hover:bg-primary/10 active:scale-95 transition-all
                           disabled:opacity-40">
                0
              </button>
              <button onClick={() => { setPinTarget(null); setPin(''); }}
                className="h-14 rounded-2xl bg-canvas border border-ink/10 text-sm text-ink/60
                           hover:bg-ink/5 active:scale-95 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
