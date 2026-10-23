import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useSession } from '@/lib/session';

export default function PinLogin() {
  const { learnerId } = useParams<{ learnerId: string }>();
  const nav = useNavigate();
  const { refresh } = useSession();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const enter = async (digit: string) => {
    const next = (pin + digit).slice(0, 4);
    setPin(next);
    setError('');
    if (next.length === 4) {
      setLoading(true);
      try {
        await api.post('/auth/login-learner', { learnerId, pin: next });
        await refresh();
        nav('/app/home');
      } catch {
        setError('Wrong PIN — try again');
        setPin('');
      } finally {
        setLoading(false);
      }
    }
  };

  const del = () => setPin((p) => p.slice(0, -1));

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 gap-8">
      <h1 className="font-display text-2xl font-bold text-ink">Enter your PIN</h1>

      {/* Dots */}
      <div className="flex gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all ${
            i < pin.length ? 'bg-primary border-primary' : 'border-ink/30 bg-transparent'
          }`} />
        ))}
      </div>

      {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {['1','2','3','4','5','6','7','8','9'].map((d) => (
          <button key={d} onClick={() => { void enter(d); }} disabled={loading || pin.length === 4}
            className="bg-surface border border-ink/10 rounded-2xl text-2xl font-display font-semibold
                       text-ink py-4 hover:bg-primary/10 active:scale-95 transition-all min-h-[56px]
                       disabled:opacity-50">
            {d}
          </button>
        ))}
        <div /> {/* empty */}
        <button onClick={() => { void enter('0'); }} disabled={loading || pin.length === 4}
          className="bg-surface border border-ink/10 rounded-2xl text-2xl font-display font-semibold
                     text-ink py-4 hover:bg-primary/10 active:scale-95 transition-all min-h-[56px]
                     disabled:opacity-50">
          0
        </button>
        <button onClick={del} disabled={loading || pin.length === 0}
          className="bg-surface border border-ink/10 rounded-2xl text-xl text-ink/60 py-4
                     hover:bg-red-50 active:scale-95 transition-all min-h-[56px] disabled:opacity-30">
          ⌫
        </button>
      </div>

      <button onClick={() => nav(-1)} className="text-ink/50 text-sm hover:text-ink">
        ← Back
      </button>
    </div>
  );
}
