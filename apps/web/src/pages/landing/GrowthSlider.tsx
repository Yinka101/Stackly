import { useState, useId } from 'react';

const SEED = 5; // Practice Dollars

function compound(principal: number, years: number, rate = 0.07) {
  return principal * Math.pow(1 + rate, years);
}

export default function GrowthSlider() {
  const [years, setYears] = useState(10);
  const sliderId = useId();
  const result = compound(SEED, years);
  const bars = Array.from({ length: 20 }, (_, i) => compound(SEED, i + 1));
  const max = bars[bars.length - 1];

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-5 shadow-sm w-full max-w-sm mx-auto">
      {/* Disclaimer */}
      <p className="text-xs text-[var(--color-ink-muted)] mb-3 text-center">
        Example only — not a promise of returns
      </p>

      {/* Bar chart */}
      <div
        className="flex items-end gap-[3px] h-28 mb-4"
        role="img"
        aria-label={`Bar chart showing ${SEED} Practice Dollars growing to ${result.toFixed(2)} over ${years} years at 7% annual return`}
      >
        {bars.map((val, i) => {
          const active = i + 1 <= years;
          const isSelected = i + 1 === years;
          return (
            <div
              key={i}
              className="flex-1 rounded-t-md transition-all duration-300"
              style={{
                height: `${(val / max) * 100}%`,
                backgroundColor: isSelected
                  ? 'var(--color-accent)'
                  : active
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
                minHeight: 4,
              }}
            />
          );
        })}
      </div>

      {/* Result display */}
      <div className="text-center mb-4">
        <div className="font-display font-bold text-3xl text-[var(--color-ink)] tabular-nums">
          ${result.toFixed(2)}
        </div>
        <div className="text-sm text-[var(--color-ink-muted)]">
          from $5 after {years} year{years !== 1 ? 's' : ''} at 7%/yr
        </div>
      </div>

      {/* Slider */}
      <label htmlFor={sliderId} className="sr-only">
        Years of growth
      </label>
      <input
        id={sliderId}
        type="range"
        min={1}
        max={20}
        value={years}
        onChange={(e) => setYears(Number(e.target.value))}
        className="w-full accent-[var(--color-primary)] cursor-pointer"
        aria-valuemin={1}
        aria-valuemax={20}
        aria-valuenow={years}
        aria-valuetext={`${years} years`}
      />
      <div className="flex justify-between text-xs text-[var(--color-ink-muted)] mt-1">
        <span>1 yr</span>
        <span>Plant $5, watch it grow</span>
        <span>20 yrs</span>
      </div>
    </div>
  );
}
