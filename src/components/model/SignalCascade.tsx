import { useId, useMemo } from 'react';
import { fidelityColor } from '../../lib/fidelityColor';

interface SignalCascadeProps {
  levels: number;
  fidelityRate: number;
  semantic?: boolean;
  /** Use a smaller, more compact layout */
  compact?: boolean;
}

/**
 * Signal cascade visualization with cascading highlight sweep.
 *
 * Bars + trapezoid connectors show the structural cascade.
 * A white highlight washes down through bars and connectors
 * in sequence, creating a sense of information flowing through
 * layers. Flash intensity decreases per layer (tied to fidelity).
 */
export function SignalCascade({ levels, fidelityRate, semantic, compact }: SignalCascadeProps) {
  const W = 300;
  const H = 220;
  const PAD_X = compact ? 16 : 24;
  const PAD_TOP = compact ? 16 : 24;
  const PAD_BOTTOM = 8;
  const usableW = W - PAD_X * 2;
  const usableH = H - PAD_TOP - PAD_BOTTOM;
  const labelSpace = compact ? 0 : 48; // reserve right margin for "100%" text
  const barScale = usableW - labelSpace;
  const centerX = W / 2;
  const uid = useId().replace(/:/g, '');
  // Include inputs in keyframe name so browsers restart on slider change
  const kf = `${uid}${levels}${Math.round(fidelityRate)}`;

  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const data = useMemo(() => {
    const maxBlockH = compact ? 16 : 20;
    const blockH = Math.min(maxBlockH, usableH / (levels * 1.35));
    const gap = blockH * 0.35;
    const totalH = levels * blockH + (levels - 1) * gap;
    const bottomY = H - PAD_BOTTOM;
    const topY = bottomY - totalH;

    return Array.from({ length: levels }, (_, i) => {
      // Reversing the index for Y-positioning so wider base is at the bottom.
      const invertedIndex = levels - 1 - i;
      const f = Math.pow(fidelityRate / 100, i) * 100;
      const bw = Math.max(8, (f / 100) * barScale);
      const y = topY + invertedIndex * (blockH + gap);
      return { f, bw, y, blockH };
    });
  }, [levels, fidelityRate, usableH, barScale, compact, H, PAD_BOTTOM]);

  // Cascading flow animation: one keyframe, staggered delays
  const flow = useMemo(() => {
    if (data.length < 2) return null;

    const stagger = 0.12; // seconds between each layer's flash
    const flashDur = 0.45; // each layer's flash duration
    const rest = 0.6; // pause between cycles
    const totalDuration = flashDur + (data.length - 1) * stagger + rest;
    const initialDelay = levels * 0.06 + 0.4;

    // Flash occupies flashDur/totalDuration of the cycle
    const flashPct = (flashDur / totalDuration) * 100;
    const peakPct = flashPct * 0.4;

    const css = `@keyframes cf-${kf}{0%,${flashPct.toFixed(1)}%,100%{opacity:0}${peakPct.toFixed(1)}%{opacity:1}}`;

    return { totalDuration, initialDelay, stagger, css };
  }, [data, levels, kf]);

  const showFlow = !!flow && !prefersReducedMotion;

  return (
    <svg viewBox="0 0 300 220" className="w-full h-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Signal cascade showing ${data[data.length - 1]?.f.toFixed(1) ?? 0}% fidelity remaining at depth ${levels} at ${fidelityRate}% per-layer retention`}>
      {showFlow && <style>{flow.css}</style>}

      {/* ── Bars + Trapezoids ── */}
      {data.map((d, i) => {
        const next = data[i + 1];
        return (
          <g key={i}>
            {next && (
              <path
                d={`M${centerX - d.bw / 2},${d.y} L${centerX + d.bw / 2},${d.y} L${centerX + next.bw / 2},${next.y + next.blockH} L${centerX - next.bw / 2},${next.y + next.blockH} Z`}
                fill={fidelityColor(d.f, semantic)}
                opacity={0.2}
                style={{
                  animation: 'cascade-reveal 0.4s ease-out both',
                  animationDelay: `${i * 80 + 40}ms`,
                  transformOrigin: `${centerX}px ${next.y + next.blockH}px`,
                }}
              />
            )}
            <rect
              x={centerX - d.bw / 2}
              y={d.y}
              width={d.bw}
              height={d.blockH}
              rx={3}
              fill={fidelityColor(d.f, semantic)}
              style={{
                animation: 'cascade-reveal 0.4s ease-out both',
                animationDelay: `${i * 80}ms`,
                transformOrigin: `${centerX}px ${d.y + d.blockH / 2}px`,
              }}
            />
            {!compact && (
              <text
                x={centerX + d.bw / 2 + 8}
                y={d.y + d.blockH / 2 + 4}
                fontSize={9}
                fontWeight={500}
                fill="#c8c3be"
                style={{
                  animation: 'cascade-reveal 0.3s ease-out both',
                  animationDelay: `${i * 80 + 200}ms`,
                }}
              >
                {d.f.toFixed(0)}%
              </text>
            )}
          </g>
        );
      })}

      {/* ── Cascading flow highlights ── */}
      {showFlow && (
        <>
          {/* Bar highlights */}
          {data.map((d, i) => (
            <rect
              key={`glow-${i}`}
              x={centerX - d.bw / 2}
              y={d.y}
              width={d.bw}
              height={d.blockH}
              rx={3}
              fill="white"
              fillOpacity={0.1 + 0.2 * (d.f / 100)}
              style={{
                animation: `cf-${kf} ${flow.totalDuration}s ease-in-out infinite`,
                animationDelay: `${flow.initialDelay + i * flow.stagger}s`,
                animationFillMode: 'backwards',
              }}
            />
          ))}

          {/* Connector highlights — timed halfway between adjacent bars */}
          {data.slice(0, -1).map((d, i) => {
            const next = data[i + 1];
            return (
              <path
                key={`cflow-${i}`}
                d={`M${centerX - d.bw / 2},${d.y} L${centerX + d.bw / 2},${d.y} L${centerX + next.bw / 2},${next.y + next.blockH} L${centerX - next.bw / 2},${next.y + next.blockH} Z`}
                fill="white"
                fillOpacity={0.12}
                style={{
                  animation: `cf-${kf} ${flow.totalDuration}s ease-in-out infinite`,
                  animationDelay: `${flow.initialDelay + (i + 0.5) * flow.stagger}s`,
                  animationFillMode: 'backwards',
                }}
              />
            );
          })}
        </>
      )}
    </svg>
  );
}
