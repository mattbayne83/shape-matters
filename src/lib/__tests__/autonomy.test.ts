import { describe, it, expect } from 'vitest';
import { calcAutonomyScore } from '../autonomy';

describe('calcAutonomyScore', () => {
  it('returns score = DCI directly at L=3 (depth discount 1.0)', () => {
    const result = calcAutonomyScore(60, 3);
    expect(result.score).toBe(60);
    expect(result.depthDiscount).toBeCloseTo(1.0, 2);
  });

  it('discounts DCI at L=9 (depth discount 0.5)', () => {
    const result = calcAutonomyScore(40, 9);
    expect(result.score).toBe(20);
    expect(result.depthDiscount).toBeCloseTo(0.5, 2);
  });

  it('caps score at 100', () => {
    const result = calcAutonomyScore(100, 2);
    expect(result.score).toBe(100);
  });

  it('validates Finding 15: Amazon (L=9, DCI=40) beats Meta (L=6, DCI=28)', () => {
    const amazon = calcAutonomyScore(40, 9);
    const meta = calcAutonomyScore(28, 6);
    expect(amazon.score).toBeGreaterThan(meta.score);
  });

  it('returns correct crossover floor', () => {
    // At L=9, discount=0.5, floor = 50/0.5 = 100
    const result = calcAutonomyScore(40, 9);
    expect(result.crossoverFloor).toBeCloseTo(100, 0);
  });

  it('handles L=1 edge case (no hierarchy, full autonomy)', () => {
    const result = calcAutonomyScore(50, 1);
    expect(result.score).toBe(50);
    expect(result.depthDiscount).toBe(1);
  });

  it('handles DCI=0 (fully CEO-centric)', () => {
    const result = calcAutonomyScore(0, 6);
    expect(result.score).toBe(0);
  });

  it('handles DCI=100 (fully IC-empowered)', () => {
    const result = calcAutonomyScore(100, 3);
    expect(result.score).toBe(100);
  });

  it('returns correct health label and color', () => {
    const high = calcAutonomyScore(88, 3);
    expect(high.label).toBe('Live');

    const low = calcAutonomyScore(10, 3);
    expect(low.label).toBe('Expired');
  });

  it('produces correct reference company ranking', () => {
    const haier = calcAutonomyScore(88, 3);     // 88 × 1.0 = 88
    const nucor = calcAutonomyScore(82, 4);     // 82 × 0.79 = 65
    const google = calcAutonomyScore(58, 8);    // 58 × 0.53 = 31
    const amazon = calcAutonomyScore(40, 9);    // 40 × 0.5 = 20
    const meta = calcAutonomyScore(28, 6);      // 28 × 0.61 = 17
    const oneok = calcAutonomyScore(22, 6);     // 22 × 0.61 = 13

    expect(oneok.score).toBeLessThan(meta.score);
    expect(meta.score).toBeLessThan(amazon.score);
    expect(amazon.score).toBeLessThan(google.score);
    expect(google.score).toBeLessThan(nucor.score);
    expect(nucor.score).toBeLessThan(haier.score);
  });

  it('deep orgs pay a real penalty even with moderate DCI', () => {
    // L=9, DCI=43 should NOT score high (was 86 with old formula)
    const deep = calcAutonomyScore(43, 9);
    expect(deep.score).toBeLessThan(30);
  });
});
