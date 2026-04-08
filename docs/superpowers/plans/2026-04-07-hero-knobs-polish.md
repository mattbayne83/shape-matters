# Hero Layout, LED Knobs & Detail Panel Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the PillarDashboard's hero EQ chart to channel-strip framing with pulse animations, replace pillar card knobs with LED ring style, and fix detail panel overflow/clipping.

**Architecture:** Pure component-level changes — no store, calculation, or routing changes. RadarChart gets a full rewrite (channel strips), PillarCard's Knob sub-component gets replaced (LED ring), and 4 detail panel components get overflow/layout fixes. One new CSS keyframe in index.css.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, SVG, CSS animations

---

### Task 1: Add `eq-breathe` keyframe to index.css

**Files:**
- Modify: `src/index.css:258-268` (before the closing `@layer utilities` block for what-if)

- [ ] **Step 1: Add the keyframe definition**

Add this block after the `what-if-border-pulse` keyframe (line 258) and before the `@layer utilities` block at line 260:

```css
@keyframes eq-breathe {
  0%,
  100% {
    box-shadow: var(--eq-glow-dim);
  }

  50% {
    box-shadow: var(--eq-glow-bright);
  }
}
```

The glow colors are per-segment (depend on `SEG_COLORS`), so RadarChart will set `--eq-glow-dim` and `--eq-glow-bright` as inline CSS custom properties on the top segment div.

- [ ] **Step 2: Verify dev server still loads**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm run dev`
Expected: Dev server starts without CSS parse errors.

- [ ] **Step 3: Commit**

Do NOT commit — per user preference, no auto-commits.

---

### Task 2: Rewrite RadarChart as Channel Strip EQ Meters

**Files:**
- Modify: `src/components/model/RadarChart.tsx` (full rewrite, ~93 lines → ~90 lines)

- [ ] **Step 1: Rewrite RadarChart.tsx**

Replace the entire file content with:

```tsx
import { healthBandColor } from '../../lib/healthScores';

interface RadarChartProps {
  fidelity: number;
  lagHealth: number;
  responseHealth: number;
}

const PILLARS = [
  { key: 'fidelity', label: 'Fidelity' },
  { key: 'lag', label: 'Lag' },
  { key: 'response', label: 'Response' },
] as const;

const SEGMENTS = 10;
const SEG_GAP = 3;

const SEG_COLORS = [
  '#44403c', // 0-10   stone-700
  '#44403c', // 10-20  stone-700
  '#57534e', // 20-30  stone-600
  '#78716c', // 30-40  stone-500
  '#A8967A', // 40-50  warm-stone
  '#A8967A', // 50-60  warm-stone
  '#F4A261', // 60-70  ember-light
  '#F4A261', // 70-80  ember-light
  '#E05A1B', // 80-90  ember
  '#dc2626', // 90-100 red-600
];

export function RadarChart({ fidelity, lagHealth, responseHealth }: RadarChartProps) {
  const scores = [fidelity, lagHealth, responseHealth];

  return (
    <div className="flex items-stretch gap-3 w-full h-full px-6 py-4">
      {PILLARS.map((pillar, i) => {
        const score = scores[i];
        const headlineColor = healthBandColor(score);
        const filledCount = Math.round(score / 10);

        return (
          <div
            key={pillar.key}
            className="flex-1 max-w-[180px] bg-white border border-stone-200 rounded-xl shadow-sm flex flex-col items-center gap-2 px-3 py-4"
          >
            {/* Label */}
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest shrink-0">
              {pillar.label}
            </span>

            {/* Score */}
            <span
              className="text-4xl font-extrabold font-mono tabular-nums leading-none shrink-0"
              style={{ color: headlineColor }}
            >
              {score}
            </span>

            {/* EQ column */}
            <div
              className="w-full flex-1 flex flex-col-reverse min-h-0"
              style={{ gap: SEG_GAP }}
            >
              {Array.from({ length: SEGMENTS }, (_, seg) => {
                const isFilled = seg < filledCount;
                const isTop = seg === filledCount - 1 && filledCount > 0;
                const color = SEG_COLORS[seg];

                return (
                  <div
                    key={seg}
                    className="w-full flex-1 rounded"
                    style={{
                      backgroundColor: isFilled ? color : '#f5f5f4',
                      opacity: isFilled ? 1 : 0.4,
                      transition: `background-color 300ms ease-out, opacity 300ms ease-out`,
                      transitionDelay: `${seg * 40}ms`,
                      ...(isTop
                        ? {
                            ['--eq-glow-dim' as string]: `0 0 8px ${color}55`,
                            ['--eq-glow-bright' as string]: `0 0 14px ${color}88`,
                            animation: 'eq-breathe 2s ease-in-out infinite',
                          }
                        : { boxShadow: 'none' }),
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify the component renders**

Open the app in browser, navigate to `#model`. The hero panel (right side of PillarDashboard when no pillar is expanded) should show 3 white card columns with EQ segments.

Verify:
- Segments fill the available height (flex-1 stretching)
- Score numbers are large and colored by health band
- Top filled segment has a pulsing glow animation
- Dragging a slider causes segments to cascade with staggered transitions

- [ ] **Step 3: Commit**

Do NOT commit — per user preference.

---

### Task 3: Replace PillarCard Knob with LED Ring

**Files:**
- Modify: `src/components/model/PillarCard.tsx:1-72` (replace the `Knob` function)

- [ ] **Step 1: Replace the Knob sub-component**

Replace lines 1–72 (the import, `Knob` function, and its closing brace) with:

```tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type PillarId = 'fidelity' | 'lag' | 'response';

const LED_COUNT = 13;
const ARC_START = 135; // 7 o'clock
const ARC_SWEEP = 270;

/** LED Ring knob — 13 dots on a 270° arc with dark body and white pointer */
function Knob({ score, color, size = 60 }: { score: number; color: string; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const ledR = (size - 4) / 2; // radius for LED dot positions
  const litCount = Math.round(Math.min(Math.max(score, 0), 100) / (100 / LED_COUNT));

  const toXY = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return [cx + ledR * Math.cos(rad), cy + ledR * Math.sin(rad)] as const;
  };

  // Pointer angle — same arc mapping as LEDs
  const pointerAngle = ARC_START + (Math.min(Math.max(score, 0), 100) / 100) * ARC_SWEEP;
  const pointerLen = 16;
  const pointerRad = (pointerAngle * Math.PI) / 180;
  const px = cx + pointerLen * Math.cos(pointerRad);
  const py = cy + pointerLen * Math.sin(pointerRad);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="select-none shrink-0">
      <defs>
        <filter id={`led-glow-${color.replace('#', '')}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor={color} floodOpacity="0.5" />
        </filter>
        <filter id="knob-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* LED ring — 13 dots */}
      {Array.from({ length: LED_COUNT }, (_, i) => {
        const angle = ARC_START + (i / (LED_COUNT - 1)) * ARC_SWEEP;
        const [lx, ly] = toXY(angle);
        const isLit = i < litCount;

        return (
          <circle
            key={i}
            cx={lx}
            cy={ly}
            r={isLit ? 3 : 2.5}
            fill={isLit ? color : '#e7e5e4'}
            opacity={isLit ? 1 : 0.4}
            filter={isLit ? `url(#led-glow-${color.replace('#', '')})` : undefined}
            className="transition-all duration-500"
          />
        );
      })}

      {/* Knob body */}
      <circle cx={cx} cy={cy} r={21} fill="#44403c" filter="url(#knob-shadow)" />
      <circle cx={cx} cy={cy} r={19} fill="#57534e" />

      {/* Pointer line */}
      <line
        x1={cx}
        y1={cy}
        x2={px}
        y2={py}
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        className="transition-all duration-500"
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3} fill="#78716c" />
    </svg>
  );
}
```

The rest of the file (PillarCardProps interface and PillarCard component) stays exactly the same — the Knob is called with the same props `{ score, color }` and the default size change from 36→60 is handled by the new default parameter.

- [ ] **Step 2: Verify the LED ring renders**

In browser, check `#model` section:
- Each PillarCard shows a dark circular knob (60px) with LED dots
- Lit dots glow in the accent color
- White pointer line tracks the score position
- Dragging sliders animates the dots and pointer smoothly

- [ ] **Step 3: Commit**

Do NOT commit — per user preference.

---

### Task 4: Add overflow-hidden to PillarDashboard detail wrappers

**Files:**
- Modify: `src/components/model/PillarDashboard.tsx:83-161` (three motion.div expanded panels)

- [ ] **Step 1: Add overflow-hidden to the fidelity expanded panel**

In `PillarDashboard.tsx`, find the fidelity motion.div (line ~84):

Change:
```tsx
              className="p-4 h-full flex flex-col"
```
to:
```tsx
              className="p-4 h-full flex flex-col overflow-hidden"
```

- [ ] **Step 2: Add overflow-hidden to the lag expanded panel**

Find the lag motion.div (line ~119):

Change:
```tsx
              className="p-4 h-full flex flex-col"
```
to:
```tsx
              className="p-4 h-full flex flex-col overflow-hidden"
```

- [ ] **Step 3: Add overflow-hidden to the response expanded panel**

Find the response motion.div (line ~131):

Change:
```tsx
              className="p-4 h-full flex flex-col"
```
to:
```tsx
              className="p-4 h-full flex flex-col overflow-hidden"
```

- [ ] **Step 4: Verify no visual change when collapsed**

Refresh the app — the default radar/EQ view should be unaffected. Click each pillar to expand — content should still render but now clips instead of overflowing the container boundary.

- [ ] **Step 5: Commit**

Do NOT commit — per user preference.

---

### Task 5: Fix PropagationDelay overflow

**Files:**
- Modify: `src/components/model/PropagationDelay.tsx`

- [ ] **Step 1: Update the bars container for overflow and dynamic height**

In `PropagationDelay.tsx`, find the bars container div (line ~39):

Change:
```tsx
      <div className="space-y-3 flex-1 min-h-0 flex flex-col justify-center px-4">
```
to:
```tsx
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col justify-center gap-3 px-4">
```

- [ ] **Step 2: Add dynamic bar height and truncate to role labels**

Find the bar row (lines ~46-63). Change:

```tsx
              <span className="text-xs font-mono text-stone-400 w-28 shrink-0 text-right">
                L{d.layer} · {d.role}
              </span>
              <div className="flex-1 h-8 bg-stone-100 rounded relative overflow-hidden shadow-inner">
```

to:

```tsx
              <span className="text-xs font-mono text-stone-400 w-28 shrink-0 text-right truncate">
                L{d.layer} · {d.role}
              </span>
              <div className={`flex-1 ${levels > 6 ? 'h-6' : 'h-8'} bg-stone-100 rounded relative overflow-hidden shadow-inner`}>
```

Note: The `levels` prop is already available in the component — it's destructured from props on line 17.

- [ ] **Step 3: Pin the footer**

Find the footer paragraph (line ~67):

Change:
```tsx
        <p className="text-sm text-stone-500 mt-4 pt-3 border-t border-stone-100">
```
to:
```tsx
        <p className="text-sm text-stone-500 mt-auto pt-3 border-t border-stone-100 shrink-0">
```

- [ ] **Step 4: Verify with high levels**

In the app, set Levels slider to 12+. Expand the Lag pillar. Verify:
- Bars scroll within the container if needed
- Bar height is shorter (h-6) for density
- Role labels truncate instead of wrapping
- "Removing 1 layer" footer stays pinned at the bottom

- [ ] **Step 5: Commit**

Do NOT commit — per user preference.

---

### Task 6: Fix ThreeFutures verdict pinning

**Files:**
- Modify: `src/components/model/ThreeFutures.tsx:122-128`

- [ ] **Step 1: Pin the verdict footer**

Find the verdict container (line ~122):

Change:
```tsx
      <div className="mt-3 pt-3 border-t border-stone-100 shrink-0">
```

This already has `shrink-0`. Verify it also needs `mt-auto` to pin to bottom when cards don't fill the space. Change to:

```tsx
      <div className="mt-auto pt-3 border-t border-stone-100 shrink-0">
```

- [ ] **Step 2: Verify**

Expand the Response pillar. The verdict sentence should always sit at the bottom of the ThreeFutures column regardless of how tall the 3 scenario cards are.

- [ ] **Step 3: Commit**

Do NOT commit — per user preference.

---

### Task 7: Fix ChangeResponseTimeline legend

**Files:**
- Modify: `src/components/model/ChangeResponseTimeline.tsx`

- [ ] **Step 1: Wrap SVG and legend in a flex column**

Find the return JSX (line ~125). The current structure is:
```tsx
    <div className="flex-1 w-full flex flex-col justify-center min-h-0">
```

This is already a flex column with `min-h-0` — good. Now find the legend div (line ~234):

Change:
```tsx
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2 text-[10px] text-stone-400">
```
to:
```tsx
      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2 text-[10px] text-stone-400 shrink-0">
```

- [ ] **Step 2: Make the SVG flex-1 to fill space**

Find the `<svg>` tag (line ~144):

Change:
```tsx
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
```
to:
```tsx
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full flex-1 min-h-0" preserveAspectRatio="xMidYMid meet">
```

- [ ] **Step 3: Verify**

Expand the Response pillar. The timeline SVG should fill available space and the legend should not clip or wrap awkwardly at the bottom.

- [ ] **Step 4: Commit**

Do NOT commit — per user preference.

---

### Task 8: Final verification pass

**Files:** None — visual QA only.

- [ ] **Step 1: Run type checker**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 2: Run linter**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx eslint src/components/model/RadarChart.tsx src/components/model/PillarCard.tsx src/components/model/PillarDashboard.tsx src/components/model/PropagationDelay.tsx src/components/model/ThreeFutures.tsx src/components/model/ChangeResponseTimeline.tsx --max-warnings 0`
Expected: No errors or warnings.

- [ ] **Step 3: Run tests**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm run test`
Expected: All 214 tests pass (no component tests exist for these files — only lib tests).

- [ ] **Step 4: Visual QA checklist**

Open app at `#model` and verify:
- [ ] Hero EQ: 3 channel strip cards with full-height segments
- [ ] Hero EQ: Top segment breathes (glow pulse)
- [ ] Hero EQ: Dragging sliders cascades segments bottom-to-top
- [ ] Knobs: LED ring with dark body on all 3 pillar cards
- [ ] Knobs: Lit dots glow, pointer tracks score
- [ ] Fidelity expand: SignalCascade + SensitivitySweep fit without clipping
- [ ] Lag expand: Bars scroll at 12+ levels, shorter bars, truncated roles, pinned footer
- [ ] Response expand: Timeline SVG fills space, legend doesn't clip, verdict pinned
- [ ] All 3 company presets (Valve, Nucor, etc.) render correctly at extreme values

- [ ] **Step 5: Start dev server for user**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm run dev`
Provide the localhost URL to the user.
