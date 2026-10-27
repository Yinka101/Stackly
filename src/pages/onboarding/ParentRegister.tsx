import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, tokenStore } from '@/lib/api';
import { useSession } from '@/lib/session';

export default function ParentRegister() {
  const nav = useNavigate();
  const { setUserFromLogin } = useSession();
  const [form, setForm] = useState({ familyName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await api.post<{ token: string; role: 'parent' | 'learner'; familyId: string }>(
        '/auth/register-parent',
        { familyName: form.familyName, email: form.email, password: form.password, consentGiven: true },
      );
      tokenStore.set(res.token);
      setUserFromLogin({ role: res.role ?? 'parent', familyId: res.familyId, token: res.token });
      nav('/onboarding/add-learner');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center p-6 pt-8">
      <div className="w-full max-w-md">
        {/* Back */}
        <button onClick={() => nav(-1)}
          className="flex items-center gap-1 text-ink/50 hover:text-ink text-sm mb-6 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <h1 className="font-display text-2xl font-bold text-ink mb-1">Create your family account</h1>
        <p className="text-ink/60 mb-8">Your details - your child never sees or enters these.</p>

        <form onSubmit={(e) => { void submit(e); }} className="flex flex-col gap-4">
          <Field label="Family name (optional)" placeholder="e.g. The Smiths">
            <input value={form.familyName} onChange={set('familyName')} type="text"
              className="input" placeholder="The Smith Family" />
          </Field>
          <Field label="Your email">
            <input value={form.email} onChange={set('email')} type="email" required
              className="input" placeholder="you@example.com" />
          </Field>
          <Field label="Password">
            <input value={form.password} onChange={set('password')} type="password" required
              className="input" placeholder="At least 8 characters" />
          </Field>
          <Field label="Confirm password">
            <input value={form.confirm} onChange={set('confirm')} type="password" required
              className="input" placeholder="Same password again" />
          </Field>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <button type="submit" disabled={loading}
            className="bg-primary text-white font-display font-semibold text-lg rounded-2xl py-4
                       disabled:opacity-50 hover:bg-primary/90 active:scale-95 transition-all
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
                       min-h-[56px] mt-2">
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink/80">{label}</span>
      {children}
    </label>
  );
}
