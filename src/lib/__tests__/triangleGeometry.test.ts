import { describe, it, expect } from 'vitest';
import {
  employeesPerLayer,
  idealizedWidthAtLayer,
  calcTriangleGeometry,
  calcRestructuringImpact,
  CONGESTION_GAMMA,
} from '../triangleGeometry';

describe('employeesPerLayer', () => {
  it('returns single layer for L=1', () => {
    const layers = employeesPerLayer(1, 1000);
    expect(layers).toHaveLength(1);
    expect(layers[0]).toBe(1000);
  });

  it('sums to total employees', () => {
    const layers = employeesPerLayer(6, 5000);
    const sum = layers.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(5000, 0);
  });

  it('bottom layer (ICs) is largest', () => {
    const layers = employeesPerLayer(6, 5000);
    const maxLayer = Math.max(...layers);
    expect(layers[0]).toBe(maxLayer);
  });

  it('layers decrease monotonically', () => {
    const layers = employeesPerLayer(6, 5000);
    for (let i = 1; i < layers.length; i++) {
      expect(layers[i]).toBeLessThan(layers[i - 1]);
    }
  });

  it('top layer (CEO) is smallest', () => {
    const layers = employeesPerLayer(6, 5000);
    const minLayer = Math.min(...layers);
    expect(layers[layers.length - 1]).toBe(minLayer);
  });
});

describe('idealizedWidthAtLayer', () => {
  it('layer 0 equals the base', () => {
    expect(idealizedWidthAtLayer(0, 6, 10)).toBe(10);
  });

  it('top layer (L-1) equals 0', () => {
    expect(idealizedWidthAtLayer(5, 6, 10)).toBe(0);
  });

  it('narrows linearly', () => {
    const w1 = idealizedWidthAtLayer(1, 6, 10);
    const w2 = idealizedWidthAtLayer(2, 6, 10);
    const w3 = idealizedWidthAtLayer(3, 6, 10);
    // Equal steps
    expect(w1 - w2).toBeCloseTo(w2 - w3, 6);
  });

  it('single level returns base', () => {
    expect(idealizedWidthAtLayer(0, 1, 10)).toBe(10);
  });
});

describe('calcTriangleGeometry', () => {
  describe('standard case (6 levels, 5000 employees, 82%)', () => {
    const geo = calcTriangleGeometry(6, 5000, 82);

    it('height equals levels', () => {
      expect(geo.height).toBe(6);
    });

    it('base equals span of control', () => {
      expect(geo.base).toBeCloseTo(Math.pow(5000, 1 / 6), 4);
    });

    it('area = 0.5 × base × height', () => {
      expect(geo.area).toBeCloseTo(0.5 * geo.base * geo.height, 4);
    });

    it('slope angle is between 0 and 90 degrees', () => {
      expect(geo.slopeAngle).toBeGreaterThan(0);
      expect(geo.slopeAngle).toBeLessThan(90);
    });

    it('shape gap is between 0 and 1', () => {
      expect(geo.totalShapeGap).toBeGreaterThanOrEqual(0);
      expect(geo.totalShapeGap).toBeLessThanOrEqual(1);
    });

    it('agility score is between 0 and 1', () => {
      expect(geo.agilityScore).toBeGreaterThan(0);
      expect(geo.agilityScore).toBeLessThanOrEqual(1);
    });

    it('torque profile has one entry per level', () => {
      expect(geo.torqueProfile).toHaveLength(6);
    });

    it('CEO torque (last entry) equals agility score', () => {
      expect(geo.torqueProfile[5]).toBe(geo.agilityScore);
    });

    it('layer inertia has one entry per level', () => {
      expect(geo.layerInertia).toHaveLength(6);
    });

    it('layer inertia contributions sum to ~100%', () => {
      const totalPct = geo.layerInertia.reduce((a, li) => a + li.contributionPct, 0);
      expect(totalPct).toBeCloseTo(100, 0);
    });

    it('peak inertia layer is valid', () => {
      expect(geo.peakInertiaLayer).toBeGreaterThanOrEqual(0);
      expect(geo.peakInertiaLayer).toBeLessThan(6);
    });

    it('moment of inertia is positive', () => {
      expect(geo.momentOfInertia).toBeGreaterThan(0);
    });
  });

  // ── Shape classification ──
  describe('shape classification', () => {
    it('very flat org (2 levels) is Mesa', () => {
      const geo = calcTriangleGeometry(2, 5000, 82);
      expect(geo.shapeClass).toBe('mesa');
    });

    it('deep narrow org (12 levels, 500 employees) is Diamond (shape gap > 8%)', () => {
      const geo = calcTriangleGeometry(12, 500, 82);
      // High shape gap + steep slope → diamond classification takes priority
      expect(geo.shapeClass).toBe('diamond');
    });

    it('shape class is always one of the valid types', () => {
      const validClasses = ['mesa', 'pyramid', 'diamond', 'obelisk'];
      for (const [levels, employees] of [[3, 1000], [6, 5000], [12, 500], [12, 100000], [15, 50000]]) {
        const geo = calcTriangleGeometry(levels, employees, 82);
        expect(validClasses).toContain(geo.shapeClass);
      }
    });

    it('classification label is non-empty', () => {
      const geo = calcTriangleGeometry(6, 5000, 82);
      expect(geo.shapeClassLabel.length).toBeGreaterThan(0);
    });
  });

  // ── Edge case: 1 level ──
  describe('edge case: 1 level', () => {
    const geo = calcTriangleGeometry(1, 100, 82);

    it('agility score is 1.0 (perfect reach)', () => {
      expect(geo.agilityScore).toBe(1);
    });

    it('torque profile has single entry', () => {
      expect(geo.torqueProfile).toHaveLength(1);
      expect(geo.torqueProfile[0]).toBe(1);
    });

    it('shape gap is 0 (no divergence possible)', () => {
      expect(geo.totalShapeGap).toBe(0);
    });
  });

  // ── Higher fidelity = better agility ──
  describe('fidelity affects agility', () => {
    it('higher fidelity → higher agility score', () => {
      const low = calcTriangleGeometry(6, 5000, 60);
      const high = calcTriangleGeometry(6, 5000, 95);
      expect(high.agilityScore).toBeGreaterThan(low.agilityScore);
    });
  });

  // ── Deeper org = lower agility ──
  describe('depth affects agility', () => {
    it('more levels → lower agility score', () => {
      const shallow = calcTriangleGeometry(3, 5000, 82);
      const deep = calcTriangleGeometry(10, 5000, 82);
      expect(shallow.agilityScore).toBeGreaterThan(deep.agilityScore);
    });
  });
});

  // ── Congestion model ──
  describe('congestion model', () => {
    it('CONGESTION_GAMMA constant is 0.1', () => {
      expect(CONGESTION_GAMMA).toBe(0.1);
    });

    it('L=1 org is unaffected by congestion (no hops)', () => {
      const geo = calcTriangleGeometry(1, 100, 82);
      expect(geo.agilityScore).toBe(1);
      expect(geo.torqueProfile).toEqual([1]);
    });

    it('congestion reduces CEO torque compared to hop-uniform formula', () => {
      const levels = 6;
      const employees = 5000;
      const fidelityRate = 82;
      const r = fidelityRate / 100;
      const geo = calcTriangleGeometry(levels, employees, fidelityRate);

      // Compute old (no-congestion) CEO torque for comparison
      const layerCounts = employeesPerLayer(levels, employees);
      const origin = levels - 1;
      let oldTorque = 0;
      for (let k = 0; k < levels; k++) {
        oldTorque += layerCounts[k] * Math.pow(r, Math.abs(origin - k));
      }
      const oldCeoTorque = oldTorque / employees;

      expect(geo.agilityScore).toBeLessThan(oldCeoTorque);
    });
  });

describe('calcRestructuringImpact', () => {
  it('returns null for 2 or fewer levels', () => {
    expect(calcRestructuringImpact(2, 5000, 82)).toBeNull();
    expect(calcRestructuringImpact(1, 5000, 82)).toBeNull();
  });

  it('proposes one fewer level', () => {
    const impact = calcRestructuringImpact(6, 5000, 82)!;
    expect(impact.currentLevels).toBe(6);
    expect(impact.proposedLevels).toBe(5);
  });

  it('agility improves (positive delta)', () => {
    const impact = calcRestructuringImpact(6, 5000, 82)!;
    expect(impact.agilityDelta).toBeGreaterThan(0);
  });

  it('inertia reduces (positive %)', () => {
    const impact = calcRestructuringImpact(6, 5000, 82)!;
    expect(impact.inertiaReduction).toBeGreaterThan(0);
  });

  it('fidelity improves (positive gain)', () => {
    const impact = calcRestructuringImpact(6, 5000, 82)!;
    expect(impact.fidelityGain).toBeGreaterThan(0);
  });

  it('fidelity gain matches formula', () => {
    const impact = calcRestructuringImpact(6, 5000, 82)!;
    const current = Math.pow(0.82, 5) * 100;
    const proposed = Math.pow(0.82, 4) * 100;
    expect(impact.fidelityGain).toBeCloseTo(proposed - current, 4);
  });

  it('manager ratio changes (negative = leaner)', () => {
    const impact = calcRestructuringImpact(6, 5000, 82)!;
    expect(impact.managerRatioDelta).toBeLessThan(0);
  });
});
