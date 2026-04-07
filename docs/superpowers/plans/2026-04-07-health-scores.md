# Health Scores Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Propagation Lag and Change Response pillars to 0-100 health scores with physics-based curves, business-anchored labels, and a new radar chart summarizing all three dimensions.

**Architecture:** New `healthScores.ts` lib with pure scoring functions consumed by `PillarDashboard`. PillarCard gets new props for health score, label, and color. New `RadarChart.tsx` SVG component renders above the pillar cards. TDD throughout.

**Tech Stack:** TypeScript, Vitest, React 19, SVG (no external charting lib)

**Spec:** `docs/superpowers/specs/2026-04-07-health-scores-design.md`

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/lib/healthScores.ts` | Pure scoring functions: `calcLagHealth`, `calcResponseHealth`, `healthBandColor`, band/label lookup |
| Create | `src/lib/__tests__/healthScores.test.ts` | Unit tests for all scoring functions |
| Create | `src/components/model/RadarChart.tsx` | 3-axis SVG spider chart (Fidelity, Lag, Response) |
| Modify | `src/types/index.ts` | Add `HealthScore` interface |
| Modify | `src/components/model/PillarCard.tsx` | Accept `healthColor` prop, use it for headline + accent |
| Modify | `src/components/model/PillarDashboard.tsx` | Compute health scores, pass to PillarCards, render RadarChart |

---

### Task 1: Add HealthScore type

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add the HealthScore interface**

At the end of `src/types/index.ts`, after the `Scenario` interface (line 156), add:

```typescript
// ── Health Scores ──────────────────────────────────────────────────
export interface HealthScore {
  score: number;          // 0-100, rounded integer
  label: string;          // "Live", "Nimble", "Stuck", etc.
  color: string;          // Hex color for the score band
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors (type is only added, not consumed yet)

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add HealthScore type"
```

---

### Task 2: Implement health scoring functions (TDD)

**Files:**
- Create: `src/lib/healthScores.ts`
- Create: `src/lib/__tests__/healthScores.test.ts`

- [ ] **Step 1: Write failing tests for `calcLagHealth`**

Create `src/lib/__tests__/healthScores.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calcLagHealth, calcResponseHealth, healthBandColor } from '../healthScores';

describe('calcLagHealth', () => {
  it('0 delay → score 100 (perfect)', () => {
    const result = calcLagHealth(0);
    expect(result.score).toBe(100);
    expect(result.label).toBe('Live');
    expect(result.color).toBe('#44403c');
  });

  it('default org: 75d delay → score 47 (Aging)', () => {
    const result = calcLagHealth(75);
    expect(result.score).toBe(47);
    expect(result.label).toBe('Aging');
  });

  it('90d delay → score 41 (Aging)', () => {
    const result = calcLagHealth(90);
    expect(result.score).toBe(41);
    expect(result.label).toBe('Aging');
  });

  it('14d delay → score 87 (Live)', () => {
    const result = calcLagHealth(14);
    expect(result.score).toBe(87);
    expect(result.label).toBe('Live');
  });

  it('150d delay → score 22 (Stale)', () => {
    const result = calcLagHealth(150);
    expect(result.score).toBe(22);
    expect(result.label).toBe('Stale');
  });

  it('300d delay → score 5 (Expired)', () => {
    const result = calcLagHealth(300);
    expect(result.score).toBe(5);
    expect(result.label).toBe('Expired');
  });

  it('negative delay clamped to 0 → score 100', () => {
    expect(calcLagHealth(-10).score).toBe(100);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run src/lib/__tests__/healthScores.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write failing tests for `calcResponseHealth`**

Append to `src/lib/__tests__/healthScores.test.ts`:

```typescript
describe('calcResponseHealth', () => {
  it('ζ=1.0 (critically damped) → score 100 (Dialed In)', () => {
    const result = calcResponseHealth(1.0, 'critically-damped');
    expect(result.score).toBe(100);
    expect(result.label).toBe('Dialed In');
    expect(result.color).toBe('#44403c');
  });

  it('default org: ζ=0.63 under-damped → score 72 (Nimble)', () => {
    const result = calcResponseHealth(0.63, 'under-damped');
    expect(result.score).toBe(72);
    expect(result.label).toBe('Nimble');
  });

  it('ζ=0.30 under-damped → score 14 (Fishtailing)', () => {
    const result = calcResponseHealth(0.30, 'under-damped');
    expect(result.score).toBe(14);
    expect(result.label).toBe('Fishtailing');
  });

  it('ζ=0.50 under-damped → score 37 (Twitchy)', () => {
    const result = calcResponseHealth(0.50, 'under-damped');
    expect(result.score).toBe(37);
    expect(result.label).toBe('Twitchy');
  });

  it('ζ=1.30 over-damped → score 81 (Steady)', () => {
    const result = calcResponseHealth(1.30, 'over-damped');
    expect(result.score).toBe(81);
    expect(result.label).toBe('Steady');
  });

  it('ζ=1.50 over-damped → score 55 (Lumbering)', () => {
    const result = calcResponseHealth(1.50, 'over-damped');
    expect(result.score).toBe(55);
    expect(result.label).toBe('Lumbering');
  });

  it('ζ=2.0 over-damped → score 9 (Stuck)', () => {
    const result = calcResponseHealth(2.0, 'over-damped');
    expect(result.score).toBe(9);
    expect(result.label).toBe('Stuck');
  });

  it('symmetric: ζ=0.5 and ζ=1.5 produce the same score', () => {
    const under = calcResponseHealth(0.5, 'under-damped');
    const over = calcResponseHealth(1.5, 'over-damped');
    expect(under.score).toBe(over.score);
  });

  it('under vs over-damped at same score get different labels', () => {
    // ζ=0.5 under → "Twitchy", ζ=1.5 over → "Lumbering" — same score, different label
    const under = calcResponseHealth(0.5, 'under-damped');
    const over = calcResponseHealth(1.5, 'over-damped');
    expect(under.label).toBe('Twitchy');
    expect(over.label).toBe('Lumbering');
  });
});
```

- [ ] **Step 4: Write failing tests for `healthBandColor`**

Append to `src/lib/__tests__/healthScores.test.ts`:

```typescript
describe('healthBandColor', () => {
  it('score 100 → stone-700', () => {
    expect(healthBandColor(100)).toBe('#44403c');
  });

  it('score 85 → stone-700 (lower bound)', () => {
    expect(healthBandColor(85)).toBe('#44403c');
  });

  it('score 84 → warm-stone (upper bound)', () => {
    expect(healthBandColor(84)).toBe('#a8967a');
  });

  it('score 65 → warm-stone (lower bound)', () => {
    expect(healthBandColor(65)).toBe('#a8967a');
  });

  it('score 64 → ember-light', () => {
    expect(healthBandColor(64)).toBe('#F4A261');
  });

  it('score 40 → ember-light (lower bound)', () => {
    expect(healthBandColor(40)).toBe('#F4A261');
  });

  it('score 39 → ember', () => {
    expect(healthBandColor(39)).toBe('#E05A1B');
  });

  it('score 20 → ember (lower bound)', () => {
    expect(healthBandColor(20)).toBe('#E05A1B');
  });

  it('score 19 → red', () => {
    expect(healthBandColor(19)).toBe('#dc2626');
  });

  it('score 0 → red', () => {
    expect(healthBandColor(0)).toBe('#dc2626');
  });
});
```

- [ ] **Step 5: Implement `healthScores.ts`**

Create `src/lib/healthScores.ts`:

```typescript
import type { HealthScore, ResponseRegime } from '../types';

const LAG_TAU = 100;
const RESPONSE_SIGMA = 0.65;

const LAG_LABELS: [number, string][] = [
  [85, 'Live'],
  [65, 'Fresh'],
  [40, 'Aging'],
  [20, 'Stale'],
  [0, 'Expired'],
];

const UNDER_DAMPED_LABELS: [number, string][] = [
  [85, 'Dialed In'],
  [65, 'Nimble'],
  [40, 'Twitchy'],
  [20, 'Fishtailing'],
  [0, 'Spinning Out'],
];

const OVER_DAMPED_LABELS: [number, string][] = [
  [85, 'Dialed In'],
  [65, 'Steady'],
  [40, 'Lumbering'],
  [20, 'Dragging'],
  [0, 'Stuck'],
];

const BAND_COLORS: [number, string][] = [
  [85, '#44403c'],
  [65, '#a8967a'],
  [40, '#F4A261'],
  [20, '#E05A1B'],
  [0, '#dc2626'],
];

function lookupBand(score: number, bands: [number, string][]): string {
  for (const [threshold, value] of bands) {
    if (score >= threshold) return value;
  }
  return bands[bands.length - 1][1];
}

export function healthBandColor(score: number): string {
  return lookupBand(Math.round(score), BAND_COLORS);
}

export function calcLagHealth(totalDelay: number): HealthScore {
  const clampedDelay = Math.max(0, totalDelay);
  const raw = 100 * Math.exp(-clampedDelay / LAG_TAU);
  const score = Math.round(raw);
  return {
    score,
    label: lookupBand(score, LAG_LABELS),
    color: healthBandColor(score),
  };
}

export function calcResponseHealth(
  zeta: number,
  regime: ResponseRegime,
): HealthScore {
  const raw = 100 * Math.exp(-((zeta - 1.0) / RESPONSE_SIGMA) ** 2);
  const score = Math.round(raw);
  const labels = regime === 'over-damped' ? OVER_DAMPED_LABELS : UNDER_DAMPED_LABELS;
  return {
    score,
    label: lookupBand(score, labels),
    color: healthBandColor(score),
  };
}
```

- [ ] **Step 6: Run all tests to verify they pass**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run src/lib/__tests__/healthScores.test.ts`
Expected: All tests PASS

- [ ] **Step 7: Run the full test suite to check for regressions**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run`
Expected: All existing tests PASS (164+ existing + new)

- [ ] **Step 8: Commit**

```bash
git add src/lib/healthScores.ts src/lib/__tests__/healthScores.test.ts
git commit -m "feat: add health scoring functions for Lag and Response pillars"
```

---

### Task 3: Update PillarCard to accept health color

**Files:**
- Modify: `src/components/model/PillarCard.tsx`

The current `PillarCard` uses a static `accentColor` prop for headline color and ring color. We need it to accept a dynamic `healthColor` that overrides the headline color based on the health score band, while keeping `accentColor` for the ring/indicator when expanded.

- [ ] **Step 1: Add `healthColor` prop to PillarCard**

In `src/components/model/PillarCard.tsx`, update the interface and component:

Replace the `PillarCardProps` interface (lines 3-13):

```typescript
interface PillarCardProps {
  id: PillarId;
  label: string;
  value: string;
  sub: string;
  accentColor: string;
  healthColor?: string;
  isExpanded: boolean;
  hasExpandedSibling?: boolean;
  onToggle: () => void;
}
```

Update the destructured props (line 16-23) to include `healthColor`:

```typescript
export function PillarCard({
  label,
  value,
  sub,
  accentColor,
  healthColor,
  isExpanded,
  hasExpandedSibling,
  onToggle,
}: PillarCardProps) {
```

Update the headline value color (line 49) — change `style={{ color: accentColor }}` to:

```typescript
        style={{ color: healthColor ?? accentColor }}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors (`healthColor` is optional, so existing callers don't break)

- [ ] **Step 3: Commit**

```bash
git add src/components/model/PillarCard.tsx
git commit -m "feat: PillarCard accepts healthColor prop for dynamic headline coloring"
```

---

### Task 4: Wire health scores into PillarDashboard

**Files:**
- Modify: `src/components/model/PillarDashboard.tsx`

- [ ] **Step 1: Import health scoring functions**

At the top of `src/components/model/PillarDashboard.tsx`, add after the `fidelityColor` import (line 9):

```typescript
import { calcLagHealth, calcResponseHealth, healthBandColor } from '../../lib/healthScores';
```

- [ ] **Step 2: Compute health scores in the component**

After the `response` useMemo (line 52), add:

```typescript
  const lagHealth = useMemo(
    () => calcLagHealth(lag.totalDelay),
    [lag.totalDelay],
  );

  const responseHealth = useMemo(
    () => calcResponseHealth(response.dampingRatio, response.regime),
    [response.dampingRatio, response.regime],
  );

  const fidelityScore = Math.round(m.fidelityAtTopPct);
  const fidelityHealthColor = healthBandColor(fidelityScore);
```

- [ ] **Step 3: Update the three PillarCard instances**

Replace the Fidelity PillarCard (lines 82-90):

```typescript
        <PillarCard
          id="fidelity"
          label="Signal Fidelity"
          value={`${fidelityScore}`}
          sub={`${m.fidelityAtTopPct.toFixed(1)}% signal preserved across ${levels - 1} relays`}
          accentColor="#E05A1B"
          healthColor={fidelityHealthColor}
          isExpanded={expandedPillar === 'fidelity'}
          hasExpandedSibling={expandedPillar !== null && expandedPillar !== 'fidelity'}
          onToggle={() => togglePillar('fidelity')}
        />
```

Replace the Lag PillarCard (lines 91-99):

```typescript
        <PillarCard
          id="lag"
          label="Propagation Lag"
          value={`${lagHealth.score}`}
          sub={`${lag.totalDelay}d CEO → front line · ${lagHealth.label}`}
          accentColor="#A8967A"
          healthColor={lagHealth.color}
          isExpanded={expandedPillar === 'lag'}
          hasExpandedSibling={expandedPillar !== null && expandedPillar !== 'lag'}
          onToggle={() => togglePillar('lag')}
        />
```

Replace the Response PillarCard (lines 100-110):

```typescript
        <PillarCard
          id="response"
          label="Change Response"
          value={`${responseHealth.score}`}
          sub={`ζ = ${response.dampingRatio.toFixed(2)} · ${response.regimeLabel} · ${responseHealth.label}`}
          accentColor="#16A34A"
          healthColor={responseHealth.color}
          isExpanded={expandedPillar === 'response'}
          hasExpandedSibling={expandedPillar !== null && expandedPillar !== 'response'}
          onToggle={() => togglePillar('response')}
        />
```

- [ ] **Step 4: Verify build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Run full test suite**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/components/model/PillarDashboard.tsx
git commit -m "feat: wire health scores into PillarCard headlines"
```

---

### Task 5: Build the RadarChart component

**Files:**
- Create: `src/components/model/RadarChart.tsx`

- [ ] **Step 1: Create the RadarChart SVG component**

Create `src/components/model/RadarChart.tsx`:

```typescript
import { healthBandColor } from '../../lib/healthScores';

interface RadarChartProps {
  fidelity: number;  // 0-100
  lagHealth: number; // 0-100
  responseHealth: number; // 0-100
}

const SIZE = 220;
const CX = SIZE / 2;
const CY = SIZE / 2 + 6; // slight downward shift so top label has room
const RADIUS = 80;

// Axes: top (Fidelity), bottom-left (Lag), bottom-right (Response)
// Angles: -90° (top), 150° (bottom-left), 30° (bottom-right)
const AXES = [
  { angle: -90, label: 'FIDELITY' },
  { angle: 150, label: 'LAG' },
  { angle: 30, label: 'RESPONSE' },
];

function polarToXY(angleDeg: number, r: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

function gridTriangle(level: number): string {
  const r = (level / 100) * RADIUS;
  return AXES.map(({ angle }) => polarToXY(angle, r).join(',')).join(' ');
}

export function RadarChart({ fidelity, lagHealth, responseHealth }: RadarChartProps) {
  const scores = [fidelity, lagHealth, responseHealth];
  const dataPoints = scores.map((s, i) => polarToXY(AXES[i].angle, (s / 100) * RADIUS));
  const dataPolygon = dataPoints.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <div className="flex justify-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="select-none"
      >
        {/* Concentric grid triangles */}
        {[20, 40, 60, 80, 100].map((level) => (
          <polygon
            key={level}
            points={gridTriangle(level)}
            fill="none"
            stroke="#e7e5e4"
            strokeWidth={level === 100 ? 1.5 : 0.75}
          />
        ))}

        {/* Axis lines */}
        {AXES.map(({ angle, label }) => {
          const [x, y] = polarToXY(angle, RADIUS);
          return (
            <line
              key={label}
              x1={CX}
              y1={CY}
              x2={x}
              y2={y}
              stroke="#d6d3d1"
              strokeWidth={1}
            />
          );
        })}

        {/* Data fill */}
        <polygon
          points={dataPolygon}
          fill="#E05A1B"
          fillOpacity={0.15}
          stroke="#E05A1B"
          strokeWidth={2}
        />

        {/* Data points */}
        {dataPoints.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={5}
            fill={healthBandColor(scores[i])}
            stroke="white"
            strokeWidth={2}
          />
        ))}

        {/* Axis labels with scores */}
        {AXES.map(({ angle, label }, i) => {
          const labelR = RADIUS + 24;
          const [lx, ly] = polarToXY(angle, labelR);
          return (
            <g key={label}>
              <text
                x={lx}
                y={ly - 5}
                textAnchor="middle"
                dominantBaseline="auto"
                className="fill-stone-900 text-[15px] font-bold"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', fontVariantNumeric: 'tabular-nums' }}
              >
                {scores[i]}
              </text>
              <text
                x={lx}
                y={ly + 7}
                textAnchor="middle"
                dominantBaseline="auto"
                className="fill-stone-500 text-[9px] font-semibold"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.1em' }}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/model/RadarChart.tsx
git commit -m "feat: add RadarChart SVG component for 3-pillar health summary"
```

---

### Task 6: Integrate RadarChart into PillarDashboard

**Files:**
- Modify: `src/components/model/PillarDashboard.tsx`

- [ ] **Step 1: Import RadarChart**

Add to the imports in `PillarDashboard.tsx`, after the `ThreeFutures` import:

```typescript
import { RadarChart } from './RadarChart';
```

- [ ] **Step 2: Render RadarChart above the pillar cards**

In the return JSX, right before the `{/* ── Summary cards ── */}` comment and the `<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">` element, add:

```typescript
      {/* ── Radar summary ── */}
      <RadarChart
        fidelity={fidelityScore}
        lagHealth={lagHealth.score}
        responseHealth={responseHealth.score}
      />
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Start dev server and visually verify**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm run dev`

Navigate to `http://localhost:5173/#model`. Verify:
1. Radar chart appears above the 3 pillar cards
2. Three data points with score labels (Fidelity, Lag, Response)
3. Concentric triangle grid visible
4. Data triangle filled with ember at low opacity
5. Moving the Levels slider updates all three scores and the radar shape
6. Pillar cards show 0-100 scores as headlines with correct colors
7. Subtexts show raw values with labels (e.g., "75d CEO → front line · Aging")

- [ ] **Step 5: Run full verification suite**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit && npx eslint . --max-warnings 0 && npx vitest run`
Expected: Type check passes, no lint warnings, all tests pass

- [ ] **Step 6: Commit**

```bash
git add src/components/model/PillarDashboard.tsx
git commit -m "feat: integrate RadarChart into PillarDashboard above pillar cards"
```

---

### Task 7: Clean up calibration explorer

**Files:**
- Delete: `docs/calibration-explorer.html` (brainstorming artifact, not part of the product)

- [ ] **Step 1: Remove the calibration explorer file**

```bash
cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && git rm docs/calibration-explorer.html
```

- [ ] **Step 2: Commit**

```bash
git commit -m "chore: remove calibration explorer (brainstorming artifact)"
```
