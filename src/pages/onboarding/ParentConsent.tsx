import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CONSENT_ITEMS = [
  { id: 'collect', label: 'What we collect', detail: "A learner's nickname, age group and avatar. That's it. No real names, no email addresses, no photos or location." },
  { id: 'never', label: 'What we never do', detail: 'We never sell data. We never show ads. The AI never gives buy or sell advice. We never let kids enter payment details.' },
  { id: 'payments', label: 'How payments work', detail: 'Every top-up uses the PayPal sandbox (test money only in this prototype). A parent approves each transaction. Kids never touch payment flows.' },
  { id: 'practice', label: 'Practice money only', detail: 'All investing is done with Practice Dollars. No real trades, no real brokerage accounts.' },
  { id: 'open', label: 'Open source & auditable', detail: 'The source code is public on GitHub. Any developer can check what the app does.' },
];

export default function ParentConsent() {
  const nav = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center p-6 pt-12">
      <div className="w-full max-w-lg">
        {/* Prototype banner */}
        <div className="bg-accent/20 border border-accent rounded-xl px-4 py-2 text-sm text-ink/80 mb-6 font-medium">
          ⚠️ This is a prototype consent flow. In production, this would be a legally reviewed document. Labels are for demonstration only.
        </div>

        <h1 className="font-display text-2xl font-bold text-ink mb-1">Before you start</h1>
        <p className="text-ink/70 mb-6">Here is exactly what Stackly does and does not do with your family's information. Tap each item to read more.</p>

        <div className="flex flex-col gap-3 mb-6">
          {CONSENT_ITEMS.map((item) => (
            <div key={item.id} className="bg-surface rounded-2xl overflow-hidden border border-ink/8">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left gap-2 min-h-[44px]"
                onClick={() => setOpen(open === item.id ? null : item.id)}
              >
                <span className="font-semibold text-ink">{item.label}</span>
                <span className="text-ink/40 text-xl">{open === item.id ? '−' : '+'}</span>
              </button>
              {open === item.id && (
                <p className="px-4 pb-4 text-ink/70 text-sm leading-relaxed">{item.detail}</p>
              )}
            </div>
          ))}
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-8">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-5 h-5 rounded accent-primary"
          />
          <span className="text-ink/80 text-sm leading-relaxed">
            I have read and understood the above. I agree to create a Stackly family account on behalf of my household.
          </span>
        </label>

        <button
          disabled={!agreed}
          onClick={() => nav('/onboarding/parent-register')}
          className="w-full bg-primary text-white font-display font-semibold text-lg rounded-2xl py-4
                     disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95
                     transition-all focus-visible:outline-2 focus-visible:outline-offset-2
                     focus-visible:outline-primary min-h-[56px]"
        >
          I agree - continue
        </button>
      </div>
    </div>
  );
}
