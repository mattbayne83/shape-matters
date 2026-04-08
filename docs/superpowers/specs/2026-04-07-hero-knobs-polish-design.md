# Hero Layout, LED Knobs & Detail Panel Polish

**Date:** 2026-04-07
**Scope:** RadarChart.tsx, PillarCard.tsx, PillarDashboard.tsx, PropagationDelay.tsx, ThreeFutures.tsx

## Problem

The Model Your Org section's PillarDashboard has three issues:
1. The hero EQ chart wastes space — narrow columns with dead whitespace
2. PillarCard knobs are tiny (36px) and visually unimpressive
3. Expanded detail panels can clip or overflow their container at various input combinations

## Design Decisions

### 1. Hero RadarChart → Channel Strip EQ Meters

Replace the current flat EQ layout with individually framed channel strips.

**Container:**
- Parent: `flex items-stretch gap-3 w-full h-full px-6 py-4`
- Remove the absolute-positioned 100/0 scale markers (clip at small sizes)

**Each channel strip:**
- White card: `bg-white border border-stone-200 rounded-xl shadow-sm`
- `flex-1 max-w-[180px]` — equal width, grows to fill
- Internal layout (flex column):
  1. Label — `text-[9px] font-bold uppercase tracking-widest text-stone-400`
  2. Score — `text-4xl font-extrabold font-mono tabular-nums leading-none` colored by `healthBandColor(score)`
  3. EQ segments — `flex-1 flex flex-col-reverse gap-[3px]`
     - 10 segments, each `flex-1 rounded` (stretches to fill all remaining height)
     - Filled segments use `SEG_COLORS[seg]` (existing color ramp)
     - Unfilled segments: `bg-stone-100 opacity-40`
     - Top filled segment: glow `boxShadow: 0 0 8px ${color}55`

**Animations (soundboard feel):**

1. **Breathing glow** — the top filled segment pulses its `boxShadow` on a ~2s infinite CSS animation:
   - Keyframes: `0%,100% { box-shadow: 0 0 8px ${color}55 }` → `50% { box-shadow: 0 0 14px ${color}88 }`
   - `animation: eq-breathe 2s ease-in-out infinite`
   - Only applied to the single top filled segment (not all filled segments)
   - Define `@keyframes eq-breathe` in `index.css` (not inline) for perf

2. **Cascade fill on value change** — when score changes, segments animate bottom-to-top:
   - Each filled segment gets `transition: background-color 300ms ease-out, opacity 300ms ease-out`
   - Staggered via `transition-delay: ${seg * 40}ms` (seg 0 = bottom, fires first)
   - Unfilled segments transition out with the same stagger (top-down natural)
   - This fires naturally from React re-render when Zustand state changes — no extra state needed

**Props unchanged:** `{ fidelity, lagHealth, responseHealth }` — no API change.

### 2. PillarCard LED Ring Knobs

Replace the `Knob` sub-component in PillarCard.tsx.

**Sizing:** 60×60px SVG (up from 36px).

**Structure (outer to inner):**
1. **LED ring** — 13 dots on a 270° arc (135° to 405°, same sweep as current)
   - Lit dots: `r=3`, fill = accent color, `filter: drop-shadow(0 0 3px ${color}88)`
   - Unlit dots: `r=2.5`, fill = `#e7e5e4`, opacity 0.4
   - Lit count: `Math.round(score / (100 / 13))` — maps 0-100 to 0-13
2. **Knob body** — outer circle `r=21` fill `#44403c`, inner circle `r=19` fill `#57534e`
   - `filter: drop-shadow(0 1px 2px rgba(0,0,0,0.12))`
3. **Pointer line** — from center to position on arc, stroke `white`, strokeWidth 2, strokeLinecap round
4. **Center dot** — `r=3`, fill `#78716c`

**Animation:** All elements get `transition-all duration-500` (matches existing knob transition).

**Props unchanged:** `{ score, color, size? }` — size default changes from 36 to 60.

### 3. Detail Panel Polish

All fixes target the expanded pillar content inside `PillarDashboard`'s right column (`lg:absolute lg:inset-0` container).

#### Cross-cutting
- All `motion.div` wrappers for expanded content: add `overflow-hidden` class
- Verify the parent border wrapper's `overflow-hidden` is effective

#### Fidelity Panel (SignalCascade + SensitivitySweep)
- Both sub-panels: ensure `min-h-0 overflow-hidden` on their flex containers
- Section labels (`text-[10px]`): add `shrink-0` (already present — verify)
- No structural changes needed — SVGs scale via `preserveAspectRatio`

#### Lag Panel (PropagationDelay)
- Bars container (`space-y-3`): change to `overflow-y-auto` with scrollbar styling
- When `levels > 6`: reduce bar height from `h-8` to `h-6` for density
- Role label span (`w-28`): add `truncate` class to prevent text overflow
- Footer ("Removing 1 layer saves N days"): add `mt-auto shrink-0` to pin at bottom
- Wrap bars in a `flex-1 min-h-0 overflow-y-auto` container

#### Response Panel (ChangeResponseTimeline + ThreeFutures)
- ThreeFutures verdict paragraph: ensure `shrink-0 mt-auto` so it pins below the cards
- ChangeResponseTimeline legend: add `shrink-0` and tighten `gap-x-3`
- The SVG and its legend should be in a `flex flex-col min-h-0` wrapper with the SVG getting `flex-1 min-h-0`

## Files Changed

| File | Change |
|------|--------|
| `src/components/model/RadarChart.tsx` | Full rewrite — channel strip layout |
| `src/components/model/PillarCard.tsx` | Replace `Knob` sub-component with LED ring |
| `src/components/model/PillarDashboard.tsx` | Add `overflow-hidden` to motion.div wrappers |
| `src/components/model/PropagationDelay.tsx` | Overflow handling, dynamic bar height, truncate |
| `src/components/model/ThreeFutures.tsx` | Pin verdict footer |
| `src/components/model/ChangeResponseTimeline.tsx` | Legend shrink-0, tighter spacing |
| `src/index.css` | Add `@keyframes eq-breathe` animation |

## Not Changed

- No new dependencies
- No store changes
- No calculation/logic changes
- No changes to InputStrip, ModelYourOrg, or other sections
- Existing color ramp (`SEG_COLORS`) and `healthBandColor` reused as-is
