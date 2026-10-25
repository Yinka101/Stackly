interface Props {
  emoji?: string;
  title: string;
  body?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ emoji = '📭', title, body, action }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 px-4 text-center">
      <span className="text-5xl" aria-hidden="true">{emoji}</span>
      <div>
        <p className="font-display font-bold text-lg text-ink">{title}</p>
        {body && <p className="text-sm text-ink/60 mt-1 max-w-xs">{body}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 bg-primary text-white font-semibold rounded-xl px-5 py-2.5
                     hover:bg-primary/90 active:scale-95 transition-all min-h-[44px]
                     focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
