# InputStrip UX Redesign: Org Designer Workbench

**Date:** 2026-04-09
**Status:** Approved (brainstorming)

## Problem

The current InputStrip presents 5 sliders + an advanced disclosure as peers in a flat row. But the inputs fall into two distinct categories:

- **Structural reality** (hard to change): Depth, Headcount — set by org size and shape
- **Design levers** (actionable): Fidelity/Layer, Cycle Time, Authority (DCI), Team Routing — choices leaders can influence

The flat layout doesn't communicate this distinction. An "org designer workbench" mental model requires that structural context is set-and-forget while the levers are the primary interaction.

## Design

### Layout: Three Tiers

The InputStrip becomes a vertically stacked card with three visually distinct tiers:

**Tier 1 — Context Bar** (stone background `#f5f5f4`)
- Collapsed by default: read-only summary showing `Depth: 9 · Headcount: 8.7K`
- "Edit" toggle expands inline to reveal Depth + Headcount `CompactSlider` components (stone accent `#a8a29e`)
- When collapsed, structure values shown as bold monospace numbers alongside their labels
- "Your Org" section label at left edge

**Tier 2 — Lever Sliders** (white background)
- 4-column CSS grid: Fidelity, Cycle Time, Authority, Team Routing
- All use ember accent `#E05A1B` (unified — they're all levers now)
- Always visible, always interactive — this is the primary interaction zone
- Each slider shows: label (top-left), hint + value (top-right), track, tick marks (bottom)
- No dividers between sliders — the grid gap provides separation

**Tier 3 — Benchmarks** (white background, subtle top border)
- Company preset pills: Valve, Nucor, Google, Meta, Haier, Amazon
- "Compare" label at left
- Share button at right
- Same pill styling as current implementation

### Change Highlight Animation

When a company preset is clicked:

1. **Context bar** updates Depth + Headcount instantly (no animation — these are facts)
2. **Lever sliders** whose values changed get a **1.5s ember pulse ring** animation:
   - CSS `box-shadow` expanding from `0 0 0 0 rgba(224, 90, 27, 0.25)` to `0 0 0 4px rgba(224, 90, 27, 0.12)` then fading to `0 0 0 0 rgba(224, 90, 27, 0)`
   - `@keyframes lever-pulse` with `animation-duration: 1.5s`, `ease-out`
   - Applied via a `lever-changed` class that is added on preset click and removed after 1.5s (via `setTimeout` or `onAnimationEnd`)
3. **Sliders whose values didn't change** get no animation
4. **After 1.5s**, all highlights disappear completely. No persistent state.

### Context Bar Expand/Collapse

- Controlled by existing `advancedInputsOpen` store field (repurposed — was used for Team Routing disclosure)
- When expanded: shows Depth + Headcount sliders using `CompactSlider` with `accent="warm-stone"` (differentiated from lever ember)
- Smooth height transition via `max-height` + `overflow-hidden` + `transition-all duration-300`
- "Edit" text toggles to "Collapse" or just uses a chevron rotation (matching existing pattern)

### Accent Color Strategy

| Slider Group | Accent | Meaning |
|---|---|---|
| Depth, Headcount (Tier 1) | `warm-stone` (#A8967A) | Structural reality — muted, contextual |
| Fidelity, Cycle Time, Authority, Team Routing (Tier 2) | `ember` (#E05A1B) | Design levers — active, actionable |

This is a change from current behavior where Cycle Time, Authority, and Team Routing use warm-stone. In the workbench model, all levers share ember to reinforce "these are the things you can change."

### Company Preset Behavior

When a preset is clicked:
1. Set ALL values (structure + levers) to the company's profile
2. Track which lever values changed from previous state (compare before/after)
3. Apply `lever-pulse` animation class only to changed sliders
4. Context bar updates values immediately
5. Preset pill gets active styling (dark fill)

### Mobile Behavior

- Tier 1: Context bar stays single-line collapsed; expands to stacked sliders
- Tier 2: 4-column grid → 2-column grid at `< lg` breakpoint, then single column at `< sm`
- Tier 3: Pills wrap naturally (flex-wrap)

## Files to Modify

| File | Change |
|---|---|
| `src/components/model/InputStrip.tsx` | Complete restructure: 3-tier layout, context bar collapse/expand, lever grid, pulse animation logic |
| `src/store/useCompanyStore.ts` | Repurpose `advancedInputsOpen` as context bar expand state (or rename to `contextExpanded`) |
| `src/index.css` | Add `@keyframes lever-pulse` animation |

## Files NOT Modified

- `CompactSlider` component — reused as-is, just different `accent` prop values
- `PillarDashboard`, `PillarCard` — no changes
- Store data fields — no new state, just UI reorganization
- `contextHints.ts` — all hint functions already exist

## Out of Scope

- Changing the pillar dashboard layout
- Adding new inputs or calculations
- Modifying company preset data (already updated in Phase 1)
- Changing the PillarCard "Structure" / "Design Lever" labels (already done in Phase 5)
