# Health Scores for Propagation Lag & Change Response

**Date:** 2026-04-07
**Status:** Draft
**Scope:** New scoring functions, PillarCard headline changes, new RadarChart component

## Problem

Signal Fidelity has an intuitive 0-100% scale where "closer to 100% is better." But Propagation Lag outputs raw days (e.g., "75d") and Change Response outputs damping ratio ζ and settling time in weeks — neither tells the user whether their number is good, bad, or catastrophic. Users have no anchor for how to feel about "75 days" or "ζ=0.63."

## Solution

Convert all three pillars to a unified 0-100 health score with physics-based decay curves and business-anchored label bands. The score replaces the headline metric on PillarCards, with raw values moving to subtext. A new radar chart above the cards visualizes the balance across all three dimensions.

## Scoring Functions

### Propagation Lag Health

```
lagHealth = 100 × e^(-totalDelay / 100)
```

- **Input:** `totalDelay = decisionCycle × (levels - 1)²` (days, from `calcThermalLag`)
- **Decay constant:** τ = 100 (calibrated so 90-day delay scores ~41, 14-day delay scores ~87)
- **Physics basis:** Exponential decay mirrors thermal energy dissipation — the same physics model underlying the lag calculation itself
- **Monotonically decreasing:** Lower delay = higher score, no ambiguity

Reference calibration:

| Delay | Score | Label |
|-------|-------|-------|
| 3d | 97 | Live |
| 14d | 87 | Live |
| 25d | 78 | Fresh |
| 45d | 64 | Aging |
| 75d | 47 | Aging |
| 90d | 41 | Aging |
| 150d | 22 | Stale |
| 300d | 5 | Expired |

### Change Response Health

```
responseHealth = 100 × e^(-((ζ - 1.0) / 0.65)²)
```

- **Input:** `ζ` (damping ratio, from `calcDampedResponse`)
- **Peak:** ζ = 1.0 (critically damped = optimal in control theory)
- **Width:** σ = 0.65 (workable "good zone" of roughly ζ = 0.6 – 1.4)
- **Physics basis:** Gaussian centered on optimal damping — natural quality metric for second-order systems
- **Symmetric curve, asymmetric labels:** Both under-damped (chaos) and over-damped (paralysis) are penalized equally by the score, but the label text distinguishes the failure mode

Reference calibration:

| ζ | Score | Regime | Label |
|---|-------|--------|-------|
| 0.03 | 1 | Under | Spinning Out |
| 0.30 | 14 | Under | Fishtailing |
| 0.50 | 37 | Under | Twitchy |
| 0.63 | 72 | Under | Nimble |
| 0.80 | 91 | Critical | Dialed In |
| 1.00 | 100 | Critical | Dialed In |
| 1.20 | 91 | Critical | Dialed In |
| 1.30 | 81 | Over | Steady |
| 1.50 | 55 | Over | Lumbering |
| 2.00 | 9 | Over | Stuck |
| 2.95 | 0 | Over | Stuck |

### Signal Fidelity (unchanged)

Already outputs 0-100% natively (`r^(L-1) × 100`). No conversion needed. The existing value IS the health score.

## Label Bands

### Shared Color System (all 3 pillars)

| Score Range | Color Token | Hex |
|-------------|-------------|-----|
| 85–100 | stone-700 | `#44403c` |
| 65–84 | warm-stone | `#a8967a` |
| 40–64 | ember-light | `#F4A261` |
| 20–39 | ember | `#E05A1B` |
| 0–19 | red-600 | `#dc2626` |

### Lag Labels — "Signal Freshness"

| Score | Label | Interpretation |
|-------|-------|----------------|
| 85–100 | Live | Signals land within days — startup-fast information flow |
| 65–84 | Fresh | Signals propagate within a few weeks — responsive |
| 40–64 | Aging | Signals take 1-2 months — burning planning cycle time on propagation |
| 20–39 | Stale | Signals take a full quarter — information is dated on arrival |
| 0–19 | Expired | Signals take multiple quarters — effectively useless by arrival |

### Response Labels — "Vehicle Handling" (dual labels by regime)

| Score | Under-damped (ζ < 1) | Over-damped (ζ ≥ 1) |
|-------|----------------------|---------------------|
| 85–100 | Dialed In | Dialed In |
| 65–84 | Nimble | Steady |
| 40–64 | Twitchy | Lumbering |
| 20–39 | Fishtailing | Dragging |
| 0–19 | Spinning Out | Stuck |

The vehicle handling metaphor maps directly to damped oscillator physics:
- **Under-damped = oversteer:** The org turns too hard, overshoots the target, oscillates
- **Over-damped = understeer:** The org turns the wheel but barely changes direction
- **Critically damped = precision handling:** Fastest possible convergence without oscillation

## PillarCard Changes

All three PillarCards show a **0-100 health score** as the headline metric (colored by band), with raw values in subtext:

### Fidelity PillarCard
- **Headline:** `37` (stone-700 → ember → red depending on band)
- **Subtext:** "37% signal preserved across 5 relays"
- Note: The score IS the fidelity percentage — no conversion needed. The only change is adopting the shared color banding system (replacing any existing `metricColor`-based coloring) so all three cards use the same visual severity scale.

### Lag PillarCard
- **Headline:** `47` (ember-light, "Aging" band)
- **Subtext:** "75 days CEO → front line · Aging"
- The label appears in the subtext after the raw value

### Response PillarCard
- **Headline:** `72` (warm-stone, "Nimble" band)
- **Subtext:** "ζ = 0.63 · Under-damped · Nimble"
- Shows ζ value, regime classification, AND the handling label

### Headline Color

The headline score number is colored using the band color for its range. This replaces any existing `metricColor` usage on PillarCards.

## Radar Chart

A new compact 3-axis radar/spider chart positioned above the 3 PillarCards in the `PillarDashboard` layout.

### Axes
1. **Fidelity** (top) — Signal Fidelity % (0-100)
2. **Lag** (bottom-left) — Lag Health Score (0-100)
3. **Response** (bottom-right) — Response Health Score (0-100)

### Visual Design
- **Size:** ~220px wide × 200px tall, centered above the card grid
- **Grid:** Concentric triangles at 20, 40, 60, 80, 100 marks (stone-200 strokes, 1px)
- **Axis lines:** From center to each vertex (stone-300, 1px)
- **Data fill:** Triangle connecting the three scores, filled with ember at 15% opacity, stroked ember at 2px
- **Data points:** 6px circles at each axis value, filled ember, white 2px stroke
- **Axis labels:** Outside each vertex — score value in bold + pillar name in small caps below
  - e.g., "47" bold + "LAG" in `text-[10px] uppercase tracking-widest text-stone-500`
- **No animation** — static SVG, updates instantly on slider changes

### Interaction
- No hover/click behavior on the radar itself
- The three PillarCards below it are still the primary interaction targets
- The radar serves as a visual summary only

### Responsive
- On mobile (< 768px): radar scales down to ~180px or hides behind the advanced inputs toggle along with the rest of the dashboard

## Default Org Scores (L=6, H=5000, d=3, a=55)

| Pillar | Raw Value | Health Score | Label |
|--------|-----------|-------------|-------|
| Signal Fidelity | 37% | 37 | — |
| Propagation Lag | 75 days | 47 | Aging |
| Change Response | ζ=0.63 | 72 | Nimble |

## Expanded Pillar Views

**No changes.** The expanded views (PropagationDelay bars, ChangeResponseTimeline curve, SignalCascade funnel) continue to show raw physics values. Health scores are a dashboard-level judgment tool — the expanded views are where you understand the physics.

## New Files

### `src/lib/healthScores.ts`

Pure functions, no React dependency:

```typescript
interface HealthScore {
  score: number;       // 0-100, rounded to nearest integer
  label: string;       // "Live", "Nimble", "Stuck", etc.
  color: string;       // Hex color for the band
}

function calcLagHealth(totalDelay: number): HealthScore
function calcResponseHealth(zeta: number, regime: ResponseRegime): HealthScore
function healthBandColor(score: number): string
```

`calcResponseHealth` takes `regime` to select the correct label (under vs over-damped). The score calculation itself doesn't use regime — only the label lookup does.

### `src/lib/__tests__/healthScores.test.ts`

Unit tests covering:
- Lag score at known delay values (0, 14, 75, 90, 300)
- Response score at known ζ values (0.3, 0.63, 1.0, 1.3, 2.0)
- Label selection for under-damped vs over-damped at same score
- Color band boundaries (edge cases at 19/20, 39/40, 64/65, 84/85)
- Edge cases: delay=0 → 100, extreme ζ → 0, negative inputs clamped

### `src/components/model/RadarChart.tsx`

Pure SVG component. Props:
- `fidelity: number` (0-100)
- `lagHealth: number` (0-100)
- `responseHealth: number` (0-100)

No internal state. Renders a static SVG with concentric grid, axis lines, data triangle, and labels.

## Files to Change

### `src/components/model/PillarCard.tsx`

- Headline metric → health score (0-100) for all three pillars
- Headline color → `healthBandColor(score)` instead of current coloring
- Subtext → raw value + label badge string
- Props may need: `healthScore: number`, `healthLabel: string`, `healthColor: string` (or compute from score internally)

### `src/components/model/PillarDashboard.tsx`

- Compute `lagHealth` and `responseHealth` from store values
- Pass health scores to PillarCards
- Render `RadarChart` above the 3-card grid
- Pass all three scores to RadarChart

## Files NOT Changed

- `src/lib/thermalLag.ts` — raw calculation unchanged
- `src/lib/dampedResponse.ts` — raw calculation unchanged
- `src/lib/depthTax.ts` — unchanged
- Expanded view components (PropagationDelay, ChangeResponseTimeline, ThreeFutures, SignalCascade, SensitivitySweep)
- Methodology cards and section
- ModelYourOrg slider inputs
- Context hints (from advanced-inputs spec)
- Store schema (no new persisted state)

## Out of Scope

- Signal Fidelity scoring changes (already 0-100 natively)
- Methodology section updates for new score formulas (separate task)
- Combined/averaged organizational health number (radar chart replaces this)
- Score-based context hints on sliders
- Score history or comparison features
