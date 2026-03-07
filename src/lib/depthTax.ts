import type { DepthTaxResult } from '../types';

// Model constants
const ALPHA = 0.005; // drift rate per layer per day
const LAMBDA = 0.008; // staleness decay constant
const K = 3; // days per layer for decision latency

export function calcDepthTax(
  levels: number,
  headcount: number,
  fidelityRate: number
): DepthTaxResult {
  const r = fidelityRate / 100;
  const L = levels;

  // Card 1: Signal Cost
  const signalFidelity = Math.pow(r, L - 1) * 100;
  const roundTripFidelity = Math.pow(r, 2 * (L - 1)) * 100;

  // Card 2: Drift Cost
  const driftHalfLife =
    L > 1 ? Math.LN2 / (ALPHA * (L - 1)) : Infinity;
  const ninetyDayAccuracy = Math.exp(-ALPHA * (L - 1) * 90) * 100;

  // Card 3: Decision Cost
  const decisionLatency = L * K;
  const decisionQuality =
    Math.pow(r, L - 1) * Math.exp(-LAMBDA * L * K);
  const flatQuality = r * Math.exp(-LAMBDA * 2 * K);
  const wasteMultiplier =
    flatQuality < 1 ? (1 - decisionQuality) / (1 - flatQuality) : 1;

  // Context
  const decisionsPerMonth = 5 * Math.pow(headcount, 0.6);

  return {
    levels,
    headcount,
    fidelityRate,
    signalFidelity,
    roundTripFidelity,
    driftHalfLife,
    ninetyDayAccuracy,
    decisionQuality,
    flatQuality,
    wasteMultiplier,
    decisionLatency,
    decisionsPerMonth,
  };
}
