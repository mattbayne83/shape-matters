export type Archetype =
  | 'flat'
  | 'tech'
  | 'flattened'
  | 'self-managing'
  | 'energy'
  | 'command';

export const ARCHETYPE_LABELS: Record<Archetype, string> = {
  flat: 'Flat by Design',
  tech: 'Tech Giants',
  flattened: 'Recently Flattened',
  'self-managing': 'Self-Managing',
  energy: 'Energy',
  command: 'Command',
};

export const ARCHETYPE_COLORS: Record<Archetype, string> = {
  flat: '#1C1917',    // stone-900
  tech: '#292524',    // stone-800
  flattened: '#44403c', // stone-700
  'self-managing': '#57534e', // stone-600
  energy: '#78716c',   // stone-500
  command: '#0c0a09',  // stone-950 — darker than flat to signal depth
};

/**
 * Provenance tag for a company's DCI value.
 *
 * - `case-study`: grounded in published academic cases, books, or employee
 *   handbooks with primary-source management quotes (e.g., Haier in Hamel's
 *   *Humanocracy*, Valve in the Handbook + Ellsworth's first-hand account).
 * - `qualitative-estimate`: inferred from culture decks, journalism, and
 *   Glassdoor signals. Not empirically grounded in a single primary source.
 * - `wms-sector`: calibrated against Bloom-Van Reenen World Management Survey
 *   sector means via `DCI = 25 × (WMS_score − 1)`. No reference company
 *   currently uses this tag — firm-level microdata is not publicly accessible.
 *
 * Cycle 9 H5 audit: zero of six reference companies are sector-calibrated.
 */
export type DciSource = 'case-study' | 'qualitative-estimate' | 'wms-sector';

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
  decisionCycle?: number;     // days/layer (optional for backward compat)
  dci?: number;                 // Decision-Centrality Index (0-100, optional for backward compat)
  dciSource?: DciSource;      // provenance tag for the dci value (Cycle 9 H5)
  teamDecisionMix?: number;   // default team-routing % when selected as preset (0-100)
  narrative?: string;         // human-readable "so what" one-liner for Proof section
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

export type ShapeClassification = 'mesa' | 'pyramid' | 'diamond' | 'obelisk';

export interface LayerInertia {
  layer: number;
  count: number;
  distance: number;         // distance from centroid
  contribution: number;     // count × distance²
  contributionPct: number;  // % of total inertia
  gapFromIdeal: number;     // actual - ideal count (positive = bloated)
}

export interface RestructuringImpact {
  currentLevels: number;
  proposedLevels: number;
  agilityDelta: number;       // positive = improvement
  inertiaReduction: number;   // percentage reduction
  managerRatioDelta: number;  // negative = fewer managers (leaner)
  fidelityGain: number;       // percentage points gained at top
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
  torqueProfile: number[];   // per-layer pivot efficiency (index = origin layer)
  perimeter: number;
  perimeterToArea: number;
  // New: per-layer decomposition
  layerInertia: LayerInertia[];
  peakInertiaLayer: number;   // layer index with highest inertia contribution
  // New: shape classification
  shapeClass: ShapeClassification;
  shapeClassLabel: string;
}

// ── Thermal Lag (Pillar 2) ──────────────────────────────────────────
export interface LayerDelay {
  layer: number;
  role: string;
  cumulativeDelay: number;  // days
  marginalDelay: number;    // days added by this layer
}

export interface ThermalLagResult {
  totalDelay: number;         // days, CEO to front line
  marginalLayerCost: number;  // days saved by removing deepest layer
  lagRatio: number;           // actual / linear delay
  layerDelays: LayerDelay[];  // per-layer breakdown
}

// ── Relay Simulator ─────────────────────────────────────────────────
export type ScenarioCategory = 'safety' | 'strategy' | 'customer' | 'innovation' | 'operations';

export interface RelayLevel {
  role: string;
  message: string;
  incentive: string;
  lostDetails: string[];
  addedFraming: string[];
}

export interface Scenario {
  id: string;
  title: string;
  category: ScenarioCategory;
  originalMessage: string;
  levels: RelayLevel[];
}

// ── Health Scores ──────────────────────────────────────────────────
export interface HealthScore {
  score: number;          // 0-100, rounded integer
  label: string;          // "Live", "Nimble", "Stuck", etc.
  color: string;          // Hex color for the score band
}

// ── Autonomy (Pillar 3) ───────────────────────────────────────────
export interface AutonomyResult {
  score: number;                // 0-100 health score
  depthDiscount: number;        // log(3) / log(L) — 1.0 at L=3, 0.5 at L=9
  crossoverFloor: number;       // minimum DCI to score above 50
  label: string;                // health band label
  color: string;                // health band color
}

// ── Blended Model (Team vs Monolithic) ───────────────────────────────
export interface BlendedScores {
  fidelity: number;      // 0-100
  lag: number;           // 0-100
  autonomy: number;      // 0-100
  isBlended: boolean;    // true when teamDecisionMix > 0
  monoFidelity: number;  // monolithic fidelity (for delta display)
  monoLag: number;       // monolithic lag health
  monoAutonomy: number;  // monolithic autonomy
}
