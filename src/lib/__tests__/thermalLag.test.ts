import { describe, it, expect } from 'vitest';
import {
  calcPropagationDelay,
  calcMarginalLayerCost,
  calcLagRatio,
  calcLayerDelays,
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
