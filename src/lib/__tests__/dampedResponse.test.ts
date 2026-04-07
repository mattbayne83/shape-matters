import { describe, it, expect } from 'vitest';
import {
  calcDampingRatio,
  calcNaturalFrequency,
  calcOvershoot,
  calcSettlingTimeWeeks,
  calcStepResponse,
  classifyRegime,
} from '../dampedResponse';

describe('calcDampingRatio', () => {
  it('standard case: L=6, H=5000, A=55 → ζ ≈ 0.63', () => {
    expect(calcDampingRatio(6, 5000, 55)).toBeCloseTo(0.63, 1);
  });

  it('flat org: L=2, H=500, A=80 → under-damped', () => {
    const zeta = calcDampingRatio(2, 500, 80);
    expect(zeta).toBeLessThan(1);
  });

  it('deep org: L=12, H=100000, A=30 → over-damped', () => {
    const zeta = calcDampingRatio(12, 100000, 30);
    expect(zeta).toBeGreaterThan(1);
  });

  it('higher agility → lower damping ratio', () => {
    const zetaLow = calcDampingRatio(6, 5000, 30);
    const zetaHigh = calcDampingRatio(6, 5000, 80);
    expect(zetaHigh).toBeLessThan(zetaLow);
  });

  it('more levels → higher damping ratio', () => {
    const zetaShallow = calcDampingRatio(3, 5000, 55);
    const zetaDeep = calcDampingRatio(9, 5000, 55);
    expect(zetaDeep).toBeGreaterThan(zetaShallow);
  });
});

describe('calcNaturalFrequency', () => {
  it('standard case: H=5000, A=55', () => {
    expect(calcNaturalFrequency(5000, 55)).toBeCloseTo(1.049, 2);
  });

  it('higher agility → higher frequency', () => {
    const f1 = calcNaturalFrequency(5000, 30);
    const f2 = calcNaturalFrequency(5000, 80);
    expect(f2).toBeGreaterThan(f1);
  });
});

describe('calcOvershoot', () => {
  it('under-damped (ζ=0.3) → significant overshoot', () => {
    expect(calcOvershoot(0.3)).toBeCloseTo(37.2, 0);
  });

  it('under-damped (ζ=0.63) → ~7.8% overshoot', () => {
    const os = calcOvershoot(0.63);
    expect(os).toBeCloseTo(7.8, 0);
  });

  it('critically damped (ζ=1.0) → 0% overshoot', () => {
    expect(calcOvershoot(1.0)).toBe(0);
  });

  it('over-damped (ζ=2.0) → 0% overshoot', () => {
    expect(calcOvershoot(2.0)).toBe(0);
  });
});

describe('calcSettlingTimeWeeks', () => {
  it('standard case produces weeks in realistic range', () => {
    const weeks = calcSettlingTimeWeeks(6, 5000, 55);
    expect(weeks).toBeGreaterThan(4);
    expect(weeks).toBeLessThan(52);
  });

  it('deeper org → longer settling time', () => {
    const shallow = calcSettlingTimeWeeks(3, 5000, 55);
    const deep = calcSettlingTimeWeeks(9, 5000, 55);
    expect(deep).toBeGreaterThan(shallow);
  });
});

describe('calcStepResponse', () => {
  it('starts at 0 (t=0)', () => {
    expect(calcStepResponse(0, 0.63, 1.0)).toBeCloseTo(0, 2);
  });

  it('converges to 1.0 for large t (under-damped)', () => {
    expect(calcStepResponse(50, 0.63, 1.0)).toBeCloseTo(1.0, 1);
  });

  it('converges to 1.0 for large t (over-damped)', () => {
    expect(calcStepResponse(50, 2.0, 1.0)).toBeCloseTo(1.0, 1);
  });

  it('converges to 1.0 for large t (critically damped)', () => {
    expect(calcStepResponse(50, 1.0, 1.0)).toBeCloseTo(1.0, 1);
  });

  it('under-damped overshoots past 1.0', () => {
    const values = Array.from({ length: 100 }, (_, i) =>
      calcStepResponse(i * 0.1, 0.3, 1.0)
    );
    expect(Math.max(...values)).toBeGreaterThan(1.0);
  });

  it('over-damped never exceeds 1.0', () => {
    const values = Array.from({ length: 100 }, (_, i) =>
      calcStepResponse(i * 0.1, 2.0, 1.0)
    );
    expect(Math.max(...values)).toBeLessThanOrEqual(1.001);
  });
});

describe('classifyRegime', () => {
  it('ζ < 0.7 → under-damped', () => {
    expect(classifyRegime(0.5).regime).toBe('under-damped');
    expect(classifyRegime(0.5).regimeLabel).toBe('Too Fast');
  });

  it('0.7 ≤ ζ ≤ 1.3 → critically-damped', () => {
    expect(classifyRegime(0.8).regime).toBe('critically-damped');
    expect(classifyRegime(1.0).regime).toBe('critically-damped');
    expect(classifyRegime(1.3).regime).toBe('critically-damped');
    expect(classifyRegime(1.0).regimeLabel).toBe('Right-Sized');
  });

  it('ζ > 1.3 → over-damped', () => {
    expect(classifyRegime(1.5).regime).toBe('over-damped');
    expect(classifyRegime(1.5).regimeLabel).toBe('Too Slow');
  });
});
