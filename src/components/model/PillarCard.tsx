import { ChevronLeft, ChevronRight } from 'lucide-react';

export type PillarId = 'fidelity' | 'lag' | 'autonomy';

const LED_COUNT = 13;
const ARC_START = 135; // 7 o'clock
const ARC_SWEEP = 270;

/** LED Ring knob — 13 dots on a 270° arc with dark body and white pointer */
function Knob({ score, color, size = 60 }: { score: number; color: string; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const ledR = size * 0.4; // radius for LED dot positions (leaves room for dot radius + glow)
  const litCount = Math.round(Math.min(Math.max(score, 0), 100) / (100 / LED_COUNT));

  const toXY = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return [cx + ledR * Math.cos(rad), cy + ledR * Math.sin(rad)] as const;
  };

  // Pointer angle — same arc mapping as LEDs
  const pointerAngle = ARC_START + (Math.min(Math.max(score, 0), 100) / 100) * ARC_SWEEP;
  const pointerLen = size * 0.22;
  const pointerRad = (pointerAngle * Math.PI) / 180;
  const px = cx + pointerLen * Math.cos(pointerRad);
  const py = cy + pointerLen * Math.sin(pointerRad);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="select-none shrink-0">
      <defs>
        <filter id={`led-glow-${color.replace('#', '')}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor={color} floodOpacity="0.5" />
        </filter>
        <filter id="knob-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* LED ring — 13 dots */}
      {Array.from({ length: LED_COUNT }, (_, i) => {
        const angle = ARC_START + (i / (LED_COUNT - 1)) * ARC_SWEEP;
        const [lx, ly] = toXY(angle);
        const isLit = i < litCount;

        return (
          <circle
            key={i}
            cx={lx}
            cy={ly}
            r={isLit ? size * 0.05 : size * 0.042}
            fill={isLit ? color : '#e7e5e4'}
            opacity={isLit ? 1 : 0.4}
            filter={isLit ? `url(#led-glow-${color.replace('#', '')})` : undefined}
            className="transition-all duration-500"
          />
        );
      })}

      {/* Knob body */}
      <circle cx={cx} cy={cy} r={size * 0.28} fill="#44403c" filter="url(#knob-shadow)" />
      <circle cx={cx} cy={cy} r={size * 0.25} fill="#57534e" />

      {/* Pointer line */}
      <line
        x1={cx}
        y1={cy}
        x2={px}
        y2={py}
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        className="transition-all duration-500"
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={size * 0.05} fill="#78716c" />
    </svg>
  );
}

interface PillarCardProps {
  id: PillarId;
  label: string;
  value: string;
  score: number;
  sub: string;
  accentColor: string;
  healthColor?: string;
  isExpanded: boolean;
  hasExpandedSibling?: boolean;
  onToggle: () => void;
}

export function PillarCard({
  label,
  value,
  score,
  sub,
  accentColor,
  healthColor,
  isExpanded,
  hasExpandedSibling,
  onToggle,
}: PillarCardProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        relative w-full text-left rounded-xl border
        transition-all duration-300 cursor-pointer overflow-hidden flex
        ${isExpanded
          ? 'bg-white border-2 shadow-md z-10'
          : hasExpandedSibling
            ? 'bg-white border-stone-100 opacity-55 scale-[0.97] hover:opacity-75 shadow-none'
            : 'bg-white hover:bg-stone-50/50 border-stone-200 hover:border-stone-300 hover:shadow-md shadow-sm'}
      `}
      style={isExpanded ? { borderColor: accentColor, boxShadow: `0 8px 30px ${accentColor}33` } : {}}
    >
      {/* Active Tab Indicator Line */}
      <div
        className={`absolute top-0 left-0 w-full h-[3px] transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundColor: accentColor }}
      />

      {/* Card content */}
      <div className="flex items-center gap-3 p-4 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1 transition-colors">
            {label}
          </p>
          <p
            className="text-3xl font-extrabold font-mono tabular-nums leading-none mb-1 transition-colors"
            style={{ color: healthColor ?? accentColor }}
          >
            {value}<span className="text-sm font-semibold text-stone-300 ml-0.5">/100</span>
          </p>
          <p className="text-[11px] text-stone-500 leading-snug">{sub}</p>
        </div>
        <Knob score={score} color={healthColor ?? accentColor} size={72} />
      </div>

      {/* Explore / Back edge strip */}
      <div
        className={`flex items-center px-1.5 border-l transition-all duration-300 ${
          isExpanded
            ? 'bg-stone-50 border-stone-200'
            : 'bg-stone-50/60 border-stone-100 hover:bg-stone-100/60'
        }`}
      >
        {isExpanded ? (
          <ChevronLeft className="w-5 h-5" style={{ color: accentColor }} />
        ) : (
          <ChevronRight className="w-5 h-5 text-stone-400 animate-[nudge_2s_ease-in-out_infinite]" />
        )}
      </div>
    </button>
  );
}
