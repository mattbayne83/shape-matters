import { healthBandColor } from '../../lib/healthScores';

interface RadarChartProps {
  fidelity: number;
  lagHealth: number;
  responseHealth: number;
}

const PILLARS = [
  { key: 'fidelity', label: 'Fidelity' },
  { key: 'lag', label: 'Lag' },
  { key: 'response', label: 'Response' },
] as const;

const SEGMENTS = 10;
const SEG_GAP = 3;

// Per-segment color ramp: green at bottom → amber → ember → red at top
// This mimics a classic VU/EQ meter
const SEG_COLORS = [
  '#44403c', // 0-10   stone-700 (baseline)
  '#44403c', // 10-20  stone-700
  '#57534e', // 20-30  stone-600
  '#78716c', // 30-40  stone-500
  '#A8967A', // 40-50  warm-stone
  '#A8967A', // 50-60  warm-stone
  '#F4A261', // 60-70  ember-light
  '#F4A261', // 70-80  ember-light
  '#E05A1B', // 80-90  ember
  '#dc2626', // 90-100 red-600 (redline)
];

export function RadarChart({ fidelity, lagHealth, responseHealth }: RadarChartProps) {
  const scores = [fidelity, lagHealth, responseHealth];

  return (
    <div className="flex items-end justify-center gap-10 w-full h-full px-8 py-6 relative">
      {/* Scale markers — left edge */}
      <div className="absolute left-2 flex flex-col justify-between text-[8px] font-mono text-stone-300 select-none" style={{ top: 44, bottom: 36 }}>
        <span>100</span>
        <span>0</span>
      </div>

      {PILLARS.map((pillar, i) => {
        const score = scores[i];
        const headlineColor = healthBandColor(score);
        const filledCount = Math.round(score / 10);

        return (
          <div key={pillar.key} className="flex flex-col items-center gap-3 flex-1 max-w-[100px]">
            {/* Score */}
            <span
              className="text-2xl font-extrabold font-mono tabular-nums leading-none"
              style={{ color: headlineColor }}
            >
              {score}
            </span>

            {/* EQ column */}
            <div
              className="w-full flex flex-col-reverse"
              style={{ gap: SEG_GAP }}
            >
              {Array.from({ length: SEGMENTS }, (_, seg) => {
                const isFilled = seg < filledCount;
                const isTop = seg === filledCount - 1 && filledCount > 0;

                return (
                  <div
                    key={seg}
                    className="w-full transition-all duration-300"
                    style={{
                      height: 14,
                      borderRadius: 3,
                      backgroundColor: isFilled ? SEG_COLORS[seg] : '#f5f5f4',
                      opacity: isFilled ? 1 : 0.4,
                      boxShadow: isTop ? `0 0 8px ${SEG_COLORS[seg]}55` : 'none',
                    }}
                  />
                );
              })}
            </div>

            {/* Label */}
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              {pillar.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
