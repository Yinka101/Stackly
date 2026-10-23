import type { ReactNode } from 'react';
import { clsx } from '../lib/clsx';

export type BadgeVariant = 'primary' | 'accent' | 'success' | 'danger' | 'neutral';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-light text-primary-dark',
  accent: 'bg-accent-light text-amber-800',
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-700',
  neutral: 'bg-surface-raised text-ink-muted',
};

export default function Badge({ children, variant = 'primary', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-3 py-1 rounded-pill text-sm font-semibold',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
