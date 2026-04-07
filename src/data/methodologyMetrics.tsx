import type { ReactNode } from 'react';

export interface MetricDefinition {
  id: string;
  title: string;
  formula: ReactNode;
  description: string;
  constants?: string;
  category: 'primary' | 'secondary' | 'lag' | 'response';
}

export const METHODOLOGY_METRICS: MetricDefinition[] = [
  // ── Primary Metrics ──
  {
    id: 'methodology-signal-fidelity',
    title: 'Signal Fidelity',
    formula: <>r<sup>(L-1)</sup> × 100%</>,
    description:
      'The percentage of the original message that survives L-1 relay hops from frontline to CEO. Based on Bartlett\'s serial reproduction research (1932): each retelling preserves only a fraction r of the original. At 82% fidelity and 6 levels, only 37% of the original signal reaches the top.',
    category: 'primary',
  },
  {
    id: 'methodology-decision-quality',
    title: 'Decision Quality',
    formula: <>r<sup>(L-1)</sup> × e<sup>(-λ·L·K)</sup></>,
    description:
      'Combines signal fidelity with information staleness. The first term captures signal degradation; the second captures time decay — information loses value as it ages during the decision cycle.',
    constants: 'λ = 0.008 (staleness decay), K = 3 days/layer',
    category: 'primary',
  },
  {
    id: 'methodology-pivot-speed',
    title: 'Pivot Speed',
    formula: <>(1/N) × Σ n<sub>k</sub> × r<sup>|L-1-k|</sup></>,
    description:
      'The CEO\'s fidelity-weighted reach across all layers (torque model). For each layer k, the directive\'s effective weight is discounted by signal decay over the distance. A score of 0.5+ means directives effectively land; below 0.25, pivots are largely lost in translation.',
    category: 'primary',
  },
  {
    id: 'methodology-decision-latency',
    title: 'Decision Latency',
    formula: <>L × K</>,
    description:
      'The round-trip time for a decision cycle: information travels up L layers, gets processed, and the decision travels back down. K = 3 days/layer is a conservative estimate accounting for scheduling, review, and approval at each level.',
    constants: 'K = 3 days/layer',
    category: 'primary',
  },
  {
    id: 'methodology-management-tax',
    title: 'Management Tax',
    formula: <>(N - n<sub>0</sub>) / N × 100%</>,
    description:
      'The percentage of the organization in management roles (all non-IC layers). Layer 0 (frontline ICs) does the productive work; layers 1 through L-1 manage. Below 15% is lean; above 30% means nearly half the org is managing rather than producing.',
    category: 'primary',
  },
  {
    id: 'methodology-drift-cost',
    title: 'Drift Cost',
    formula: <>e<sup>(-α·(L-1)·90)</sup> × 100%</>,
    description:
      'Information accuracy remaining after 90 days. Each layer adds a drift rate that compounds across L-1 layers. A 6-level org loses accuracy ~5× faster than a 2-level org because drift compounds at every relay point.',
    constants: 'α = 0.005/day',
    category: 'primary',
  },

  // ── Secondary Metrics ──
  {
    id: 'methodology-span-of-control',
    title: 'Span of Control',
    formula: <>N<sup>1/L</sup></>,
    description:
      'Average number of direct reports per manager, assuming uniform geometric narrowing. Below 4 indicates excessive management levels; above 7 suggests a lean, empowered structure.',
    category: 'secondary',
  },
  {
    id: 'methodology-shape-gap',
    title: 'Shape Gap',
    formula: <>Σ|w<sub>ideal</sub> - w<sub>actual</sub>| / 2N</>,
    description:
      'How much the actual org shape deviates from an idealized linear triangle. The idealized triangle narrows linearly; real orgs narrow exponentially (creating a horn shape). Higher values indicate a more pronounced middle-management bulge.',
    category: 'secondary',
  },
  {
    id: 'methodology-throughput',
    title: 'Throughput',
    formula: <>5 × N<sup>0.6</sup></>,
    description:
      'Estimated organizational decision throughput using a sub-linear scaling model. Larger orgs make more decisions, but not proportionally — coordination overhead grows. The 0.6 exponent reflects diminishing returns from organizational complexity.',
    constants: 'decisions/month',
    category: 'secondary',
  },
  {
    id: 'methodology-flatness-index',
    title: 'Flatness Index',
    formula: <>Span / L</>,
    description:
      'A composite measure of structural flatness: the ratio of average span of control to org depth. Higher values indicate flatter organizations. An index of 1.0 means span equals depth; values above 2.0 indicate meaningfully flat structures.',
    category: 'secondary',
  },
  {
    id: 'methodology-annual-comm-loss',
    title: 'Annual Comm Loss',
    formula: <>N × $10,140 × (1 - r<sup>2(L-1)</sup>)</>,
    description:
      'Estimated annual cost of ineffective communication, based on the Axios HQ 2025 finding of $10,140/employee/year average loss. Scaled by round-trip signal degradation — deeper orgs waste more because messages lose fidelity on every round trip.',
    category: 'secondary',
  },

  // ── Lag Metrics ──
  {
    id: 'methodology-propagation-delay',
    title: 'Propagation Delay',
    formula: <>d × (L-1)<sup>2</sup></>,
    description:
      'Total time for a strategic signal to propagate from CEO to front line. Based on Fourier\'s Law of thermal conduction — each layer acts as insulation. The key insight: delay scales with the square of depth, not linearly. At 6 levels and 3 days/layer, propagation takes 75 days (not 15). Adding one layer doesn\'t add one unit of delay — it compounds.',
    constants: 'd = decision cycle (days/layer)',
    category: 'lag',
  },
  {
    id: 'methodology-marginal-layer-cost',
    title: 'Marginal Layer Cost',
    formula: <>d × (2(L-1) - 1)</>,
    description:
      'Days saved by removing the deepest organizational layer. Because delay is quadratic, the savings are disproportionately large for deep orgs. Removing one layer from a 6-level org saves 27 days — not 3. This metric makes the ROI of flattening visceral.',
    constants: 'd = decision cycle (days/layer)',
    category: 'lag',
  },

  // ── Response Metrics ──
  {
    id: 'methodology-damping-ratio',
    title: 'Damping Ratio (ζ)',
    formula: <>c / 2√(km)</>,
    description:
      'The single number that determines how your organization responds to change. Based on the damped harmonic oscillator from classical mechanics. Under-damped (ζ < 0.7): org overshoots and oscillates. Critically damped (0.7–1.3): fastest convergence without chaos. Over-damped (ζ > 1.3): sluggish crawl toward the target.',
    constants: 'c = levels × 1.1, k = agility/10, m = √headcount',
    category: 'response',
  },
  {
    id: 'methodology-overshoot',
    title: 'Overshoot',
    formula: <>e<sup>(-πζ / √(1-ζ²))</sup> × 100%</>,
    description:
      'How far past the target your organization swings before correcting. Only applies to under-damped orgs (ζ < 1). A 19% overshoot means the org over-commits resources by 19% on a pivot before pulling back. Over-damped orgs never overshoot — they just arrive too slowly.',
    category: 'response',
  },
  {
    id: 'methodology-settling-time',
    title: 'Settling Time',
    formula: <>4ζ / ω<sub>0</sub> × scale</>,
    description:
      'How long until the organization stays within 2% of the target after a major change (pivot, new strategy, market response). The 2% band represents practical alignment — close enough that execution is effective. Shorter is better, but too short often means under-damped oscillation.',
    constants: 'ω₀ = √(k/m), scale = 3.5 weeks',
    category: 'response',
  },
];
