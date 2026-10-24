import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useSession } from '@/lib/session';

const DEMO_EMAIL = 'parent@demo.stackly';
const DEMO_PASSWORD = 'demo1234';

export default function ParentLogin() {
  const nav = useNavigate();
  const { refresh } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = async (e?: string, p?: string) => {
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/login-parent', {
        email: e ?? email,
        password: p ?? password,
      });
      await refresh();
      nav('/app/family');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const submit = (e: FormEvent) => { e.preventDefault(); void doLogin(); };
  const tryDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    void doLogin(DEMO_EMAIL, DEMO_PASSWORD);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Back */}
        <button onClick={() => nav(-1)}
          className="flex items-center gap-1 text-ink/50 hover:text-ink text-sm mb-6 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <h1 className="font-display text-2xl font-bold text-ink mb-1">Parent sign in</h1>
        <p className="text-ink/60 mb-8">Sign in to manage your family or add learners.</p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink/80">Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
              className="input" placeholder="you@example.com" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink/80">Password</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
              className="input" placeholder="Your password" />
          </label>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <button type="submit" disabled={loading}
            className="bg-primary text-white font-display font-semibold text-lg rounded-2xl py-4
                       disabled:opacity-50 hover:bg-primary/90 active:scale-95 transition-all min-h-[56px] mt-2">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Demo shortcut */}
        <div className="mt-6 p-4 bg-accent/10 rounded-xl">
          <p className="text-sm font-semibold text-ink/80 mb-2">Try the demo</p>
          <p className="text-xs text-ink/50 mb-3">
            Email: {DEMO_EMAIL} · Password: {DEMO_PASSWORD}
          </p>
          <button onClick={tryDemo} disabled={loading}
            className="w-full bg-accent text-ink font-display font-semibold rounded-xl py-3
                       hover:bg-accent/80 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]">
            {loading ? 'Signing in…' : '✨ Sign in with demo account'}
          </button>
        </div>

        <p className="text-ink/50 text-sm mt-6 text-center">
          No account?{' '}
          <button onClick={() => nav('/onboarding')} className="text-primary underline">
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
