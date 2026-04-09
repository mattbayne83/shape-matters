import { useId, useMemo } from 'react';
import { calcLayerDelays, calcMarginalLayerCost } from '../../lib/thermalLag';

interface DotTimelineProps {
  levels: number;
  decisionCycle: number;
}

function lagDotColor(pct: number): string {
  const r = Math.round(224 + (68 - 224) * pct);
  const g = Math.round(90 + (64 - 90) * pct);
  const b = Math.round(27 + (60 - 27) * pct);
  return `rgb(${r},${g},${b})`;
}

const W = 500;
const H = 180;
const PAD = { top: 32, right: 24, bottom: 40, left: 24 };
const PLOT_W = W - PAD.left - PAD.right;
const DOT_LINE_Y = H - PAD.bottom;

export function DotTimeline({ levels, decisionCycle }: DotTimelineProps) {
  const uid = useId().replace(/:/g, '');
  // Include inputs in keyframe name so browsers restart on slider change
  const kf = `${uid}${levels}${decisionCycle}`;

  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const delays = useMemo(
    () => calcLayerDelays(levels, decisionCycle),
    [levels, decisionCycle],
  );

  const marginalCost = useMemo(
    () => calcMarginalLayerCost(levels, decisionCycle),
    [levels, decisionCycle],
  );

  const maxDelay = delays[delays.length - 1]?.cumulativeDelay || 1;
  const lastIdx = Math.max(delays.length - 1, 1);

  // Space dots evenly by layer index so the curve shows quadratic acceleration
  const xForIndex = (i: number) =>
    PAD.left + (i / lastIdx) * PLOT_W;

  const curveH = DOT_LINE_Y - PAD.top - 16;

  // Y position maps delay value to height — quadratic delay = quadratic curve
  const yForDelay = (delay: number) =>
    DOT_LINE_Y - 8 - (delay / Math.max(maxDelay, 1)) * curveH;

  // Build the quadratic curve points
  const curvePoints = (() => {
    const pts: string[] = [];
    for (let i = 0; i < delays.length; i++) {
      const x = xForIndex(i);
      const y = yForDelay(delays[i].cumulativeDelay);
      pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  // Approximate curve length: sum of distances between consecutive points
  const curveLength = useMemo(() => {
    if (delays.length < 2) return 1000;
    let len = 0;
    for (let i = 1; i < delays.length; i++) {
      const x1 = xForIndex(i - 1);
      const y1 = yForDelay(delays[i - 1].cumulativeDelay);
      const x2 = xForIndex(i);
      const y2 = yForDelay(delays[i].cumulativeDelay);
      len += Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    return Math.ceil(len) + 10; // small buffer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delays]);

  const animate = !prefersReducedMotion;

  const keyframes = `
    @keyframes dt-dot-${kf} { from { transform: scale(0); opacity: 0 } to { transform: scale(1); opacity: 1 } }
    @keyframes dt-fade-${kf} { from { opacity: 0 } to { opacity: 1 } }
    @keyframes dt-curve-${kf} { from { stroke-dashoffset: ${curveLength} } to { stroke-dashoffset: 0 } }
  `;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <p className="text-[11px] text-stone-400 mb-2 shrink-0">
        How long a strategic signal takes to reach each layer
      </p>

      <div className="flex-1 min-h-0 flex items-center justify-center">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {animate && <style>{keyframes}</style>}

          {/* Timeline axis */}
          <line
            x1={PAD.left} y1={DOT_LINE_Y}
            x2={W - PAD.right} y2={DOT_LINE_Y}
            stroke="#d6d3d1" strokeWidth={1.5}
            style={animate ? { animation: `dt-fade-${kf} 300ms ease-out both` } : undefined}
          />

          {/* Quadratic curve */}
          {delays.length > 1 && (
            <path
              d={curvePoints}
              fill="none"
              stroke="#E05A1B"
              strokeWidth={2}
              opacity={0.6}
              strokeDasharray={animate ? curveLength : undefined}
              strokeDashoffset={animate ? curveLength : undefined}
              style={animate ? {
                animation: `dt-curve-${kf} 600ms ease-out both`,
                animationDelay: '200ms',
              } : undefined}
            />
          )}

          {/* Dots + labels */}
          {delays.map((d, i) => {
            const x = xForIndex(i);
            const colorPct = d.cumulativeDelay / Math.max(maxDelay, 1);
            const color = lagDotColor(colorPct);
            const dotR = i === 0 ? 5 : i === delays.length - 1 ? 5 : 4;
            const curveY = yForDelay(d.cumulativeDelay);
            const dotDelay = i * 80;

            return (
              <g key={d.layer}>
                {/* Connecting line from curve to dot */}
                {d.cumulativeDelay > 0 && (
                  <line
                    x1={x} y1={curveY}
                    x2={x} y2={DOT_LINE_Y - dotR - 1}
                    stroke={color} strokeWidth={1} opacity={0.3}
                    strokeDasharray="2,2"
                    style={animate ? {
                      animation: `dt-fade-${kf} 300ms ease-out both`,
                      animationDelay: `${dotDelay + 150}ms`,
                    } : undefined}
                  />
                )}

                {/* Dot on timeline */}
                <circle
                  cx={x} cy={DOT_LINE_Y}
                  r={dotR} fill={color}
                  style={animate ? {
                    animation: `dt-dot-${kf} 400ms ease-out both`,
                    animationDelay: `${dotDelay}ms`,
                    transformOrigin: `${x}px ${DOT_LINE_Y}px`,
                  } : undefined}
                />

                {/* Layer label above */}
                <text
                  x={x} y={DOT_LINE_Y - dotR - 6}
                  textAnchor="middle"
                  fontSize={8} fontWeight={600}
                  fill="#78716c"
                  style={animate ? {
                    animation: `dt-fade-${kf} 300ms ease-out both`,
                    animationDelay: `${dotDelay + 100}ms`,
                  } : undefined}
                >
                  L{d.layer}
                </text>

                {/* Day label below */}
                <text
                  x={x} y={DOT_LINE_Y + 16}
                  textAnchor="middle"
                  fontSize={8} fontFamily="monospace"
                  fill="#a8a29e"
                  style={animate ? {
                    animation: `dt-fade-${kf} 300ms ease-out both`,
                    animationDelay: `${dotDelay + 100}ms`,
                  } : undefined}
                >
                  {d.cumulativeDelay === 0 ? 'Day 0' : `${Math.round(d.cumulativeDelay)}d`}
                </text>
              </g>
            );
          })}

          {/* Total delay annotation at end of curve */}
          {delays.length > 1 && (
            <text
              x={xForIndex(lastIdx)} y={PAD.top + 4}
              textAnchor="end"
              fontSize={11} fontWeight={700} fontFamily="monospace"
              fill="#E05A1B"
              style={animate ? {
                animation: `dt-fade-${kf} 300ms ease-out both`,
                animationDelay: `${delays.length * 80 + 200}ms`,
              } : undefined}
            >
              {Math.round(maxDelay)} days total
            </text>
          )}
        </svg>
      </div>

      {levels > 1 && (
        <p className="text-sm text-stone-500 mt-auto pt-3 border-t border-stone-100 shrink-0">
          Removing 1 layer saves{' '}
          <span className="font-bold font-mono text-stone-700">
            {Math.round(marginalCost)} days
          </span>
        </p>
      )}
    </div>
  );
}
