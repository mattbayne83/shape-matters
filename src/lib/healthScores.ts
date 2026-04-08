import type { HealthScore } from '../types';

const LAG_TAU = 100;

const LAG_LABELS: [number, string][] = [
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

function lookupBand(score: number, bands: [number, string][]): string {
  for (const [threshold, value] of bands) {
    if (score >= threshold) return value;
  }
  return bands[bands.length - 1][1];
}

export function healthBandColor(score: number): string {
  return lookupBand(Math.round(score), BAND_COLORS);
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

