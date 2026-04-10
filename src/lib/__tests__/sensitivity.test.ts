import { describe, it, expect } from 'vitest';
import {
  computeScores,
  calcLeverSensitivity,
  calcAllLeverSensitivities,
  findBindingPillar,
  calcExchangeRates,
  type SensitivityState,
} from '../sensitivity';

const AMAZON: SensitivityState = {
  levels: 9,
  headcount: 1556000,
  fidelityRate: 82,
  decisionCycle: 3,
  dci: 72,
  teamDecisionMix: 70,
};

const VALVE: SensitivityState = {
  levels: 1,
  headcount: 350,
  fidelityRate: 98, // UI slider max
  decisionCycle: 1.5,
  dci: 92,
  teamDecisionMix: 0,
};

const META: SensitivityState = {
  levels: 6,
  headcount: 74067,
  fidelityRate: 82,
  decisionCycle: 2.5,
  dci: 35, // Cycle 12 H10 recalibration (was 28)
  teamDecisionMix: 30,
};

describe('computeScores', () => {
  it('returns all three pillars + composite', () => {
    const s = computeScores(AMAZON);
    expect(s.fidelity).toBeGreaterThanOrEqual(0);
    expect(s.fidelity).toBeLessThanOrEqual(100);
    expect(s.lag).toBeGreaterThanOrEqual(0);
    expect(s.lag).toBeLessThanOrEqual(100);
    expect(s.autonomy).toBeGreaterThanOrEqual(0);
    expect(s.autonomy).toBeLessThanOrEqual(100);
    expect(s.composite).toBeCloseTo((s.fidelity + s.lag + s.autonomy) / 3, 10);
  });

  it('Valve scores high across the board (flat, high-DCI)', () => {
    const s = computeScores(VALVE);
    expect(s.composite).toBeGreaterThan(80);
  });
});

describe('calcLeverSensitivity', () => {
  it('+1 fidelityRate improves composite at Amazon', () => {
    const result = calcLeverSensitivity(AMAZON, 'fidelityRate');
    expect(result.dComposite).toBeGreaterThan(0);
    expect(result.atCap).toBe(false);
  });

  it('decisionCycle sensitivity is stored as "positive = better" (we measure −1 day)', () => {
    const result = calcLeverSensitivity(AMAZON, 'decisionCycle');
    expect(result.dComposite).toBeGreaterThan(0);
  });

  it('flags a capped lever when at its UI maximum (fidelityRate=98)', () => {
    const state = { ...AMAZON, fidelityRate: 98 };
    const result = calcLeverSensitivity(state, 'fidelityRate');
    expect(result.atCap).toBe(true);
    expect(result.dComposite).toBe(0);
  });

  it('flags a capped lever when decisionCycle is at UI minimum (1 day)', () => {
    const state = { ...AMAZON, decisionCycle: 1 };
    const result = calcLeverSensitivity(state, 'decisionCycle');
    expect(result.atCap).toBe(true);
  });
});

describe('calcAllLeverSensitivities', () => {
  it('returns all four levers in deterministic order', () => {
    const results = calcAllLeverSensitivities(AMAZON);
    expect(results.map((r) => r.lever)).toEqual([
      'fidelityRate',
      'decisionCycle',
      'dci',
      'teamDecisionMix',
    ]);
  });
});

describe('findBindingPillar', () => {
  it('identifies the lowest pillar as binding', () => {
    const result = findBindingPillar(META);
    const scores = computeScores(META);
    const min = Math.min(scores.fidelity, scores.lag, scores.autonomy);
    expect(result.score).toBeCloseTo(min, 5);
  });

  it('flags all-tied when pillar spread is under 10 points', () => {
    // Contrived: L=1, high fidelity, short cycle, DCI=100 — all pillars near ceiling
    const tied: SensitivityState = {
      levels: 1,
      headcount: 100,
      fidelityRate: 98,
      decisionCycle: 1,
      dci: 100,
      teamDecisionMix: 0,
    };
    const result = findBindingPillar(tied);
    expect(result.allTied).toBe(true);
  });

  it('treats Valve as balanced — 8-point autonomy gap is below the 10pt threshold', () => {
    // Valve fidelity/lag ≈ 100, autonomy ≈ 92 — 8pt gap is noise, not a bottleneck
    const result = findBindingPillar(VALVE);
    expect(result.allTied).toBe(true);
  });

  it('does NOT flag all-tied for Meta (binding case, autonomy pillar)', () => {
    // After the Cycle 12 H10 DCI recalibration (28 → 35), Meta's blended
    // autonomy lifts from ~25 to ~32 at mix=30. Spread across the three
    // pillars is still well above 10 points, binding pillar is still autonomy.
    const result = findBindingPillar(META);
    expect(result.allTied).toBe(false);
    expect(result.pillar).toBe('autonomy');
  });

  it('topLever is one of the four known levers', () => {
    const result = findBindingPillar(META);
    expect(['fidelityRate', 'decisionCycle', 'dci', 'teamDecisionMix']).toContain(result.topLever);
  });

  it('topLever is the highest-impact lever across all four', () => {
    const result = findBindingPillar(META);
    const all = calcAllLeverSensitivities(META);
    const maxImpact = Math.max(...all.map((s) => Math.abs(s.dComposite)));
    expect(Math.abs(result.topLeverImpact)).toBeCloseTo(maxImpact, 10);
  });

  it('computes a non-negative multiplier', () => {
    const result = findBindingPillar(META);
    expect(result.multiplier).toBeGreaterThanOrEqual(0);
  });
});

describe('calcExchangeRates', () => {
  it('returns the three documented pairs', () => {
    const rates = calcExchangeRates(AMAZON);
    const pairs = rates.map((r) => `${r.from}:${r.to}`);
    expect(pairs).toContain('fidelityRate:teamDecisionMix');
    expect(pairs).toContain('fidelityRate:dci');
    expect(pairs).toContain('decisionCycle:teamDecisionMix');
  });

  it('produces at least one finite positive ratio for a mid-range org', () => {
    // Google — L=8, DCI=58 (below the team-autonomy cap), mix=50: all levers active
    const GOOGLE: SensitivityState = {
      levels: 8,
      headcount: 183323,
      fidelityRate: 82,
      decisionCycle: 3.5,
      dci: 58,
      teamDecisionMix: 50,
    };
    const rates = calcExchangeRates(GOOGLE);
    const finite = rates.filter((r) => isFinite(r.ratio) && r.ratio > 0);
    expect(finite.length).toBeGreaterThan(0);
  });

  it('returns Infinity when a pair-target lever is inert (e.g. saturated team autonomy)', () => {
    // Amazon at mix=70, DCI=72: team-path autonomy saturates at 100, so the
    // DCI lever's composite impact is ~0 and any `*:dci` ratio is Infinity.
    // This is genuine model behavior — Cycle 6 H2 calls this "governance-locked"
    // when it's Meta; at Amazon it's the routing substitution at work.
    const rates = calcExchangeRates(AMAZON);
    const toDci = rates.find((r) => r.to === 'dci');
    expect(toDci?.ratio).toBe(Infinity);
  });

  it('returns Infinity when the `to` lever is capped (division by zero)', () => {
    const cappedFidelityState = { ...AMAZON, fidelityRate: 100 };
    const rates = calcExchangeRates(cappedFidelityState);
    const fidelityToMix = rates.find((r) => r.from === 'fidelityRate');
    expect(fidelityToMix?.ratio).toBe(0); // capped `from` → ratio=0
  });
});
