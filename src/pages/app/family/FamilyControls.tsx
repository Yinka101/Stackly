import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Settings {
  agentEnabled: boolean;
  weeklyCapCents: number;
  readingLevelOverride: string | null;
}

const CAP_OPTIONS = [
  { label: '$5 / week',  cents: 500  },
  { label: '$10 / week', cents: 1000 },
  { label: '$20 / week', cents: 2000 },
  { label: '$50 / week', cents: 5000 },
];

const LEVEL_OPTIONS = [
  { value: '',          label: 'Follow age band (default)' },
  { value: 'sprouts',   label: 'Sprouts - ages 7–10' },
  { value: 'builders',  label: 'Builders - ages 11–14' },
  { value: 'investors', label: 'Investors - ages 15–24' },
];

export default function FamilyControls() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<Settings>('/family/settings').then(setSettings).catch(() => {});
  }, []);

  const save = async (patch: Partial<Settings>) => {
    if (!settings) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    setSaving(true);
    setSaved(false);
    try {
      await api.put('/family/settings', {
        agentEnabled: next.agentEnabled,
        weeklyCapCents: next.weeklyCapCents,
        readingLevelOverride: next.readingLevelOverride ?? null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  if (!settings) return <p className="text-ink/40 text-sm text-center py-8">Loading…</p>;

  return (
    <div className="flex flex-col gap-5">
      {/* Coach agent toggle */}
      <Section title="Coach agent" description="Let the Coach propose Practice Dollar top-ups for your child's goals.">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-ink text-sm">Allow Coach to suggest purchases</p>
            <p className="text-xs text-ink/50 mt-0.5">
              {settings.agentEnabled
                ? 'Coach can propose kits - you always approve first'
                : 'Coach will not suggest any purchases'}
            </p>
          </div>
          <button
            onClick={() => void save({ agentEnabled: !settings.agentEnabled })}
            className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0
                        ${settings.agentEnabled ? 'bg-primary' : 'bg-ink/20'}`}
            aria-label={settings.agentEnabled ? 'Disable Coach agent' : 'Enable Coach agent'}
          >
            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform
                              ${settings.agentEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </Section>

      {/* Weekly spending cap */}
      <Section title="Weekly spending cap" description="Maximum the Coach can propose per week across all learners.">
        <div className="grid grid-cols-2 gap-2">
          {CAP_OPTIONS.map((opt) => (
            <button
              key={opt.cents}
              onClick={() => void save({ weeklyCapCents: opt.cents })}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all border
                          ${settings.weeklyCapCents === opt.cents
                            ? 'bg-primary text-white border-primary'
                            : 'bg-ink/5 text-ink/70 border-transparent hover:bg-ink/10'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Reading level override */}
      <Section
        title="Reading level override"
        description="Change the vocabulary the Coach and lessons use for all learners in this family."
      >
        <div className="flex flex-col gap-2">
          {LEVEL_OPTIONS.map((opt) => {
            const current = settings.readingLevelOverride ?? '';
            return (
              <button
                key={opt.value}
                onClick={() => void save({ readingLevelOverride: opt.value || null })}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border
                            ${current === opt.value
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-ink/4 border-transparent text-ink/70 hover:bg-ink/8'}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Save status */}
      {(saving || saved) && (
        <p className={`text-xs text-center transition-opacity ${saved ? 'text-primary' : 'text-ink/40'}`}>
          {saving ? 'Saving…' : 'Saved'}
        </p>
      )}
    </div>
  );
}

function Section({ title, description, children }: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-ink/8 rounded-2xl p-4 flex flex-col gap-3">
      <div>
        <p className="font-display font-bold text-ink">{title}</p>
        <p className="text-xs text-ink/50 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}
