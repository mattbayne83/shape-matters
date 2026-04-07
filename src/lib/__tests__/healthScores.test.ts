import { describe, it, expect } from 'vitest';
import { calcLagHealth, calcResponseHealth, healthBandColor } from '../healthScores';

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

describe('calcResponseHealth', () => {
  it('ζ=1.0 (critically damped) → score 100 (Dialed In)', () => {
    const result = calcResponseHealth(1.0, 'critically-damped');
    expect(result.score).toBe(100);
    expect(result.label).toBe('Dialed In');
    expect(result.color).toBe('#44403c');
  });

  it('default org: ζ=0.63 under-damped → score 72 (Nimble)', () => {
    const result = calcResponseHealth(0.63, 'under-damped');
    expect(result.score).toBe(72);
    expect(result.label).toBe('Nimble');
  });

  it('ζ=0.30 under-damped → score 31 (Fishtailing)', () => {
    const result = calcResponseHealth(0.30, 'under-damped');
    expect(result.score).toBe(31);
    expect(result.label).toBe('Fishtailing');
  });

  it('ζ=0.50 under-damped → score 55 (Twitchy)', () => {
    const result = calcResponseHealth(0.50, 'under-damped');
    expect(result.score).toBe(55);
    expect(result.label).toBe('Twitchy');
  });

  it('ζ=1.30 over-damped → score 81 (Steady)', () => {
    const result = calcResponseHealth(1.30, 'over-damped');
    expect(result.score).toBe(81);
    expect(result.label).toBe('Steady');
  });

  it('ζ=1.50 over-damped → score 55 (Lumbering)', () => {
    const result = calcResponseHealth(1.50, 'over-damped');
    expect(result.score).toBe(55);
    expect(result.label).toBe('Lumbering');
  });

  it('ζ=2.0 over-damped → score 9 (Stuck)', () => {
    const result = calcResponseHealth(2.0, 'over-damped');
    expect(result.score).toBe(9);
    expect(result.label).toBe('Stuck');
  });

  it('symmetric: ζ=0.5 and ζ=1.5 produce the same score', () => {
    const under = calcResponseHealth(0.5, 'under-damped');
    const over = calcResponseHealth(1.5, 'over-damped');
    expect(under.score).toBe(over.score);
  });

  it('under vs over-damped at same score get different labels', () => {
    const under = calcResponseHealth(0.5, 'under-damped');
    const over = calcResponseHealth(1.5, 'over-damped');
    expect(under.label).toBe('Twitchy');
    expect(over.label).toBe('Lumbering');
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
