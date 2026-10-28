import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { getApiBase, loadConfig } from '@/lib/api';

export default function ForgotPassword() {
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loadConfig();
      const res = await fetch(`${getApiBase()}/auth/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? 'Something went wrong');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link to="/login-parent" className="text-sm text-ink/50 hover:text-ink mb-6 inline-block">
          ← Back to sign in
        </Link>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🔑</span>
            <div>
              <h1 className="font-display font-bold text-xl text-ink">Forgot password?</h1>
              <p className="text-sm text-ink/50">We'll send a reset link to your email.</p>
            </div>
          </div>

          {submitted ? (
            <div className="flex flex-col gap-4 text-center">
              <span className="text-4xl">📬</span>
              <p className="font-semibold text-ink">Check your inbox</p>
              <p className="text-sm text-ink/60">
                If an account exists for <strong>{email}</strong>, a reset link is on its way.
                Check your spam folder if you don't see it within a few minutes.
              </p>
              <Link
                to="/login-parent"
                className="mt-2 py-3 rounded-xl text-center font-semibold text-sm"
                style={{ backgroundColor: '#2d7a4f', color: '#ffffff' }}
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={(e) => { void submit(e); }} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink/70" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="py-3 rounded-xl font-bold disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: '#2d7a4f', color: '#ffffff' }}
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
