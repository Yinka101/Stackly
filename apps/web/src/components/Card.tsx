import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from '../lib/clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevated?: boolean;
  padded?: boolean;
}

export default function Card({ children, elevated = false, padded = true, className, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-surface rounded-[var(--radius-2xl)] border border-[var(--color-border)]',
        padded && 'p-5',
        elevated && 'shadow-lg shadow-black/5',
        !elevated && 'shadow-sm',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
