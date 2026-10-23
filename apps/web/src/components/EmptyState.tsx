import type { ReactNode } from 'react';
import Seedling from '../assets/Seedling';
import type { SeedlingMood } from '../assets/Seedling';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  mood?: SeedlingMood;
  action?: { label: string; onClick: () => void };
  children?: ReactNode;
}

export default function EmptyState({ title, description, mood = 'thinking', action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 gap-4">
      <Seedling mood={mood} size={100} />
      <div className="space-y-2">
        <h3 className="text-xl font-bold font-display text-ink">{title}</h3>
        {description && <p className="text-ink-muted max-w-xs mx-auto">{description}</p>}
      </div>
      {children}
      {action && (
        <Button onClick={action.onClick} variant="primary" size="md">
          {action.label}
        </Button>
      )}
    </div>
  );
}
