import type {
  ThermalLagResult,
  LayerDelay,
  NyquistStability,
  NyquistStabilityBand,
} from '../types';

const ROLE_LABELS = [
  'CEO', 'SVP', 'VP', 'Director', 'Sr. Manager', 'Manager',
  'Team Lead', 'Sr. IC', 'IC', 'Associate', 'Analyst',
  'Coordinator', 'Specialist', 'Assistant', 'Front Line',
];

function roleForLayer(layer: number, totalLevels: number): string {
  if (layer === 0) return 'CEO';
  if (layer === totalLevels - 1) return 'Front Line';
  const midLabels = ROLE_LABELS.slice(1, -1);
  const idx = Math.round((layer - 1) / Math.max(1, totalLevels - 3) * (midLabels.length - 1));
  return midLabels[Math.min(idx, midLabels.length - 1)];
}

export function calcPropagationDelay(levels: number, decisionCycle: number): number {
  const relays = levels - 1;
  return decisionCycle * relays * relays;
}

export function calcMarginalLayerCost(levels: number, decisionCycle: number): number {
  if (levels <= 1) return 0;
  const relays = levels - 1;
  return decisionCycle * (2 * relays - 1);
}

export function calcLagRatio(levels: number): number {
  return Math.max(0, levels - 1);
}

export function calcLayerDelays(levels: number, decisionCycle: number): LayerDelay[] {
  return Array.from({ length: levels }, (_, k) => ({
    layer: k,
    role: roleForLayer(k, levels),
    cumulativeDelay: decisionCycle * k * k,
    marginalDelay: k === 0 ? 0 : decisionCycle * (2 * k - 1),
  }));
}

/**
 * Analytic Nyquist phase-margin critical depth:
 *
 *   L*(d, T) = 1 + √(T / (4d))
 *
 * Derived by treating the org as a closed-loop controller with natural
 * period `T` (strategic cadence, days) and feedback delay `τ = d·(L−1)²`
 * from the Fourier-conduction propagation model. The stability crossover
 * `τ = T/4` (one-quarter-period phase margin) yields the closed form above.
 *
 * Above `L*`, strategic feedback arrives out of phase with cadence and the
 * loop becomes oscillatory ("policy whiplash"). Below `L*`, the loop is
 * phase-stable.
 *
 * Cycle 12 H2 first-landed analytic formula — see `evals/journal/cycle-012.md`.
 *
 * @param d - per-layer decision cycle (days/layer). Must be > 0.
 * @param T - strategic cadence period (days). Must be ≥ 0.
 */
export function calcLStar(d: number, T: number): number {
  return 1 + Math.sqrt(T / (4 * d));
}

/**
 * Classify an org's position relative to its Nyquist ceiling.
 *
 * Returns the analytic `lStar`, the depth margin `L − lStar`, and a
 * three-band classification:
 *   - `stable`      — margin ≤ 0 (depth at or below the ceiling)
 *   - `thin`        — 0 < margin ≤ 1 (one layer of slack burned)
 *   - `oscillatory` — margin > 1 (phase-margin collapse)
 *
 * Thresholds are inclusive at the upper bound of `stable`/`thin`. See
 * `calcLStar` for the underlying derivation.
 *
 * Cycle 12 H2 — `evals/journal/cycle-012.md`.
 */
export function calcNyquistStability(
  L: number,
  d: number,
  T: number,
): NyquistStability {
  const lStar = calcLStar(d, T);
  const margin = L - lStar;
  let band: NyquistStabilityBand;
  if (margin <= 0) band = 'stable';
  else if (margin <= 1) band = 'thin';
  else band = 'oscillatory';
  return { lStar, margin, band };
}

export function calcThermalLag(levels: number, decisionCycle: number): ThermalLagResult {
  return {
    totalDelay: calcPropagationDelay(levels, decisionCycle),
    marginalLayerCost: calcMarginalLayerCost(levels, decisionCycle),
    lagRatio: calcLagRatio(levels),
    layerDelays: calcLayerDelays(levels, decisionCycle),
  };
}
