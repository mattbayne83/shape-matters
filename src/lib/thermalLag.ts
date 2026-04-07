import type { ThermalLagResult, LayerDelay } from '../types';

const ROLE_LABELS = [
  'CEO', 'SVP', 'VP', 'Director', 'Sr. Manager', 'Manager',
  'Team Lead', 'Sr. IC', 'IC', 'Associate', 'Analyst',
  'Coordinator', 'Specialist', 'Assistant', 'Front Line',
];

function roleForLayer(layer: number, totalLevels: number): string {
  if (layer === 0) return 'CEO';
  if (layer === totalLevels - 1) return 'Front Line';
  const midLabels = ROLE_LABELS.slice(1, -1);
  const idx = Math.round((layer - 1) / Math.max(1, totalLevels - 3) * (midLabels.length - 1));
  return midLabels[Math.min(idx, midLabels.length - 1)];
}

export function calcPropagationDelay(levels: number, decisionCycle: number): number {
  const relays = levels - 1;
  return decisionCycle * relays * relays;
}

export function calcMarginalLayerCost(levels: number, decisionCycle: number): number {
  if (levels <= 1) return 0;
  const relays = levels - 1;
  return decisionCycle * (2 * relays - 1);
}

export function calcLagRatio(levels: number): number {
  return Math.max(0, levels - 1);
}

export function calcLayerDelays(levels: number, decisionCycle: number): LayerDelay[] {
  return Array.from({ length: levels }, (_, k) => ({
    layer: k,
    role: roleForLayer(k, levels),
    cumulativeDelay: decisionCycle * k * k,
    marginalDelay: k === 0 ? 0 : decisionCycle * (2 * k - 1),
  }));
}

export function calcThermalLag(levels: number, decisionCycle: number): ThermalLagResult {
  return {
    totalDelay: calcPropagationDelay(levels, decisionCycle),
    marginalLayerCost: calcMarginalLayerCost(levels, decisionCycle),
    lagRatio: calcLagRatio(levels),
    layerDelays: calcLayerDelays(levels, decisionCycle),
  };
}
