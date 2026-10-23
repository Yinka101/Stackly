import type { CSSProperties } from 'react';
import { clsx } from '../lib/clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

function SkeletonBlock({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={clsx(
        'bg-gradient-to-r from-surface-raised via-border to-surface-raised',
        'rounded-[var(--radius-xl)]',
        className
      )}
      style={{
        backgroundSize: '400% 100%',
        animation: 'skeleton-shimmer 1.4s ease infinite',
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export default function Skeleton({ className, variant = 'rect', width, height, lines = 1 }: SkeletonProps) {
  const style: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'circle') {
    return <SkeletonBlock className={clsx('rounded-full', className)} style={style} />;
  }

  if (variant === 'text') {
    return (
      <div className={clsx('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBlock
            key={i}
            className={clsx('h-4 rounded-full', i === lines - 1 && lines > 1 && 'w-3/4')}
          />
        ))}
      </div>
    );
  }

  return <SkeletonBlock className={clsx('h-16', className)} style={style} />;
}
