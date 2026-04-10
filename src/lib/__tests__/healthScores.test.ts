import { describe, it, expect } from 'vitest';
import { calcLagHealth, healthBandColor, scoreBand, BAND_RANK } from '../healthScores';

describe('calcLagHealth', () => {
  it('0 delay → score 100 (perfect)', () => {
    const result = calcLagHealth(0);
    expect(result.score).toBe(100);
    expect(result.label).toBe('Live');
    expect(result.color).toBe('#44403c');
  });

  it('default org: 75d delay → score 47 (Aging)', () => {
    const result = calcLagHealth(75);
    expect(result.score).toBe(47);
    expect(result.label).toBe('Aging');
  });

  it('90d delay → score 41 (Aging)', () => {
    const result = calcLagHealth(90);
    expect(result.score).toBe(41);
    expect(result.label).toBe('Aging');
  });

  it('14d delay → score 87 (Live)', () => {
    const result = calcLagHealth(14);
    expect(result.score).toBe(87);
    expect(result.label).toBe('Live');
  });

  it('150d delay → score 22 (Stale)', () => {
    const result = calcLagHealth(150);
    expect(result.score).toBe(22);
    expect(result.label).toBe('Stale');
  });

  it('300d delay → score 5 (Expired)', () => {
    const result = calcLagHealth(300);
    expect(result.score).toBe(5);
    expect(result.label).toBe('Expired');
  });

  it('negative delay clamped to 0 → score 100', () => {
    expect(calcLagHealth(-10).score).toBe(100);
  });
});

describe('healthBandColor', () => {
  it('score 100 → stone-700', () => {
    expect(healthBandColor(100)).toBe('#44403c');
  });

  it('score 85 → stone-700 (lower bound)', () => {
    expect(healthBandColor(85)).toBe('#44403c');
  });

  it('score 84 → warm-stone (upper bound)', () => {
    expect(healthBandColor(84)).toBe('#a8967a');
  });

  it('score 65 → warm-stone (lower bound)', () => {
    expect(healthBandColor(65)).toBe('#a8967a');
  });

  it('score 64 → ember-light', () => {
    expect(healthBandColor(64)).toBe('#F4A261');
  });

  it('score 40 → ember-light (lower bound)', () => {
    expect(healthBandColor(40)).toBe('#F4A261');
  });

  it('score 39 → ember', () => {
    expect(healthBandColor(39)).toBe('#E05A1B');
  });

  it('score 20 → ember (lower bound)', () => {
    expect(healthBandColor(20)).toBe('#E05A1B');
  });

  it('score 19 → red', () => {
    expect(healthBandColor(19)).toBe('#dc2626');
  });

  it('score 0 → red', () => {
    expect(healthBandColor(0)).toBe('#dc2626');
  });
});

describe('scoreBand', () => {
  it('returns the right band at each boundary', () => {
    expect(scoreBand(100)).toBe('Live');
    expect(scoreBand(85)).toBe('Live');
    expect(scoreBand(84)).toBe('Fresh');
    expect(scoreBand(65)).toBe('Fresh');
    expect(scoreBand(64)).toBe('Aging');
    expect(scoreBand(40)).toBe('Aging');
    expect(scoreBand(39)).toBe('Stale');
    expect(scoreBand(20)).toBe('Stale');
    expect(scoreBand(19)).toBe('Expired');
    expect(scoreBand(0)).toBe('Expired');
  });

  it('BAND_RANK orders bands Live > Fresh > Aging > Stale > Expired', () => {
    expect(BAND_RANK.Live).toBeGreaterThan(BAND_RANK.Fresh);
    expect(BAND_RANK.Fresh).toBeGreaterThan(BAND_RANK.Aging);
    expect(BAND_RANK.Aging).toBeGreaterThan(BAND_RANK.Stale);
    expect(BAND_RANK.Stale).toBeGreaterThan(BAND_RANK.Expired);
  });
});

// ── Cycle 9 H4 theorem: band(min) ≤ band(mean) ──
//
// Provable via AM-min inequality + band monotonicity: for any three non-negative
// scores F, L, A, `mean(F,L,A) ≥ min(F,L,A)`, and scoreBand is monotone
// non-decreasing in its argument, so `scoreBand(min) ≤ scoreBand(mean)`. This
// test exhaustively verifies the theorem on a coarse grid of all score triples
// and additionally checks that 0 triples violate the inequality.
//
// This is the safety floor justifying `band(min) !== band(mean)` as the
// binding-pillar detection rule in sensitivity.ts. See Cycle 9 H4 for the
// proof and the 10,000-triple Monte Carlo that returned 0 upflips.
describe('band(min) ≤ band(mean) theorem (Cycle 9 H4)', () => {
  it('holds for all {0,10,...,100}^3 score triples (1331 cases, 0 violations)', () => {
    let tested = 0;
    let violations = 0;
    for (let f = 0; f <= 100; f += 10) {
      for (let l = 0; l <= 100; l += 10) {
        for (let a = 0; a <= 100; a += 10) {
          const min = Math.min(f, l, a);
          const mean = (f + l + a) / 3;
          const rMin = BAND_RANK[scoreBand(min)];
          const rMean = BAND_RANK[scoreBand(mean)];
          if (rMin > rMean) violations++;
          tested++;
        }
      }
    }
    expect(tested).toBe(1331);
    expect(violations).toBe(0);
  });

  it('holds for a fine-grained 0-100 grid (step 5, 9261 cases)', () => {
    let violations = 0;
    for (let f = 0; f <= 100; f += 5) {
      for (let l = 0; l <= 100; l += 5) {
        for (let a = 0; a <= 100; a += 5) {
          const min = Math.min(f, l, a);
          const mean = (f + l + a) / 3;
          if (BAND_RANK[scoreBand(min)] > BAND_RANK[scoreBand(mean)]) violations++;
        }
      }
    }
    expect(violations).toBe(0);
  });

  it('Amazon reference case (F=63, L=74, A=81): band(min)=Aging, band(mean)=Fresh (flipped)', () => {
    // Canonical false-Fresh case from Cycle 7 H2 / Cycle 9 H2. Composite=72.7
    // (Fresh), but min=63 (Aging). The band flip is exactly the bottleneck the
    // sensitivity helper exists to detect.
    const composite = (63 + 74 + 81) / 3;
    expect(scoreBand(63)).toBe('Aging');
    expect(scoreBand(composite)).toBe('Fresh');
    expect(BAND_RANK[scoreBand(63)]).toBeLessThan(BAND_RANK[scoreBand(composite)]);
  });
});
