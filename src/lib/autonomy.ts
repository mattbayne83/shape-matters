import type { AutonomyResult } from '../types';
import { healthBandColor } from './healthScores';

const AUTONOMY_LABELS: [number, string][] = [
  [85, 'Live'],
  [65, 'Fresh'],
  [40, 'Aging'],
  [20, 'Stale'],
  [0, 'Expired'],
];

function lookupLabel(score: number): string {
  for (const [threshold, label] of AUTONOMY_LABELS) {
    if (score >= threshold) return label;
  }
  return AUTONOMY_LABELS[AUTONOMY_LABELS.length - 1][1];
}

/**
 * Autonomy score: min(DCI × log(3)/log(L), 100)
 * Depth discounts autonomy — more layers = more coordination overhead eroding authority.
 * At L=3: identity (score = DCI). At L=9: score = DCI × 0.5.
 */
export function calcAutonomyScore(dci: number, levels: number): AutonomyResult {
  const depthDiscount = levels <= 1 ? 1 : Math.log(3) / Math.log(levels);
  const raw = dci * depthDiscount;
  const score = Math.round(Math.min(raw, 100));
  const crossoverFloor = depthDiscount > 0 ? 50 / depthDiscount : 100;

  return {
    score,
    depthDiscount,
    crossoverFloor,
    label: lookupLabel(score),
    color: healthBandColor(score),
  };
}
