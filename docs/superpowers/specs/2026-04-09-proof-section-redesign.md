# Proof Section Redesign — Pillar Score Cards with Mini EQ

**Date:** 2026-04-09
**Status:** Approved
**Section:** `#proof` (The Proof — Real Companies, Real Structures)

## Goal

Replace the current data-heavy company cards with pillar-score-first cards that match the Model section's visual language. Each card leads with Fidelity / Lag / Autonomy health scores (0–100) paired with mini EQ columns, creating instant cross-section recognition.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Card hero | 3 pillar health scores | Matches Model section language; users see the same metrics in both sections |
| EQ integration | Mini 5-segment column beside each score (A1) | Compact, fits 3-column grid, provides instant visual "health signature" |
| Interactivity | None — read-only reference | Preset pills in Model section already handle company loading; no cross-section coupling |
| Data density | Curated middle ground | Pillar scores + levels/employees context + round-trip punchline + narrative + source |
| Grid layout | Same as current: 1-col mobile, 2-col md, 3-col lg | 6 cards = 2 neat rows on desktop; cards are shorter now so cleaner |

## Card Structure (top → bottom)

1. **Header row** — Company name (left) + era badge (right)
2. **Context line** — `{levels} levels · {employees} employees · {industry}` (small, muted)
3. **Pillar strip** — 3 equal-width cells in a flex row, each containing:
   - Label (uppercase, 8–9px): FIDELITY / LATENCY / AUTONOMY
   - Health score (22–26px, mono, colored by `healthBandColor`)
   - Mini 5-segment EQ column (beside the score)
4. **Punchline stat** — Round-trip fidelity % in a bordered row (label left, value right)
5. **Narrative** — One-sentence human story from `company.narrative`
6. **Source** — Citation text with external link icon when `sourceUrl` exists

## Removed from Current Card

- Avg Span
- Flatness Index
- Manager Ratio + IC count
- LayerDiagram (horizontal bar chart per layer)
- "Structure" and "Fidelity" section labels

These metrics are all available in the Model section and don't need to be repeated in the Proof cards.

## New Component: `MiniEQ`

Small inline EQ column for use in company cards.

**Props:**
- `score: number` (0–100)
- `segments?: number` (default 5)

**Behavior:**
- Renders `segments` stacked bars in a `flex-col-reverse` column
- Each segment maps to a 20-point range (for 5 segments: 0–20, 20–40, 40–60, 60–80, 80–100)
- Filled segments use VU meter color ramp from RadarChart: stone-700 → stone-600 → warm-stone → ember-light → ember
- Unfilled segments: `#e7e5e4` at 40% opacity
- Top filled segment gets a subtle glow (`box-shadow`) matching its color
- Fixed dimensions: width 10–14px, height 32–36px, gap 1.5–2px, border-radius 1.5–2px

**Color ramp (bottom → top, 5 segments):**
```
Seg 0 (0-20):   #44403c  (stone-700)
Seg 1 (20-40):  #57534e  (stone-600)
Seg 2 (40-60):  #A8967A  (warm-stone)
Seg 3 (60-80):  #F4A261  (ember-light)
Seg 4 (80-100): #E05A1B  (ember)
```

This matches the RadarChart's VU meter ramp (first 5 of the 10-segment version).

## Calculation Requirements

CompanyCard needs to compute all 3 pillar scores for each company. Currently it only computes `calcOrgMetrics`. Add:

- **Fidelity score:** `Math.round(m.fidelityAtTopPct)` — already computed via `calcOrgMetrics`
- **Lag score:** `calcLagHealth(calcThermalLag(levels, decisionCycle).totalDelay).score` — requires `company.decisionCycle`
- **Autonomy score:** `calcAutonomyScore(company.dci, company.levels).score` — requires `company.dci`

Both `decisionCycle` and `dci` exist on all 6 reference companies.

## Files Changed

| File | Change |
|------|--------|
| `src/components/model/CompanyCard.tsx` | Rewrite card layout: remove LayerDiagram/span/flatness/manager sections, add pillar strip with MiniEQ, compute lag + autonomy scores |
| `src/components/model/MiniEQ.tsx` | New component: 5-segment inline EQ column |
| `src/components/model/ComparisonView.tsx` | No changes needed (passes company + fidelityRate, CompanyCard handles the rest) |

## Files NOT Changed

- `referenceCompanies.ts` — data is already complete
- `ComparisonView.tsx` — grid layout stays the same
- `ScrollPage.tsx` — section wrapper unchanged
- `RadarChart.tsx` — MiniEQ is a new component, not extracted from RadarChart

## Responsive Behavior

- **Desktop (lg):** 3-column grid, pillar strip shows all 3 cells side-by-side
- **Tablet (md):** 2-column grid, same card layout
- **Mobile:** 1-column, cards full-width. Pillar strip cells may need tighter padding/smaller font on very narrow screens (< 360px)

## Design Tokens

All colors use existing design system tokens:
- Score colors: `healthBandColor(score)` from `src/lib/healthScores.ts`
- EQ segment colors: hardcoded VU ramp (same as RadarChart)
- Punchline fidelity color: `fidelityColor(roundTripFidelity)` from `src/lib/fidelityColor.ts`
- Background: `bg-white` cells on `bg-stone-50` card (matches current)
- Borders: `border-stone-200` (card), `border-stone-200` (cells)
