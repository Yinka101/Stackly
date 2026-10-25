interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ title = 'Something went wrong', message, onRetry }: Props) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-12 px-4 text-center">
      <span className="text-5xl" aria-hidden="true">⚠️</span>
      <div>
        <p className="font-display font-bold text-lg text-ink">{title}</p>
        {message && <p className="text-sm text-ink/60 mt-1 max-w-xs">{message}</p>}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-primary text-white font-semibold rounded-xl px-5 py-2.5
                     hover:bg-primary/90 active:scale-95 transition-all min-h-[44px]
                     focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Try again
        </button>
      )}
    </div>
  );
}
