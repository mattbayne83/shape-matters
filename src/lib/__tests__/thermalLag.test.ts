import { describe, it, expect } from 'vitest';
import {
  calcPropagationDelay,
  calcMarginalLayerCost,
  calcLagRatio,
  calcLayerDelays,
  calcThermalLag,
  calcLStar,
  calcNyquistStability,
} from '../thermalLag';

describe('calcPropagationDelay', () => {
  describe('standard case (6 levels, 3 days/layer)', () => {
    it('returns quadratic delay: d × (L-1)²', () => {
      expect(calcPropagationDelay(6, 3)).toBe(75);
    });
  });

  describe('edge cases', () => {
    it('1 level = 0 delay (no relays)', () => {
      expect(calcPropagationDelay(1, 3)).toBe(0);
    });

    it('2 levels = d × 1 = d', () => {
      expect(calcPropagationDelay(2, 3)).toBe(3);
    });

    it('14 levels, 1 day/layer = 169', () => {
      expect(calcPropagationDelay(14, 1)).toBe(169);
    });

    it('fractional cycle: 6 levels, 1.5 days/layer', () => {
      expect(calcPropagationDelay(6, 1.5)).toBe(37.5);
    });
  });
});

describe('calcMarginalLayerCost', () => {
  it('6 levels, 3 days: removing deepest saves 27 days', () => {
    expect(calcMarginalLayerCost(6, 3)).toBe(27);
  });

  it('4 levels, 3 days: removing deepest saves 15 days', () => {
    expect(calcMarginalLayerCost(4, 3)).toBe(15);
  });

  it('2 levels: removing deepest saves d days', () => {
    expect(calcMarginalLayerCost(2, 3)).toBe(3);
  });

  it('1 level: no layer to remove, returns 0', () => {
    expect(calcMarginalLayerCost(1, 3)).toBe(0);
  });
});

describe('calcLagRatio', () => {
  it('6 levels: ratio = L-1 = 5', () => {
    expect(calcLagRatio(6)).toBe(5);
  });

  it('2 levels: ratio = 1', () => {
    expect(calcLagRatio(2)).toBe(1);
  });

  it('1 level: ratio = 0 (no delay)', () => {
    expect(calcLagRatio(1)).toBe(0);
  });
});

describe('calcLayerDelays', () => {
  it('returns correct number of entries (L layers)', () => {
    const delays = calcLayerDelays(6, 3);
    expect(delays).toHaveLength(6);
  });

  it('first layer (CEO) has 0 cumulative delay', () => {
    const delays = calcLayerDelays(6, 3);
    expect(delays[0].cumulativeDelay).toBe(0);
    expect(delays[0].layer).toBe(0);
  });

  it('each layer has correct cumulative delay: d × k²', () => {
    const delays = calcLayerDelays(6, 3);
    expect(delays[0].cumulativeDelay).toBe(0);
    expect(delays[1].cumulativeDelay).toBe(3);
    expect(delays[2].cumulativeDelay).toBe(12);
    expect(delays[3].cumulativeDelay).toBe(27);
    expect(delays[4].cumulativeDelay).toBe(48);
    expect(delays[5].cumulativeDelay).toBe(75);
  });

  it('marginal delay accelerates (quadratic gap)', () => {
    const delays = calcLayerDelays(6, 3);
    expect(delays[1].marginalDelay).toBe(3);
    expect(delays[2].marginalDelay).toBe(9);
    expect(delays[3].marginalDelay).toBe(15);
    expect(delays[4].marginalDelay).toBe(21);
    expect(delays[5].marginalDelay).toBe(27);
  });

  it('assigns role labels', () => {
    const delays = calcLayerDelays(6, 3);
    expect(delays[0].role).toBe('CEO');
    expect(delays[delays.length - 1].role).toBe('Front Line');
  });

  it('1 level: returns single entry with 0 delay', () => {
    const delays = calcLayerDelays(1, 3);
    expect(delays).toHaveLength(1);
    expect(delays[0].cumulativeDelay).toBe(0);
  });
});

// ── Cycle 12 H2: Nyquist ceiling ─────────────────────────────────────
describe('calcLStar and calcNyquistStability — Nyquist ceiling (Cycle 12 H2)', () => {
  it('calcLStar(3, 90) ≈ 3.739 (d=3, quarterly cadence)', () => {
    expect(calcLStar(3, 90)).toBeCloseTo(3.739, 2);
  });

  it('propagation-delay invariant: totalDelay(round(L*), d) ≈ T/4', () => {
    // By construction, τ = d·(L−1)² equals T/4 exactly at L = L*(d, T).
    // With integer rounding of L*, the invariant holds within ~one (2L−3)·d
    // step — loose here because the tolerance depends on where L* falls.
    const cases: Array<[number, number]> = [
      [3, 90],
      [1, 90],
      [3, 365],
    ];
    for (const [d, T] of cases) {
      const lStarFloat = calcLStar(d, T);
      const L = Math.round(lStarFloat);
      const delay = calcThermalLag(L, d).totalDelay;
      const target = T / 4;
      // Rounding step: max jump from rounding L by 0.5 is about (2·lStarFloat − 2)·d.
      const tolerance = d * Math.max(1, 2 * lStarFloat - 1);
      expect(Math.abs(delay - target)).toBeLessThanOrEqual(tolerance);
    }
  });

  it('monotone in d: deeper per-layer cycle lowers the ceiling at fixed T', () => {
    const T = 90;
    let prev = Infinity;
    for (const d of [1, 2, 3, 4, 5]) {
      const curr = calcLStar(d, T);
      expect(curr).toBeLessThan(prev);
      prev = curr;
    }
  });

  it('monotone in T: longer cadence raises the ceiling at fixed d', () => {
    const d = 3;
    let prev = -Infinity;
    for (const T of [7, 30, 90, 365]) {
      const curr = calcLStar(d, T);
      expect(curr).toBeGreaterThan(prev);
      prev = curr;
    }
  });

  it('band = "stable" for Nucor-ish params (L=3, d=3, T=90)', () => {
    // L*(3, 90) ≈ 3.739 → margin = 3 − 3.739 < 0 → stable
    expect(calcNyquistStability(3, 3, 90).band).toBe('stable');
  });

  it('band = "oscillatory" for Amazon-ish params (L=9, d=3, T=90)', () => {
    // L*(3, 90) ≈ 3.739 → margin = 9 − 3.739 ≈ 5.26 → oscillatory (> 1)
    const r = calcNyquistStability(9, 3, 90);
    expect(r.band).toBe('oscillatory');
    expect(r.margin).toBeGreaterThan(1);
  });

  it('band thresholds are inclusive at boundaries', () => {
    // Construct an exact-boundary case by inverting L* for chosen (d, T).
    // With d = 1, T = 16: L* = 1 + √(16/4) = 3 → L=3 has margin=0 → stable.
    expect(calcNyquistStability(3, 1, 16).band).toBe('stable');
    // L=4 gives margin=1 → thin (still ≤ 1).
    expect(calcNyquistStability(4, 1, 16).band).toBe('thin');
    // L=5 gives margin=2 → oscillatory.
    expect(calcNyquistStability(5, 1, 16).band).toBe('oscillatory');
  });
});
