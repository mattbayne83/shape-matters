import type { TriangleGeometry } from '../types';

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
 * Compute triangle geometry metrics for an organization.
 * Maps the org's height (levels) and width (span) to geometric analogs.
 */
export function calcTriangleGeometry(
  levels: number,
  employees: number
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
  // Normalize agility score: compare to a maximally rigid org (single person at each extreme)
  // Use inverse exponential for a 0-1 scale where 1 = most agile
  const maxInertia = employees * Math.pow(height, 2);
  const agilityScore = maxInertia > 0
    ? 1 - momentOfInertia / maxInertia
    : 1;

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
    perimeter,
    perimeterToArea,
  };
}
