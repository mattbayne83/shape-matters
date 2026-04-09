import { healthBandColor } from '../../lib/healthScores';

interface RadarChartProps {
  fidelity: number;
  lagHealth: number;
  autonomyHealth: number;
}

const PILLARS = [
  { key: 'fidelity', label: 'Fidelity' },
  { key: 'lag', label: 'Latency' },
  { key: 'autonomy', label: 'Autonomy' },
] as const;

const SEGMENTS = 10;
const SEG_GAP = 3;

const SEG_COLORS = [
  '#44403c', // 0-10   stone-700
  '#44403c', // 10-20  stone-700
  '#57534e', // 20-30  stone-600
  '#78716c', // 30-40  stone-500
  '#A8967A', // 40-50  warm-stone
  '#A8967A', // 50-60  warm-stone
  '#F4A261', // 60-70  ember-light
  '#F4A261', // 70-80  ember-light
  '#E05A1B', // 80-90  ember
  '#dc2626', // 90-100 red-600
];

export function RadarChart({ fidelity, lagHealth, autonomyHealth }: RadarChartProps) {
  const scores = [fidelity, lagHealth, autonomyHealth];

  return (
    <div className="flex items-stretch justify-center gap-3 w-full h-full px-6 py-4">
      {PILLARS.map((pillar, i) => {
        const score = scores[i];
        const headlineColor = healthBandColor(score);
        const filledCount = Math.round(score / 10);

        return (
          <div
            key={pillar.key}
            className="flex-1 max-w-[180px] bg-white border border-stone-200 rounded-xl shadow-sm flex flex-col items-center gap-2 px-3 py-4"
          >
            {/* Label */}
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest shrink-0">
              {pillar.label}
            </span>

            {/* Score */}
            <span
              className="text-4xl font-extrabold font-mono tabular-nums leading-none shrink-0"
              style={{ color: headlineColor }}
            >
              {score}
            </span>

            {/* EQ column */}
            <div
              className="w-full flex-1 flex flex-col-reverse min-h-0"
              style={{ gap: SEG_GAP }}
            >
              {Array.from({ length: SEGMENTS }, (_, seg) => {
                const isFilled = seg < filledCount;
                const isTop = seg === filledCount - 1 && filledCount > 0;
                const color = SEG_COLORS[seg];

                return (
                  <div
                    key={seg}
                    className="w-full flex-1 rounded"
                    style={{
                      backgroundColor: isFilled ? color : '#f5f5f4',
                      opacity: isFilled ? 1 : 0.4,
                      transition: `background-color 300ms ease-out, opacity 300ms ease-out`,
                      transitionDelay: `${seg * 40}ms`,
                      ...(isTop
                        ? {
                            ['--eq-glow-dim' as string]: `0 0 8px ${color}55`,
                            ['--eq-glow-bright' as string]: `0 0 14px ${color}88`,
                            animation: 'eq-breathe 2s ease-in-out infinite',
                          }
                        : { boxShadow: 'none' }),
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
