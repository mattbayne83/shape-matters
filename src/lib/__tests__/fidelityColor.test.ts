import { describe, it, expect } from 'vitest';
import { fidelityColor, metricColor } from '../fidelityColor';

describe('fidelityColor', () => {
  describe('monochrome mode (default)', () => {
    it('returns HSL string', () => {
      expect(fidelityColor(50)).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
    });

    it('low fidelity → lighter (higher L)', () => {
      const low = fidelityColor(10);
      const high = fidelityColor(90);
      // Extract lightness from hsl string
      const lLow = parseInt(low.match(/(\d+)%\)$/)![1]);
      const lHigh = parseInt(high.match(/(\d+)%\)$/)![1]);
      expect(lLow).toBeGreaterThan(lHigh); // Lower fidelity = lighter color
    });

    it('uses hue 24 (stone)', () => {
      const color = fidelityColor(50);
      expect(color).toMatch(/^hsl\(24,/);
    });
  });

  describe('semantic mode', () => {
    it('returns HSL string', () => {
      expect(fidelityColor(50, true)).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
    });

    it('low fidelity → warm/ember hue (~19)', () => {
      const color = fidelityColor(0, true);
      const h = parseInt(color.match(/^hsl\((\d+),/)![1]);
      expect(h).toBe(19);
    });

    it('high fidelity → stone hue (~24)', () => {
      const color = fidelityColor(100, true);
      const h = parseInt(color.match(/^hsl\((\d+),/)![1]);
      expect(h).toBe(24);
    });

    it('high fidelity has lower saturation (stone-like)', () => {
      const low = fidelityColor(0, true);
      const high = fidelityColor(100, true);
      const sLow = parseInt(low.match(/, (\d+)%,/)![1]);
      const sHigh = parseInt(high.match(/, (\d+)%,/)![1]);
      expect(sLow).toBeGreaterThan(sHigh);
    });
  });

  describe('clamping', () => {
    it('clamps values below 0', () => {
      expect(() => fidelityColor(-10)).not.toThrow();
      expect(fidelityColor(-10)).toBe(fidelityColor(0));
    });

    it('clamps values above 100', () => {
      expect(() => fidelityColor(150)).not.toThrow();
      expect(fidelityColor(150)).toBe(fidelityColor(100));
    });
  });
});

describe('metricColor', () => {
  it('returns HSL string', () => {
    expect(metricColor(0.5)).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
  });

  it('goodness=1 (best) → stone-700 hue/saturation', () => {
    const color = metricColor(1);
    const h = parseInt(color.match(/^hsl\((\d+),/)![1]);
    const s = parseInt(color.match(/, (\d+)%,/)![1]);
    expect(h).toBe(24);
    expect(s).toBe(6);
  });

  it('goodness=0 (worst) → ember hue/saturation', () => {
    const color = metricColor(0);
    const h = parseInt(color.match(/^hsl\((\d+),/)![1]);
    const s = parseInt(color.match(/, (\d+)%,/)![1]);
    expect(h).toBe(19);
    expect(s).toBe(79);
  });

  it('clamps below 0', () => {
    expect(metricColor(-0.5)).toBe(metricColor(0));
  });

  it('clamps above 1', () => {
    expect(metricColor(1.5)).toBe(metricColor(1));
  });
});
