import { useState, useEffect } from 'react';

const KEY = 'stackly_sound';

export function useSoundEnabled() {
  const [on, setOn] = useState(() => localStorage.getItem(KEY) === 'on');
  const toggle = () => setOn((v) => {
    const next = !v;
    localStorage.setItem(KEY, next ? 'on' : 'off');
    return next;
  });
  return { soundOn: on, toggleSound: toggle };
}

/** Small accessible toggle for sound on/off.  */
export default function SoundToggle() {
  const { soundOn, toggleSound } = useSoundEnabled();
  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === KEY) window.location.reload();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <button
      onClick={toggleSound}
      aria-pressed={soundOn}
      aria-label={soundOn ? 'Sound on - click to mute' : 'Sound off - click to enable'}
      className="flex items-center gap-1.5 text-xs text-ink/50 hover:text-ink
                 focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1
                 transition-colors min-h-[44px]"
    >
      <span aria-hidden="true">{soundOn ? '🔊' : '🔇'}</span>
      <span className="sr-only">{soundOn ? 'Sound on' : 'Sound off'}</span>
    </button>
  );
}
