import { useMemo } from 'react';
import type { LayerInertia } from '../../types';

interface InertiaProfileProps {
  layerInertia: LayerInertia[];
  levels: number;
  peakLayer: number;
  actualCentroidHeight: number;
}

// SVG dimensions
const W = 680;
const H_PER_LAYER = 28;
const PAD = { top: 24, right: 24, bottom: 16, left: 56 };
const BAR_H = 16;

/**
 * Horizontal bar chart showing per-layer contribution to total moment of inertia.
 * Layers ordered bottom (ICs) to top (CEO). Peak layer highlighted.
 * A centroid marker shows the org's center of mass.
 */
export function InertiaProfile({ layerInertia, levels, peakLayer, actualCentroidHeight }: InertiaProfileProps) {
  const totalH = PAD.top + levels * H_PER_LAYER + PAD.bottom;
  const barAreaW = W - PAD.left - PAD.right;

  const maxPct = useMemo(
    () => Math.max(...layerInertia.map((l) => l.contributionPct), 1),
    [layerInertia]
  );

  // Draw layers from top (CEO, layer L-1) to bottom (ICs, layer 0)
  const displayLayers = useMemo(
    () => [...layerInertia].reverse(),
    [layerInertia]
  );

  // Map layer index to Y position (top of SVG = top layer = CEO)
  function yForRow(rowIdx: number): number {
    return PAD.top + rowIdx * H_PER_LAYER;
  }

  // Centroid row position
  const centroidRowY = useMemo(() => {
    // actualCentroidHeight is layer index (0=ICs). We display reversed.
    const reversedPos = levels - 1 - actualCentroidHeight;
    return PAD.top + reversedPos * H_PER_LAYER + BAR_H / 2;
  }, [levels, actualCentroidHeight]);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${totalH}`}
        className="w-full h-auto"
        role="img"
        aria-label="Per-layer inertia contribution breakdown"
      >
        {/* Centroid line */}
        <line
          x1={PAD.left}
          y1={centroidRowY}
          x2={W - PAD.right}
          y2={centroidRowY}
          stroke="#7c3aed"
          strokeWidth={1}
          strokeDasharray="4 3"
          opacity={0.5}
        />

        {displayLayers.map((li, rowIdx) => {
          const y = yForRow(rowIdx);
          const barW = maxPct > 0 ? (li.contributionPct / maxPct) * barAreaW : 0;
          const isPeak = li.layer === peakLayer;
          const isBloated = li.gapFromIdeal > 0;

          // Color: peak layer gets red accent, bloated layers amber, others slate
          let barColor = '#cbd5e1'; // slate-300
          if (isPeak) barColor = '#dc2626'; // red-600
          else if (isBloated && li.contributionPct > 15) barColor = '#d97706'; // amber-600
          else if (li.contributionPct > 10) barColor = '#64748b'; // slate-500

          return (
            <g key={li.layer}>
              {/* Layer label */}
              <text
                x={PAD.left - 8}
                y={y + BAR_H / 2 + 4}
                textAnchor="end"
                fontSize={10}
                className="font-mono"
                fill={isPeak ? '#dc2626' : '#94a3b8'}
                fontWeight={isPeak ? 'bold' : 'normal'}
              >
                L{li.layer}
              </text>

              {/* Background track */}
              <rect
                x={PAD.left}
                y={y}
                width={barAreaW}
                height={BAR_H}
                rx={3}
                fill="#f1f5f9"
              />

              {/* Inertia bar */}
              <rect
                x={PAD.left}
                y={y}
                width={Math.max(barW, 2)}
                height={BAR_H}
                rx={3}
                fill={barColor}
                opacity={isPeak ? 0.9 : 0.6}
                style={{
                  animation: 'fade-in 0.4s ease-out both',
                  animationDelay: `${rowIdx * 0.05}s`,
                }}
              />

              {/* Percentage label */}
              <text
                x={PAD.left + Math.max(barW, 2) + 6}
                y={y + BAR_H / 2 + 4}
                fontSize={9}
                className="font-mono"
                fill={isPeak ? '#dc2626' : '#64748b'}
                fontWeight={isPeak ? 'bold' : 'normal'}
              >
                {li.contributionPct.toFixed(0)}%
                {isPeak && ' — peak rigidity'}
              </text>
            </g>
          );
        })}

        {/* Centroid label */}
        <text
          x={W - PAD.right}
          y={centroidRowY - 6}
          textAnchor="end"
          fontSize={8}
          fill="#7c3aed"
          fontWeight="bold"
        >
          center of mass
        </text>
      </svg>
    </div>
  );
}
