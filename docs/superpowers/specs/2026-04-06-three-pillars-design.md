# Three Pillars Design Spec — Fidelity, Lag, Response

**Date:** 2026-04-06
**Scope:** Expand Model Your Org section with two new physics-based models
**Status:** Design approved

---

## Overview

Shape Matters currently answers one question about organizational signals: **what fraction survives?** (Signal Fidelity via Bartlett compound decay). This spec adds two new physics-based models that complete the diagnostic:

1. **Fidelity** — "What fraction survives?" (existing, unchanged)
2. **Lag** — "When does it arrive?" (Fourier's Law / thermal diffusion)
3. **Response** — "Does the org land, overshoot, or stall?" (Damped harmonic oscillator)

Together: a signal enters the top of the org. Fidelity determines how much survives. Lag determines when it arrives. Response determines whether the org acts on it cleanly, chaotically, or not at all.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Page structure | Expand Model Your Org | Keep narrative flow intact; same sliders, richer outputs |
| Information density | Progressive disclosure (3 layers) | Default: 1 slider + 3 numbers. Expand any pillar for detail. User controls depth. |
| New inputs | Two new sliders (behind "Advanced") | Full independence between models; hidden until user explores a pillar |
| Lag visualization | Horizontal propagation bars | Quadratic scaling is visceral when bars accelerate |
| Response visualization | Change Response Timeline + Three Futures | Chart gives shape (interactive), narrative cards give feeling (accessible) |
| Methodology | Full methodology cards | Consistent with existing pattern; every metric documented and linkable |

---

## New Inputs

Two new sliders added to the Model Your Org input panel (sticky left column):

### Decision Cycle (days/layer)

- **What it represents:** Average time for one management layer to receive, process, and relay a strategic signal (meetings, reviews, reformulation)
- **Range:** 1–14 days
- **Default:** 3 days
- **Step:** 0.5 days
- **Store field:** `decisionCycle: number` (persisted)
- **URL param:** `&d=` (e.g., `?l=6&h=5000&f=82&d=3`)
- **Accent:** Same `accent-ember` as existing sliders

### Cultural Agility (0–100)

- **What it represents:** How quickly the org adapts to new direction — encompasses decision rights, cultural openness to change, process flexibility. Higher = more agile.
- **Range:** 0–100
- **Default:** 55
- **Step:** 1
- **Store field:** `culturalAgility: number` (persisted)
- **URL param:** `&a=` (e.g., `?l=6&h=5000&f=82&d=3&a=55`)
- **Accent:** Same `accent-ember` as existing sliders

**Input ordering in panel:** Levels (hero) → Headcount → Fidelity Rate → Decision Cycle → Cultural Agility

---

## Pillar 2: Lag Model

### Physics Basis

Fourier's Law of thermal conduction. Each management layer acts as insulation with thermal resistance. The key insight: propagation delay scales with the **square** of depth, not linearly. This is because each successive layer must absorb and process an increasingly large accumulated context.

### Core Math (`src/lib/thermalLag.ts`)

```
Cumulative delay at layer k (0-indexed, where k=0 is the origin):
  τ(k) = decisionCycle × k²

Total propagation delay (L levels = L-1 relay points):
  τ_total = decisionCycle × (L - 1)²

Per-layer marginal delay (how much removing layer k saves):
  Δτ(k) = decisionCycle × (2k - 1)
```

**Example:** 6 levels, 3 days/layer:
- L1 (SVP): 3 × 1² = Day 3
- L2 (VP): 3 × 2² = Day 12
- L3 (Director): 3 × 3² = Day 27
- L4 (Manager): 3 × 4² = Day 48
- L5 (Front Line): 3 × 5² = Day 75

Removing one layer (6→5) saves 75 - 48 = **27 days**. Not 3. That's the quadratic surprise.

### Additional Lag Metrics

| Metric | Formula | Description |
|--------|---------|-------------|
| Total Propagation Delay | `d × (L-1)²` | Days from CEO to front line |
| Marginal Layer Cost | `d × (2(L-1) - 1)` | Days saved by removing one layer |
| Lag Ratio | `τ_total / (d × (L-1))` | Actual delay vs theoretical linear delay. Always = L-1. Grows linearly but communicates the quadratic penalty intuitively. |

### Visualization: Propagation Delay Bars

Horizontal bar chart, one row per org layer (top-down, L0 at top):

- **Left label:** Layer level + role label (e.g., "L3 · Director")
- **Bar:** Fills proportional to cumulative delay. Color transitions from blue (fast) to warm (slow) as delay increases.
- **Right label:** "Day N" timestamp
- **Key visual:** The gaps between bars **accelerate** — making the quadratic scaling visceral without needing to explain the math
- **Animation:** On slider change, bars animate from left. Each layer appears after its computed delay (fast, stylized — not real-time).
- **Annotation below:** "Removing one layer saves N days" — dynamically computed marginal cost

**Color:** Uses a blue→warm gradient keyed to proportion of total delay. Not ember (which is fidelity's semantic color). Suggests a different dimension.

### Methodology Cards (2)

1. **Propagation Delay** — Category: Lag (new category badge color: blue). Formula: `τ = d × (L-1)²`. Description: Fourier-inspired quadratic delay model.
2. **Marginal Layer Cost** — Category: Lag. Formula: `Δτ = d × (2(L-1) - 1)`. Description: Days saved by removing the deepest layer.

---

## Pillar 3: Response Model

### Physics Basis

Damped harmonic oscillator (spring-mass-damper). When an org receives a signal and tries to act on it (a pivot, a new strategy, a market response), the dynamic behavior follows the same math as a mass on a spring with friction:

- **Under-damped (ζ < 1):** Org overshoots the target, oscillates, eventually settles. Common in flat/agile orgs that move fast but lack stabilizing processes.
- **Critically damped (ζ = 1):** Fastest possible convergence without overshoot. The optimal regime.
- **Over-damped (ζ > 1):** Org crawls toward the target asymptotically. Never overshoots but agonizingly slow. Common in deep/bureaucratic orgs.

### Core Math (`src/lib/dampedResponse.ts`)

```
Parameters:
  m = headcount / 1000                     (mass / inertia, normalized)
  k = culturalAgility / 10                 (spring stiffness, 0-10)
  c = levels × DAMPING_PER_LAYER           (damping coefficient)

  DAMPING_PER_LAYER ≈ 1.1                  (tuning constant — calibrate during implementation)

Derived quantities:
  ω₀ = √(k / m)                           (natural frequency)
  ζ = c / (2 × √(k × m))                  (damping ratio — THE key diagnostic number)
  ω_d = ω₀ × √(1 - ζ²)                   (damped frequency, for ζ < 1)

Step response (what happens when org tries to reach 100% alignment):
  Under-damped (ζ < 1):
    x(t) = 1 - (e^(-ζω₀t) / √(1-ζ²)) × sin(ω_d × t + arccos(ζ))

  Critically damped (ζ = 1):
    x(t) = 1 - (1 + ω₀t) × e^(-ω₀t)

  Over-damped (ζ > 1):
    x(t) = 1 - (ζ+√(ζ²-1))/(2√(ζ²-1)) × e^((-ζ+√(ζ²-1))ω₀t)
          + (ζ-√(ζ²-1))/(2√(ζ²-1)) × e^((-ζ-√(ζ²-1))ω₀t)

Key output metrics:
  Overshoot %:     OS = e^(-πζ / √(1-ζ²)) × 100     (for ζ < 1; 0 for ζ ≥ 1)
  Settling time:   t_s ≈ 4 / (ζ × ω₀)               (time to stay within 2% of target)
  Rise time:       t_r ≈ (π - arccos(ζ)) / ω_d       (time to first reach target, ζ < 1)
```

**Time scaling:** Raw `t` values are abstract. Scale to weeks: `t_weeks = t × TIME_SCALE_FACTOR`. Calibrate so that typical orgs (L=6, H=5000, A=55) produce settling times in the 10-20 week range, which matches real-world organizational change timelines.

**Example:** L=6, H=5000, A=55:
- m = 5.0, k = 5.5, c = 6.6
- ζ = 6.6 / (2 × √27.5) = 6.6 / 10.49 ≈ 0.63
- Overshoot ≈ 19%
- Settling time ≈ 14 weeks (after scaling)
- Regime: Under-damped (moderate) — "overcommits then corrects"

### Visualization: Change Response Timeline + Three Futures

**Top: SVG Step-Response Chart**

- **X-axis:** Time (weeks). No abstract units — real time labels.
- **Y-axis:** "% aligned with new strategy" (0–120%, to show overshoot above 100%)
- **Target line:** Dashed horizontal at 100% labeled "goal"
- **Background zones:** Colored regions for Mobilization → Overshoot → Correction → Alignment phases
- **User's curve:** Bold blue line, computed from their slider inputs via the step-response equation
- **Ghost reference curves:** Three faint lines showing under-damped (red), critically damped (green), over-damped (gray) for context
- **Annotations:** "Overcommits N%" at the peak, "Lands here (~N wks)" at settling point
- **Animation:** Curve redraws on slider change. The line traces left-to-right with a brief animation.

**Bottom: Three Futures Narrative Cards**

Three side-by-side cards showing the three regimes as organizational stories:

| Card | Regime | Title | Story |
|------|--------|-------|-------|
| Left | Under-damped (ζ < 0.7) | "Too Fast" | Teams overcommit → overshoot → swing back → confusion → eventually settles (6+ months) |
| Center | Near-critical (0.7 ≤ ζ ≤ 1.3) | "Right-Sized" | Org mobilizes → minor correction → aligned in N weeks |
| Right | Over-damped (ζ > 1.3) | "Too Slow" | Committees form → urgency diluted → front line barely notices → 12+ months, still partial |

**Highlighting:** The card matching the user's current ζ gets a highlighted border (blue). The other two are dimmed. As sliders change, the highlight shifts between cards — the transition between regimes is the key "aha" moment.

**Verdict line:** Below the cards, a single sentence: "Your org is [regime label]. It will [overshoot by N% / converge in N weeks / still be at N% after 12 months] on a major pivot." Dynamically generated from the math.

### Methodology Cards (3)

1. **Damping Ratio (ζ)** — Category: Response (new category badge). Formula: `ζ = c / 2√(km)`. Description: The single number that determines whether your org overshoots, stalls, or lands.
2. **Overshoot** — Category: Response. Formula: `OS = e^(-πζ/√(1-ζ²)) × 100%`. Description: How far past the target your org swings before correcting.
3. **Settling Time** — Category: Response. Formula: `t_s ≈ 4/(ζω₀)`. Description: How long until the org stays within 2% of the target.

---

## Integration into Model Your Org

### Progressive Disclosure (Three Layers)

The section uses progressive disclosure to manage density. Same total content,
but the user controls how deep they go.

#### Layer 1 — The Dashboard (default view)

What everyone sees on arrival. ~1.5 screen heights.

```
┌─────────────────────────────────────────────────────┐
│  MODEL YOUR ORG                                     │
│                                                     │
│  Org Levels  ●━━━━━━━━━━━━━━○──────────  6          │
│                                                     │
│  ┌───────────────┐┌───────────────┐┌───────────────┐│
│  │  30.4%        ││  75 days      ││  ~14 weeks    ││
│  │  signal        ││  to propagate ││  to settle    ││
│  │  survives      ││  CEO→front    ││  after pivot  ││
│  │                ││  line         ││               ││
│  │  ▼ Explore     ││  ▼ Explore    ││  ▼ Explore    ││
│  └───────────────┘└───────────────┘└───────────────┘│
│   Fidelity          Lag             Response         │
│                                                     │
│  ▸ Advanced inputs (Headcount, Fidelity Rate...)     │
└─────────────────────────────────────────────────────┘
```

- **Input:** Just the **Levels** slider — the single control that drives the most
  dramatic change across all three models.
- **Output:** Three **PillarCard** components, one per pillar. Each shows:
  - Headline metric value (large, colored)
  - One-line description
  - "Explore" link to expand
- **Advanced inputs:** Collapsed by default. Expanding reveals Headcount,
  Fidelity Rate, Decision Cycle, and Cultural Agility sliders.

#### Layer 2 — Explore a Pillar

Click "Explore" on any card to expand its visualization. ~3 screen heights.

- **Only ONE pillar expanded at a time.** The other two remain as compact
  summary cards. Clicking another card's "Explore" switches the expanded pillar.
  Clicking "Collapse" returns to the dashboard view.
- **Advanced inputs** expand as a group when any pillar is explored (the
  secondary sliders become relevant once you're digging in).

**Fidelity (expanded):**
- SignalCascade funnel visualization
- SensitivitySweep chart
- 6 existing FlippableMetricCards (Signal Fidelity, Comm Loss, Mgr Ratio,
  Agility, Inertia, Shape Gap)
- What-if panel

**Lag (expanded):**
- Propagation Delay bars visualization
- 2 metric cards: Propagation Delay, Marginal Layer Cost
- "Removing 1 layer saves N days" annotation

**Response (expanded):**
- Change Response Timeline (SVG step-response chart)
- Three Futures narrative cards (highlighted by regime)
- Verdict sentence
- 3 metric cards: Damping Ratio, Overshoot, Settling Time

#### Layer 3 — Deep Dive

Methodology links (`infoHref`) on any metric card scroll to the Methodology
section for the full formula, description, and assumptions. This is the
existing pattern — no new interaction to build.

### PillarCard Component (new)

The three summary cards shown in the dashboard view. Compact, clickable, pillar-colored.

| Pillar | Headline | Sub-text | Color Accent |
|--------|----------|----------|-------------|
| Fidelity | `N%` | "signal survives" | Ember (existing) |
| Lag | `N days` | "CEO to front line" | Blue |
| Response | `~N wks` | "to settle after pivot" | Green |

Each card also shows a small spark indicator (up/down trend or regime badge)
so the dashboard view conveys directionality, not just a number.

### Expanded Pillar Metric Cards

When a pillar is expanded, its detail metric cards appear within the expanded view:

**Fidelity pillar** (existing cards, relocated into expandable):

| Card | Value | Sub-text | infoHref |
|------|-------|----------|----------|
| Signal Fidelity | `N%` | compound decay | `#methodology-signal-fidelity` |
| Comm Loss | `$Nk` | annual cost | `#methodology-comm-loss` |
| Manager Ratio | `1:N` | span of control | `#methodology-manager-ratio` |
| Agility | `N` | torque score | `#methodology-agility` |
| Inertia | `N` | resistance | `#methodology-inertia` |
| Shape Gap | `N` | geometry delta | `#methodology-shape-gap` |

**Lag pillar** (new):

| Card | Value | Sub-text | infoHref |
|------|-------|----------|----------|
| Propagation Delay | `N days` | "CEO to front line" | `#methodology-propagation-delay` |
| Marginal Layer Cost | `N days` | "saved by removing 1 layer" | `#methodology-marginal-layer-cost` |

**Response pillar** (new):

| Card | Value | Sub-text | infoHref |
|------|-------|----------|----------|
| Damping Ratio | `ζ = N` | Regime label | `#methodology-damping-ratio` |
| Overshoot | `N%` | "past target" | `#methodology-overshoot` |
| Settling Time | `~N wks` | "to full alignment" | `#methodology-settling-time` |

### Zustand Store Changes

```typescript
// New persisted fields
decisionCycle: number       // default: 3 (days)
culturalAgility: number     // default: 55 (0-100)
expandedPillar: 'fidelity' | 'lag' | 'response' | null  // default: null (dashboard view)
advancedInputsOpen: boolean // default: false

// Exclude from persistence (reset on reload):
// expandedPillar, advancedInputsOpen — always start at dashboard view

// New actions
setDecisionCycle: (d: number) => void
setCulturalAgility: (a: number) => void
setExpandedPillar: (p: 'fidelity' | 'lag' | 'response' | null) => void
setAdvancedInputsOpen: (open: boolean) => void
```

### Zustand Store Changes

```typescript
// New persisted fields (add to useCompanyStore)
decisionCycle: number     // default: 3 (days)
culturalAgility: number   // default: 55 (0-100)

// New actions
setDecisionCycle: (d: number) => void
setCulturalAgility: (a: number) => void

// URL params: extend applyUrlParams() and buildShareUrl()
// &d= for decisionCycle, &a= for culturalAgility
```

### Shareable URL

Extend from `?l=6&h=5000&f=82` to `?l=6&h=5000&f=82&d=3&a=55`.

Backward compatible — if `d` or `a` are missing, use defaults (3, 55).

---

## New Source Files

### Pure Calculation Libraries

| File | Exports | Depends On |
|------|---------|------------|
| `src/lib/thermalLag.ts` | `calcPropagationDelay(levels, decisionCycle)`, `calcMarginalLayerCost(levels, decisionCycle)`, `calcLagRatio(levels)`, `calcLayerDelays(levels, decisionCycle)` | Nothing |
| `src/lib/dampedResponse.ts` | `calcDampingRatio(levels, headcount, culturalAgility)`, `calcOvershoot(zeta)`, `calcSettlingTime(zeta, omega0, timeScale)`, `calcStepResponse(t, zeta, omega0)`, `classifyRegime(zeta)` | Nothing |

### Test Files

| File | Coverage |
|------|----------|
| `src/lib/__tests__/thermalLag.test.ts` | Quadratic scaling, edge cases (1 level, 14 levels), marginal cost, lag ratio |
| `src/lib/__tests__/dampedResponse.test.ts` | Three regimes, overshoot formula, settling time, step response curve shape, boundary ζ values |

### Components

| File | Description |
|------|-------------|
| `src/components/model/PillarCard.tsx` | Summary card for dashboard view — headline metric, description, "Explore" link |
| `src/components/model/PillarDashboard.tsx` | Orchestrator: 3 PillarCards in dashboard mode, expand/collapse logic, advanced inputs toggle |
| `src/components/model/PropagationDelay.tsx` | Lag visualization — SVG horizontal bars with animation |
| `src/components/model/ChangeResponseTimeline.tsx` | Response chart — SVG step-response curve with org-native labels |
| `src/components/model/ThreeFutures.tsx` | Three narrative regime cards with dynamic highlighting |

### Data

| File | Description |
|------|-------------|
| `src/data/methodologyMetrics.tsx` | Extend with 5 new MetricDefinition entries (2 Lag + 3 Response) |

---

## What's NOT Changing

- Page structure and section flow (Problem → Simulate → Evidence → Proof → Model → Methodology)
- SignalCascade visualization (stays as-is, moves inside Fidelity expanded view)
- Existing 6 FlippableMetricCards (fidelity metrics unchanged, move inside Fidelity expanded view)
- SensitivitySweep (unchanged, moves inside Fidelity expanded view)
- GembaComparison, ComparisonView, InteractiveFidelityDemo
- SectionNav anchors (no new sections)
- SimulateSection (telephone effect stays independent)
- Design system tokens, color palette, typography

**What IS changing in ModelYourOrg:**
- Top-level layout becomes PillarDashboard (3 summary cards + expand/collapse)
- Input panel gains 2 new sliders behind "Advanced inputs" expander
- Existing fidelity content (SignalCascade, SensitivitySweep, metric cards, What-if)
  wraps into the Fidelity expanded view — no content removed, just reorganized

---

## Reference Company Data

The existing 6 reference companies need `decisionCycle` and `culturalAgility` estimates added to `src/data/companies.ts`. Reasonable defaults based on archetype:

| Company | Archetype | Decision Cycle | Cultural Agility | Rationale |
|---------|-----------|---------------|-----------------|-----------|
| Valve | flat | 1.5 days | 85 | Flat, autonomous, fast decisions |
| Spotify | tech | 2 days | 75 | Squads, moderate process |
| Toyota | flattened | 3 days | 60 | Deliberate, consensus-driven |
| GE (Welch era) | flattened | 4 days | 50 | Large, process-heavy but actively managed |
| ExxonMobil | energy | 5 days | 30 | Deep hierarchy, regulatory, slow but stable |
| Zappos (Holacracy) | experimental | 1 day | 90 | Radical autonomy |

---

## Open Questions (resolve during implementation)

1. **DAMPING_PER_LAYER constant:** Starting at 1.1. May need calibration so that typical orgs (L=4-8, H=1K-50K, A=30-70) produce ζ values spanning all three regimes.
2. **TIME_SCALE_FACTOR:** Needs calibration so settling times land in real-world ranges (weeks to months, not seconds or years).
3. **Lag bar color gradient:** Exact color stops TBD — should feel distinct from ember (fidelity) and green (data viz). Blue is the current candidate.
4. **Animation timing:** Propagation bars and response curve need animation durations that feel responsive on slider drag without being distracting.
