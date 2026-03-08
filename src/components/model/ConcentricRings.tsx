import { useMemo } from 'react';
import { fidelityColor } from '../../lib/fidelityColor';

interface ConcentricRingsProps {
  levels: number;
  fidelityRate: number;
  semantic?: boolean;
  className?: string;
}

export function ConcentricRings({ levels, fidelityRate, semantic, className }: ConcentricRingsProps) {
  const SIZE = 300;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const MIN_R = 14;
  const MAX_R = 128;

  const data = useMemo(() => {
    const spacing = levels > 1 ? (MAX_R - MIN_R) / (levels - 1) : 0;
    const ringW = Math.max(2, spacing * 0.55);
    return Array.from({ length: levels }, (_, i) => {
      const f = Math.pow(fidelityRate / 100, i) * 100;
      const r = MIN_R + i * spacing;
      const opacity = 0.25 + 0.75 * (f / 100);
      return { f, r, ringW, opacity };
    });
  }, [levels, fidelityRate]);

  const outerFidelity = data.length > 0 ? data[data.length - 1].f : 100;

  // Show labels for: every ring if ≤6, otherwise every 2nd + always first/last
  const labelIndices = useMemo(() => {
    const indices = new Set<number>();
    indices.add(0);
    indices.add(data.length - 1);
    if (levels <= 6) {
      for (let i = 0; i < data.length; i++) indices.add(i);
    } else {
      for (let i = 0; i < data.length; i += 2) indices.add(i);
    }
    return indices;
  }, [data.length, levels]);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={className ?? 'w-full h-auto'}>
      <defs>
        <filter id="ring-glow-f">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Rings: outermost first (painter's order) */}
      {[...data].reverse().map((d, ri) => {
        const i = data.length - 1 - ri;
        return (
          <g
            key={i}
            style={{
              transformOrigin: `${CX}px ${CY}px`,
              animation: 'ring-scale 0.5s ease-out both',
              animationDelay: `${i * 120}ms`,
            }}
          >
            <circle
              cx={CX}
              cy={CY}
              r={d.r}
              fill="none"
              stroke={fidelityColor(d.f, semantic)}
              strokeWidth={d.ringW}
              opacity={d.opacity}
            />
          </g>
        );
      })}
      {/* Center dot with glow */}
      <circle
        cx={CX}
        cy={CY}
        r={MIN_R * 0.7}
        fill={fidelityColor(100, semantic)}
        filter="url(#ring-glow-f)"
        style={{
          transformOrigin: `${CX}px ${CY}px`,
          animation: 'pulse-glow 2.5s ease-in-out infinite',
          animationDelay: `${levels * 120 + 300}ms`,
        }}
      />
      {/* Sonar pulse from outermost ring */}
      <circle
        cx={CX}
        cy={CY}
        r={MAX_R}
        fill="none"
        stroke={fidelityColor(outerFidelity, semantic)}
        strokeWidth={2}
        opacity={0}
        style={{
          transformOrigin: `${CX}px ${CY}px`,
          animation: 'sonar-ring 3s ease-out infinite',
          animationDelay: `${levels * 120 + 600}ms`,
        }}
      />
      {/* Ring labels */}
      {data.map((d, i) =>
        labelIndices.has(i) ? (
          <text
            key={i}
            x={CX}
            y={CY - d.r - d.ringW / 2 - 5}
            textAnchor="middle"
            fontSize={11}
            fill="#a8a29e"
            style={{
              animation: 'cascade-reveal 0.3s ease-out both',
              animationDelay: `${i * 120 + 400}ms`,
            }}
          >
            L{i}: {d.f.toFixed(0)}%
          </text>
        ) : null
      )}
    </svg>
  );
}
