# Advanced Inputs Redesign — Grouped Cards with Live Context

**Date:** 2026-04-06
**Status:** Approved
**Scope:** `ModelYourOrg.tsx` component + new `SliderInput` shared component + context hint logic

## Problem

The expanded advanced inputs section is a flat wall of 5 controls with no visual grouping, inconsistent slider layouts (two different patterns), inconsistent accent colors (stone-700 vs ember), no contextual help, and a misplaced "Copy shareable link" button. It feels like a settings dump rather than an invitation to explore.

## Design

### Layout: Two Grouped Cards (Always Visible on Desktop)

Remove the `AnimatePresence` collapse/expand toggle on desktop (≥768px). Replace the flat list with a **2-column grid** of two semantically grouped cards:

**Structure card** (left) — "How your org is built"
- Company preset dropdown
- Organization Size slider
- Per-Layer Fidelity slider
- Accent color: **ember** (`#E05A1B` fill, `#F4A261` gradient end)

**Dynamics card** (right) — "How your org behaves"
- Decision Cycle slider
- Cultural Agility slider
- Accent color: **warm-stone** (`#A8967A` fill, `#c4b49a` gradient end)
- Bottom callout: dashed-border box explaining "These inputs feed the Propagation Lag and Change Response pillars below"

### Card Header Pattern

Each card gets a header with:
- 30×30px icon badge (gradient background matching the card's accent, white SVG icon inside, `rounded-lg`)
- Group name: `text-xs font-bold uppercase tracking-widest text-stone-700`
- Subtitle: `text-[10px] text-stone-400`
- Separated from inputs by a `border-b border-stone-100` with `pb-3 mb-5`

Icons:
- Structure: bar-chart-like icon (vertical bars)
- Dynamics: clock icon

### Unified Slider Pattern (All 4 Sliders)

Every slider uses the same layout — no more mixed patterns:

```
[Label (11px semibold stone-600)]     [Value (15px bold mono stone-900)]
[═══════════●══════════] ← 6px track, gradient fill, themed thumb
[Context hint (10px italic warm-stone)]
```

- **Label**: `text-[11px] font-semibold text-stone-600` (left-aligned)
- **Value**: `text-[15px] font-bold font-mono tabular-nums text-stone-900` (right-aligned)
- **Track**: `h-1.5 bg-stone-200 rounded-full` with a filled portion using the card's accent gradient
- **Thumb**: Native range input. Structure sliders use `accent-ember` (works via Tailwind custom token). Dynamics sliders use `style={{ accentColor: '#A8967A' }}` since `warm-stone` isn't in the accent- utility namespace.
- **Context hint**: `text-[10px] italic text-warm-stone mt-1`

### Dynamic Context Hints

Each slider gets a context line that updates live as the value changes. Mix factual comparison + derived data:

**Organization Size** — bucketed by range:
- <100: "Startup — everyone knows everyone"
- 100–500: "Small — ~1 manager per {span} people"
- 500–5,000: "Mid-size — ~1 manager per {span} people"
- 5,000–50,000: "Large enterprise — {managerRatio}% management overhead"
- 50,000+: "Mega-corp — {managerRatio}% management overhead"

**Per-Layer Fidelity:**
- <65%: "Low — {100-val}% signal lost per hop"
- 65–79%: "Below average — {100-val}% signal lost per hop"
- 80–85%: "Typical — {100-val}% signal lost per hop"
- 86–92%: "High — only {100-val}% lost per hop"
- 93+%: "Exceptional — near-lossless relay"

**Decision Cycle:**
- 1–2d: "Startup-fast — {totalDays}d CEO → front line"
- 2.5–5d: "Moderate — {totalDays}d CEO → front line"
- 5.5–10d: "Bureaucratic — {totalDays}d CEO → front line"
- 10+d: "Glacial — {totalDays}d CEO → front line"

Where `totalDays` = `decisionCycle × (levels - 1)`

**Cultural Agility:**
- 0–20: "Rigid — settling time ~{settlingWeeks} weeks"
- 21–40: "Resistant — settling time ~{settlingWeeks} weeks"
- 41–60: "Moderate — settling time ~{settlingWeeks} weeks"
- 61–80: "Adaptive — settling time ~{settlingWeeks} weeks"
- 81–100: "Highly agile — settling time ~{settlingWeeks} weeks"

Where `settlingWeeks` comes from `calcDampedResponse().settlingTimeWeeks`.

### Share Link Button

Move outside the grouped cards. Full-width subtle button below the 2-column grid:
- `w-full flex items-center justify-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 border border-stone-200 hover:border-stone-300 rounded-lg py-2 bg-white transition-colors`
- Uses `Link` icon from lucide-react (existing)

### Mobile Behavior (< 768px)

- Cards stack vertically: Structure on top, Dynamics below
- The "Advanced inputs" toggle **returns** on mobile — both cards collapse behind it
- Levels hero slider remains always visible
- Share link stays below cards (visible when expanded)

### Responsive Breakpoint

Use Tailwind's `md:` prefix (768px):
- `md:grid md:grid-cols-2 md:gap-3.5` for the card grid
- On mobile: `flex flex-col gap-3` (stacked)
- Toggle button: `md:hidden` (hidden on desktop, visible on mobile)

## Files to Change

1. **`src/components/model/ModelYourOrg.tsx`** — Major rewrite of the advanced inputs section. Remove desktop collapse logic, add 2-column grouped cards, update share link position.

2. **`src/components/model/SliderInput.tsx`** (new) — Shared slider component encapsulating the unified pattern: label, mono value, themed track, context hint. Props: `label`, `value`, `displayValue`, `hint`, `accent` ('ember' | 'warm-stone'), `min`, `max`, `step`, `onChange`.

3. **`src/lib/contextHints.ts`** (new) — Pure functions that return context hint strings for each slider. Inputs: slider value + derived metrics (span, managerRatio, totalDelay, settlingWeeks). No React dependency — just string computation.

4. **`src/index.css`** — Add `--color-warm-stone-light: #c4b49a` to `@theme` block if not already present. May need custom slider track styling for the gradient fill (WebKit + Firefox pseudo-elements).

## Files NOT Changed

- `PillarDashboard.tsx`, `PillarCard.tsx`, `MetricCard.tsx` — untouched
- `useCompanyStore.ts` — no state changes needed (advancedInputsOpen still used for mobile)
- Calculation libs — read-only consumers

## Out of Scope

- Levels hero slider redesign (already works well)
- PillarCard or MetricCard styling
- "More metrics" section
- What-If panel
- Mobile-specific polish beyond basic stacking
