import type { HealthScore } from '../types';

const LAG_TAU = 100;

/** Band labels in descending order of health (best → worst). */
export type Band = 'Live' | 'Fresh' | 'Aging' | 'Stale' | 'Expired';

/** Rank: 4 = Live (best) → 0 = Expired (worst). Used for theorem assertions. */
export const BAND_RANK: Record<Band, number> = {
  Live: 4,
  Fresh: 3,
  Aging: 2,
  Stale: 1,
  Expired: 0,
};

const LAG_LABELS: [number, Band][] = [
  [85, 'Live'],
  [65, 'Fresh'],
  [40, 'Aging'],
  [20, 'Stale'],
  [0, 'Expired'],
];

const BAND_COLORS: [number, string][] = [
  [85, '#44403c'],
  [65, '#a8967a'],
  [40, '#F4A261'],
  [20, '#E05A1B'],
  [0, '#dc2626'],
];

function lookupBand<T>(score: number, bands: [number, T][]): T {
  for (const [threshold, value] of bands) {
    if (score >= threshold) return value;
  }
  return bands[bands.length - 1][1];
}

export function healthBandColor(score: number): string {
  return lookupBand(Math.round(score), BAND_COLORS);
}

/**
 * Map any 0-100 score to its band label. Used by sensitivity.ts for the
 * band-flip test (`scoreBand(min) !== scoreBand(mean)`).
 *
 * See Cycle 9 H4: `band(min) ≤ band(mean)` is provable via AM-min + band
 * monotonicity. 10,000-triple Monte Carlo confirmed 0 upflips.
 */
export function scoreBand(score: number): Band {
  return lookupBand(Math.round(score), LAG_LABELS);
}

export function calcLagHealth(totalDelay: number): HealthScore {
  const clampedDelay = Math.max(0, totalDelay);
  const raw = 100 * Math.exp(-clampedDelay / LAG_TAU);
  const score = Math.round(raw);
  return {
    score,
    label: lookupBand(score, LAG_LABELS),
    color: healthBandColor(score),
  };
}

