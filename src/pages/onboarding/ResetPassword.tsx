import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getApiBase, loadConfig } from '@/lib/api';

export default function ResetPassword() {
  const [params]        = useSearchParams();
  const nav             = useNavigate();
  const token           = params.get('token') ?? '';

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [done,      setDone]      = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
        <div className="card max-w-sm w-full text-center flex flex-col gap-4">
          <span className="text-4xl">❌</span>
          <p className="font-semibold text-ink">Invalid reset link</p>
          <p className="text-sm text-ink/60">This link is missing a token. Please request a new one.</p>
          <Link to="/forgot-password" className="py-3 rounded-xl font-bold text-center"
                style={{ backgroundColor: '#2d7a4f', color: '#ffffff' }}>
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    try {
      await loadConfig();
      const res = await fetch(`${getApiBase()}/auth/reset-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      });
      const d = await res.json().catch(() => ({})) as { ok?: boolean; error?: string };
      if (!res.ok || !d.ok) throw new Error(d.error ?? 'Something went wrong');
      setDone(true);
      setTimeout(() => nav('/login-parent'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🔒</span>
            <div>
              <h1 className="font-display font-bold text-xl text-ink">Set new password</h1>
              <p className="text-sm text-ink/50">Choose a password at least 8 characters long.</p>
            </div>
          </div>

          {done ? (
            <div className="flex flex-col gap-4 text-center">
              <span className="text-4xl">✅</span>
              <p className="font-semibold text-ink">Password updated!</p>
              <p className="text-sm text-ink/60">Redirecting you to sign in…</p>
            </div>
          ) : (
            <form onSubmit={(e) => { void submit(e); }} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink/70" htmlFor="password">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="input"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink/70" htmlFor="confirm">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Same password again"
                  className="input"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading || !password || !confirm}
                className="py-3 rounded-xl font-bold disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: '#2d7a4f', color: '#ffffff' }}
              >
                {loading ? 'Updating…' : 'Update password'}
              </button>

              <Link to="/forgot-password"
                    className="text-center text-sm text-ink/50 hover:text-ink">
                Request a new link
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
