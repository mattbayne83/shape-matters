import { useMemo } from 'react';
import { calcDepthTax } from '../../lib/depthTax';
import { fidelityColor } from '../../lib/fidelityColor';

const STEPS = 25;
const MIN_RATE = 50;
const MAX_RATE = 98;
const TYPICAL_MIN = 70;
const TYPICAL_MAX = 90;

// SVG dimensions
const W = 280;
const H = 160;
const PAD = { top: 14, right: 16, bottom: 28, left: 38 };
const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;

function xFor(rate: number) {
  return PAD.left + ((rate - MIN_RATE) / (MAX_RATE - MIN_RATE)) * plotW;
}
function yFor(val: number) {
  return PAD.top + plotH - (val / 100) * plotH;
}

interface Props {
  levels: number;
  headcount: number;
  currentFidelityRate: number;
}

export function SensitivitySweep({ levels, headcount, currentFidelityRate }: Props) {
  const data = useMemo(() => {
    const points: { rate: number; rt: number }[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const rate = MIN_RATE + (i / STEPS) * (MAX_RATE - MIN_RATE);
      const tax = calcDepthTax(levels, headcount, rate);
      points.push({ rate, rt: tax.roundTripFidelity });
    }
    return points;
  }, [levels, headcount]);

  const currentTax = calcDepthTax(levels, headcount, currentFidelityRate);
  const currentRT = currentTax.roundTripFidelity;
  const cx = xFor(currentFidelityRate);
  const cy = yFor(currentRT);

  const polyline = data.map((d) => `${xFor(d.rate)},${yFor(d.rt)}`).join(' ');

  // Typical range shading coordinates
  const txMin = xFor(TYPICAL_MIN);
  const txMax = xFor(TYPICAL_MAX);

  return (
    <div className="flex-1 w-full flex items-center justify-center">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full flex-1" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Sensitivity chart showing ${currentRT.toFixed(1)}% round-trip fidelity at ${currentFidelityRate}% per-layer rate across depth ${levels}`}>
        {/* Typical range shading */}
        <rect
          x={txMin} y={PAD.top}
          width={txMax - txMin} height={plotH}
          fill="#e7e5e4" opacity={0.4} rx={2}
        />
        <text x={(txMin + txMax) / 2} y={PAD.top + 12} textAnchor="middle" className="fill-stone-400" fontSize={9} fontWeight={600}>
          typical range
        </text>

        {/* Curve */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#44403c"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Current position vertical line */}
        <line
          x1={cx} y1={PAD.top} x2={cx} y2={PAD.top + plotH}
          stroke={fidelityColor(currentRT, true)}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.6}
        />

        {/* Current position dot */}
        <circle
          cx={cx} cy={cy} r={5}
          fill={fidelityColor(currentRT, true)}
          stroke="white" strokeWidth={1.5}
        />

        {/* Current value label */}
        <text
          x={cx} y={cy - 10}
          textAnchor="middle"
          fontSize={11} fontWeight={700} fontFamily="monospace"
          fill={fidelityColor(currentRT, true)}
        >
          {currentRT.toFixed(1)}%
        </text>

        {/* X axis labels */}
        <text x={PAD.left} y={H - 6} fontSize={9} fill="#a8a29e" textAnchor="start">50%</text>
        <text x={PAD.left + plotW} y={H - 6} fontSize={9} fill="#a8a29e" textAnchor="end">98%</text>
        <text x={PAD.left + plotW / 2} y={H - 6} fontSize={9} fill="#a8a29e" textAnchor="middle">per-layer rate</text>

        {/* Y axis labels */}
        <text x={PAD.left - 4} y={PAD.top + 5} fontSize={9} fill="#a8a29e" textAnchor="end">100%</text>
        <text x={PAD.left - 4} y={PAD.top + plotH} fontSize={9} fill="#a8a29e" textAnchor="end">0%</text>
      </svg>
    </div>
  );
}
