import { useMemo } from 'react';
import { fidelityColor } from '../../lib/fidelityColor';
import { employeesPerLayer, idealizedWidthAtLayer, calcTriangleGeometry } from '../../lib/triangleGeometry';

interface ShapeOverlayProps {
  levels: number;
  employees: number;
  fidelityRate: number;
  semantic?: boolean;
}

// SVG viewBox dimensions
const W = 680;
const H = 420;
const PAD = { top: 32, right: 60, bottom: 48, left: 60 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

/** Map layer index (0=bottom, L-1=top) to Y pixel — top of SVG = apex */
function yPos(layer: number, levels: number): number {
  if (levels <= 1) return PAD.top + PLOT_H / 2;
  return PAD.top + (layer / (levels - 1)) * PLOT_H;
}

/** Map a width value to half-width in pixels (symmetric around center) */
function halfW(width: number, maxWidth: number): number {
  if (maxWidth <= 0) return 0;
  return (width / maxWidth) * (PLOT_W / 2);
}

const CENTER_X = PAD.left + PLOT_W / 2;

export function ShapeOverlay({ levels, employees, fidelityRate, semantic }: ShapeOverlayProps) {
  const geo = useMemo(
    () => calcTriangleGeometry(levels, employees, fidelityRate),
    [levels, employees, fidelityRate]
  );

  const layerCounts = useMemo(
    () => employeesPerLayer(levels, employees),
    [levels, employees]
  );

  // Compute the normalized idealized widths (same total as layerCounts)
  const span = Math.pow(employees, 1 / levels);
  const idealWidths = useMemo(() => {
    const raw = Array.from({ length: levels }, (_, k) =>
      idealizedWidthAtLayer(k, levels, span)
    );
    const rawSum = raw.reduce((a, b) => a + b, 0);
    return rawSum > 0 ? raw.map((v) => (v / rawSum) * employees) : raw;
  }, [levels, employees, span]);

  const maxWidth = Math.max(...layerCounts, ...idealWidths);

  // Build SVG paths — layer 0 at bottom, L-1 at top
  // We draw from top (apex) to bottom (base) for each side

  // Idealized triangle: straight lines from apex to base corners
  const trianglePath = useMemo(() => {
    if (levels <= 1) return '';
    const topY = yPos(levels - 1, levels);
    const botY = yPos(0, levels);
    const botHW = halfW(idealWidths[0], maxWidth);
    return `M${CENTER_X},${topY} L${CENTER_X + botHW},${botY} L${CENTER_X - botHW},${botY} Z`;
  }, [levels, idealWidths, maxWidth]);

  // Actual org shape: smooth exponential curve
  // Build path with points at each layer, using quadratic curves for smoothness
  const actualPath = useMemo(() => {
    if (levels <= 1) return '';
    // Generate points from top (apex) down to bottom, right side
    const rightPts: { x: number; y: number }[] = [];
    const leftPts: { x: number; y: number }[] = [];

    // Add intermediate points for smooth curve (4x resolution)
    const steps = (levels - 1) * 4;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps; // 0 = top layer, 1 = bottom layer
      const layer = (levels - 1) * (1 - frac); // L-1 down to 0

      // Interpolate actual width at fractional layers
      const lowerIdx = Math.floor(layer);
      const upperIdx = Math.min(Math.ceil(layer), levels - 1);
      const t = layer - lowerIdx;
      const interpWidth = lowerIdx === upperIdx
        ? layerCounts[lowerIdx]
        : layerCounts[lowerIdx] * (1 - t) + layerCounts[upperIdx] * t;

      const y = PAD.top + frac * PLOT_H;
      const hw = halfW(interpWidth, maxWidth);
      rightPts.push({ x: CENTER_X + hw, y });
      leftPts.push({ x: CENTER_X - hw, y });
    }

    // Build path: right side down, then left side back up
    let d = `M${rightPts[0].x.toFixed(1)},${rightPts[0].y.toFixed(1)}`;
    for (let i = 1; i < rightPts.length; i++) {
      d += ` L${rightPts[i].x.toFixed(1)},${rightPts[i].y.toFixed(1)}`;
    }
    // Bottom connection
    d += ` L${leftPts[leftPts.length - 1].x.toFixed(1)},${leftPts[leftPts.length - 1].y.toFixed(1)}`;
    // Left side back up
    for (let i = leftPts.length - 2; i >= 0; i--) {
      d += ` L${leftPts[i].x.toFixed(1)},${leftPts[i].y.toFixed(1)}`;
    }
    d += ' Z';
    return d;
  }, [levels, layerCounts, maxWidth]);

  // Gap region paths (right side only, mirrored)
  // The gap is the area between the triangle edge and the actual curve
  const gapPath = useMemo(() => {
    if (levels <= 1) return '';
    const steps = (levels - 1) * 4;
    const outerPts: { x: number; y: number }[] = []; // whichever is wider
    const innerPts: { x: number; y: number }[] = []; // whichever is narrower

    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const layer = (levels - 1) * (1 - frac);

      // Ideal width (linear interpolation)
      const idealW = idealWidths[0] * (1 - frac); // Linear from base to 0

      // Actual width (exponential interpolation)
      const lowerIdx = Math.floor(layer);
      const upperIdx = Math.min(Math.ceil(layer), levels - 1);
      const t = layer - lowerIdx;
      const actualW = lowerIdx === upperIdx
        ? layerCounts[lowerIdx]
        : layerCounts[lowerIdx] * (1 - t) + layerCounts[upperIdx] * t;

      // Normalize both by same total for fair comparison
      const idealNorm = idealWidths.reduce((a, b) => a + b, 0);
      const actualNorm = layerCounts.reduce((a, b) => a + b, 0);
      const normIdealW = idealNorm > 0 ? (idealW / idealNorm) * employees : idealW;
      const normActualW = actualNorm > 0 ? (actualW / actualNorm) * employees : actualW;

      const y = PAD.top + frac * PLOT_H;
      const wider = Math.max(normIdealW, normActualW);
      const narrower = Math.min(normIdealW, normActualW);

      outerPts.push({ x: CENTER_X + halfW(wider, maxWidth), y });
      innerPts.push({ x: CENTER_X + halfW(narrower, maxWidth), y });
    }

    // Build gap path: outer edge down, inner edge back up (right side)
    let d = `M${outerPts[0].x.toFixed(1)},${outerPts[0].y.toFixed(1)}`;
    for (let i = 1; i < outerPts.length; i++) {
      d += ` L${outerPts[i].x.toFixed(1)},${outerPts[i].y.toFixed(1)}`;
    }
    for (let i = innerPts.length - 1; i >= 0; i--) {
      d += ` L${innerPts[i].x.toFixed(1)},${innerPts[i].y.toFixed(1)}`;
    }
    d += ' Z';

    // Mirror for left side
    const leftOuterPts = outerPts.map((p) => ({ x: 2 * CENTER_X - p.x, y: p.y }));
    const leftInnerPts = innerPts.map((p) => ({ x: 2 * CENTER_X - p.x, y: p.y }));

    let dLeft = ` M${leftOuterPts[0].x.toFixed(1)},${leftOuterPts[0].y.toFixed(1)}`;
    for (let i = 1; i < leftOuterPts.length; i++) {
      dLeft += ` L${leftOuterPts[i].x.toFixed(1)},${leftOuterPts[i].y.toFixed(1)}`;
    }
    for (let i = leftInnerPts.length - 1; i >= 0; i--) {
      dLeft += ` L${leftInnerPts[i].x.toFixed(1)},${leftInnerPts[i].y.toFixed(1)}`;
    }
    dLeft += ' Z';

    return d + dLeft;
  }, [levels, idealWidths, layerCounts, maxWidth, employees]);

  // Find layer of maximum gap for annotation
  const maxGapLayer = useMemo(() => {
    if (levels <= 2) return { layer: 0, gap: 0 };
    let maxGap = 0;
    let maxIdx = 0;
    for (let k = 0; k < levels; k++) {
      const gap = Math.abs(idealWidths[k] - layerCounts[k]);
      if (gap > maxGap) {
        maxGap = gap;
        maxIdx = k;
      }
    }
    return { layer: maxIdx, gap: maxGap };
  }, [levels, idealWidths, layerCounts]);

  // Fidelity color for each layer
  const layerFidelities = useMemo(
    () =>
      Array.from({ length: levels }, (_, k) => {
        // k=0 is bottom (100% fidelity), k=L-1 is top
        const relays = levels - 1 - k;
        return Math.pow(fidelityRate / 100, relays) * 100;
      }),
    [levels, fidelityRate]
  );

  // Centroid lines
  const idealCentroidY = yPos(levels - 1 - geo.centroidHeight, levels);
  const actualCentroidY = yPos(levels - 1 - geo.actualCentroidHeight, levels);

  if (levels <= 1) {
    return (
      <div className="w-full text-center py-12 text-sm text-slate-500">
        Single-level organizations have no hierarchical depth — no triangle to display.
      </div>
    );
  }

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Overlay comparing idealized triangle narrowing vs actual exponential organizational shape"
      >
        <defs>
          <linearGradient id="shape-actual-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="shape-gap-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        {/* Layer gridlines */}
        {Array.from({ length: levels }, (_, k) => {
          const y = yPos(k, levels);
          const fid = layerFidelities[k];
          return (
            <g key={`grid-${k}`}>
              <line
                x1={PAD.left}
                y1={y}
                x2={W - PAD.right}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth={0.5}
                strokeDasharray="4 4"
              />
              <text
                x={W - PAD.right + 6}
                y={y + 3.5}
                fontSize={9}
                className="font-mono"
                fill={fidelityColor(fid, semantic)}
              >
                {fid.toFixed(0)}%
              </text>
              <text
                x={PAD.left - 6}
                y={y + 3.5}
                textAnchor="end"
                fontSize={9}
                className="font-mono"
                fill="#94a3b8"
              >
                L{levels - 1 - k}
              </text>
            </g>
          );
        })}

        {/* Gap region — "hidden cost zone" */}
        <path
          d={gapPath}
          fill="url(#shape-gap-fill)"
          style={{
            animation: 'fade-in 0.8s ease-out 0.6s both',
          }}
        />

        {/* Idealized triangle — dashed outline */}
        <path
          d={trianglePath}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={1.5}
          strokeDasharray="8 4"
          strokeLinejoin="round"
          style={{
            animation: 'shape-draw 1s ease-out both',
          }}
        />

        {/* Actual org shape — filled exponential curve */}
        <path
          d={actualPath}
          fill="url(#shape-actual-fill)"
          stroke="#2563eb"
          strokeWidth={2}
          strokeLinejoin="round"
          style={{
            animation: 'horn-grow 0.8s ease-out 0.3s both',
          }}
        />

        {/* Layer fidelity dots on actual curve (right side) */}
        {layerCounts.map((count, k) => {
          const y = yPos(k, levels);
          const hw = halfW(count, maxWidth);
          const fid = layerFidelities[k];
          return (
            <circle
              key={`dot-${k}`}
              cx={CENTER_X + hw}
              cy={y}
              r={3.5}
              fill="white"
              stroke={fidelityColor(fid, semantic)}
              strokeWidth={2}
              style={{
                animation: 'fade-in 0.3s ease-out both',
                animationDelay: `${0.4 + k * 0.08}s`,
              }}
            />
          );
        })}

        {/* Centroid markers */}
        {/* Idealized centroid (h/3 from base) */}
        <line
          x1={PAD.left + 20}
          y1={idealCentroidY}
          x2={W - PAD.right - 20}
          y2={idealCentroidY}
          stroke="#94a3b8"
          strokeWidth={1}
          strokeDasharray="3 3"
          style={{ animation: 'fade-in 0.4s ease-out 1s both' }}
        />
        <text
          x={PAD.left + 22}
          y={idealCentroidY - 5}
          fontSize={8}
          fill="#94a3b8"
          style={{ animation: 'fade-in 0.4s ease-out 1s both' }}
        >
          Ideal centroid (h/3)
        </text>

        {/* Actual centroid line + center of mass dot */}
        <line
          x1={PAD.left + 20}
          y1={actualCentroidY}
          x2={W - PAD.right - 20}
          y2={actualCentroidY}
          stroke="#7c3aed"
          strokeWidth={1.5}
          style={{ animation: 'fade-in 0.4s ease-out 1.2s both' }}
        />
        <text
          x={PAD.left + 22}
          y={actualCentroidY - 5}
          fontSize={8}
          fill="#7c3aed"
          fontWeight="bold"
          style={{ animation: 'fade-in 0.4s ease-out 1.2s both' }}
        >
          Center of mass
        </text>

        {/* Center of mass dot — weighted position on the actual org shape */}
        <circle
          cx={CENTER_X}
          cy={actualCentroidY}
          r={7}
          fill="#7c3aed"
          opacity={0.9}
          style={{ animation: 'fade-in 0.5s ease-out 1.3s both' }}
        />
        <circle
          cx={CENTER_X}
          cy={actualCentroidY}
          r={12}
          fill="none"
          stroke="#7c3aed"
          strokeWidth={1.5}
          opacity={0.3}
          style={{ animation: 'fade-in 0.5s ease-out 1.4s both' }}
        />
        <circle
          cx={CENTER_X}
          cy={actualCentroidY}
          r={18}
          fill="none"
          stroke="#7c3aed"
          strokeWidth={1}
          opacity={0.15}
          style={{ animation: 'fade-in 0.5s ease-out 1.5s both' }}
        />

        {/* Max gap annotation */}
        {maxGapLayer.gap > 0 && levels > 2 && (
          <g style={{ animation: 'fade-in 0.4s ease-out 1.4s both' }}>
            <text
              x={CENTER_X + halfW(layerCounts[maxGapLayer.layer], maxWidth) + 16}
              y={yPos(maxGapLayer.layer, levels) + 4}
              fontSize={9}
              fill="#dc2626"
              fontWeight="bold"
            >
              Max gap
            </text>
          </g>
        )}

        {/* Legend */}
        <g style={{ animation: 'fade-in 0.4s ease-out 0.8s both' }}>
          <line x1={PAD.left} y1={H - 16} x2={PAD.left + 20} y2={H - 16} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="8 4" />
          <text x={PAD.left + 26} y={H - 12} fontSize={9} fill="#64748b">
            Idealized triangle (linear)
          </text>
          <line x1={PAD.left + 190} y1={H - 16} x2={PAD.left + 210} y2={H - 16} stroke="#2563eb" strokeWidth={2} />
          <text x={PAD.left + 216} y={H - 12} fontSize={9} fill="#64748b">
            Actual org shape (exponential)
          </text>
          <rect x={PAD.left + 400} y={H - 22} width={12} height={12} rx={2} fill="#dc2626" opacity={0.15} />
          <text x={PAD.left + 418} y={H - 12} fontSize={9} fill="#64748b">
            Shape gap
          </text>
        </g>

        {/* Axis labels */}
        <text
          x={PAD.left - 6}
          y={PAD.top - 10}
          fontSize={9}
          fill="#94a3b8"
          textAnchor="end"
        >
          CEO
        </text>
        <text
          x={PAD.left - 6}
          y={PAD.top + PLOT_H + 12}
          fontSize={9}
          fill="#94a3b8"
          textAnchor="end"
        >
          ICs
        </text>
      </svg>

      {/* Shape gap callout */}
      <div className="mt-3 text-center">
        <span className="text-xs text-slate-500">Shape Gap Index: </span>
        <span className="text-sm font-bold font-mono" style={{ color: geo.totalShapeGap > 0.15 ? '#dc2626' : geo.totalShapeGap > 0.05 ? '#d97706' : '#16a34a' }}>
          {(geo.totalShapeGap * 100).toFixed(1)}%
        </span>
        <span className="text-[10px] text-slate-400 ml-2">
          divergence between idealized triangle and actual org shape
        </span>
      </div>
    </div>
  );
}
