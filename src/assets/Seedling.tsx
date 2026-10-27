/**
 * Stackly mascot - a little seedling with three moods.
 * Pure inline SVG, no external dependencies.
 */
export type SeedlingMood = 'happy' | 'thinking' | 'celebrating';

interface SeedlingProps {
  mood?: SeedlingMood;
  size?: number;
  className?: string;
}

export default function Seedling({ mood = 'happy', size = 120, className = '' }: SeedlingProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Seedling mascot, ${mood}`}
      role="img"
      className={className}
    >
      <path d="M38 90 L42 110 H78 L82 90 Z" fill="#c2855a" />
      <rect x="34" y="84" width="52" height="8" rx="4" fill="#a06640" />
      <ellipse cx="60" cy="88" rx="22" ry="5" fill="#7a5230" />
      <path d="M60 88 Q58 70 60 54" stroke="#2d9e5f" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 68 Q44 60 42 46 Q56 48 60 68Z" fill="#2d9e5f" stroke="#1e7044" strokeWidth="1" />
      <path d="M60 68 Q52 58 46 50" stroke="#1e7044" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M60 60 Q76 52 78 38 Q64 40 60 60Z" fill="#38b87a" stroke="#1e7044" strokeWidth="1" />
      <path d="M60 60 Q68 50 74 42" stroke="#1e7044" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <circle cx="54" cy="52" r="2.5" fill="#1a2744" />
      <circle cx="66" cy="52" r="2.5" fill="#1a2744" />
      <circle cx="55" cy="51" r="1" fill="white" />
      <circle cx="67" cy="51" r="1" fill="white" />
      {mood === 'happy' && (
        <>
          <path d="M52 59 Q60 66 68 59" stroke="#1a2744" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <ellipse cx="50" cy="57" rx="4" ry="2.5" fill="#f87171" opacity="0.4" />
          <ellipse cx="70" cy="57" rx="4" ry="2.5" fill="#f87171" opacity="0.4" />
        </>
      )}
      {mood === 'thinking' && (
        <>
          <path d="M54 60 Q60 63 66 60" stroke="#1a2744" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="78" cy="38" r="3" fill="#f5c842" opacity="0.9" />
          <circle cx="86" cy="30" r="4.5" fill="#f5c842" opacity="0.8" />
          <circle cx="96" cy="20" r="6" fill="#f5c842" opacity="0.7" />
          <text x="93" y="24" fontSize="7" fill="#1a2744" fontWeight="bold" textAnchor="middle">?</text>
        </>
      )}
      {mood === 'celebrating' && (
        <>
          <path d="M51 59 Q60 70 69 59" stroke="#1a2744" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M54 60 Q60 67 66 60" fill="#ff8fa3" opacity="0.6" />
          <rect x="20" y="20" width="6" height="6" rx="1" fill="#f5c842" transform="rotate(25 23 23)" />
          <rect x="90" y="15" width="5" height="5" rx="1" fill="#f87171" transform="rotate(-15 92 17)" />
          <rect x="14" y="50" width="5" height="5" rx="1" fill="#60a5fa" transform="rotate(40 16 52)" />
          <rect x="98" y="45" width="6" height="6" rx="1" fill="#34d399" transform="rotate(-30 101 48)" />
          <circle cx="30" cy="35" r="3" fill="#f5c842" />
          <circle cx="92" cy="32" r="2.5" fill="#f87171" />
        </>
      )}
    </svg>
  );
}
