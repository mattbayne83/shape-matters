import { healthBandColor } from '../../lib/healthScores';

interface RadarChartProps {
  fidelity: number;  // 0-100
  lagHealth: number; // 0-100
  responseHealth: number; // 0-100
}

const SIZE = 220;
const CX = SIZE / 2;
const CY = SIZE / 2 + 6; // slight downward shift so top label has room
const RADIUS = 80;

// Axes: top (Fidelity), bottom-left (Lag), bottom-right (Response)
// Angles: -90° (top), 150° (bottom-left), 30° (bottom-right)
const AXES = [
  { angle: -90, label: 'FIDELITY' },
  { angle: 150, label: 'LAG' },
  { angle: 30, label: 'RESPONSE' },
];

function polarToXY(angleDeg: number, r: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

function gridTriangle(level: number): string {
  const r = (level / 100) * RADIUS;
  return AXES.map(({ angle }) => polarToXY(angle, r).join(',')).join(' ');
}

export function RadarChart({ fidelity, lagHealth, responseHealth }: RadarChartProps) {
  const scores = [fidelity, lagHealth, responseHealth];
  const dataPoints = scores.map((s, i) => polarToXY(AXES[i].angle, (s / 100) * RADIUS));
  const dataPolygon = dataPoints.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <div className="flex justify-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="select-none"
      >
        {/* Concentric grid triangles */}
        {[20, 40, 60, 80, 100].map((level) => (
          <polygon
            key={level}
            points={gridTriangle(level)}
            fill="none"
            stroke="#e7e5e4"
            strokeWidth={level === 100 ? 1.5 : 0.75}
          />
        ))}

        {/* Axis lines */}
        {AXES.map(({ angle, label }) => {
          const [x, y] = polarToXY(angle, RADIUS);
          return (
            <line
              key={label}
              x1={CX}
              y1={CY}
              x2={x}
              y2={y}
              stroke="#d6d3d1"
              strokeWidth={1}
            />
          );
        })}

        {/* Data fill */}
        <polygon
          points={dataPolygon}
          fill="#E05A1B"
          fillOpacity={0.15}
          stroke="#E05A1B"
          strokeWidth={2}
        />

        {/* Data points */}
        {dataPoints.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={5}
            fill={healthBandColor(scores[i])}
            stroke="white"
            strokeWidth={2}
          />
        ))}

        {/* Axis labels with scores */}
        {AXES.map(({ angle, label }, i) => {
          const labelR = RADIUS + 24;
          const [lx, ly] = polarToXY(angle, labelR);
          return (
            <g key={label}>
              <text
                x={lx}
                y={ly - 5}
                textAnchor="middle"
                dominantBaseline="auto"
                className="fill-stone-900 text-[15px] font-bold"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', fontVariantNumeric: 'tabular-nums' }}
              >
                {scores[i]}
              </text>
              <text
                x={lx}
                y={ly + 7}
                textAnchor="middle"
                dominantBaseline="auto"
                className="fill-stone-500 text-[9px] font-semibold"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.1em' }}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
