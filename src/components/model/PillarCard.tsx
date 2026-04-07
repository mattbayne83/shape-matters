import { ChevronLeft, ChevronRight } from 'lucide-react';

export type PillarId = 'fidelity' | 'lag' | 'response';

/** Rotary knob indicator — 270° sweep from 7 o'clock to 5 o'clock */
function Knob({ score, color, size = 36 }: { score: number; color: string; size?: number }) {
  const r = (size - 4) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const strokeW = 3;
  const arcR = r - strokeW / 2;
  const startAngle = 135;  // 7 o'clock
  const sweep = 270;
  const endAngle = startAngle + sweep;
  const fillAngle = startAngle + (Math.min(Math.max(score, 0), 100) / 100) * sweep;

  const toXY = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return [cx + arcR * Math.cos(rad), cy + arcR * Math.sin(rad)];
  };

  const arcPath = (from: number, to: number) => {
    const [x1, y1] = toXY(from);
    const [x2, y2] = toXY(to);
    const large = to - from > 180 ? 1 : 0;
    return `M${x1},${y1} A${arcR},${arcR} 0 ${large} 1 ${x2},${y2}`;
  };

  // Needle endpoint
  const needleLen = arcR - 4;
  const [nx, ny] = (() => {
    const rad = (fillAngle * Math.PI) / 180;
    return [cx + needleLen * Math.cos(rad), cy + needleLen * Math.sin(rad)];
  })();

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="select-none shrink-0">
      {/* Track */}
      <path
        d={arcPath(startAngle, endAngle)}
        fill="none"
        stroke="#e7e5e4"
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      {/* Fill */}
      {score > 0 && (
        <path
          d={arcPath(startAngle, fillAngle)}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      )}
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3} fill="#d6d3d1" />
      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
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
        relative w-full text-left rounded-xl border p-4
        transition-all duration-300 cursor-pointer overflow-hidden
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

      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1 transition-colors">
            {label}
          </p>
          <p
            className="text-3xl font-extrabold font-mono tabular-nums leading-none mb-1 transition-colors"
            style={{ color: healthColor ?? accentColor }}
          >
            {value}
          </p>
          <p className="text-[11px] text-stone-500 leading-snug">{sub}</p>
        </div>
        <Knob score={score} color={healthColor ?? accentColor} />
      </div>

      <div className={`flex items-center gap-1 mt-2.5 text-xs font-semibold transition-colors ${isExpanded ? '' : 'text-stone-500 group-hover:text-stone-600'}`}
        style={isExpanded ? { color: accentColor } : {}}
      >
        {isExpanded ? (
          <>
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </>
        ) : (
          <>
            Explore
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
      </div>
    </button>
  );
}
