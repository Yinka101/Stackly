import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useSession } from '@/lib/session';

export default function ParentLogin() {
  const nav = useNavigate();
  const { refresh } = useSession();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill demo credentials when ?demo=1
  useEffect(() => {
    if (params.get('demo') === '1') {
      setEmail('parent@demo.stackly');
      setPassword('demo1234');
    }
  }, [params]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/login-parent', { email, password });
      await refresh();
      nav('/onboarding/learner-select');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Parent sign in</h1>
        <p className="text-ink/60 mb-8">Sign in to manage your family or add learners.</p>

        <form onSubmit={(e) => { void submit(e); }} className="flex flex-col gap-4">
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

        <div className="mt-6 p-4 bg-accent/10 rounded-xl text-sm text-ink/70">
          <p className="font-semibold mb-1">Demo credentials</p>
          <p>Email: parent@demo.stackly</p>
          <p>Password: demo1234</p>
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
