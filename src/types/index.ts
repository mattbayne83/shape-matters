export type Archetype =
  | 'flat'
  | 'tech'
  | 'flattened'
  | 'experimental'
  | 'energy';

export const ARCHETYPE_LABELS: Record<Archetype, string> = {
  flat: 'Flat by Design',
  tech: 'Tech Giants',
  flattened: 'Recently Flattened',
  experimental: 'Experimental',
  energy: 'Energy',
};

export const ARCHETYPE_COLORS: Record<Archetype, string> = {
  flat: '#0f172a',    // slate-900
  tech: '#1e293b',    // slate-800
  flattened: '#334155', // slate-700
  experimental: '#475569', // slate-600
  energy: '#64748b',   // slate-500
};

export interface Company {
  id: string;
  name: string;
  era: string;
  levels: number;
  employees: number;
  industry: string;
  archetype: Archetype;
  color: string;
  notes: string;
  source: string;
  sourceUrl?: string;
}

export interface OrgMetrics {
  avgSpan: number;
  flatnessIndex: number;
  fidelityAtTopPct: number;
  roundTripFidelity: number;
  roundTripLayers: number;
  managersEstimate: number;
  managerRatio: number;
  icCount: number;
  annualCommLoss: number;
  levels: number;
  employees: number;
}

export interface DepthTaxResult {
  levels: number;
  headcount: number;
  fidelityRate: number;
  signalFidelity: number;
  roundTripFidelity: number;
  driftHalfLife: number;
  ninetyDayAccuracy: number;
  decisionQuality: number;
  flatQuality: number;
  wasteMultiplier: number;
  decisionLatency: number;
  decisionsPerMonth: number;
}

export interface TriangleGeometry {
  height: number;
  base: number;
  area: number;
  slopeAngle: number;
  slantHeight: number;
  totalShapeGap: number;
  centroidHeight: number;
  actualCentroidHeight: number;
  decisionGravityRatio: number;
  momentOfInertia: number;
  agilityScore: number;
  perimeter: number;
  perimeterToArea: number;
}
