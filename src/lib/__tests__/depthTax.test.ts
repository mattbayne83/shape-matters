import { describe, it, expect } from 'vitest';
import { calcDepthTax } from '../depthTax';

describe('calcDepthTax', () => {
  // ── Standard case ──
  describe('standard case (6 levels, 5000 headcount, 82%)', () => {
    const tax = calcDepthTax(6, 5000, 82);

    it('signal fidelity matches r^(L-1) × 100', () => {
      const expected = Math.pow(0.82, 5) * 100;
      expect(tax.signalFidelity).toBeCloseTo(expected, 4);
    });

    it('round-trip fidelity matches r^(2(L-1)) × 100', () => {
      const expected = Math.pow(0.82, 10) * 100;
      expect(tax.roundTripFidelity).toBeCloseTo(expected, 4);
    });

    it('decision latency = L × K (K=3)', () => {
      expect(tax.decisionLatency).toBe(18); // 6 × 3
    });

    it('decision quality is between 0 and 1', () => {
      expect(tax.decisionQuality).toBeGreaterThan(0);
      expect(tax.decisionQuality).toBeLessThan(1);
    });

    it('decision quality < signal fidelity (staleness penalty)', () => {
      // Decision quality adds time decay on top of fidelity loss
      expect(tax.decisionQuality).toBeLessThan(tax.signalFidelity / 100);
    });

    it('90-day accuracy is between 0 and 100', () => {
      expect(tax.ninetyDayAccuracy).toBeGreaterThan(0);
      expect(tax.ninetyDayAccuracy).toBeLessThan(100);
    });

    it('drift half-life is positive and finite', () => {
      expect(tax.driftHalfLife).toBeGreaterThan(0);
      expect(tax.driftHalfLife).toBeLessThan(Infinity);
    });

    it('waste multiplier > 1 (deeper orgs waste more than flat)', () => {
      expect(tax.wasteMultiplier).toBeGreaterThan(1);
    });

    it('decisions per month is positive', () => {
      expect(tax.decisionsPerMonth).toBeGreaterThan(0);
    });

    it('passes through input values', () => {
      expect(tax.levels).toBe(6);
      expect(tax.headcount).toBe(5000);
      expect(tax.fidelityRate).toBe(82);
    });
  });

  // ── Edge case: 1 level (flat) ──
  describe('edge case: 1 level', () => {
    const tax = calcDepthTax(1, 100, 82);

    it('signal fidelity is 100% (no relays)', () => {
      // r^0 = 1 → 100%
      expect(tax.signalFidelity).toBe(100);
    });

    it('round-trip fidelity is 100%', () => {
      expect(tax.roundTripFidelity).toBe(100);
    });

    it('decision latency is 3 days (minimum)', () => {
      expect(tax.decisionLatency).toBe(3); // 1 × 3
    });

    it('drift half-life is infinite (no compounding layers)', () => {
      expect(tax.driftHalfLife).toBe(Infinity);
    });

    it('90-day accuracy is 100%', () => {
      expect(tax.ninetyDayAccuracy).toBe(100);
    });
  });

  // ── Deep hierarchy ──
  describe('deep hierarchy (15 levels)', () => {
    const tax = calcDepthTax(15, 50000, 82);

    it('signal fidelity is very low', () => {
      // 0.82^14 ≈ 6.3%
      expect(tax.signalFidelity).toBeLessThan(10);
    });

    it('decision latency is 45 days', () => {
      expect(tax.decisionLatency).toBe(45); // 15 × 3
    });

    it('90-day accuracy is very low', () => {
      expect(tax.ninetyDayAccuracy).toBeLessThan(50);
    });
  });

  // ── Fidelity rate extremes ──
  describe('fidelity rate extremes', () => {
    it('98% fidelity preserves quality well', () => {
      const tax = calcDepthTax(6, 5000, 98);
      expect(tax.signalFidelity).toBeGreaterThan(90);
    });

    it('50% fidelity destroys signal rapidly', () => {
      const tax = calcDepthTax(6, 5000, 50);
      // 0.50^5 = 3.125%
      expect(tax.signalFidelity).toBeCloseTo(3.125, 2);
    });
  });

  // ── Formula consistency ──
  describe('formula consistency', () => {
    it('decision quality = r^(L-1) × e^(-λ·L·K)', () => {
      const tax = calcDepthTax(4, 1000, 85);
      const r = 0.85;
      const L = 4;
      const LAMBDA = 0.008;
      const K = 3;
      const expected = Math.pow(r, L - 1) * Math.exp(-LAMBDA * L * K);
      expect(tax.decisionQuality).toBeCloseTo(expected, 6);
    });

    it('90-day accuracy = e^(-α·(L-1)·90) × 100', () => {
      const tax = calcDepthTax(4, 1000, 85);
      const ALPHA = 0.005;
      const expected = Math.exp(-ALPHA * 3 * 90) * 100;
      expect(tax.ninetyDayAccuracy).toBeCloseTo(expected, 4);
    });
  });
});
