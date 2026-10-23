import { clsx } from '../lib/clsx';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number; // 0-based index
  orientation?: 'horizontal' | 'vertical';
}

export default function Stepper({ steps, currentStep, orientation = 'horizontal' }: StepperProps) {
  if (orientation === 'vertical') {
    return (
      <ol className="flex flex-col gap-0">
        {steps.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <li key={step.id} className="flex gap-4">
              {/* Line + circle */}
              <div className="flex flex-col items-center">
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-colors',
                    done && 'bg-primary text-white',
                    active && 'bg-primary text-white ring-4 ring-primary-light',
                    !done && !active && 'bg-surface-raised text-ink-muted border-2 border-[var(--color-border)]'
                  )}
                  aria-current={active ? 'step' : undefined}
                >
                  {done ? <Check size={14} /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={clsx('w-0.5 flex-1 min-h-[24px] my-1', done ? 'bg-primary' : 'bg-[var(--color-border)]')} />
                )}
              </div>
              {/* Label */}
              <div className="pb-6 pt-1">
                <div className={clsx('font-semibold text-sm', active ? 'text-primary' : done ? 'text-ink' : 'text-ink-muted')}>
                  {step.label}
                </div>
                {step.description && <div className="text-xs text-ink-muted mt-0.5">{step.description}</div>}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className="flex items-center w-full">
      {steps.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <li key={step.id} className={clsx('flex items-center', i < steps.length - 1 && 'flex-1')}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors',
                  done && 'bg-primary text-white',
                  active && 'bg-primary text-white ring-4 ring-primary-light',
                  !done && !active && 'bg-surface-raised text-ink-muted border-2 border-[var(--color-border)]'
                )}
                aria-current={active ? 'step' : undefined}
              >
                {done ? <Check size={14} /> : i + 1}
              </div>
              <span className={clsx('text-xs font-medium', active ? 'text-primary' : 'text-ink-muted')}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={clsx('flex-1 h-0.5 mx-2 mb-5 transition-colors', done ? 'bg-primary' : 'bg-[var(--color-border)]')} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
