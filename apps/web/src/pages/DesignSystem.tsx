import { useState } from 'react';
import { toast } from 'sonner';
import { AGE_BANDS, BAND_LABELS, type AgeBand } from '@stackly/shared';
import { useTheme } from '../lib/theme';
import Seedling from '../assets/Seedling';
import type { SeedlingMood } from '../assets/Seedling';
import {
  Button, Card, Badge, ProgressRing, Modal, Tabs,
  EmptyState, Skeleton, ChartCard, Stepper,
} from '../components';

const chartData = [
  { label: 'Mon', value: 40 },
  { label: 'Tue', value: 70 },
  { label: 'Wed', value: 55 },
  { label: 'Thu', value: 90 },
  { label: 'Fri', value: 65 },
];

const stepperSteps = [
  { id: 'a', label: 'Pick band', description: 'Choose age group' },
  { id: 'b', label: 'Set nickname', description: 'No email needed' },
  { id: 'c', label: 'Start learning', description: 'Jump in!' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold font-display text-ink mb-4 pb-2 border-b border-[var(--color-border)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function DesignSystem() {
  const { theme, setTheme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [stepperStep, setStepperStep] = useState(1);
  const [progress, setProgress] = useState(65);

  return (
    <div className="min-h-dvh bg-canvas py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-ink">Stackly Design System</h1>
          <p className="text-ink-muted mt-1">All components across all three age-band themes.</p>
        </div>

        {/* Theme switcher */}
        <div className="flex gap-2 mb-10 p-1 bg-surface-raised rounded-[var(--radius-xl)] w-fit">
          {AGE_BANDS.map((band: AgeBand) => (
            <button
              key={band}
              onClick={() => setTheme(band)}
              className={`px-5 py-2.5 rounded-[var(--radius-xl)] text-sm font-semibold transition-all min-h-[44px] ${
                theme === band
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {BAND_LABELS[band]}
            </button>
          ))}
        </div>

        {/* Mascot */}
        <Section title="Mascot">
          <div className="flex flex-wrap gap-8 items-end">
            {(['happy', 'thinking', 'celebrating'] as SeedlingMood[]).map((mood) => (
              <div key={mood} className="flex flex-col items-center gap-2">
                <Seedling mood={mood} size={110} />
                <Badge variant="neutral">{mood}</Badge>
              </div>
            ))}
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Button">
          <div className="flex flex-wrap gap-3 mb-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" loading>Loading</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badge">
          <div className="flex flex-wrap gap-3">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="neutral">Neutral</Badge>
          </div>
        </Section>

        {/* Cards */}
        <Section title="Card">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <h3 className="font-bold font-display text-ink mb-1">Default Card</h3>
              <p className="text-ink-muted text-sm">Soft border, no elevation.</p>
            </Card>
            <Card elevated>
              <h3 className="font-bold font-display text-ink mb-1">Elevated Card</h3>
              <p className="text-ink-muted text-sm">With a drop shadow for hierarchy.</p>
            </Card>
          </div>
        </Section>

        {/* Progress Ring */}
        <Section title="ProgressRing">
          <div className="flex flex-wrap gap-8 items-center">
            <ProgressRing value={progress} size={80} label={`${progress}%`} sublabel="Lessons" />
            <ProgressRing value={42} size={64} label="42%" color="var(--color-accent)" />
            <ProgressRing value={100} size={64} label="Done!" color="var(--color-success)" />
            <div className="flex flex-col gap-2">
              <input
                type="range" min={0} max={100} value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-32"
                aria-label="Adjust progress demo"
              />
              <span className="text-xs text-ink-muted">Drag to adjust</span>
            </div>
          </div>
        </Section>

        {/* Tabs */}
        <Section title="Tabs">
          <Tabs
            tabs={[
              { id: 'paypal', label: 'PayPal', content: <Card><p className="text-ink-muted">PayPal lesson content goes here.</p></Card> },
              { id: 'investing', label: 'Investing', content: <Card><p className="text-ink-muted">Investing lesson content goes here.</p></Card> },
              { id: 'basics', label: 'Money Basics', content: <Card><p className="text-ink-muted">Money basics content goes here.</p></Card> },
            ]}
          />
        </Section>

        {/* Stepper */}
        <Section title="Stepper">
          <div className="space-y-6">
            <Stepper steps={stepperSteps} currentStep={stepperStep} orientation="horizontal" />
            <div className="flex gap-3">
              <Button size="sm" variant="ghost" onClick={() => setStepperStep((s) => Math.max(0, s - 1))}>Back</Button>
              <Button size="sm" onClick={() => setStepperStep((s) => Math.min(stepperSteps.length - 1, s + 1))}>Next</Button>
            </div>
            <Stepper steps={stepperSteps} currentStep={stepperStep} orientation="vertical" />
          </div>
        </Section>

        {/* ChartCard */}
        <Section title="ChartCard">
          <ChartCard title="Practice Portfolio" subtitle="This week's value (Practice Dollars)" data={chartData}>
            <p className="text-xs text-ink-muted">Educational only. No real money.</p>
          </ChartCard>
        </Section>

        {/* Skeleton */}
        <Section title="Skeleton">
          <div className="space-y-3 max-w-sm">
            <Skeleton variant="rect" height={60} className="w-full" />
            <Skeleton variant="text" lines={3} />
            <div className="flex gap-3 items-center">
              <Skeleton variant="circle" width={48} height={48} />
              <Skeleton variant="text" lines={2} className="flex-1" />
            </div>
          </div>
        </Section>

        {/* Empty State */}
        <Section title="EmptyState">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <EmptyState
                title="No lessons yet"
                description="Pick a topic to start learning."
                mood="thinking"
                action={{ label: 'Browse Lessons', onClick: () => toast.info('Navigating…') }}
              />
            </Card>
            <Card>
              <EmptyState
                title="Portfolio empty"
                description="Make your first practice trade!"
                mood="happy"
                action={{ label: 'Start Trading', onClick: () => toast.info('Opening portfolio…') }}
              />
            </Card>
          </div>
        </Section>

        {/* Modal */}
        <Section title="Modal">
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Well done!">
            <div className="flex flex-col items-center gap-4 text-center">
              <Seedling mood="celebrating" size={90} />
              <p className="text-ink-muted">You finished your first lesson. Keep it up!</p>
              <Button fullWidth onClick={() => setModalOpen(false)}>Continue</Button>
            </div>
          </Modal>
        </Section>

        {/* Toast */}
        <Section title="Toast">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => toast.success('Practice trade placed!')}>Success toast</Button>
            <Button variant="secondary" onClick={() => toast.error('Not enough Practice Dollars')}>Error toast</Button>
            <Button variant="ghost" onClick={() => toast.info('Penny is thinking…')}>Info toast</Button>
          </div>
        </Section>

        {/* Colour tokens */}
        <Section title="Colour Tokens">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'canvas', var: '--color-canvas' },
              { name: 'surface', var: '--color-surface' },
              { name: 'surface-raised', var: '--color-surface-raised' },
              { name: 'border', var: '--color-border' },
              { name: 'primary', var: '--color-primary' },
              { name: 'primary-light', var: '--color-primary-light' },
              { name: 'accent', var: '--color-accent' },
              { name: 'accent-light', var: '--color-accent-light' },
              { name: 'ink', var: '--color-ink' },
              { name: 'ink-muted', var: '--color-ink-muted' },
              { name: 'danger', var: '--color-danger' },
              { name: 'success', var: '--color-success' },
            ].map(({ name, var: v }) => (
              <div key={name} className="flex flex-col gap-1">
                <div className="h-10 rounded-[var(--radius-xl)] border border-[var(--color-border)]" style={{ background: `var(${v})` }} />
                <span className="text-xs text-ink-muted font-mono">{name}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
