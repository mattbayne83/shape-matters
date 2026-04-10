import { describe, it, expect } from 'vitest';
import { calcAutonomyScore } from '../autonomy';

describe('calcAutonomyScore', () => {
  it('returns score = DCI directly at L=3 (depth discount 1.0)', () => {
    const result = calcAutonomyScore(60, 3);
    expect(result.score).toBe(60);
    expect(result.depthDiscount).toBeCloseTo(1.0, 2);
  });

  it('discounts DCI at L=9 (depth discount 0.5)', () => {
    const result = calcAutonomyScore(72, 9);
    expect(result.score).toBe(36);
    expect(result.depthDiscount).toBeCloseTo(0.5, 2);
  });

  it('caps score at 100', () => {
    const result = calcAutonomyScore(100, 2);
    expect(result.score).toBe(100);
  });

  it('validates Finding 15: Amazon (L=9, DCI=72) beats Meta (L=6, DCI=35)', () => {
    // Meta DCI recalibrated 28 → 35 in Cycle 12 H10. Amazon still wins:
    // amazon = 72 × 0.5 = 36 vs meta = 35 × log(3)/log(6) ≈ 21.
    const amazon = calcAutonomyScore(72, 9);
    const meta = calcAutonomyScore(35, 6);
    expect(amazon.score).toBeGreaterThan(meta.score);
  });

  it('returns correct crossover floor', () => {
    // At L=9, discount=0.5, floor = 50/0.5 = 100
    const result = calcAutonomyScore(72, 9);
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
    const amazon = calcAutonomyScore(72, 9);    // 72 × 0.5 = 36
    const google = calcAutonomyScore(58, 8);    // 58 × 0.53 = 31
    const meta = calcAutonomyScore(35, 6);      // 35 × 0.61 = 21 (Cycle 12 H10)
    const oneok = calcAutonomyScore(22, 6);     // 22 × 0.61 = 13

    expect(oneok.score).toBeLessThan(meta.score);
    expect(meta.score).toBeLessThan(google.score);
    expect(google.score).toBeLessThan(amazon.score);
    expect(amazon.score).toBeLessThan(nucor.score);
    expect(nucor.score).toBeLessThan(haier.score);
  });

  it('deep orgs pay a real penalty even with moderate DCI', () => {
    // L=9, DCI=43 should NOT score high (was 86 with old formula)
    const deep = calcAutonomyScore(43, 9);
    expect(deep.score).toBeLessThan(30);
  });

  // ── Cycle 7 H4 structural invariants ──
  describe('structural invariants (Cycle 7 H4)', () => {
    it('L=1 and L=3 produce identical scores for any DCI (both discount=1)', () => {
      for (let dci = 0; dci <= 100; dci += 10) {
        const l1 = calcAutonomyScore(dci, 1).score;
        const l3 = calcAutonomyScore(dci, 3).score;
        expect(l1).toBe(l3);
      }
    });

    it('DCI=0 produces score=0 at any depth', () => {
      for (let l = 1; l <= 12; l++) {
        expect(calcAutonomyScore(0, l).score).toBe(0);
      }
    });

    it('score is monotonically non-increasing in L for L ≥ 3 (at any fixed DCI)', () => {
      for (let dci = 10; dci <= 100; dci += 10) {
        let prev = calcAutonomyScore(dci, 3).score;
        for (let l = 4; l <= 12; l++) {
          const curr = calcAutonomyScore(dci, l).score;
          expect(curr).toBeLessThanOrEqual(prev);
          prev = curr;
        }
      }
    });

    it('score never exceeds 100 at any input', () => {
      for (let dci = 0; dci <= 100; dci += 5) {
        for (let l = 1; l <= 12; l++) {
          expect(calcAutonomyScore(dci, l).score).toBeLessThanOrEqual(100);
        }
      }
    });

    it('L=2 score is higher than L=1 for sub-cap DCIs (log(3)/log(2) ≈ 1.585 lift)', () => {
      // Verifies the quirk Cycle 7 H4 flagged: moving L=1 → L=2 *raises* autonomy
      // for any DCI below ~63 (the cap frontier). Locks the nonintuitive-but-correct behavior.
      const l1 = calcAutonomyScore(50, 1).score;
      const l2 = calcAutonomyScore(50, 2).score;
      expect(l2).toBeGreaterThan(l1);
    });
  });
});
