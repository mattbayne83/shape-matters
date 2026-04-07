# Dashboard Layout Redesign — Input Strip + 70/30 Radar/Pillar Split

**Date:** 2026-04-07
**Status:** Approved
**Scope:** `ModelYourOrg.tsx` layout restructure, `PillarDashboard.tsx` 70/30 grid with in-place expand, `PillarCard.tsx` directional arrows, new `InputStrip.tsx` component

## Problem

The current layout leads with the Levels slider as the most visually dominant element. The radar chart and health scores — the actual output — are secondary. On desktop, the two grouped input cards (Structure/Dynamics) consume ~50% of the viewport before any results are visible. The visual hierarchy is inverted: inputs dominate, results follow.

Additionally, expanding a pillar card pushes content below the cards, causing a page jump that loses the input context.

## Design

### Visual Hierarchy (top to bottom)

1. **Input strip** (~60px) — compact horizontal row of all 5 sliders + preset dropdown + share link
2. **70/30 split area** (~300px) — radar chart (70% left) + stacked pillar cards (30% right)
3. **Expanded content** — replaces radar chart in-place when a pillar is explored

### Input Strip

A single white card containing all 5 inputs in a horizontal row. Replaces the current Levels hero slider + Structure/Dynamics grouped cards.

**Layout:** `grid-template-columns: repeat(5, 1fr) auto`

Each input cell contains:
- Label: `text-[9px] font-semibold` (ember-colored for Structure inputs: Levels, Size, Fidelity; warm-stone for Dynamics inputs: Cycle, Agility)
- Value: `text-[15px] font-extrabold font-mono tabular-nums text-stone-900` (right-aligned)
- Slider: native `<input type="range">` styled as a thin 5px track with gradient fill (ember gradient for Structure, warm-stone gradient for Dynamics)

The 6th column (auto-width) contains:
- "Preset" label: `text-[7px] font-semibold uppercase tracking-wide text-stone-400`
- Company preset dropdown (compact)
- Share link icon (🔗 or Link icon from lucide)

**No context hints** in the strip — too compact. The context hints from the advanced-inputs spec are dropped in this layout.

**Mobile (< 768px):** The input strip stacks vertically or collapses behind a toggle. The 70/30 split becomes a single column (radar on top, pillar cards below). This spec focuses on desktop; mobile details are out of scope.

### 70/30 Split: Radar + Pillar Cards

A CSS grid: `grid-template-columns: 7fr 3fr` with `gap: 12px`.

**Left (70%) — Radar Chart container:**
- White card with border, rounded-xl, centered content
- `RadarChart` component renders inside (already built)
- The radar chart should scale up to fill available space (~260px wide SVG inside the container)
- When a pillar is expanded, this container crossfades from the radar to the expanded pillar content (SignalCascade, PropagationDelay, ChangeResponseTimeline, etc.)
- Transition: `AnimatePresence` with opacity fade, ~300ms

**Right (30%) — Stacked Pillar Cards:**
- 3 `PillarCard` components in a vertical flex column with `gap: 8px`
- Each card uses `flex: 1` to distribute height equally
- Cards are always visible — they persist whether collapsed or expanded

### PillarCard Changes

**Collapsed state (no pillar expanded):**
- Same content as current: label, health score, subtext
- Action link: **← Details** (left-pointing chevron + "Details" text)
- The left arrow points toward the radar/content area where details will appear
- Hover: border color changes to pillar accent, subtle box-shadow

**Active state (this pillar is expanded):**
- Border: `2px solid {accentColor}`, box-shadow with accent color at 12% opacity
- Top accent bar: 3px solid accent color across top edge
- Action link: **→ Back** (right-pointing chevron + "Back" text, colored with accent)
- The right arrow points back toward the radar (which will reappear on collapse)

**Inactive sibling state (a different pillar is expanded):**
- `opacity: 0.55`, `scale: 0.97`
- Still shows ← Details link (clickable — switches directly to this pillar)
- Clicking an inactive sibling: collapses current, expands clicked one (no intermediate "all collapsed" state needed, but acceptable)

### Expanded Content Behavior

When a pillar card is clicked:
1. The radar chart in the left 70% area fades out
2. The expanded content for that pillar fades in, occupying the same container
3. The pillar cards on the right stay exactly where they are
4. The input strip above stays exactly where it is
5. **No page jump** — the 70/30 grid container maintains its position

The expanded content is the same as today:
- **Fidelity:** SignalCascade + SensitivitySweep + 6 FlippableMetricCards
- **Lag:** PropagationDelay bars
- **Response:** ChangeResponseTimeline + ThreeFutures

The left container may need to grow in height for content-heavy pillars (Fidelity has 6 metric cards). This is acceptable — a gentle height animation is fine. The key constraint is that the pillar cards column and input strip don't move horizontally.

### Removed Elements

- **Levels hero slider** — absorbed into the input strip as one of 5 equal sliders
- **Structure/Dynamics grouped cards** — replaced by the single input strip with color-coded accents
- **Advanced inputs toggle** — no longer needed on desktop (all inputs always visible)
- **Context hints on sliders** — dropped due to space constraints in the compact strip

### Preserved Elements

- **Company preset dropdown** — moved into input strip, labeled "Preset"
- **Share link button** — moved into input strip as icon
- **What-if panel** — remains below the 70/30 split (if it exists in current layout)
- **"More metrics" section** — remains below (if it exists)
- **All calculation logic** — unchanged
- **RadarChart component** — unchanged, just repositioned

## New Components

### `InputStrip.tsx`

Extracted from `ModelYourOrg.tsx`. Contains the horizontal row of 5 compact sliders + preset + share.

**Props:** None (reads from Zustand store directly, like current `ModelYourOrg`)

**Responsibilities:**
- Renders 5 slider inputs in a horizontal grid
- Handles company preset changes
- Handles share link copy
- Manages local `hcSlider` state for logarithmic headcount mapping

This extraction keeps `ModelYourOrg.tsx` focused on layout orchestration.

## Files to Change

1. **`src/components/model/InputStrip.tsx`** (new) — Compact horizontal input row extracted from ModelYourOrg
2. **`src/components/model/ModelYourOrg.tsx`** — Major layout restructure: remove hero slider + grouped cards, render InputStrip + PillarDashboard in new layout
3. **`src/components/model/PillarDashboard.tsx`** — Change from vertical stack to 70/30 grid. RadarChart moves into the left column alongside expanded content. PillarCards move to right column.
4. **`src/components/model/PillarCard.tsx`** — Replace ChevronDown/ChevronUp with ChevronLeft/ChevronRight. Change "Explore"/"Collapse" to "Details"/"Back".
5. **`src/components/model/RadarChart.tsx`** — May need size adjustments to fill the 70% container responsively

## Files NOT Changed

- All calculation libs (`healthScores.ts`, `thermalLag.ts`, `dampedResponse.ts`, etc.)
- Expanded content components (`SignalCascade`, `SensitivitySweep`, `PropagationDelay`, `ChangeResponseTimeline`, `ThreeFutures`, `FlippableMetricCard`)
- Store schema
- Types
- Test files (pure calculation tests unaffected by layout changes)

## Out of Scope

- Mobile-specific layout (collapsible input strip, single-column stacking)
- Context hints in the compact input strip
- New animations beyond opacity crossfade
- What-if panel redesign
- SliderInput component changes (the compact strip may use native range inputs directly rather than the SliderInput component, which was designed for the larger card layout)
