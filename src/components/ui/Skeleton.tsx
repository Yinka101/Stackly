/** Skeleton shimmer — respects prefers-reduced-motion. */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-2xl bg-ink/6 overflow-hidden relative ${className}`}
    >
      <div className="absolute inset-0 skeleton-shimmer motion-safe:animate-[skeleton-shimmer_1.4s_ease_infinite]" />
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return <Skeleton className={`h-24 w-full ${className}`} />;
}
