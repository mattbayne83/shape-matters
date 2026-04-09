# Autonomy Pillar Design — Replace Agility with Authority Distribution

> Date: 2026-04-08
> Status: Approved
> Replaces: Response/Agility pillar (torque model)

---

## Problem

The three-pillar model (Fidelity, Lag, Response/Agility) has a structural redundancy: Fidelity and Agility are near-perfectly correlated (Spearman ≈ 1.0) because the torque model collapses to `r^(L-1)` for bottom-heavy orgs. Users see the same signal twice under different labels. The model has two independent dimensions, not three.

Autoresearch cycles 1–4 identified Decision-Centrality Index (DCI) as the genuine independence-breaker. Heterogeneous authority profiles drop the F-A correlation from 1.0 to 0.77 and produce real rank inversions (Finding 10, 15). This is the only validated path to a genuinely independent third pillar.

## Design

### Three pillars (revised)

| Pillar | Question | Input lever | Independent? |
|--------|----------|-------------|--------------|
| **Fidelity** | Can information survive the chain? | `fidelityRate` (culture/tools) | ✓ existing |
| **Lag** | How long do decisions take? | `decisionCycle` (process/CI-CD) | ✓ existing |
| **Autonomy** | Who can actually make decisions? | `dci` (authority distribution) | ✓ **new** |

Structure (`levels`) is the one lever that affects all three — the "nuke" option.

### Score formula

```
autonomyScore = min(DCI × log(levels) / log(3), 100)
```

- At L=3 (flat): score = DCI directly (depth multiplier = 1.0)
- At L=9 (deep): each DCI point is worth 2× (depth multiplier = 2.0)
- Validates Finding 15: Amazon (L=9, DCI=40) → score 80; Meta (L=6, DCI=30) → score 49. Amazon beats Meta. ✓
- Crossover floor for any depth: `50 / (log(levels) / log(3))`

Health bands use the same 5-tier system as Fidelity and Lag (0–100 → Expired through Live).

### Reference company DCI values

| Company | DCI | Rationale |
|---------|-----|-----------|
| Haier | 88 | Microenterprise model — ICs run as independent units |
| Nucor | 82 | Steel teams have full P&L authority |
| Google | 58 | 20% time, IC-driven OKRs, but strong hierarchy |
| Amazon | 40 | Two-pizza teams offset by strong top-down mandate culture |
| Meta | 28 | Centralized product decisions, IC execution |
| ONEOK | 22 | Regulated energy — operational decisions mostly escalate |

### Store changes

- New persisted field: `dci: number` (default 50)
- New URL param: `?ci=` (alongside `?l=&h=&f=&d=`)
- `applyUrlParams()` reads `ci`; `buildShareUrl()` includes it
- `partialize` updated to persist `dci`
- Company presets set `dci` alongside existing fields

### InputStrip changes

Row 1 gains a third group after the vertical divider:

- **Structure:** Depth / Headcount / Fidelity·Layer (ember accent)
- **Dynamics:** Cycle Time (warm-stone accent)
- **Authority:** Decision Centrality (warm-stone accent)

DCI slider: range 0–100, step 1. Label: "Authority · IC %". Sublabel: "0 = all decisions escalate to CEO · 100 = ICs decide independently"

### PillarCard: Autonomy

Replaces the Response/Agility card in PillarDashboard's left column (position 3 of 3).

- **Title:** "Autonomy"
- **Description:** "How distributed is decision-making authority? Deep orgs with centralized decisions pay a compounding tax."
- **Health score:** `autonomyScore` (0–100), same 5-tier color bands
- **Knob SVG:** 270° sweep driven by `autonomyScore`
- **CTA:** "Explore >" expands into right column
- **Accent color:** warm-stone (distinct from ember/Fidelity and blue-warm/Lag)

### Expanded Autonomy view

`expandedPillar` type: `'fidelity' | 'lag' | 'autonomy' | null`

Two elements side by side (same layout as Fidelity's SignalCascade + SensitivitySweep):

**Left — Authority Spectrum Bar:**
- Horizontal bar from "CEO-centric (0)" to "IC-empowered (100)"
- User's DCI marked as a positioned indicator
- 6 reference companies as small labeled dots
- Crossover threshold for current depth shown as a vertical line

**Right — Depth Leverage Annotation:**
- "Your depth amplifier: ×{log(levels)/log(3)}"
- "Each +10 DCI points = +{10 × depth_multiplier} autonomy health"
- Key insight: "At 9 levels, authority distribution matters 2× more than at 3 levels"
- If score < 50: ember-tinted nudge — "Consider distributing decision authority to ICs closest to the work"

### RadarChart update

Column labels: `Fidelity | Lag | Response` → `Fidelity | Lag | Autonomy`

Autonomy column uses `autonomyScore` for segment fill, same VU meter color ramp.

### What-If scenario

New fourth scenario added to the existing What-If panel in `ModelYourOrg` (sits below PillarDashboard):

- **"Empower frontline decisions"** — shifts DCI +15, shows Autonomy score delta only (Fidelity and Lag unchanged)
- Joins existing scenarios: "Improve communication culture" (+5pp fidelityRate), "Remove a management layer" (-1 level), "Accelerate decisions" (-30% decisionCycle)
- Validates the research insight that authority is an independent lever

### Methodology

New `MetricDefinition` entry:

- **Title:** "Autonomy Score"
- **Category:** `autonomy` (new category, warm-stone stripe on MethodologyCard)
- **Formula:** `min(DCI × log(L) / log(3), 100)`
- **Description:** "Measures how effectively decision authority is distributed, weighted by organizational depth. Deep orgs with centralized decisions face compounding delays; the depth multiplier captures this exponential cost. Based on Decision-Centrality Index research showing rank inversions at DCI≥35 for deep organizations."
- **Anchor:** `#methodology-autonomy-score`

### Removals

- **Delete** `TorqueProfile` component
- **Remove** `'response'` from `expandedPillar` union type
- **Remove** Response pillar entry from `PillarDashboard` config
- **Keep** `triangleGeometry.ts` + tests — still computes `shapeGap`, `slope`, `shapeClass` for FlippableMetricCards in "More Metrics"
- **Keep** `agilityScore` in `TriangleGeometry` return type — used by a FlippableMetricCard, just no longer a pillar headline

### New files

- `src/lib/autonomy.ts` — `calcAutonomyScore(dci, levels)` pure function
- `src/lib/__tests__/autonomy.test.ts` — unit tests for formula, edge cases, reference company validation
- `src/components/model/AuthoritySpectrum.tsx` — expanded view component

### Modified files

- `src/store/useCompanyStore.ts` — add `dci`, URL param, preset values
- `src/data/companies.ts` — add `dci` to Company type + 6 values
- `src/components/model/InputStrip.tsx` — add Authority slider group
- `src/components/model/PillarDashboard.tsx` — swap Response → Autonomy
- `src/components/model/PillarCard.tsx` — no structural change (data-driven)
- `src/components/model/RadarChart.tsx` — column label + data source
- `src/components/model/ModelYourOrg.tsx` — What-If scenario
- `src/data/methodologyMetrics.tsx` — new Autonomy metric definition
- `src/types/` — update `expandedPillar` type, add `dci` to Company
