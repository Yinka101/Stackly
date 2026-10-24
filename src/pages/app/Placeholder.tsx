interface Props { title: string; coming?: string; }
export default function Placeholder({ title, coming }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
      <span className="text-5xl">🚧</span>
      <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
      <p className="text-ink/60">{coming ?? 'This section is coming in the next prompt.'}</p>
    </div>
  );
}
