# Three Pillars Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Lag (thermal propagation) and Response (damped oscillator) models to Model Your Org with progressive disclosure — 1 slider + 3 headline numbers on arrival, full visualizations on demand.

**Architecture:** Two new pure calculation libraries (`thermalLag.ts`, `dampedResponse.ts`) feed into a `PillarDashboard` component that replaces the current ModelYourOrg layout. Three `PillarCard` summary cards show headline metrics; expanding any card reveals its full visualization. Existing fidelity content (SignalCascade, SensitivitySweep, FlippableMetricCards) moves inside the Fidelity expanded view unchanged.

**Tech Stack:** React 19, TypeScript 5.9, Vitest 4, Zustand 5 (persist), Tailwind CSS 4, custom SVG visualizations (no charting library).

**Spec:** `docs/superpowers/specs/2026-04-06-three-pillars-design.md`

**IMPORTANT:** Do NOT commit unless explicitly asked. Strip commit steps from execution.

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `src/lib/thermalLag.ts` | Pure thermal lag calculations (propagation delay, marginal cost, layer delays) |
| `src/lib/dampedResponse.ts` | Pure damped oscillator calculations (damping ratio, overshoot, settling time, step response curve) |
| `src/lib/__tests__/thermalLag.test.ts` | Unit tests for thermal lag |
| `src/lib/__tests__/dampedResponse.test.ts` | Unit tests for damped response |
| `src/components/model/PillarCard.tsx` | Summary card for dashboard view (headline metric + "Explore" link) |
| `src/components/model/PillarDashboard.tsx` | Orchestrator: 3 PillarCards, expand/collapse logic, advanced inputs toggle |
| `src/components/model/PropagationDelay.tsx` | Lag visualization: SVG horizontal bars with quadratic scaling |
| `src/components/model/ChangeResponseTimeline.tsx` | Response visualization: SVG step-response curve with org-native labels |
| `src/components/model/ThreeFutures.tsx` | Three narrative regime cards with dynamic highlighting |

### Modified Files

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add `ThermalLagResult`, `DampedResponseResult`, `ResponseRegime` types |
| `src/store/useCompanyStore.ts` | Add `decisionCycle`, `culturalAgility`, `expandedPillar`, `advancedInputsOpen` fields + actions + URL params |
| `src/data/referenceCompanies.ts` | Add `decisionCycle` and `culturalAgility` fields to each company |
| `src/data/methodologyMetrics.tsx` | Add 5 new `MetricDefinition` entries (2 Lag, 3 Response) |
| `src/components/model/ModelYourOrg.tsx` | Replace layout with `PillarDashboard` orchestrator |

---

## Task 1: Types — New Interfaces

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add new types to the types file**

Open `src/types/index.ts` and add these types at the bottom, before the Relay Simulator section:

```typescript
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

// ── Damped Response (Pillar 3) ──────────────────────────────────────
export type ResponseRegime = 'under-damped' | 'critically-damped' | 'over-damped';

export interface DampedResponseResult {
  dampingRatio: number;       // ζ (zeta)
  naturalFrequency: number;   // ω₀
  overshootPct: number;       // 0 for over-damped
  settlingTimeWeeks: number;  // time to stay within 2% of target
  regime: ResponseRegime;
  regimeLabel: string;        // "Too Fast" | "Right-Sized" | "Too Slow"
}
```

- [ ] **Step 2: Add new fields to Company interface**

In the same file, extend the `Company` interface:

```typescript
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
  culturalAgility?: number;   // 0-100 (optional for backward compat)
}
```

- [ ] **Step 3: Run type check**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors (new types are additive, Company fields are optional)

---

## Task 2: Thermal Lag Calculation Library (TDD)

**Files:**
- Create: `src/lib/thermalLag.ts`
- Create: `src/lib/__tests__/thermalLag.test.ts`

- [ ] **Step 1: Write the test file**

Create `src/lib/__tests__/thermalLag.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  calcPropagationDelay,
  calcMarginalLayerCost,
  calcLagRatio,
  calcLayerDelays,
} from '../thermalLag';

describe('calcPropagationDelay', () => {
  describe('standard case (6 levels, 3 days/layer)', () => {
    it('returns quadratic delay: d × (L-1)²', () => {
      // 3 × 5² = 75
      expect(calcPropagationDelay(6, 3)).toBe(75);
    });
  });

  describe('edge cases', () => {
    it('1 level = 0 delay (no relays)', () => {
      expect(calcPropagationDelay(1, 3)).toBe(0);
    });

    it('2 levels = d × 1 = d', () => {
      expect(calcPropagationDelay(2, 3)).toBe(3);
    });

    it('14 levels, 1 day/layer = 169', () => {
      // 1 × 13² = 169
      expect(calcPropagationDelay(14, 1)).toBe(169);
    });

    it('fractional cycle: 6 levels, 1.5 days/layer', () => {
      // 1.5 × 25 = 37.5
      expect(calcPropagationDelay(6, 1.5)).toBe(37.5);
    });
  });
});

describe('calcMarginalLayerCost', () => {
  it('6 levels, 3 days: removing deepest saves 27 days', () => {
    // d × (2(L-1) - 1) = 3 × (10-1) = 27
    expect(calcMarginalLayerCost(6, 3)).toBe(27);
  });

  it('4 levels, 3 days: removing deepest saves 15 days', () => {
    // 3 × (6-1) = 15
    expect(calcMarginalLayerCost(4, 3)).toBe(15);
  });

  it('2 levels: removing deepest saves d days', () => {
    expect(calcMarginalLayerCost(2, 3)).toBe(3);
  });

  it('1 level: no layer to remove, returns 0', () => {
    expect(calcMarginalLayerCost(1, 3)).toBe(0);
  });
});

describe('calcLagRatio', () => {
  it('6 levels: ratio = L-1 = 5', () => {
    expect(calcLagRatio(6)).toBe(5);
  });

  it('2 levels: ratio = 1', () => {
    expect(calcLagRatio(2)).toBe(1);
  });

  it('1 level: ratio = 0 (no delay)', () => {
    expect(calcLagRatio(1)).toBe(0);
  });
});

describe('calcLayerDelays', () => {
  it('returns correct number of entries (L layers)', () => {
    const delays = calcLayerDelays(6, 3);
    expect(delays).toHaveLength(6);
  });

  it('first layer (CEO) has 0 cumulative delay', () => {
    const delays = calcLayerDelays(6, 3);
    expect(delays[0].cumulativeDelay).toBe(0);
    expect(delays[0].layer).toBe(0);
  });

  it('each layer has correct cumulative delay: d × k²', () => {
    const delays = calcLayerDelays(6, 3);
    expect(delays[0].cumulativeDelay).toBe(0);    // 3 × 0² = 0
    expect(delays[1].cumulativeDelay).toBe(3);    // 3 × 1² = 3
    expect(delays[2].cumulativeDelay).toBe(12);   // 3 × 2² = 12
    expect(delays[3].cumulativeDelay).toBe(27);   // 3 × 3² = 27
    expect(delays[4].cumulativeDelay).toBe(48);   // 3 × 4² = 48
    expect(delays[5].cumulativeDelay).toBe(75);   // 3 × 5² = 75
  });

  it('marginal delay accelerates (quadratic gap)', () => {
    const delays = calcLayerDelays(6, 3);
    // Marginals: 0, 3, 9, 15, 21, 27
    expect(delays[1].marginalDelay).toBe(3);
    expect(delays[2].marginalDelay).toBe(9);
    expect(delays[3].marginalDelay).toBe(15);
    expect(delays[4].marginalDelay).toBe(21);
    expect(delays[5].marginalDelay).toBe(27);
  });

  it('assigns role labels', () => {
    const delays = calcLayerDelays(6, 3);
    expect(delays[0].role).toBe('CEO');
    expect(delays[delays.length - 1].role).toBe('Front Line');
  });

  it('1 level: returns single entry with 0 delay', () => {
    const delays = calcLayerDelays(1, 3);
    expect(delays).toHaveLength(1);
    expect(delays[0].cumulativeDelay).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run src/lib/__tests__/thermalLag.test.ts`
Expected: FAIL — module `../thermalLag` not found

- [ ] **Step 3: Write the implementation**

Create `src/lib/thermalLag.ts`:

```typescript
import type { ThermalLagResult, LayerDelay } from '../types';

const ROLE_LABELS = [
  'CEO', 'SVP', 'VP', 'Director', 'Sr. Manager', 'Manager',
  'Team Lead', 'Sr. IC', 'IC', 'Associate', 'Analyst',
  'Coordinator', 'Specialist', 'Assistant', 'Front Line',
];

function roleForLayer(layer: number, totalLevels: number): string {
  if (layer === 0) return 'CEO';
  if (layer === totalLevels - 1) return 'Front Line';
  // Map intermediate layers proportionally into ROLE_LABELS[1..13]
  const midLabels = ROLE_LABELS.slice(1, -1);
  const idx = Math.round((layer - 1) / Math.max(1, totalLevels - 3) * (midLabels.length - 1));
  return midLabels[Math.min(idx, midLabels.length - 1)];
}

/**
 * Total propagation delay (CEO to front line).
 * Fourier-inspired: delay scales with the square of depth.
 * τ_total = decisionCycle × (levels - 1)²
 */
export function calcPropagationDelay(levels: number, decisionCycle: number): number {
  const relays = levels - 1;
  return decisionCycle * relays * relays;
}

/**
 * Days saved by removing the deepest layer.
 * Δτ = decisionCycle × (2(L-1) - 1)
 */
export function calcMarginalLayerCost(levels: number, decisionCycle: number): number {
  if (levels <= 1) return 0;
  const relays = levels - 1;
  return decisionCycle * (2 * relays - 1);
}

/**
 * Ratio of actual (quadratic) delay to theoretical linear delay.
 * lagRatio = τ_total / (d × (L-1)) = L-1
 */
export function calcLagRatio(levels: number): number {
  return Math.max(0, levels - 1);
}

/**
 * Per-layer delay breakdown.
 * Layer k has cumulative delay = d × k² and marginal = d × (2k - 1).
 */
export function calcLayerDelays(levels: number, decisionCycle: number): LayerDelay[] {
  return Array.from({ length: levels }, (_, k) => ({
    layer: k,
    role: roleForLayer(k, levels),
    cumulativeDelay: decisionCycle * k * k,
    marginalDelay: k === 0 ? 0 : decisionCycle * (2 * k - 1),
  }));
}

/**
 * Full thermal lag result.
 */
export function calcThermalLag(levels: number, decisionCycle: number): ThermalLagResult {
  return {
    totalDelay: calcPropagationDelay(levels, decisionCycle),
    marginalLayerCost: calcMarginalLayerCost(levels, decisionCycle),
    lagRatio: calcLagRatio(levels),
    layerDelays: calcLayerDelays(levels, decisionCycle),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run src/lib/__tests__/thermalLag.test.ts`
Expected: All tests PASS

---

## Task 3: Damped Response Calculation Library (TDD)

**Files:**
- Create: `src/lib/dampedResponse.ts`
- Create: `src/lib/__tests__/dampedResponse.test.ts`

- [ ] **Step 1: Write the test file**

Create `src/lib/__tests__/dampedResponse.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  calcDampingRatio,
  calcNaturalFrequency,
  calcOvershoot,
  calcSettlingTimeWeeks,
  calcStepResponse,
  classifyRegime,
} from '../dampedResponse';

describe('calcDampingRatio', () => {
  it('standard case: L=6, H=5000, A=55 → ζ ≈ 0.63', () => {
    // m=5, k=5.5, c=6.6 → ζ = 6.6 / (2×√27.5) ≈ 0.629
    expect(calcDampingRatio(6, 5000, 55)).toBeCloseTo(0.63, 1);
  });

  it('flat org: L=2, H=500, A=80 → under-damped', () => {
    const zeta = calcDampingRatio(2, 500, 80);
    expect(zeta).toBeLessThan(1);
  });

  it('deep org: L=12, H=100000, A=30 → over-damped', () => {
    const zeta = calcDampingRatio(12, 100000, 30);
    expect(zeta).toBeGreaterThan(1);
  });

  it('higher agility → lower damping ratio', () => {
    const zetaLow = calcDampingRatio(6, 5000, 30);
    const zetaHigh = calcDampingRatio(6, 5000, 80);
    expect(zetaHigh).toBeLessThan(zetaLow);
  });

  it('more levels → higher damping ratio', () => {
    const zetaShallow = calcDampingRatio(3, 5000, 55);
    const zetaDeep = calcDampingRatio(9, 5000, 55);
    expect(zetaDeep).toBeGreaterThan(zetaShallow);
  });
});

describe('calcNaturalFrequency', () => {
  it('standard case: H=5000, A=55', () => {
    // ω₀ = √(k/m) = √(5.5/5) = √1.1 ≈ 1.049
    expect(calcNaturalFrequency(5000, 55)).toBeCloseTo(1.049, 2);
  });

  it('higher agility → higher frequency', () => {
    const f1 = calcNaturalFrequency(5000, 30);
    const f2 = calcNaturalFrequency(5000, 80);
    expect(f2).toBeGreaterThan(f1);
  });
});

describe('calcOvershoot', () => {
  it('under-damped (ζ=0.3) → significant overshoot', () => {
    // OS = e^(-π×0.3/√(1-0.09)) × 100 ≈ 37.2%
    expect(calcOvershoot(0.3)).toBeCloseTo(37.2, 0);
  });

  it('under-damped (ζ=0.63) → ~19% overshoot', () => {
    const os = calcOvershoot(0.63);
    expect(os).toBeCloseTo(19, 1);
  });

  it('critically damped (ζ=1.0) → 0% overshoot', () => {
    expect(calcOvershoot(1.0)).toBe(0);
  });

  it('over-damped (ζ=2.0) → 0% overshoot', () => {
    expect(calcOvershoot(2.0)).toBe(0);
  });
});

describe('calcSettlingTimeWeeks', () => {
  it('standard case produces weeks in realistic range', () => {
    const weeks = calcSettlingTimeWeeks(6, 5000, 55);
    expect(weeks).toBeGreaterThan(4);
    expect(weeks).toBeLessThan(52);
  });

  it('deeper org → longer settling time', () => {
    const shallow = calcSettlingTimeWeeks(3, 5000, 55);
    const deep = calcSettlingTimeWeeks(9, 5000, 55);
    expect(deep).toBeGreaterThan(shallow);
  });
});

describe('calcStepResponse', () => {
  it('starts at 0 (t=0)', () => {
    expect(calcStepResponse(0, 0.63, 1.0)).toBeCloseTo(0, 2);
  });

  it('converges to 1.0 for large t (under-damped)', () => {
    expect(calcStepResponse(50, 0.63, 1.0)).toBeCloseTo(1.0, 1);
  });

  it('converges to 1.0 for large t (over-damped)', () => {
    expect(calcStepResponse(50, 2.0, 1.0)).toBeCloseTo(1.0, 1);
  });

  it('converges to 1.0 for large t (critically damped)', () => {
    expect(calcStepResponse(50, 1.0, 1.0)).toBeCloseTo(1.0, 1);
  });

  it('under-damped overshoots past 1.0', () => {
    // At some point the curve exceeds 1.0
    const values = Array.from({ length: 100 }, (_, i) =>
      calcStepResponse(i * 0.1, 0.3, 1.0)
    );
    expect(Math.max(...values)).toBeGreaterThan(1.0);
  });

  it('over-damped never exceeds 1.0', () => {
    const values = Array.from({ length: 100 }, (_, i) =>
      calcStepResponse(i * 0.1, 2.0, 1.0)
    );
    expect(Math.max(...values)).toBeLessThanOrEqual(1.001);
  });
});

describe('classifyRegime', () => {
  it('ζ < 0.7 → under-damped', () => {
    expect(classifyRegime(0.5).regime).toBe('under-damped');
    expect(classifyRegime(0.5).regimeLabel).toBe('Too Fast');
  });

  it('0.7 ≤ ζ ≤ 1.3 → critically-damped', () => {
    expect(classifyRegime(0.8).regime).toBe('critically-damped');
    expect(classifyRegime(1.0).regime).toBe('critically-damped');
    expect(classifyRegime(1.3).regime).toBe('critically-damped');
    expect(classifyRegime(1.0).regimeLabel).toBe('Right-Sized');
  });

  it('ζ > 1.3 → over-damped', () => {
    expect(classifyRegime(1.5).regime).toBe('over-damped');
    expect(classifyRegime(1.5).regimeLabel).toBe('Too Slow');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run src/lib/__tests__/dampedResponse.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

Create `src/lib/dampedResponse.ts`:

```typescript
import type { DampedResponseResult, ResponseRegime } from '../types';

/** Damping added per organizational layer. Calibrated so typical orgs span all three regimes. */
const DAMPING_PER_LAYER = 1.1;

/** Converts abstract settling time to weeks. Calibrated for 10-20 week range at L=6, H=5000, A=55. */
const TIME_SCALE_WEEKS = 3.5;

/**
 * Damping ratio ζ — the single number that determines regime.
 * ζ = c / (2 × √(k × m))
 * where m = headcount/1000, k = agility/10, c = levels × DAMPING_PER_LAYER
 */
export function calcDampingRatio(
  levels: number,
  headcount: number,
  culturalAgility: number,
): number {
  const m = headcount / 1000;
  const k = culturalAgility / 10;
  const c = levels * DAMPING_PER_LAYER;
  return c / (2 * Math.sqrt(k * m));
}

/**
 * Natural frequency ω₀ = √(k/m).
 * Higher agility or smaller org → higher natural frequency (faster potential response).
 */
export function calcNaturalFrequency(headcount: number, culturalAgility: number): number {
  const m = headcount / 1000;
  const k = culturalAgility / 10;
  return Math.sqrt(k / m);
}

/**
 * Overshoot percentage for under-damped systems.
 * OS = e^(-πζ / √(1-ζ²)) × 100
 * Returns 0 for critically-damped and over-damped (ζ ≥ 1).
 */
export function calcOvershoot(zeta: number): number {
  if (zeta >= 1) return 0;
  return Math.exp(-Math.PI * zeta / Math.sqrt(1 - zeta * zeta)) * 100;
}

/**
 * Settling time in weeks (2% criterion).
 * t_s ≈ 4 / (ζ × ω₀) scaled to weeks.
 */
export function calcSettlingTimeWeeks(
  levels: number,
  headcount: number,
  culturalAgility: number,
): number {
  const zeta = calcDampingRatio(levels, headcount, culturalAgility);
  const omega0 = calcNaturalFrequency(headcount, culturalAgility);
  const rawSettling = 4 / (zeta * omega0);
  return rawSettling * TIME_SCALE_WEEKS;
}

/**
 * Step response x(t) — how the org converges toward 100% alignment.
 * Returns a value from 0 to >1 (overshoot possible for under-damped).
 */
export function calcStepResponse(t: number, zeta: number, omega0: number): number {
  if (t <= 0) return 0;

  if (Math.abs(zeta - 1) < 0.01) {
    // Critically damped: x(t) = 1 - (1 + ω₀t) × e^(-ω₀t)
    return 1 - (1 + omega0 * t) * Math.exp(-omega0 * t);
  }

  if (zeta < 1) {
    // Under-damped: x(t) = 1 - (e^(-ζω₀t) / √(1-ζ²)) × sin(ω_d·t + φ)
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    const phi = Math.acos(zeta);
    return 1 - (Math.exp(-zeta * omega0 * t) / Math.sqrt(1 - zeta * zeta))
      * Math.sin(omegaD * t + phi);
  }

  // Over-damped: two real exponential terms
  const sqrtTerm = Math.sqrt(zeta * zeta - 1);
  const s1 = (-zeta + sqrtTerm) * omega0;
  const s2 = (-zeta - sqrtTerm) * omega0;
  const c1 = (zeta + sqrtTerm) / (2 * sqrtTerm);
  const c2 = -(zeta - sqrtTerm) / (2 * sqrtTerm);
  return 1 - c1 * Math.exp(s1 * t) - c2 * Math.exp(s2 * t);
}

/**
 * Classify the org into a response regime based on damping ratio.
 */
export function classifyRegime(zeta: number): { regime: ResponseRegime; regimeLabel: string } {
  if (zeta < 0.7) return { regime: 'under-damped', regimeLabel: 'Too Fast' };
  if (zeta <= 1.3) return { regime: 'critically-damped', regimeLabel: 'Right-Sized' };
  return { regime: 'over-damped', regimeLabel: 'Too Slow' };
}

/**
 * Full damped response result.
 */
export function calcDampedResponse(
  levels: number,
  headcount: number,
  culturalAgility: number,
): DampedResponseResult {
  const zeta = calcDampingRatio(levels, headcount, culturalAgility);
  const omega0 = calcNaturalFrequency(headcount, culturalAgility);
  const { regime, regimeLabel } = classifyRegime(zeta);

  return {
    dampingRatio: zeta,
    naturalFrequency: omega0,
    overshootPct: calcOvershoot(zeta),
    settlingTimeWeeks: calcSettlingTimeWeeks(levels, headcount, culturalAgility),
    regime,
    regimeLabel,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run src/lib/__tests__/dampedResponse.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Run the full test suite**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm test`
Expected: All existing tests + new tests PASS (should be 124 existing + ~25 new)

---

## Task 4: Zustand Store — New Fields and URL Params

**Files:**
- Modify: `src/store/useCompanyStore.ts`

- [ ] **Step 1: Re-read the store file**

Read `src/store/useCompanyStore.ts` to ensure you have the latest content before editing.

- [ ] **Step 2: Update the state interface**

Add new fields to `CompanyState`:

```typescript
interface CompanyState {
  fidelityRate: number;
  levels: number;
  headcount: number;
  activeScenarioId: string | null;
  decisionCycle: number;       // days/layer (1-14, default 3)
  culturalAgility: number;     // 0-100 (default 55)
  expandedPillar: 'fidelity' | 'lag' | 'response' | null;  // null = dashboard
  advancedInputsOpen: boolean;
}
```

- [ ] **Step 3: Update the actions interface**

Add new actions to `CompanyActions`:

```typescript
interface CompanyActions {
  setFidelityRate: (rate: number) => void;
  setLevels: (levels: number) => void;
  setHeadcount: (headcount: number) => void;
  setActiveScenarioId: (id: string | null) => void;
  setDecisionCycle: (d: number) => void;
  setCulturalAgility: (a: number) => void;
  setExpandedPillar: (p: 'fidelity' | 'lag' | 'response' | null) => void;
  setAdvancedInputsOpen: (open: boolean) => void;
}
```

- [ ] **Step 4: Update applyUrlParams to read `&d=` and `&a=`**

In the `applyUrlParams` function, add handling for the new URL params after the existing `f` handling:

```typescript
const d = params.get('d');
const a = params.get('a');
// Update the initial check:
if (!l && !h && !f && !d && !a) return false;

// Add after the f block:
if (d) {
  const cycle = Math.max(1, Math.min(14, Number(d)));
  if (!isNaN(cycle)) state.setDecisionCycle(cycle);
}
if (a) {
  const agility = Math.max(0, Math.min(100, Math.round(Number(a))));
  if (!isNaN(agility)) state.setCulturalAgility(agility);
}
```

- [ ] **Step 5: Update the store create block**

Add new defaults and actions inside the `create` call:

```typescript
decisionCycle: 3,
culturalAgility: 55,
expandedPillar: null,
advancedInputsOpen: false,
setDecisionCycle: (d) => set({ decisionCycle: d }),
setCulturalAgility: (a) => set({ culturalAgility: a }),
setExpandedPillar: (p) => set({ expandedPillar: p }),
setAdvancedInputsOpen: (open) => set({ advancedInputsOpen: open }),
```

- [ ] **Step 6: Update partialize to persist new fields (exclude UI state)**

```typescript
partialize: (state) => ({
  fidelityRate: state.fidelityRate,
  levels: state.levels,
  headcount: state.headcount,
  decisionCycle: state.decisionCycle,
  culturalAgility: state.culturalAgility,
  // Excluded: activeScenarioId, expandedPillar, advancedInputsOpen
}),
```

- [ ] **Step 7: Update buildShareUrl**

```typescript
export function buildShareUrl(): string {
  const { levels, headcount, fidelityRate, decisionCycle, culturalAgility } =
    useCompanyStore.getState();
  const url = new URL(window.location.href);
  url.search = `?l=${levels}&h=${headcount}&f=${fidelityRate}&d=${decisionCycle}&a=${culturalAgility}`;
  url.hash = 'model';
  return url.toString();
}
```

- [ ] **Step 8: Run type check and tests**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit && npm test`
Expected: No type errors, all tests pass

---

## Task 5: Reference Company Data — Add New Fields

**Files:**
- Modify: `src/data/referenceCompanies.ts`

- [ ] **Step 1: Re-read the file**

Read `src/data/referenceCompanies.ts` to get current content.

- [ ] **Step 2: Add `decisionCycle` and `culturalAgility` to each company**

Add the two new fields to each company object:

```typescript
// Valve — flat, no managers, autonomous
decisionCycle: 1.5,
culturalAgility: 85,

// Nucor — flat manufacturing, lean
decisionCycle: 2,
culturalAgility: 70,

// Google — deep tech, process-heavy
decisionCycle: 3.5,
culturalAgility: 55,

// Meta — recently flattened, efficiency push
decisionCycle: 2.5,
culturalAgility: 65,

// Haier — radical micro-enterprise model
decisionCycle: 1,
culturalAgility: 90,

// Amazon — deep hierarchy, high pace
decisionCycle: 3,
culturalAgility: 50,
```

- [ ] **Step 3: Run type check**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors

---

## Task 6: Methodology Metrics — Add 5 New Entries

**Files:**
- Modify: `src/data/methodologyMetrics.tsx`

- [ ] **Step 1: Re-read the file**

Read `src/data/methodologyMetrics.tsx` to get current content.

- [ ] **Step 2: Update MetricDefinition type to support new categories**

Change the `category` field type:

```typescript
export interface MetricDefinition {
  id: string;
  title: string;
  formula: ReactNode;
  description: string;
  constants?: string;
  category: 'primary' | 'secondary' | 'lag' | 'response';
}
```

- [ ] **Step 3: Add 5 new metric definitions**

Append to the `METHODOLOGY_METRICS` array, after the existing secondary metrics:

```tsx
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
  constants: 'c = levels × 1.1, k = agility/10, m = headcount/1000',
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
  formula: <>4 / (ζ × ω<sub>0</sub>) × scale</>,
  description:
    'How long until the organization stays within 2% of the target after a major change (pivot, new strategy, market response). The 2% band represents practical alignment — close enough that execution is effective. Shorter is better, but too short often means under-damped oscillation.',
  constants: 'ω₀ = √(k/m), scale = 3.5 weeks',
  category: 'response',
},
```

- [ ] **Step 4: Run type check**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors. Note: if `MethodologyCard` or `MethodologySection` filter by category, you may need to check those components handle the new category values. Read them and verify.

---

## Task 7: PillarCard Component

**Files:**
- Create: `src/components/model/PillarCard.tsx`

- [ ] **Step 1: Create the PillarCard component**

Create `src/components/model/PillarCard.tsx`:

```tsx
import { ChevronDown, ChevronUp } from 'lucide-react';

export type PillarId = 'fidelity' | 'lag' | 'response';

interface PillarCardProps {
  id: PillarId;
  label: string;
  value: string;
  sub: string;
  accentColor: string;       // hex color for the value
  isExpanded: boolean;
  onToggle: () => void;
}

export function PillarCard({
  label,
  value,
  sub,
  accentColor,
  isExpanded,
  onToggle,
}: PillarCardProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        w-full text-left bg-white rounded-xl border shadow-sm p-5
        transition-all duration-200 cursor-pointer
        ${isExpanded
          ? 'border-stone-300 ring-2 ring-stone-200'
          : 'border-stone-200 hover:border-stone-300 hover:shadow-md'}
      `}
    >
      <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p
        className="text-3xl font-bold font-mono tabular-nums mb-1"
        style={{ color: accentColor }}
      >
        {value}
      </p>
      <p className="text-sm text-stone-500">{sub}</p>
      <div className="flex items-center gap-1 mt-3 text-xs font-medium text-stone-400">
        {isExpanded ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            Collapse
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" />
            Explore
          </>
        )}
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Run type check**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors

---

## Task 8: PropagationDelay Visualization

**Files:**
- Create: `src/components/model/PropagationDelay.tsx`

- [ ] **Step 1: Create the PropagationDelay component**

Create `src/components/model/PropagationDelay.tsx`:

```tsx
import { useMemo } from 'react';
import { calcLayerDelays, calcMarginalLayerCost } from '../../lib/thermalLag';

interface PropagationDelayProps {
  levels: number;
  decisionCycle: number;
}

/** Interpolate from blue (#63A0FF) to warm (#A8967A) based on 0-1 pct. */
function lagBarColor(pct: number): string {
  const r = Math.round(99 + (168 - 99) * pct);
  const g = Math.round(160 + (150 - 160) * pct);
  const b = Math.round(255 + (122 - 255) * pct);
  return `rgb(${r},${g},${b})`;
}

export function PropagationDelay({ levels, decisionCycle }: PropagationDelayProps) {
  const delays = useMemo(
    () => calcLayerDelays(levels, decisionCycle),
    [levels, decisionCycle],
  );

  const marginalCost = useMemo(
    () => calcMarginalLayerCost(levels, decisionCycle),
    [levels, decisionCycle],
  );

  const maxDelay = delays[delays.length - 1]?.cumulativeDelay || 1;

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 lg:p-6">
      <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1">
        Propagation Delay
      </h3>
      <p className="text-sm text-stone-400 mb-5">
        How long a strategic signal takes to reach each layer
      </p>

      <div className="space-y-1.5">
        {delays.map((d) => {
          const widthPct = maxDelay > 0
            ? Math.max(1, (d.cumulativeDelay / maxDelay) * 100)
            : (d.layer === 0 ? 1 : 0);

          return (
            <div key={d.layer} className="flex items-center gap-3">
              <span className="text-xs font-mono text-stone-400 w-28 shrink-0 text-right">
                L{d.layer} · {d.role}
              </span>
              <div className="flex-1 h-6 bg-stone-100 rounded relative overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-500 ease-out"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: lagBarColor(d.cumulativeDelay / Math.max(maxDelay, 1)),
                  }}
                />
              </div>
              <span className="text-xs font-mono text-stone-500 w-16 text-right tabular-nums">
                {d.cumulativeDelay === 0 ? 'Day 0' : `Day ${Math.round(d.cumulativeDelay)}`}
              </span>
            </div>
          );
        })}
      </div>

      {levels > 1 && (
        <p className="text-sm text-stone-500 mt-4 pt-3 border-t border-stone-100">
          Removing 1 layer saves{' '}
          <span className="font-bold font-mono text-stone-700">
            {Math.round(marginalCost)} days
          </span>
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run type check**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors

---

## Task 9: ChangeResponseTimeline Visualization

**Files:**
- Create: `src/components/model/ChangeResponseTimeline.tsx`

- [ ] **Step 1: Create the ChangeResponseTimeline component**

Create `src/components/model/ChangeResponseTimeline.tsx`:

```tsx
import { useMemo } from 'react';
import {
  calcDampingRatio,
  calcNaturalFrequency,
  calcStepResponse,
  calcOvershoot,
  calcSettlingTimeWeeks,
  classifyRegime,
} from '../../lib/dampedResponse';

interface ChangeResponseTimelineProps {
  levels: number;
  headcount: number;
  culturalAgility: number;
}

// Generate SVG path from step response data
function responsePath(
  points: { t: number; x: number }[],
  xScale: (t: number) => number,
  yScale: (x: number) => number,
): string {
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(p.t).toFixed(1)},${yScale(p.x).toFixed(1)}`)
    .join(' ');
}

// Reference ghost curves
const GHOST_CONFIGS = [
  { zeta: 0.3, omega0: 1, color: '#EF4444', label: 'Under-damped' },
  { zeta: 1.0, omega0: 1, color: '#4ADE80', label: 'Critically damped' },
  { zeta: 2.0, omega0: 1, color: '#a8a29e', label: 'Over-damped' },
] as const;

export function ChangeResponseTimeline({
  levels,
  headcount,
  culturalAgility,
}: ChangeResponseTimelineProps) {
  const zeta = useMemo(
    () => calcDampingRatio(levels, headcount, culturalAgility),
    [levels, headcount, culturalAgility],
  );
  const omega0 = useMemo(
    () => calcNaturalFrequency(headcount, culturalAgility),
    [headcount, culturalAgility],
  );
  const overshoot = useMemo(() => calcOvershoot(zeta), [zeta]);
  const settlingWeeks = useMemo(
    () => calcSettlingTimeWeeks(levels, headcount, culturalAgility),
    [levels, headcount, culturalAgility],
  );
  const { regimeLabel } = classifyRegime(zeta);

  // Chart dimensions
  const W = 560;
  const H = 200;
  const pad = { top: 20, right: 20, bottom: 40, left: 55 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  // Time range: enough to show settling
  const tMax = Math.max(10, Math.ceil(settlingWeeks * 1.5));
  const numPoints = 150;

  const xScale = (t: number) => pad.left + (t / tMax) * plotW;
  const yScale = (x: number) => pad.top + plotH - (x / 1.3) * plotH; // 0-130% range

  // Generate user's curve
  const userPoints = useMemo(() => {
    const timeScale = settlingWeeks / (4 / (zeta * omega0));
    return Array.from({ length: numPoints + 1 }, (_, i) => {
      const t = (i / numPoints) * tMax;
      const tRaw = t / Math.max(timeScale, 0.01);
      return { t, x: calcStepResponse(tRaw, zeta, omega0) };
    });
  }, [zeta, omega0, tMax, settlingWeeks, numPoints]);

  // Ghost curves (fixed reference)
  const ghostPaths = useMemo(
    () =>
      GHOST_CONFIGS.map((g) => {
        const pts = Array.from({ length: numPoints + 1 }, (_, i) => {
          const t = (i / numPoints) * tMax;
          return { t, x: calcStepResponse(t * 0.8, g.zeta, g.omega0) };
        });
        return { ...g, path: responsePath(pts, xScale, yScale) };
      }),
    [tMax, numPoints, xScale, yScale],
  );

  const userPath = responsePath(userPoints, xScale, yScale);

  // Find peak for overshoot annotation
  const peak = userPoints.reduce((max, p) => (p.x > max.x ? p : max), userPoints[0]);

  // Phase zone boundaries (proportional to settling time)
  const mobilizeEnd = Math.min(tMax * 0.25, settlingWeeks * 0.3);
  const overshootEnd = Math.min(tMax * 0.45, settlingWeeks * 0.6);
  const correctEnd = Math.min(tMax * 0.7, settlingWeeks * 0.9);

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 lg:p-6">
      <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1">
        Change Response Timeline
      </h3>
      <p className="text-sm text-stone-400 mb-4">
        What happens when your org tries to pivot
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Phase background zones */}
        <rect x={xScale(0)} y={pad.top} width={xScale(mobilizeEnd) - xScale(0)} height={plotH}
          fill="rgba(99,160,255,0.04)" />
        <rect x={xScale(mobilizeEnd)} y={pad.top} width={xScale(overshootEnd) - xScale(mobilizeEnd)} height={plotH}
          fill="rgba(239,68,68,0.03)" />
        <rect x={xScale(overshootEnd)} y={pad.top} width={xScale(correctEnd) - xScale(overshootEnd)} height={plotH}
          fill="rgba(251,191,36,0.03)" />
        <rect x={xScale(correctEnd)} y={pad.top} width={xScale(tMax) - xScale(correctEnd)} height={plotH}
          fill="rgba(74,222,128,0.03)" />

        {/* Phase labels */}
        <text x={(xScale(0) + xScale(mobilizeEnd)) / 2} y={H - 8} textAnchor="middle"
          className="fill-stone-400" style={{ fontSize: 9 }}>Mobilize</text>
        <text x={(xScale(mobilizeEnd) + xScale(overshootEnd)) / 2} y={H - 8} textAnchor="middle"
          className="fill-stone-400" style={{ fontSize: 9 }}>Overshoot</text>
        <text x={(xScale(overshootEnd) + xScale(correctEnd)) / 2} y={H - 8} textAnchor="middle"
          className="fill-stone-400" style={{ fontSize: 9 }}>Correct</text>
        <text x={(xScale(correctEnd) + xScale(tMax)) / 2} y={H - 8} textAnchor="middle"
          className="fill-stone-400" style={{ fontSize: 9 }}>Align</text>

        {/* Axes */}
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH}
          stroke="#d6d3d1" strokeWidth={1} />
        <line x1={pad.left} y1={pad.top + plotH} x2={W - pad.right} y2={pad.top + plotH}
          stroke="#d6d3d1" strokeWidth={1} />

        {/* Y-axis labels */}
        <text x={pad.left - 8} y={yScale(0) + 3} textAnchor="end"
          className="fill-stone-400" style={{ fontSize: 9 }}>0%</text>
        <text x={pad.left - 8} y={yScale(0.5) + 3} textAnchor="end"
          className="fill-stone-400" style={{ fontSize: 9 }}>50%</text>
        <text x={pad.left - 8} y={yScale(1.0) + 3} textAnchor="end"
          className="fill-stone-400" style={{ fontSize: 9 }}>100%</text>

        {/* Target line */}
        <line x1={pad.left} y1={yScale(1.0)} x2={W - pad.right} y2={yScale(1.0)}
          stroke="#E05A1B" strokeWidth={1} strokeDasharray="6,4" opacity={0.4} />
        <text x={W - pad.right + 4} y={yScale(1.0) + 3}
          className="fill-ember" style={{ fontSize: 9 }} opacity={0.6}>goal</text>

        {/* Y-axis title */}
        <text x={12} y={pad.top + plotH / 2} textAnchor="middle"
          className="fill-stone-400" style={{ fontSize: 8 }}
          transform={`rotate(-90,12,${pad.top + plotH / 2})`}>
          % aligned with new strategy
        </text>

        {/* Ghost reference curves */}
        {ghostPaths.map((g) => (
          <path key={g.label} d={g.path} fill="none" stroke={g.color}
            strokeWidth={1.5} opacity={0.2} />
        ))}

        {/* User's curve */}
        <path d={userPath} fill="none" stroke="#63A0FF" strokeWidth={2.5} />

        {/* Overshoot annotation */}
        {overshoot > 2 && (
          <>
            <circle cx={xScale(peak.t)} cy={yScale(peak.x)} r={3} fill="#63A0FF" opacity={0.8} />
            <line x1={xScale(peak.t)} y1={yScale(peak.x) + 4} x2={xScale(peak.t)} y2={yScale(1.0)}
              stroke="#63A0FF" strokeWidth={1} strokeDasharray="2,2" opacity={0.4} />
            <text x={xScale(peak.t) + 6} y={yScale(peak.x) - 4}
              fill="#63A0FF" style={{ fontSize: 10, fontWeight: 600 }}>
              overcommits {Math.round(overshoot)}%
            </text>
          </>
        )}

        {/* Settling annotation */}
        <text x={xScale(Math.min(settlingWeeks, tMax * 0.9))} y={yScale(1.0) - 8}
          fill="#4ADE80" style={{ fontSize: 10 }}>
          ~{Math.round(settlingWeeks)} wks
        </text>
      </svg>

      {/* Legend */}
      <div className="flex gap-4 justify-center mt-2 text-[10px] text-stone-400">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#63A0FF]" /> Your org (ζ={zeta.toFixed(2)})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]" /> Critical (ζ=1.0)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Under (ζ=0.3)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#a8a29e]" /> Over (ζ=2.0)
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run type check**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors

---

## Task 10: ThreeFutures Narrative Cards

**Files:**
- Create: `src/components/model/ThreeFutures.tsx`

- [ ] **Step 1: Create the ThreeFutures component**

Create `src/components/model/ThreeFutures.tsx`:

```tsx
import type { ResponseRegime } from '../../types';

interface ThreeFuturesProps {
  dampingRatio: number;
  overshootPct: number;
  settlingTimeWeeks: number;
  regime: ResponseRegime;
}

interface FutureCard {
  id: ResponseRegime;
  title: string;
  titleColor: string;
  borderColor: string;
  steps: { text: string; dotColor: string }[];
}

const FUTURES: FutureCard[] = [
  {
    id: 'under-damped',
    title: 'Too Fast',
    titleColor: '#EF4444',
    borderColor: 'border-red-200',
    steps: [
      { text: 'CEO announces pivot', dotColor: '#63A0FF' },
      { text: 'Teams overcommit, abandon existing work', dotColor: '#EF4444' },
      { text: 'Overshoot — "wait, not THAT far"', dotColor: '#EF4444' },
      { text: 'Swing back, confusion, mixed signals', dotColor: '#F59E0B' },
      { text: 'Second correction, fatigue sets in', dotColor: '#F59E0B' },
      { text: 'Eventually settles (6+ months)', dotColor: '#4ADE80' },
    ],
  },
  {
    id: 'critically-damped',
    title: 'Right-Sized',
    titleColor: '#4ADE80',
    borderColor: 'border-green-200',
    steps: [
      { text: 'CEO announces pivot', dotColor: '#63A0FF' },
      { text: 'Org mobilizes, good initial momentum', dotColor: '#63A0FF' },
      { text: 'Slight overshoot — some wasted effort', dotColor: '#F59E0B' },
      { text: 'One correction cycle', dotColor: '#F59E0B' },
      { text: 'Aligned and executing', dotColor: '#4ADE80' },
    ],
  },
  {
    id: 'over-damped',
    title: 'Too Slow',
    titleColor: '#a8a29e',
    borderColor: 'border-stone-200',
    steps: [
      { text: 'CEO announces pivot', dotColor: '#63A0FF' },
      { text: 'Committees form, reviews begin', dotColor: '#a8a29e' },
      { text: 'Middle layers dilute urgency', dotColor: '#a8a29e' },
      { text: 'Front line barely notices', dotColor: '#a8a29e' },
      { text: '12+ months, still only ~60% aligned', dotColor: '#a8a29e' },
    ],
  },
];

export function ThreeFutures({
  dampingRatio,
  overshootPct,
  settlingTimeWeeks,
  regime,
}: ThreeFuturesProps) {
  // Build dynamic verdict
  let verdict: string;
  if (regime === 'under-damped') {
    verdict = `Your org overcommits by ~${Math.round(overshootPct)}% on a major pivot before correcting. Expect multiple correction cycles and ~${Math.round(settlingTimeWeeks)} weeks to full alignment.`;
  } else if (regime === 'critically-damped') {
    verdict = `Your org converges efficiently — minor overshoot of ~${Math.round(overshootPct)}%, aligned in ~${Math.round(settlingTimeWeeks)} weeks. This is near-optimal response.`;
  } else {
    verdict = `Your org crawls toward change. No overshoot, but after 12 months you may still be only ~60% aligned. Settling time: ~${Math.round(settlingTimeWeeks)} weeks.`;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {FUTURES.map((card) => {
          const isActive = card.id === regime;
          return (
            <div
              key={card.id}
              className={`
                rounded-xl border p-4 transition-all duration-300
                ${isActive
                  ? `${card.borderColor} bg-white shadow-sm ring-2 ring-stone-200`
                  : 'border-stone-100 bg-stone-50/50 opacity-50'}
              `}
            >
              <p className="text-sm font-bold mb-0.5" style={{ color: card.titleColor }}>
                {card.title}
              </p>
              <p className="text-[10px] text-stone-400 mb-3">
                ζ {card.id === 'under-damped' ? '< 0.7' : card.id === 'critically-damped' ? '0.7–1.3' : '> 1.3'}
                {isActive && (
                  <span className="ml-1 font-bold text-stone-600">
                    (ζ = {dampingRatio.toFixed(2)})
                  </span>
                )}
              </p>
              <div className="space-y-1.5">
                {card.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-stone-500">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: step.dotColor }}
                    />
                    {step.text}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-stone-500 mt-4 pt-3 border-t border-stone-100 leading-relaxed">
        {verdict}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Run type check**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors

---

## Task 11: PillarDashboard Orchestrator

**Files:**
- Create: `src/components/model/PillarDashboard.tsx`

This is the core orchestrator. It renders:
- Three PillarCards in dashboard mode
- The expanded view for whichever pillar is selected
- The advanced inputs toggle

- [ ] **Step 1: Create the PillarDashboard component**

Create `src/components/model/PillarDashboard.tsx`:

```tsx
import { useMemo } from 'react';
import { useCompanyStore } from '../../store/useCompanyStore';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { calcThermalLag } from '../../lib/thermalLag';
import { calcDampedResponse } from '../../lib/dampedResponse';
import { PillarCard } from './PillarCard';
import type { PillarId } from './PillarCard';

// Fidelity expanded view (existing components)
import { SignalCascade } from './SignalCascade';
import { SensitivitySweep } from './SensitivitySweep';
import { FlippableMetricCard } from './FlippableMetricCard';

// New pillar components
import { PropagationDelay } from './PropagationDelay';
import { ChangeResponseTimeline } from './ChangeResponseTimeline';
import { ThreeFutures } from './ThreeFutures';

import { calcDepthTax } from '../../lib/depthTax';
import { calcTriangleGeometry } from '../../lib/triangleGeometry';
import { calcRestructuringImpact } from '../../lib/triangleGeometry';
import { metricColor } from '../../lib/fidelityColor';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function PillarDashboard() {
  const {
    levels, headcount, fidelityRate, decisionCycle, culturalAgility,
    expandedPillar, advancedInputsOpen,
    setExpandedPillar, setAdvancedInputsOpen,
  } = useCompanyStore();

  // Existing calcs
  const org = useMemo(() => calcOrgMetrics(levels, headcount, fidelityRate), [levels, headcount, fidelityRate]);
  const tax = useMemo(() => calcDepthTax(levels, headcount, fidelityRate), [levels, headcount, fidelityRate]);
  const geo = useMemo(() => calcTriangleGeometry(levels, headcount, fidelityRate), [levels, headcount, fidelityRate]);

  // New calcs
  const lag = useMemo(() => calcThermalLag(levels, decisionCycle), [levels, decisionCycle]);
  const response = useMemo(
    () => calcDampedResponse(levels, headcount, culturalAgility),
    [levels, headcount, culturalAgility],
  );

  const togglePillar = (id: PillarId) => {
    setExpandedPillar(expandedPillar === id ? null : id);
    if (!advancedInputsOpen && expandedPillar !== id) {
      setAdvancedInputsOpen(true);
    }
  };

  return (
    <div>
      {/* Three Pillar Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <PillarCard
          id="fidelity"
          label="Fidelity"
          value={`${org.fidelityAtTopPct.toFixed(1)}%`}
          sub="signal survives"
          accentColor="#E05A1B"
          isExpanded={expandedPillar === 'fidelity'}
          onToggle={() => togglePillar('fidelity')}
        />
        <PillarCard
          id="lag"
          label="Lag"
          value={`${Math.round(lag.totalDelay)}d`}
          sub="CEO → front line"
          accentColor="#63A0FF"
          isExpanded={expandedPillar === 'lag'}
          onToggle={() => togglePillar('lag')}
        />
        <PillarCard
          id="response"
          label="Response"
          value={`~${Math.round(response.settlingTimeWeeks)}wk`}
          sub="to settle after pivot"
          accentColor="#4ADE80"
          isExpanded={expandedPillar === 'response'}
          onToggle={() => togglePillar('response')}
        />
      </div>

      {/* Expanded Pillar Content */}
      {expandedPillar === 'fidelity' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Hero: SignalCascade */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 lg:p-6 flex justify-center">
            <SignalCascade levels={levels} fidelityRate={fidelityRate} />
          </div>

          {/* SensitivitySweep */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 lg:p-6">
            <SensitivitySweep />
          </div>

          {/* Existing 6 FlippableMetricCards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <FlippableMetricCard
              label="Signal Fidelity"
              value={org.fidelityAtTopPct.toFixed(1)}
              unit="%"
              sub={`after ${levels - 1} relay${levels > 2 ? 's' : ''}`}
              color={metricColor(org.fidelityAtTopPct / 100)}
              minOut={10} maxOut={100} currentOut={org.fidelityAtTopPct}
              inverseBest
              infoHref="#methodology-signal-fidelity"
            />
            <FlippableMetricCard
              label="Comm Loss"
              value={`$${(org.annualCommLoss / 1000).toFixed(0)}k`}
              sub="annual estimate"
              color={metricColor(1 - org.annualCommLoss / (headcount * 10140))}
              minOut={0} maxOut={headcount * 10140 / 1000} currentOut={org.annualCommLoss / 1000}
              bestLabel="Low" worstLabel="High"
              infoHref="#methodology-annual-comm-loss"
            />
            <FlippableMetricCard
              label="Management Tax"
              value={org.managerRatio.toFixed(1)}
              unit="%"
              sub={`${org.managersEstimate.toLocaleString()} managers`}
              color={metricColor(1 - org.managerRatio / 50)}
              minOut={0} maxOut={50} currentOut={org.managerRatio}
              bestLabel="Lean" worstLabel="Heavy"
              infoHref="#methodology-management-tax"
            />
            <FlippableMetricCard
              label="Pivot Speed"
              value={geo.agilityScore.toFixed(2)}
              sub="torque score"
              color={metricColor(geo.agilityScore)}
              minOut={0} maxOut={1} currentOut={geo.agilityScore}
              inverseBest
              infoHref="#methodology-pivot-speed"
            />
            <FlippableMetricCard
              label="Inertia"
              value={geo.momentOfInertia.toFixed(0)}
              sub="resistance to change"
              color={metricColor(1 - Math.min(geo.momentOfInertia / 1e8, 1))}
              minOut={0} maxOut={1e8} currentOut={geo.momentOfInertia}
              bestLabel="Low" worstLabel="High"
              infoHref="#methodology-shape-gap"
            />
            <FlippableMetricCard
              label="Shape Gap"
              value={geo.totalShapeGap.toFixed(3)}
              sub={geo.shapeClassLabel}
              color={metricColor(1 - Math.min(geo.totalShapeGap / 0.3, 1))}
              minOut={0} maxOut={0.3} currentOut={geo.totalShapeGap}
              bestLabel="Ideal" worstLabel="Distorted"
              infoHref="#methodology-shape-gap"
            />
          </div>
        </div>
      )}

      {expandedPillar === 'lag' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <PropagationDelay levels={levels} decisionCycle={decisionCycle} />
        </div>
      )}

      {expandedPillar === 'response' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <ChangeResponseTimeline
            levels={levels}
            headcount={headcount}
            culturalAgility={culturalAgility}
          />
          <ThreeFutures
            dampingRatio={response.dampingRatio}
            overshootPct={response.overshootPct}
            settlingTimeWeeks={response.settlingTimeWeeks}
            regime={response.regime}
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify imports resolve**

The component imports from existing files. Verify the import paths match reality:
- `SignalCascade` — check it exports from `./SignalCascade`
- `SensitivitySweep` — check it exports from `./SensitivitySweep`
- `calcRestructuringImpact` — check if it's exported from `triangleGeometry.ts`
- `metricColor` — check it's exported from `fidelityColor.ts`

Read each file's exports and adjust import paths if needed.

- [ ] **Step 3: Run type check**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: May have errors — fix any import path issues

---

## Task 12: Restructure ModelYourOrg with Progressive Disclosure

**Files:**
- Modify: `src/components/model/ModelYourOrg.tsx`

This task restructures the existing ModelYourOrg component to use PillarDashboard. The existing inputs move into a progressive disclosure layout.

- [ ] **Step 1: Re-read ModelYourOrg.tsx completely**

Read the full file `src/components/model/ModelYourOrg.tsx` before making any edits. Note the exact slider implementations, preset logic, headcount logarithmic slider, and copy-link button.

- [ ] **Step 2: Restructure the layout**

Replace the current CSS grid layout with the progressive disclosure structure:

**New structure:**
```
┌─────────────────────────────────────────────┐
│  Org Levels slider (hero — always visible)  │
│                                             │
│  ▸ Advanced inputs (collapsed by default)   │
│    Headcount, Fidelity Rate,                │
│    Decision Cycle, Cultural Agility         │
│    Company Presets, Copy Link               │
│                                             │
│  [Fidelity Card] [Lag Card] [Response Card] │
│                                             │
│  (expanded pillar content, if any)          │
└─────────────────────────────────────────────┘
```

Key changes:
- Remove the `grid-cols-[24rem_1fr]` two-column layout
- Move Levels slider to the top as the hero control (full width)
- Move Headcount, Fidelity Rate sliders into an "Advanced inputs" collapsible
- Add Decision Cycle and Cultural Agility sliders to the advanced section
- Move Company Presets and Copy Link into advanced section
- Replace the right-column content with `<PillarDashboard />`
- Remove direct SignalCascade, SensitivitySweep, FlippableMetricCard, MetricCard, and What-If rendering — PillarDashboard now owns those

The Levels slider, headcount logarithmic conversion, and preset logic must be preserved exactly from the existing implementation. Only the layout wrapper changes.

- [ ] **Step 3: Add new slider inputs**

Add two new slider controls inside the advanced inputs section, after the existing Fidelity Rate slider. Follow the exact existing slider pattern:

**Decision Cycle slider:**
```tsx
<div>
  <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">
    Decision Cycle
  </label>
  <div className="flex items-center gap-3 mt-1">
    <input
      type="range"
      min={1} max={14} step={0.5}
      value={decisionCycle}
      onChange={(e) => setDecisionCycle(Number(e.target.value))}
      className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-ember"
    />
    <span className="text-sm font-mono font-bold text-stone-700 w-12 text-right tabular-nums">
      {decisionCycle}d
    </span>
  </div>
</div>
```

**Cultural Agility slider:**
```tsx
<div>
  <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">
    Cultural Agility
  </label>
  <div className="flex items-center gap-3 mt-1">
    <input
      type="range"
      min={0} max={100} step={1}
      value={culturalAgility}
      onChange={(e) => setCulturalAgility(Number(e.target.value))}
      className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-ember"
    />
    <span className="text-sm font-mono font-bold text-stone-700 w-12 text-right tabular-nums">
      {culturalAgility}
    </span>
  </div>
</div>
```

- [ ] **Step 4: Wire store fields**

Add the new store fields to the destructured state at the top of the component:

```typescript
const {
  levels, setLevels,
  headcount, setHeadcount,
  fidelityRate, setFidelityRate,
  decisionCycle, setDecisionCycle,
  culturalAgility, setCulturalAgility,
  advancedInputsOpen, setAdvancedInputsOpen,
} = useCompanyStore();
```

- [ ] **Step 5: Run type check**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors. Fix any issues.

---

## Task 13: Verification — Build, Lint, Test, Dev Server

- [ ] **Step 1: Run full test suite**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm test`
Expected: All tests pass (existing 124 + ~25 new thermal lag + ~15 new damped response)

- [ ] **Step 2: Run TypeScript strict mode check**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run ESLint**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx eslint . --max-warnings 0 --fix`
Expected: No errors after auto-fix

- [ ] **Step 4: Run production build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm run build`
Expected: Build succeeds

- [ ] **Step 5: Start dev server**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm run dev`
Expected: Dev server starts. Open the URL and verify:

1. Model Your Org section shows Levels slider at top
2. Three PillarCards visible: Fidelity (ember), Lag (blue), Response (green)
3. Moving Levels slider updates all three headline numbers
4. "Advanced inputs" expander reveals Headcount, Fidelity Rate, Decision Cycle, Cultural Agility
5. Clicking "Explore" on Fidelity expands: SignalCascade + SensitivitySweep + 6 metric cards
6. Clicking "Explore" on Lag expands: Propagation Delay bars with quadratic acceleration
7. Clicking "Explore" on Response expands: Change Response Timeline chart + Three Futures cards
8. Three Futures highlight shifts between regimes as sliders change
9. Shareable URL includes `&d=` and `&a=` params
10. All existing sections (Problem, Simulate, Evidence, Proof, Methodology) unchanged
