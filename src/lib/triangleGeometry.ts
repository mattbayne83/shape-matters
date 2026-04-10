import type { TriangleGeometry, LayerInertia, ShapeClassification, RestructuringImpact } from '../types';
import { calcOrgMetrics } from './orgMetrics';

/**
 * Compute the employee count at each layer of the org hierarchy.
 * Layer 0 = frontline ICs (bottom), Layer L-1 = CEO (top).
 * Uses the geometric narrowing model: count_k = N / span^k.
 */
export function employeesPerLayer(levels: number, employees: number): number[] {
  if (levels <= 1) return [employees];
  const span = Math.pow(employees, 1 / levels);
  const raw = Array.from({ length: levels }, (_, k) => employees / Math.pow(span, k));
  // Normalize so the sum equals total employees
  const rawSum = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => (v / rawSum) * employees);
}

/**
 * Idealized linear triangle cross-section at a given layer.
 * At layer 0 (bottom) = base, at layer L-1 (top) = 0.
 * Width narrows linearly: base * (1 - layer / (L - 1)).
 */
export function idealizedWidthAtLayer(layer: number, levels: number, base: number): number {
  if (levels <= 1) return base;
  return base * (1 - layer / (levels - 1));
}

/**
 * Actual org exponential cross-section at a given layer.
 * Geometric narrowing: employees / span^layer, then normalized.
 */
export function actualWidthAtLayer(layer: number, employees: number, span: number): number {
  return employees / Math.pow(span, layer);
}

/**
 * Classify the org shape based on geometry metrics.
 *
 * Mesa: Very flat, wide span, few levels (slope < 30°)
 * Pyramid: Balanced, moderate slope, linear-ish distribution (slope 30-55°, low gap)
 * Diamond: Bloated middle layers, high shape gap (gap > 8%)
 * Obelisk: Steep and deep, narrow span (slope > 55°)
 */
function classifyShape(slopeAngle: number, totalShapeGap: number, levels: number): { class: ShapeClassification; label: string } {
  if (levels <= 2) return { class: 'mesa', label: 'Mesa — Flat & Wide' };
  if (slopeAngle < 30) return { class: 'mesa', label: 'Mesa — Flat & Wide' };
  if (totalShapeGap > 0.08 && slopeAngle > 40) return { class: 'diamond', label: 'Diamond — Bloated Middle' };
  if (slopeAngle > 55) return { class: 'obelisk', label: 'Obelisk — Steep & Deep' };
  return { class: 'pyramid', label: 'Pyramid — Balanced' };
}

/**
 * Compute triangle geometry metrics for an organization.
 * Maps the org's height (levels) and width (span) to geometric analogs.
 */
export function calcTriangleGeometry(
  levels: number,
  employees: number,
  fidelityRate: number = 82
): TriangleGeometry {
  const span = Math.pow(employees, 1 / levels);
  const height = levels;
  const base = span;

  // Core triangle properties
  const area = 0.5 * base * height;
  const slopeAngle = Math.atan(2 * height / base) * (180 / Math.PI);
  const slantHeight = Math.sqrt(height * height + (base / 2) * (base / 2));
  const perimeter = 2 * slantHeight + base;
  const perimeterToArea = area > 0 ? perimeter / area : 0;

  // Employee distribution per layer
  const layerCounts = employeesPerLayer(levels, employees);

  // Shape gap: compare idealized linear vs actual exponential distribution
  // Normalize both to sum to the same total, then measure divergence
  const idealTotal = Array.from({ length: levels }, (_, k) =>
    idealizedWidthAtLayer(k, levels, base)
  );
  const idealSum = idealTotal.reduce((a, b) => a + b, 0);
  const normalizedIdeal = idealSum > 0
    ? idealTotal.map((v) => (v / idealSum) * employees)
    : idealTotal;

  const gapSum = normalizedIdeal.reduce(
    (acc, ideal, k) => acc + Math.abs(ideal - layerCounts[k]),
    0
  );
  const totalShapeGap = employees > 0 ? gapSum / (2 * employees) : 0; // Normalized 0-1

  // Centroid calculations
  const centroidHeight = height / 3; // Idealized triangle centroid
  const actualCentroidHeight =
    layerCounts.reduce((acc, count, k) => acc + k * count, 0) / employees;
  const decisionGravityRatio = height > 0 ? actualCentroidHeight / height : 0;

  // Moment of inertia (rigidity proxy)
  const momentOfInertia = layerCounts.reduce(
    (acc, count, k) => acc + count * Math.pow(k - actualCentroidHeight, 2),
    0
  );

  // Torque-based agility.
  // Path fidelity = r^hops between origin and target. Per-hop retention is uniform.
  // See docs/TORQUE_MODEL.md for full derivation.
  const r = fidelityRate / 100;
  const torqueProfile = layerCounts.map((_, origin) => {
    let torque = 0;
    for (let k = 0; k < levels; k++) {
      let pathFidelity = 1;
      if (origin !== k) {
        const step = origin < k ? 1 : -1;
        for (let hop = origin; hop !== k; hop += step) {
          pathFidelity *= r;
        }
      }
      torque += layerCounts[k] * pathFidelity;
    }
    return employees > 0 ? torque / employees : 1;
  });
  const agilityScore = torqueProfile[levels - 1]; // CEO's pivot efficiency

  // Per-layer inertia decomposition
  const layerInertia: LayerInertia[] = layerCounts.map((count, k) => {
    const distance = k - actualCentroidHeight;
    const contribution = count * Math.pow(distance, 2);
    return {
      layer: k,
      count,
      distance,
      contribution,
      contributionPct: momentOfInertia > 0 ? (contribution / momentOfInertia) * 100 : 0,
      gapFromIdeal: count - (normalizedIdeal[k] ?? 0),
    };
  });

  // Find peak inertia layer
  let peakInertiaLayer = 0;
  let peakContribution = 0;
  for (const li of layerInertia) {
    if (li.contribution > peakContribution) {
      peakContribution = li.contribution;
      peakInertiaLayer = li.layer;
    }
  }

  // Shape classification
  const { class: shapeClass, label: shapeClassLabel } = classifyShape(slopeAngle, totalShapeGap, levels);

  return {
    height,
    base,
    area,
    slopeAngle,
    slantHeight,
    totalShapeGap,
    centroidHeight,
    actualCentroidHeight,
    decisionGravityRatio,
    momentOfInertia,
    agilityScore,
    torqueProfile,
    perimeter,
    perimeterToArea,
    layerInertia,
    peakInertiaLayer,
    shapeClass,
    shapeClassLabel,
  };
}

/**
 * Compute the impact of removing one level from the org.
 * Compares current geometry to a proposed flattened version.
 */
export function calcRestructuringImpact(
  levels: number,
  employees: number,
  fidelityRate: number
): RestructuringImpact | null {
  if (levels <= 2) return null; // Can't meaningfully flatten further

  const current = calcTriangleGeometry(levels, employees, fidelityRate);
  const proposed = calcTriangleGeometry(levels - 1, employees, fidelityRate);

  const currentFidelity = Math.pow(fidelityRate / 100, levels - 1) * 100;
  const proposedFidelity = Math.pow(fidelityRate / 100, levels - 2) * 100;

  return {
    currentLevels: levels,
    proposedLevels: levels - 1,
    agilityDelta: proposed.agilityScore - current.agilityScore,
    inertiaReduction: current.momentOfInertia > 0
      ? ((current.momentOfInertia - proposed.momentOfInertia) / current.momentOfInertia) * 100
      : 0,
    managerRatioDelta: calcOrgMetrics(levels - 1, employees, fidelityRate).managerRatio
      - calcOrgMetrics(levels, employees, fidelityRate).managerRatio,
    fidelityGain: proposedFidelity - currentFidelity,
  };
}
