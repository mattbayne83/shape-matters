import type { DampedResponseResult, ResponseRegime } from '../types';

// Calibrated so that calcDampingRatio(6, 5000, 55) ≈ 0.63.
// Using sqrt(headcount) as a proxy for organizational inertia: larger orgs are harder to move,
// and the sqrt prevents runaway scaling across the 500–100k headcount range.
const DAMPING_PER_LAYER = 0.01634;
const TIME_SCALE_WEEKS = 3.5;

/**
 * Models the organization as a spring-mass-damper system.
 * zeta = (levels × DPL × √headcount) / (2k), where k = culturalAgility / 10.
 * Larger orgs (high H) and deeper orgs (high L) both increase damping.
 * Higher agility (higher k) reduces damping — the org "springs back" faster.
 */
export function calcDampingRatio(
  levels: number,
  headcount: number,
  culturalAgility: number,
): number {
  const k = culturalAgility / 10;
  const c = levels * DAMPING_PER_LAYER * Math.sqrt(headcount);
  return c / (2 * k);
}

/** ω₀ = √(k/m), where m = headcount/1000, k = culturalAgility/10. */
export function calcNaturalFrequency(headcount: number, culturalAgility: number): number {
  const m = headcount / 1000;
  const k = culturalAgility / 10;
  return Math.sqrt(k / m);
}

/** Standard second-order overshoot: 100·exp(−πζ/√(1−ζ²)). Returns 0 when ζ ≥ 1. */
export function calcOvershoot(zeta: number): number {
  if (zeta >= 1) return 0;
  return Math.exp(-Math.PI * zeta / Math.sqrt(1 - zeta * zeta)) * 100;
}

/**
 * Settling time uses the energy-based formulation: ts = (4ζ/ω₀) × TIME_SCALE.
 * This ensures more organizational layers → longer settling, because more layers → higher ζ.
 */
export function calcSettlingTimeWeeks(
  levels: number,
  headcount: number,
  culturalAgility: number,
): number {
  const zeta = calcDampingRatio(levels, headcount, culturalAgility);
  const omega0 = calcNaturalFrequency(headcount, culturalAgility);
  return (4 * zeta / omega0) * TIME_SCALE_WEEKS;
}

/** Second-order step response, covering all three damping regimes. */
export function calcStepResponse(t: number, zeta: number, omega0: number): number {
  if (t <= 0) return 0;

  if (Math.abs(zeta - 1) < 0.01) {
    // Critically damped: y(t) = 1 − (1 + ω₀t)·e^(−ω₀t)
    return 1 - (1 + omega0 * t) * Math.exp(-omega0 * t);
  }

  if (zeta < 1) {
    // Under-damped: oscillates around 1 before settling
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    const phi = Math.acos(zeta);
    return 1 - (Math.exp(-zeta * omega0 * t) / Math.sqrt(1 - zeta * zeta))
      * Math.sin(omegaD * t + phi);
  }

  // Over-damped: slow monotone approach to 1
  const sqrtTerm = Math.sqrt(zeta * zeta - 1);
  const s1 = (-zeta + sqrtTerm) * omega0;
  const s2 = (-zeta - sqrtTerm) * omega0;
  const c1 = (zeta + sqrtTerm) / (2 * sqrtTerm);
  const c2 = -(zeta - sqrtTerm) / (2 * sqrtTerm);
  return 1 - c1 * Math.exp(s1 * t) - c2 * Math.exp(s2 * t);
}

export function classifyRegime(zeta: number): { regime: ResponseRegime; regimeLabel: string } {
  if (zeta < 0.7) return { regime: 'under-damped', regimeLabel: 'Too Fast' };
  if (zeta <= 1.3) return { regime: 'critically-damped', regimeLabel: 'Right-Sized' };
  return { regime: 'over-damped', regimeLabel: 'Too Slow' };
}

export function calcDampedResponse(
  levels: number,
  headcount: number,
  culturalAgility: number,
): DampedResponseResult {
  const zeta = calcDampingRatio(levels, headcount, culturalAgility);
  const omega0 = calcNaturalFrequency(headcount, culturalAgility);
  const { regime, regimeLabel } = classifyRegime(zeta);

  return {
    dampingRatio: zeta,
    naturalFrequency: omega0,
    overshootPct: calcOvershoot(zeta),
    settlingTimeWeeks: calcSettlingTimeWeeks(levels, headcount, culturalAgility),
    regime,
    regimeLabel,
  };
}
