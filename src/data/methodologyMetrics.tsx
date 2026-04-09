import type { ReactNode } from 'react';

export interface MetricDefinition {
  id: string;
  title: string;
  formula: ReactNode;
  description: string;
  constants?: string;
  category: 'fidelity' | 'latency' | 'autonomy' | 'supplementary';
}

export const METHODOLOGY_METRICS: MetricDefinition[] = [
  // ── Fidelity Pillar ──
  {
    id: 'methodology-signal-fidelity',
    title: 'Signal Fidelity',
    formula: <>r<sup>(L-1)</sup> × 100%</>,
    description:
      'The percentage of the original message that survives L-1 relay hops from frontline to CEO. Based on Bartlett\'s serial reproduction research (1932): each retelling preserves only a fraction r of the original. At 82% fidelity and 6 levels, only 37% of the original signal reaches the top.',
    category: 'fidelity',
  },
  {
    id: 'methodology-round-trip-fidelity',
    title: 'Round-Trip Fidelity',
    formula: <>r<sup>2(L-1)</sup> × 100%</>,
    description:
      'Signal fidelity for a complete round trip — information travels up L-1 relays, then a decision travels back down L-1 relays. The exponent doubles because the signal degrades in both directions. At 82% fidelity and 9 levels, one-way retains 20% but the round trip retains only 4.2%.',
    category: 'fidelity',
  },
  {
    id: 'methodology-drift-cost',
    title: 'Drift Cost',
    formula: <>e<sup>(-α·(L-1)·90)</sup> × 100%</>,
    description:
      'Information accuracy remaining after 90 days. Each layer adds a drift rate that compounds across L-1 layers. A 6-level org loses accuracy ~5× faster than a 2-level org because drift compounds at every relay point.',
    constants: 'α = 0.005/day',
    category: 'fidelity',
  },

  // ── Latency Pillar ──
  {
    id: 'methodology-propagation-delay',
    title: 'Propagation Delay',
    formula: <>d × (L-1)<sup>2</sup></>,
    description:
      'Total time for a strategic signal to propagate from CEO to front line. Based on Fourier\'s Law of thermal conduction — each layer acts as insulation. The key insight: delay scales with the square of depth, not linearly. At 6 levels and 3 days/layer, propagation takes 75 days (not 15). Adding one layer doesn\'t add one unit of delay — it compounds.',
    constants: 'd = decision cycle (days/layer)',
    category: 'latency',
  },
  {
    id: 'methodology-marginal-layer-cost',
    title: 'Marginal Layer Cost',
    formula: <>d × (2(L-1) - 1)</>,
    description:
      'Days saved by removing the deepest organizational layer. Because delay is quadratic, the savings are disproportionately large for deep orgs. Removing one layer from a 6-level org saves 27 days — not 3. This metric makes the ROI of flattening visceral.',
    constants: 'd = decision cycle (days/layer)',
    category: 'latency',
  },

  // ── Autonomy Pillar ──
  {
    id: 'methodology-autonomy-score',
    title: 'Autonomy Score',
    formula: <>min(DCI × log(3) / log(L), 100)</>,
    description:
      'Measures effective decision authority after structural coordination overhead. Each additional layer adds network connections (up, down, and lateral) that erode formal empowerment. At 3 levels, DCI passes through undiminished. At 9 levels, half of formal authority is consumed by coordination. Based on Decision-Centrality Index research showing rank inversions at DCI≥35 for deep organizations.',
    constants: 'DCI = Decision-Centrality Index (0-100), L = depth',
    category: 'autonomy',
  },

  // ── Supplementary Metrics ──
  {
    id: 'methodology-decision-quality',
    title: 'Decision Quality',
    formula: <>r<sup>(L-1)</sup> × e<sup>(-λ·L·K)</sup></>,
    description:
      'Combines signal fidelity with information staleness. The first term captures signal degradation; the second captures time decay — information loses value as it ages during the decision cycle.',
    constants: 'λ = 0.008 (staleness decay), K = 3 days/layer',
    category: 'supplementary',
  },
  {
    id: 'methodology-management-tax',
    title: 'Management Tax',
    formula: <>(N - n<sub>0</sub>) / N × 100%</>,
    description:
      'The percentage of the organization in management roles (all non-IC layers). Layer 0 (frontline ICs) does the productive work; layers 1 through L-1 manage. Below 15% is lean; above 30% means nearly half the org is managing rather than producing.',
    category: 'supplementary',
  },
  {
    id: 'methodology-span-of-control',
    title: 'Span of Control',
    formula: <>N<sup>1/L</sup></>,
    description:
      'Average number of direct reports per manager, assuming uniform geometric narrowing. Below 4 indicates excessive management levels; above 7 suggests a lean, empowered structure.',
    category: 'supplementary',
  },
  {
    id: 'methodology-shape-gap',
    title: 'Shape Gap',
    formula: <>Σ|w<sub>ideal</sub> - w<sub>actual</sub>| / 2N</>,
    description:
      'How much the actual org shape deviates from an idealized linear triangle. The idealized triangle narrows linearly; real orgs narrow exponentially (creating a horn shape). Higher values indicate a more pronounced middle-management bulge.',
    category: 'supplementary',
  },
  {
    id: 'methodology-annual-comm-loss',
    title: 'Annual Comm Loss',
    formula: <>N × $10,140 × (1 - r<sup>2(L-1)</sup>)</>,
    description:
      'Estimated annual cost of ineffective communication, based on the Axios HQ 2025 finding of $10,140/employee/year average loss. Scaled by round-trip signal degradation — deeper orgs waste more because messages lose fidelity on every round trip.',
    category: 'supplementary',
  },
];
