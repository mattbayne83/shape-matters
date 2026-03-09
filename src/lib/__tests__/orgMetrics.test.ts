import { describe, it, expect } from 'vitest';
import { calcOrgMetrics } from '../orgMetrics';

describe('calcOrgMetrics', () => {
  // ── Standard case: 6 levels, 5000 employees, 82% fidelity ──
  describe('standard case (6 levels, 5000 employees, 82%)', () => {
    const m = calcOrgMetrics(6, 5000, 82);

    it('calculates average span of control', () => {
      // 5000^(1/6) ≈ 4.14
      expect(m.avgSpan).toBeCloseTo(4.14, 1);
    });

    it('calculates flatness index', () => {
      // span / levels = 4.14 / 6 ≈ 0.69
      expect(m.flatnessIndex).toBeCloseTo(0.69, 1);
    });

    it('calculates one-way signal fidelity', () => {
      // 0.82^5 × 100 ≈ 37.1%
      expect(m.fidelityAtTopPct).toBeCloseTo(37.1, 0);
    });

    it('calculates round-trip relay count', () => {
      // (6-1) × 2 = 10
      expect(m.roundTripLayers).toBe(10);
    });

    it('calculates round-trip fidelity', () => {
      // 0.82^10 × 100 ≈ 13.7%
      expect(m.roundTripFidelity).toBeCloseTo(13.7, 0);
    });

    it('manager ratio is between 0 and 100', () => {
      expect(m.managerRatio).toBeGreaterThan(0);
      expect(m.managerRatio).toBeLessThan(100);
    });

    it('IC count + managers ≈ total employees', () => {
      expect(m.icCount + m.managersEstimate).toBeCloseTo(5000, -1);
    });

    it('annual comm loss is positive', () => {
      expect(m.annualCommLoss).toBeGreaterThan(0);
    });

    it('passes through input values', () => {
      expect(m.levels).toBe(6);
      expect(m.employees).toBe(5000);
    });
  });

  // ── Edge case: 1 level (completely flat) ──
  describe('edge case: 1 level (flat)', () => {
    const m = calcOrgMetrics(1, 100, 82);

    it('fidelity at top is 100% (no relays)', () => {
      // 0.82^0 = 1 → 100%
      expect(m.fidelityAtTopPct).toBe(100);
    });

    it('round-trip fidelity is 100%', () => {
      expect(m.roundTripFidelity).toBe(100);
    });

    it('round-trip layers is 0', () => {
      expect(m.roundTripLayers).toBe(0);
    });

    it('no managers in a flat org', () => {
      expect(m.managersEstimate).toBe(0);
      expect(m.managerRatio).toBe(0);
    });

    it('all employees are ICs', () => {
      expect(m.icCount).toBe(100);
    });

    it('annual comm loss is zero (no degradation)', () => {
      expect(m.annualCommLoss).toBe(0);
    });
  });

  // ── Edge case: 1 employee ──
  describe('edge case: 1 employee', () => {
    const m = calcOrgMetrics(1, 1, 82);

    it('avg span is 1', () => {
      expect(m.avgSpan).toBe(1);
    });

    it('flatness index is 1', () => {
      expect(m.flatnessIndex).toBe(1);
    });
  });

  // ── Edge case: extreme fidelity rates ──
  describe('extreme fidelity rates', () => {
    it('99% fidelity preserves most signal', () => {
      const m = calcOrgMetrics(9, 10000, 99);
      // 0.99^8 ≈ 92.3%
      expect(m.fidelityAtTopPct).toBeGreaterThan(90);
    });

    it('50% fidelity destroys signal fast', () => {
      const m = calcOrgMetrics(9, 10000, 50);
      // 0.50^8 ≈ 0.39%
      expect(m.fidelityAtTopPct).toBeLessThan(1);
    });
  });

  // ── Amazon-like: 9 levels, 1.5M employees, 82% ──
  describe('Amazon-like (9 levels, 1.5M employees, 82%)', () => {
    const m = calcOrgMetrics(9, 1500000, 82);

    it('one-way fidelity is ~20%', () => {
      // 0.82^8 ≈ 20.4%
      expect(m.fidelityAtTopPct).toBeCloseTo(20.4, 0);
    });

    it('has high manager ratio (deep hierarchy)', () => {
      expect(m.managerRatio).toBeGreaterThan(10);
    });

    it('round-trip fidelity is very low', () => {
      // 0.82^16 ≈ 4.2%
      expect(m.roundTripFidelity).toBeLessThan(5);
    });
  });
});
