import { useMemo } from 'react';
import { fidelityColor } from '../../lib/fidelityColor';

interface DecayCurveProps {
  fidelityRate: number;
  /** Maximum levels on X-axis */
  maxLevels?: number;
  /** Scenario markers to highlight on the curve */
  scenarios?: { label: string; levels: number }[];
}

const DEFAULT_SCENARIOS = [
  { label: 'Flat', levels: 3 },
  { label: 'Medium', levels: 6 },
  { label: 'Tall', levels: 9 },
  { label: 'Deep', levels: 12 },
];

// SVG viewBox dimensions
const W = 680;
const H = 320;
const PAD = { top: 16, right: 32, bottom: 52, left: 52 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

/** Map level count (1-based) to X pixel. Level 1 = left edge, maxLevels = right edge. */
function xPos(level: number, maxLevels: number): number {
  return PAD.left + ((level - 1) / (maxLevels - 1)) * PLOT_W;
}

/** Map fidelity percentage (0-100) to Y pixel */
function yPos(pct: number): number {
  return PAD.top + (1 - pct / 100) * PLOT_H;
}

export function DecayCurve({
  fidelityRate,
  maxLevels = 12,
  scenarios = DEFAULT_SCENARIOS,
}: DecayCurveProps) {
  const r = fidelityRate / 100;

  // Smooth curve: fidelity = r^(level-1) where level goes from 1 to maxLevels
  const curvePoints = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const steps = (maxLevels - 1) * 4;
    for (let i = 0; i <= steps; i++) {
      const level = 1 + (i / steps) * (maxLevels - 1);
      const fidelity = Math.pow(r, level - 1) * 100;
      pts.push({ x: xPos(level, maxLevels), y: yPos(fidelity) });
    }
    return pts;
  }, [r, maxLevels]);

  // Round-trip curve: r^(2*(level-1))
  const rtPoints = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const steps = (maxLevels - 1) * 4;
    for (let i = 0; i <= steps; i++) {
      const level = 1 + (i / steps) * (maxLevels - 1);
      const fidelity = Math.pow(r, 2 * (level - 1)) * 100;
      pts.push({ x: xPos(level, maxLevels), y: yPos(fidelity) });
    }
    return pts;
  }, [r, maxLevels]);

  // Scenario marker positions
  const markers = useMemo(
    () =>
      scenarios.map((s) => {
        const relays = s.levels - 1;
        const upPct = Math.pow(r, relays) * 100;
        const rtPct = Math.pow(r, 2 * relays) * 100;
        return {
          ...s,
          x: xPos(s.levels, maxLevels),
          upY: yPos(upPct),
          upPct,
          rtY: yPos(rtPct),
          rtPct,
        };
      }),
    [r, maxLevels, scenarios]
  );

  // Build SVG path strings
  const upPath =
    curvePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const upAreaPath =
    upPath +
    ` L${curvePoints[curvePoints.length - 1].x.toFixed(1)},${yPos(0).toFixed(1)}` +
    ` L${curvePoints[0].x.toFixed(1)},${yPos(0).toFixed(1)} Z`;
  const rtPath =
    rtPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Y-axis ticks
  const yTicks = [0, 25, 50, 75, 100];

  // X-axis ticks: 1, then every 3 to align with scenarios
  const xTicks = [1, 3, 6, 9, 12].filter((t) => t <= maxLevels);

  // Scenario label lookup for x-axis ticks
  const scenarioLabels = new Map(scenarios.map((s) => [s.levels, s.label]));

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Signal decay curve showing fidelity degradation across organizational layers"
      >
        <defs>
          <linearGradient id="decay-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#d97706" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="decay-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {yTicks.map((tick) => (
          <line
            key={`yg-${tick}`}
            x1={PAD.left}
            y1={yPos(tick)}
            x2={W - PAD.right}
            y2={yPos(tick)}
            stroke={tick === 0 ? '#d6d3d1' : '#f5f5f4'}
            strokeWidth={tick === 0 ? 1 : 0.5}
          />
        ))}

        {/* Vertical grid lines at x-ticks */}
        {xTicks.map((tick) => (
          <line
            key={`xg-${tick}`}
            x1={xPos(tick, maxLevels)}
            y1={PAD.top}
            x2={xPos(tick, maxLevels)}
            y2={H - PAD.bottom}
            stroke="#f1f5f9"
            strokeWidth={0.5}
          />
        ))}

        {/* Area fill under upward curve */}
        <path d={upAreaPath} fill="url(#decay-fill)" />

        {/* Upward fidelity curve */}
        <path
          d={upPath}
          fill="none"
          stroke="url(#decay-stroke)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Round-trip curve (dashed) */}
        <path
          d={rtPath}
          fill="none"
          stroke="#a8a29e"
          strokeWidth={1.5}
          strokeDasharray="6 4"
          strokeLinecap="round"
        />

        {/* Scenario markers */}
        {markers.map((m) => (
          <g key={m.label}>
            {/* Vertical stem: x-axis to upward curve */}
            <line
              x1={m.x}
              y1={H - PAD.bottom}
              x2={m.x}
              y2={m.upY}
              stroke={fidelityColor(m.upPct)}
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.35}
            />

            {/* Upward fidelity marker */}
            <circle
              cx={m.x}
              cy={m.upY}
              r={5}
              fill="white"
              stroke={fidelityColor(m.upPct)}
              strokeWidth={2}
            />
            <text
              x={m.x}
              y={m.upY - 12}
              textAnchor="middle"
              className="font-bold font-mono"
              fontSize={12}
              fill={fidelityColor(m.upPct)}
            >
              {m.upPct.toFixed(1)}%
            </text>

            {/* Round-trip marker */}
            <circle
              cx={m.x}
              cy={m.rtY}
              r={3}
              fill="white"
              stroke="#a8a29e"
              strokeWidth={1.5}
            />
            <text
              x={m.x + 10}
              y={m.rtY + 4}
              textAnchor="start"
              className="font-mono"
              fontSize={9}
              fill="#a8a29e"
            >
              {m.rtPct.toFixed(1)}%
            </text>
          </g>
        ))}

        {/* Y-axis labels */}
        {yTicks.map((tick) => (
          <text
            key={`yl-${tick}`}
            x={PAD.left - 10}
            y={yPos(tick) + 3.5}
            textAnchor="end"
            className="font-mono"
            fontSize={10}
            fill="#a8a29e"
          >
            {tick}%
          </text>
        ))}

        {/* X-axis tick labels + scenario names */}
        {xTicks.map((tick) => {
          const label = scenarioLabels.get(tick);
          return (
            <g key={`xl-${tick}`}>
              <text
                x={xPos(tick, maxLevels)}
                y={H - PAD.bottom + 16}
                textAnchor="middle"
                className="font-mono"
                fontSize={10}
                fill="#a8a29e"
              >
                {tick}
              </text>
              {label && (
                <text
                  x={xPos(tick, maxLevels)}
                  y={H - PAD.bottom + 29}
                  textAnchor="middle"
                  className="font-semibold"
                  fontSize={9}
                  fill="#78716c"
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}

        {/* Axis titles */}
        <text
          x={W / 2}
          y={H - 4}
          textAnchor="middle"
          fontSize={10}
          fill="#a8a29e"
        >
          Organizational Levels
        </text>
        <text
          x={12}
          y={PAD.top + PLOT_H / 2}
          textAnchor="middle"
          fontSize={10}
          fill="#a8a29e"
          transform={`rotate(-90, 12, ${PAD.top + PLOT_H / 2})`}
        >
          Signal Retained
        </text>

        {/* Legend — top right */}
        <g>
          <line x1={W - PAD.right - 130} y1={PAD.top + 8} x2={W - PAD.right - 110} y2={PAD.top + 8} stroke="#16a34a" strokeWidth={2.5} />
          <text x={W - PAD.right - 106} y={PAD.top + 12} fontSize={10} fill="#78716c">
            Upward (IC → CEO)
          </text>
          <line x1={W - PAD.right - 130} y1={PAD.top + 24} x2={W - PAD.right - 110} y2={PAD.top + 24} stroke="#a8a29e" strokeWidth={1.5} strokeDasharray="6 4" />
          <text x={W - PAD.right - 106} y={PAD.top + 28} fontSize={10} fill="#78716c">
            Round-trip
          </text>
        </g>
      </svg>
    </div>
  );
}
