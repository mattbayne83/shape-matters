// src/components/model/SliderInput.tsx

interface SliderInputProps {
  label: string;
  value: number;
  displayValue: string;
  hint: string;
  accent: 'ember' | 'warm-stone';
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  id?: string;
  ariaValueText?: string;
}

const ACCENT_STYLES = {
  ember: { accentColor: '#E05A1B' },
  'warm-stone': { accentColor: '#A8967A' },
} as const;

export function SliderInput({
  label,
  value,
  displayValue,
  hint,
  accent,
  min,
  max,
  step = 1,
  onChange,
  id,
  ariaValueText,
}: SliderInputProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label htmlFor={id} className="text-[11px] font-semibold text-stone-600">
          {label}
        </label>
        <span className="text-[15px] font-bold font-mono tabular-nums text-stone-900">
          {displayValue}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={ariaValueText}
        className="w-full h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ember/30"
        style={ACCENT_STYLES[accent]}
      />
      <div className="text-[10px] italic text-warm-stone mt-1">{hint}</div>
    </div>
  );
}
