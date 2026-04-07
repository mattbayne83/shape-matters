import { useMemo } from 'react';
import {
  calcDampingRatio,
  calcNaturalFrequency,
  calcStepResponse,
  calcOvershoot,
  calcSettlingTimeWeeks,
  classifyRegime,
} from '../../lib/dampedResponse';

interface ChangeResponseTimelineProps {
  levels: number;
  headcount: number;
  culturalAgility: number;
}

function responsePath(
  points: { t: number; x: number }[],
  xScale: (t: number) => number,
  yScale: (x: number) => number,
): string {
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(p.t).toFixed(1)},${yScale(p.x).toFixed(1)}`)
    .join(' ');
}

const GHOST_CONFIGS = [
  { zeta: 0.3, label: 'Under (ζ=0.3)', color: '#DC2626' },
  { zeta: 1.0, label: 'Ideal (ζ=1.0)', color: '#16A34A' },
  { zeta: 2.0, label: 'Over (ζ=2.0)', color: '#a8a29e' },
] as const;

const FONT = {
  axis: 10,
  label: 10,
  annotation: 11,
  yTitle: 9,
} as const;

export function ChangeResponseTimeline({
  levels,
  headcount,
  culturalAgility,
}: ChangeResponseTimelineProps) {
  const zeta = useMemo(
    () => calcDampingRatio(levels, headcount, culturalAgility),
    [levels, headcount, culturalAgility],
  );
  const omega0 = useMemo(
    () => calcNaturalFrequency(headcount, culturalAgility),
    [headcount, culturalAgility],
  );
  const overshoot = useMemo(() => calcOvershoot(zeta), [zeta]);
  const settlingWeeks = useMemo(
    () => calcSettlingTimeWeeks(levels, headcount, culturalAgility),
    [levels, headcount, culturalAgility],
  );
  const regime = useMemo(() => classifyRegime(zeta), [zeta]);

  const W = 600;
  const H = 220;
  const pad = { top: 28, right: 16, bottom: 44, left: 56 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const tMax = Math.max(10, Math.ceil(settlingWeeks * 1.5));
  const numPoints = 150;

  const xScale = useMemo(
    () => (t: number) => pad.left + (t / tMax) * plotW,
    [pad.left, tMax, plotW],
  );
  const yScale = useMemo(
    () => (x: number) => pad.top + plotH - (x / 1.3) * plotH,
    [pad.top, plotH],
  );

  const userPoints = useMemo(() => {
    const timeScale = settlingWeeks / Math.max(4 * zeta / omega0, 0.01);
    return Array.from({ length: numPoints + 1 }, (_, i) => {
      const t = (i / numPoints) * tMax;
      const tRaw = t / Math.max(timeScale, 0.01);
      return { t, x: calcStepResponse(tRaw, zeta, omega0) };
    });
  }, [zeta, omega0, tMax, settlingWeeks]);

  // Ghost curves use the user's actual omega0 so all curves share the same time scale.
  // Only zeta varies — this makes visual comparison meaningful.
  const ghostPaths = useMemo(
    () =>
      GHOST_CONFIGS.map((g) => {
        const ghostSettling = (4 * g.zeta / omega0) * 3.5;
        const ghostTimeScale = ghostSettling / Math.max(4 * g.zeta / omega0, 0.01);
        const pts = Array.from({ length: numPoints + 1 }, (_, i) => {
          const t = (i / numPoints) * tMax;
          const tRaw = t / Math.max(ghostTimeScale, 0.01);
          return { t, x: calcStepResponse(tRaw, g.zeta, omega0) };
        });
        return { ...g, path: responsePath(pts, xScale, yScale) };
      }),
    [tMax, xScale, yScale, omega0],
  );

  const userPath = responsePath(userPoints, xScale, yScale);
  const peak = userPoints.reduce((max, p) => (p.x > max.x ? p : max), userPoints[0]);

  const mobilizeEnd = Math.min(tMax * 0.25, settlingWeeks * 0.3);
  const overshootEnd = Math.min(tMax * 0.45, settlingWeeks * 0.6);
  const correctEnd = Math.min(tMax * 0.7, settlingWeeks * 0.9);

  // Determine overshoot annotation position — flip to left if near right edge
  const peakX = xScale(peak.t);
  const peakNearRight = peakX > W - pad.right - 80;

  // Settling line x-position — clamped to plot area
  const settleX = xScale(Math.min(settlingWeeks, tMax * 0.95));

  // Regime verdict for the chart badge
  const verdictColor = regime.regime === 'critically-damped' ? '#16A34A'
    : regime.regime === 'under-damped' ? '#DC2626' : '#a8a29e';
  const verdictBg = regime.regime === 'critically-damped' ? 'rgba(22,166,74,0.08)'
    : regime.regime === 'under-damped' ? 'rgba(220,38,38,0.06)' : 'rgba(168,162,158,0.08)';

  return (
    <div className="flex-1 w-full flex flex-col justify-center min-h-0">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1">
            Change Response Timeline
          </h3>
          <p className="text-sm text-stone-400">
            What happens when your org tries to pivot
          </p>
        </div>
        {/* Verdict badge */}
        <div
          className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0"
          style={{ color: verdictColor, backgroundColor: verdictBg }}
        >
          {regime.regimeLabel} · ζ={zeta.toFixed(2)}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Phase background zones */}
        <rect x={xScale(0)} y={pad.top} width={xScale(mobilizeEnd) - xScale(0)} height={plotH}
          fill="rgba(224,90,27,0.04)" />
        <rect x={xScale(mobilizeEnd)} y={pad.top} width={xScale(overshootEnd) - xScale(mobilizeEnd)} height={plotH}
          fill="rgba(220,38,38,0.03)" />
        <rect x={xScale(overshootEnd)} y={pad.top} width={xScale(correctEnd) - xScale(overshootEnd)} height={plotH}
          fill="rgba(217,119,6,0.03)" />
        <rect x={xScale(correctEnd)} y={pad.top} width={xScale(tMax) - xScale(correctEnd)} height={plotH}
          fill="rgba(22,166,74,0.03)" />

        {/* Phase labels */}
        <text x={(xScale(0) + xScale(mobilizeEnd)) / 2} y={H - 10} textAnchor="middle"
          fill="#a8a29e" style={{ fontSize: FONT.label }}>Mobilize</text>
        <text x={(xScale(mobilizeEnd) + xScale(overshootEnd)) / 2} y={H - 10} textAnchor="middle"
          fill="#a8a29e" style={{ fontSize: FONT.label }}>Overshoot</text>
        <text x={(xScale(overshootEnd) + xScale(correctEnd)) / 2} y={H - 10} textAnchor="middle"
          fill="#a8a29e" style={{ fontSize: FONT.label }}>Correct</text>
        <text x={(xScale(correctEnd) + xScale(tMax)) / 2} y={H - 10} textAnchor="middle"
          fill="#a8a29e" style={{ fontSize: FONT.label }}>Align</text>

        {/* Axes */}
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH}
          stroke="#d6d3d1" strokeWidth={1} />
        <line x1={pad.left} y1={pad.top + plotH} x2={W - pad.right} y2={pad.top + plotH}
          stroke="#d6d3d1" strokeWidth={1} />

        {/* Y-axis labels */}
        <text x={pad.left - 8} y={yScale(0) + 3} textAnchor="end"
          fill="#a8a29e" style={{ fontSize: FONT.axis }}>0%</text>
        <text x={pad.left - 8} y={yScale(0.5) + 3} textAnchor="end"
          fill="#a8a29e" style={{ fontSize: FONT.axis }}>50%</text>
        <text x={pad.left - 8} y={yScale(1.0) + 3} textAnchor="end"
          fill="#a8a29e" style={{ fontSize: FONT.axis }}>100%</text>

        {/* Target zone band — the "ideal" range (95-105% alignment) */}
        <rect
          x={pad.left} y={yScale(1.05)}
          width={plotW} height={yScale(0.95) - yScale(1.05)}
          fill="rgba(22,166,74,0.06)" rx={2}
        />

        {/* Target line at 100% */}
        <line x1={pad.left} y1={yScale(1.0)} x2={W - pad.right} y2={yScale(1.0)}
          stroke="#16A34A" strokeWidth={1} strokeDasharray="6,4" opacity={0.35} />
        <text x={pad.left + 4} y={yScale(1.0) - 4}
          fill="#16A34A" style={{ fontSize: FONT.axis }} opacity={0.6}>100% aligned</text>

        {/* Y-axis title */}
        <text x={12} y={pad.top + plotH / 2} textAnchor="middle"
          fill="#a8a29e" style={{ fontSize: FONT.yTitle }}
          transform={`rotate(-90,12,${pad.top + plotH / 2})`}>
          % aligned with new strategy
        </text>

        {/* Ghost reference curves */}
        {ghostPaths.map((g) => (
          <path key={g.label} d={g.path} fill="none" stroke={g.color}
            strokeWidth={1.5} opacity={0.18} />
        ))}

        {/* User's curve — thicker, on top */}
        <path d={userPath} fill="none" stroke="#E05A1B" strokeWidth={2.5} />

        {/* Overshoot annotation — flips direction near right edge */}
        {overshoot > 2 && (
          <>
            <circle cx={peakX} cy={yScale(peak.x)} r={3} fill="#E05A1B" opacity={0.8} />
            <line x1={peakX} y1={yScale(peak.x) + 4} x2={peakX} y2={yScale(1.0)}
              stroke="#E05A1B" strokeWidth={1} strokeDasharray="2,2" opacity={0.4} />
            <text
              x={peakNearRight ? peakX - 6 : peakX + 6}
              y={yScale(peak.x) - 4}
              textAnchor={peakNearRight ? 'end' : 'start'}
              fill="#E05A1B" style={{ fontSize: FONT.annotation, fontWeight: 600 }}>
              +{Math.round(overshoot)}% overshoot
            </text>
          </>
        )}

        {/* Settling time vertical marker */}
        <line x1={settleX} y1={pad.top} x2={settleX} y2={pad.top + plotH}
          stroke="#16A34A" strokeWidth={1} strokeDasharray="3,3" opacity={0.3} />
        <text x={settleX} y={pad.top - 6} textAnchor="middle"
          fill="#16A34A" style={{ fontSize: FONT.annotation, fontWeight: 600 }}>
          ~{Math.round(settlingWeeks)}wk settled
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2 text-[10px] text-stone-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#E05A1B]" /> Your org (ζ={zeta.toFixed(2)})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" /> Ideal (ζ=1.0)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#DC2626]" /> Under (ζ=0.3)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#a8a29e]" /> Over (ζ=2.0)
        </span>
      </div>
    </div>
  );
}
