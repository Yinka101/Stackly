import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

const BANDS = [
  { value: 'sprouts', label: 'Sprouts', ages: 'Ages 7–10', emoji: '🌱' },
  { value: 'builders', label: 'Builders', ages: 'Ages 11–14', emoji: '🔨' },
  { value: 'investors', label: 'Investors', ages: 'Ages 15–24', emoji: '📈' },
] as const;

const AVATARS = ['🦉', '🦊', '🐻', '🐼', '🦋', '🐢', '🦁', '🐸', '🚀', '⭐'];
const AVATAR_KEYS = ['owl', 'fox', 'bear', 'panda', 'butterfly', 'turtle', 'lion', 'frog', 'rocket', 'star'];

export default function AddLearner() {
  const nav = useNavigate();
  const [nickname, setNickname] = useState('');
  const [band, setBand] = useState<'sprouts' | 'builders' | 'investors'>('sprouts');
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^\d{4}$/.test(pin)) { setError('PIN must be exactly 4 digits'); return; }
    if (pin !== pinConfirm) { setError('PINs do not match'); return; }
    if (!nickname.trim()) { setError('Please enter a nickname'); return; }
    setLoading(true);
    try {
      await api.post('/auth/add-learner', {
        nickname: nickname.trim(),
        band,
        avatar: AVATAR_KEYS[avatarIdx],
        pin,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 gap-6">
        <span className="text-6xl">🎉</span>
        <h2 className="font-display text-2xl font-bold text-ink">Learner added!</h2>
        <p className="text-ink/70 text-center">{nickname} can now sign in with their 4-digit PIN.</p>
        <div className="flex gap-3 w-full max-w-xs">
          <button
            onClick={() => { setDone(false); setNickname(''); setPin(''); setPinConfirm(''); }}
            className="flex-1 border-2 border-primary text-primary font-semibold rounded-2xl py-3 hover:bg-primary/5 min-h-[44px]"
          >
            Add another
          </button>
          <button
            onClick={() => nav('/app/family')}
            className="flex-1 bg-primary text-white font-semibold rounded-2xl py-3 hover:bg-primary/90 min-h-[44px]"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center p-6 pt-12">
      <div className="w-full max-w-md">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Add a learner</h1>
        <p className="text-ink/60 mb-6">No email needed — just a nickname, age group and a 4-digit PIN.</p>

        <form onSubmit={(e) => { void submit(e); }} className="flex flex-col gap-6">
          {/* Nickname */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink/80">Nickname</span>
            <input value={nickname} onChange={(e) => setNickname(e.target.value)}
              className="input" placeholder="e.g. Sam" required maxLength={24} />
          </label>

          {/* Age band */}
          <div>
            <p className="text-sm font-semibold text-ink/80 mb-2">Age group</p>
            <div className="flex gap-2">
              {BANDS.map((b) => (
                <button key={b.value} type="button"
                  onClick={() => setBand(b.value)}
                  className={`flex-1 flex flex-col items-center gap-1 rounded-2xl py-3 border-2 transition-all min-h-[44px]
                    ${band === b.value ? 'border-primary bg-primary/10' : 'border-ink/10 bg-surface hover:border-primary/40'}`}
                >
                  <span className="text-xl">{b.emoji}</span>
                  <span className="font-semibold text-sm text-ink">{b.label}</span>
                  <span className="text-xs text-ink/50">{b.ages}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Avatar */}
          <div>
            <p className="text-sm font-semibold text-ink/80 mb-2">Pick an avatar</p>
            <div className="grid grid-cols-5 gap-2">
              {AVATARS.map((a, i) => (
                <button key={i} type="button" onClick={() => setAvatarIdx(i)}
                  className={`text-2xl rounded-xl py-2 border-2 transition-all min-h-[44px]
                    ${avatarIdx === i ? 'border-primary bg-primary/10' : 'border-ink/10 bg-surface hover:border-primary/40'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* PIN */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink/80">4-digit PIN</span>
            <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              type="password" inputMode="numeric" pattern="\d{4}" maxLength={4}
              className="input tracking-[0.5em] text-center text-2xl" placeholder="••••" />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink/80">Confirm PIN</span>
            <input value={pinConfirm} onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
              type="password" inputMode="numeric" pattern="\d{4}" maxLength={4}
              className="input tracking-[0.5em] text-center text-2xl" placeholder="••••" />
          </label>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <button type="submit" disabled={loading}
            className="bg-primary text-white font-display font-semibold text-lg rounded-2xl py-4
                       disabled:opacity-50 hover:bg-primary/90 active:scale-95 transition-all min-h-[56px]">
            {loading ? 'Adding…' : 'Add learner'}
          </button>
        </form>
      </div>
    </div>
  );
}
