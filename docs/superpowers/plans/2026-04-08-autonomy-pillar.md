# Autonomy Pillar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the redundant Agility/Response pillar with a genuinely independent Autonomy pillar driven by Decision-Centrality Index (DCI).

**Architecture:** New `dci` input (0–100) added to store, URL params, and InputStrip. New `calcAutonomyScore(dci, levels)` pure function computes `min(DCI × log(L)/log(3), 100)`. PillarDashboard swaps Response→Autonomy with new `AuthoritySpectrum` expanded view. TorqueProfile component deleted.

**Tech Stack:** React 19, TypeScript 5.9, Zustand 5, Tailwind CSS 4, Vitest 4

**Spec:** `docs/superpowers/specs/2026-04-08-autonomy-pillar-design.md`

**DO NOT commit changes. The user will ask for commits explicitly.**

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/lib/autonomy.ts` | `calcAutonomyScore()` pure function |
| Create | `src/lib/__tests__/autonomy.test.ts` | Unit tests for autonomy score |
| Create | `src/components/model/AuthoritySpectrum.tsx` | Expanded view for Autonomy pillar |
| Modify | `src/types/index.ts` | Add `dci` to `Company`, add `AutonomyResult` type |
| Modify | `src/data/referenceCompanies.ts` | Add `dci` values to 6 companies |
| Modify | `src/store/useCompanyStore.ts` | Add `dci` field, setter, URL param, persistence |
| Modify | `src/components/model/InputStrip.tsx` | Add Authority slider group |
| Modify | `src/components/model/PillarCard.tsx` | Update `PillarId` type |
| Modify | `src/components/model/PillarDashboard.tsx` | Swap Response→Autonomy, wire AuthoritySpectrum |
| Modify | `src/components/model/RadarChart.tsx` | Rename column label + prop |
| Modify | `src/components/model/ModelYourOrg.tsx` | Add "Empower frontline" What-If card |
| Modify | `src/data/methodologyMetrics.tsx` | Add Autonomy Score metric definition |
| Modify | `src/components/model/MethodologyCard.tsx` | Add `autonomy` badge style |
| Modify | `src/components/model/MethodologySection.tsx` | Add Autonomy section |
| Delete | `src/components/model/TorqueProfile.tsx` | No longer used |

---

### Task 1: Types + Pure Calculation

**Files:**
- Modify: `src/types/index.ts`
- Create: `src/lib/autonomy.ts`
- Create: `src/lib/__tests__/autonomy.test.ts`

- [ ] **Step 1: Add types to `src/types/index.ts`**

Add `dci` to the `Company` interface and add a new `AutonomyResult` type. Insert after the `Company` interface (after line 38):

```typescript
// In Company interface, add after decisionCycle line (line 36):
  dci?: number;                 // Decision-Centrality Index (0-100, optional for backward compat)
```

Add at the end of the file, after the `HealthScore` interface:

```typescript
// ── Autonomy (Pillar 3) ───────────────────────────────────────────
export interface AutonomyResult {
  score: number;                // 0-100 health score
  depthMultiplier: number;      // log(L) / log(3)
  crossoverFloor: number;       // minimum DCI to score above 50
  label: string;                // health band label
  color: string;                // health band color
}
```

- [ ] **Step 2: Write failing tests for `calcAutonomyScore`**

Create `src/lib/__tests__/autonomy.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calcAutonomyScore } from '../autonomy';

describe('calcAutonomyScore', () => {
  it('returns score = DCI directly at L=3 (depth multiplier 1.0)', () => {
    const result = calcAutonomyScore(60, 3);
    expect(result.score).toBe(60);
    expect(result.depthMultiplier).toBeCloseTo(1.0, 2);
  });

  it('amplifies DCI at L=9 (depth multiplier 2.0)', () => {
    const result = calcAutonomyScore(40, 9);
    expect(result.score).toBe(80);
    expect(result.depthMultiplier).toBeCloseTo(2.0, 2);
  });

  it('caps score at 100', () => {
    const result = calcAutonomyScore(90, 9);
    expect(result.score).toBe(100);
  });

  it('validates Finding 15: Amazon (L=9, DCI=40) beats Meta (L=6, DCI=28)', () => {
    const amazon = calcAutonomyScore(40, 9);
    const meta = calcAutonomyScore(28, 6);
    expect(amazon.score).toBeGreaterThan(meta.score);
  });

  it('returns correct crossover floor', () => {
    // At L=9, depth multiplier = 2.0, floor = 50/2.0 = 25
    const result = calcAutonomyScore(40, 9);
    expect(result.crossoverFloor).toBeCloseTo(25, 0);
  });

  it('handles L=1 edge case (single layer, no depth amplification)', () => {
    const result = calcAutonomyScore(50, 1);
    expect(result.score).toBe(0);
    expect(result.depthMultiplier).toBe(0);
  });

  it('handles DCI=0 (fully CEO-centric)', () => {
    const result = calcAutonomyScore(0, 6);
    expect(result.score).toBe(0);
  });

  it('handles DCI=100 (fully IC-empowered)', () => {
    const result = calcAutonomyScore(100, 3);
    expect(result.score).toBe(100);
  });

  it('returns correct health label and color', () => {
    const high = calcAutonomyScore(88, 3);
    expect(high.label).toBe('Live');

    const low = calcAutonomyScore(10, 3);
    expect(low.label).toBe('Expired');
  });

  it('produces correct reference company ranking', () => {
    const haier = calcAutonomyScore(88, 3);     // 88 × 1.0 = 88
    const nucor = calcAutonomyScore(82, 4);     // 82 × 1.26 = 100 (capped)
    const google = calcAutonomyScore(58, 8);    // 58 × 1.89 = 100 (capped)
    const amazon = calcAutonomyScore(40, 9);    // 40 × 2.0 = 80
    const meta = calcAutonomyScore(28, 6);      // 28 × 1.63 = 46
    const oneok = calcAutonomyScore(22, 6);     // 22 × 1.63 = 36

    expect(meta.score).toBeGreaterThan(oneok.score);
    expect(amazon.score).toBeGreaterThan(meta.score);
    expect(haier.score).toBeGreaterThan(amazon.score);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run src/lib/__tests__/autonomy.test.ts`
Expected: FAIL — module `../autonomy` not found.

- [ ] **Step 4: Implement `calcAutonomyScore`**

Create `src/lib/autonomy.ts`:

```typescript
import type { AutonomyResult } from '../types';
import { healthBandColor } from './healthScores';

const AUTONOMY_LABELS: [number, string][] = [
  [85, 'Live'],
  [65, 'Fresh'],
  [40, 'Aging'],
  [20, 'Stale'],
  [0, 'Expired'],
];

function lookupLabel(score: number): string {
  for (const [threshold, label] of AUTONOMY_LABELS) {
    if (score >= threshold) return label;
  }
  return AUTONOMY_LABELS[AUTONOMY_LABELS.length - 1][1];
}

/**
 * Autonomy score: min(DCI × log(L)/log(3), 100)
 * Depth amplifies each DCI point — deep orgs need distributed authority more.
 */
export function calcAutonomyScore(dci: number, levels: number): AutonomyResult {
  const depthMultiplier = levels <= 1 ? 0 : Math.log(levels) / Math.log(3);
  const raw = dci * depthMultiplier;
  const score = Math.round(Math.min(raw, 100));
  const crossoverFloor = depthMultiplier > 0 ? 50 / depthMultiplier : 100;

  return {
    score,
    depthMultiplier,
    crossoverFloor,
    label: lookupLabel(score),
    color: healthBandColor(score),
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run src/lib/__tests__/autonomy.test.ts`
Expected: All tests PASS.

- [ ] **Step 6: Run full test suite to verify nothing broke**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run`
Expected: All 178+ tests pass.

---

### Task 2: Reference Company Data + Store

**Files:**
- Modify: `src/data/referenceCompanies.ts`
- Modify: `src/store/useCompanyStore.ts`

- [ ] **Step 1: Add `dci` to reference companies in `src/data/referenceCompanies.ts`**

Add `dci` field to each company object. Insert after each company's `decisionCycle` line:

```
Valve:    dci: 95,   // No managers — full self-direction
Nucor:    dci: 82,   // Steel teams have full P&L authority
Google:   dci: 58,   // 20% time, IC-driven OKRs, but strong hierarchy
Meta:     dci: 28,   // Centralized product decisions, IC execution
Haier:    dci: 88,   // Microenterprise model — ICs run as independent units
Amazon:   dci: 40,   // Two-pizza teams offset by strong top-down mandate culture
```

- [ ] **Step 2: Add `dci` to Zustand store in `src/store/useCompanyStore.ts`**

In `CompanyState` interface (line 4-12), add after `decisionCycle`:

```typescript
  dci: number;                  // Decision-Centrality Index (0-100, default 50)
```

In `CompanyActions` interface (line 14-22), add after `setDecisionCycle`:

```typescript
  setDci: (dci: number) => void;
```

In the `expandedPillar` type on line 10, change:

```typescript
// Old:
  expandedPillar: 'fidelity' | 'lag' | 'response' | null;
// New:
  expandedPillar: 'fidelity' | 'lag' | 'autonomy' | null;
```

Also update the same type in `setExpandedPillar` on line 20:

```typescript
// Old:
  setExpandedPillar: (p: 'fidelity' | 'lag' | 'response' | null) => void;
// New:
  setExpandedPillar: (p: 'fidelity' | 'lag' | 'autonomy' | null) => void;
```

In the store creator (line 53-86), add `dci: 50` to initial state (after `decisionCycle: 3,`), and add `setDci: (dci) => set({ dci }),` to actions (after `setDecisionCycle`).

In `partialize` (line 77-83), add `dci: state.dci,` after `decisionCycle`.

- [ ] **Step 3: Add `ci` URL param support**

In `applyUrlParams()` function, add after the `d` param block (after line 49):

```typescript
  const ci = params.get('ci');
```

Update the early return check on line 31:

```typescript
  if (!l && !h && !f && !d && !ci) return false;
```

Add the DCI handler after the `d` handler:

```typescript
  if (ci) {
    const dci = Math.max(0, Math.min(100, Math.round(Number(ci))));
    if (!isNaN(dci)) state.setDci(dci);
  }
```

In `buildShareUrl()`, add `dci` to the destructuring and the URL string:

```typescript
  const { levels, headcount, fidelityRate, decisionCycle, dci } =
    useCompanyStore.getState();
  url.search = `?l=${levels}&h=${headcount}&f=${fidelityRate}&d=${decisionCycle}&ci=${dci}`;
```

- [ ] **Step 4: Run type check**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: Type errors in PillarDashboard.tsx and PillarCard.tsx (they reference `'response'` — expected, will fix in Task 4).

---

### Task 3: InputStrip — Add Authority Slider

**Files:**
- Modify: `src/components/model/InputStrip.tsx`

- [ ] **Step 1: Add DCI state reads from store**

In `InputStrip()`, after line 119 (`const setDecisionCycle = ...`), add:

```typescript
  const dci = useCompanyStore((s) => s.dci);
  const setDci = useCompanyStore((s) => s.setDci);
```

- [ ] **Step 2: Add `dci` to the hint function**

After the `cycleHint` function (line 103-109), add:

```typescript
function dciHint(dci: number): string {
  if (dci >= 80) return 'Self-directed';
  if (dci >= 60) return 'Empowered';
  if (dci >= 40) return 'Guided';
  if (dci >= 20) return 'Managed';
  return 'Centralized';
}
```

- [ ] **Step 3: Update preset handler to include DCI**

In `handlePresetChange` (line 135-144), after `storeHeadcount(sliderToHeadcount(pos));` add:

```typescript
    if (company.decisionCycle != null) setDecisionCycle(company.decisionCycle);
    if (company.dci != null) setDci(company.dci);
```

Note: check if `decisionCycle` is already set in the preset handler. If not, add both. If `decisionCycle` is already set, just add the `dci` line.

- [ ] **Step 4: Add the Authority slider to Row 1**

Change the grid from `grid-cols-[1fr_1fr_1fr_auto_1fr]` (line 158) to add a second divider and DCI slider:

```typescript
<div className="grid grid-cols-[1fr_1fr_1fr_auto_1fr_auto_1fr] items-end gap-x-4 p-3 px-4">
```

After the Cycle Time `CompactSlider` (line 168), add:

```tsx
        {/* ── Divider ── */}
        <div className="self-stretch flex items-center py-1">
          <div className="w-px h-full bg-stone-200" />
        </div>

        <CompactSlider
          id="is-dci"
          label="Authority · IC %"
          value={dci}
          displayValue={`${dci}%`}
          min={0}
          max={100}
          accent="warm-stone"
          onChange={(v) => { setPreset('custom'); setDci(v); }}
          hint={dciHint(dci)}
          ticks={[
            { value: 20, label: 'CEO-led' },
            { value: 50, label: 'Balanced' },
            { value: 80, label: 'IC-led' },
          ]}
        />
```

- [ ] **Step 5: Verify dev server renders correctly**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm run dev`
Expected: Dev server starts. InputStrip shows 5 sliders in 3 groups. DCI slider appears after Cycle Time with warm-stone accent.

---

### Task 4: PillarCard + PillarDashboard — Swap Response → Autonomy

**Files:**
- Modify: `src/components/model/PillarCard.tsx`
- Modify: `src/components/model/PillarDashboard.tsx`
- Create: `src/components/model/AuthoritySpectrum.tsx`
- Delete: `src/components/model/TorqueProfile.tsx`

- [ ] **Step 1: Update `PillarId` type in `src/components/model/PillarCard.tsx`**

Change line 3:

```typescript
// Old:
export type PillarId = 'fidelity' | 'lag' | 'response';
// New:
export type PillarId = 'fidelity' | 'lag' | 'autonomy';
```

- [ ] **Step 2: Create `AuthoritySpectrum` expanded view component**

Create `src/components/model/AuthoritySpectrum.tsx`:

```tsx
import { useMemo } from 'react';
import { REFERENCE_COMPANIES } from '../../data/referenceCompanies';
import { calcAutonomyScore } from '../../lib/autonomy';
import { healthBandColor } from '../../lib/healthScores';

interface AuthoritySpectrumProps {
  dci: number;
  levels: number;
}

export function AuthoritySpectrum({ dci, levels }: AuthoritySpectrumProps) {
  const autonomy = useMemo(() => calcAutonomyScore(dci, levels), [dci, levels]);

  const companyDots = useMemo(
    () =>
      REFERENCE_COMPANIES.filter((c) => c.dci != null).map((c) => ({
        id: c.id,
        name: c.name,
        dci: c.dci!,
        color: c.color,
      })),
    []
  );

  const crossoverDci = autonomy.crossoverFloor;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* ── Left: Authority Spectrum Bar ── */}
      <div className="flex flex-col justify-center px-2 lg:pr-6">
        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-4 text-center">
          Authority Spectrum
        </div>

        {/* Bar container */}
        <div className="relative mx-2">
          {/* Track */}
          <div className="h-3 rounded-full bg-gradient-to-r from-stone-200 via-stone-300 to-stone-400 relative">
            {/* Crossover threshold line */}
            {crossoverDci <= 100 && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-stone-600 z-10"
                style={{ left: `${crossoverDci}%` }}
                title={`Crossover: DCI ≥ ${Math.round(crossoverDci)}`}
              />
            )}

            {/* User position indicator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md z-20 transition-all duration-300"
              style={{
                left: `${dci}%`,
                transform: `translate(-50%, -50%)`,
                backgroundColor: healthBandColor(autonomy.score),
              }}
            />
          </div>

          {/* Company dots */}
          <div className="relative h-8 mt-1">
            {companyDots.map((c) => (
              <div
                key={c.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${c.dci}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div
                  className="w-2 h-2 rounded-full border border-white/80 shadow-sm"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-[8px] text-stone-400 whitespace-nowrap mt-0.5">
                  {c.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>

          {/* Axis labels */}
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-stone-400">CEO-centric (0)</span>
            <span className="text-[9px] text-stone-400">IC-empowered (100)</span>
          </div>
        </div>

        {/* Crossover annotation */}
        {crossoverDci <= 100 && (
          <p className="text-[10px] text-stone-400 text-center mt-3">
            At your depth, DCI above{' '}
            <span className="font-bold text-stone-600">{Math.round(crossoverDci)}</span>{' '}
            beats structurally flatter competitors
          </p>
        )}
      </div>

      {/* ── Right: Depth Leverage Annotation ── */}
      <div className="flex flex-col justify-center px-2 lg:pl-6 lg:border-l lg:border-stone-100">
        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-4 text-center">
          Depth Leverage
        </div>

        <div className="space-y-3">
          <div className="bg-stone-50 rounded-lg p-3 text-center">
            <div className="text-[10px] text-stone-500 uppercase font-semibold tracking-wide mb-1">
              Your depth amplifier
            </div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-stone-900">
              ×{autonomy.depthMultiplier.toFixed(2)}
            </div>
          </div>

          <p className="text-[11px] text-stone-500 text-center leading-relaxed">
            Each +10 DCI points ={' '}
            <span className="font-bold text-stone-700">
              +{Math.round(10 * autonomy.depthMultiplier)} autonomy health
            </span>
          </p>

          <p className="text-[11px] text-stone-500 text-center leading-relaxed">
            At {levels} levels, authority distribution matters{' '}
            <span className="font-bold text-stone-700">
              {autonomy.depthMultiplier.toFixed(1)}×
            </span>{' '}
            more than at 3 levels
          </p>

          {autonomy.score < 50 && (
            <div className="bg-orange-50 border border-orange-200/50 rounded-lg p-3">
              <p className="text-[11px] text-stone-600 text-center leading-relaxed">
                Consider distributing decision authority to ICs closest to the work
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Rewire PillarDashboard — swap Response → Autonomy**

In `src/components/model/PillarDashboard.tsx`:

Replace the imports (lines 1-17). Remove `TorqueProfile` import, add `AuthoritySpectrum` and `calcAutonomyScore`:

```typescript
// Remove this line:
import { TorqueProfile } from './TorqueProfile';
// Add these lines:
import { AuthoritySpectrum } from './AuthoritySpectrum';
import { calcAutonomyScore } from '../../lib/autonomy';
```

Add `dci` store read after `decisionCycle` (line 24):

```typescript
  const dci = useCompanyStore((s) => s.dci);
```

Replace the agility score calculation (lines 35-36):

```typescript
// Old:
  const agilityScore = Math.round(geo.agilityScore * 100);
  const agilityHealthColor = healthBandColor(agilityScore);
// New:
  const autonomy = useMemo(() => calcAutonomyScore(dci, levels), [dci, levels]);
  const autonomyHealthColor = healthBandColor(autonomy.score);
```

Update `PILLAR_ACCENTS` (lines 40-44):

```typescript
  const PILLAR_ACCENTS: Record<PillarId, string> = {
    fidelity: '#E05A1B',
    lag: '#E05A1B',
    autonomy: '#A8967A',  // warm-stone for Autonomy
  };
```

Update RadarChart props (line 74-78):

```tsx
              <RadarChart
                fidelity={fidelityScore}
                lagHealth={lagHealth.score}
                autonomyHealth={autonomy.score}
              />
```

Replace the `expandedPillar === 'response'` block (lines 126-143) with:

```tsx
          {expandedPillar === 'autonomy' && (
            <motion.div
              key="autonomy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE}
              className="p-4 h-full flex flex-col overflow-hidden"
            >
              <AuthoritySpectrum dci={dci} levels={levels} />
            </motion.div>
          )}
```

Replace the third PillarCard (lines 174-185):

```tsx
        <PillarCard
          id="autonomy"
          label="Autonomy"
          value={`${autonomy.score}`}
          score={autonomy.score}
          sub={`DCI ${dci}% · ${autonomy.label}`}
          accentColor="#A8967A"
          healthColor={autonomyHealthColor}
          isExpanded={expandedPillar === 'autonomy'}
          hasExpandedSibling={expandedPillar !== null && expandedPillar !== 'autonomy'}
          onToggle={() => togglePillar('autonomy')}
        />
```

- [ ] **Step 4: Delete `src/components/model/TorqueProfile.tsx`**

Run: `rm src/components/model/TorqueProfile.tsx`

- [ ] **Step 5: Run type check to verify all type errors resolved**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No type errors.

---

### Task 5: RadarChart — Update Column Labels

**Files:**
- Modify: `src/components/model/RadarChart.tsx`

- [ ] **Step 1: Update props and pillar config**

In `src/components/model/RadarChart.tsx`, change the interface (lines 3-7):

```typescript
// Old:
interface RadarChartProps {
  fidelity: number;
  lagHealth: number;
  responseHealth: number;
}
// New:
interface RadarChartProps {
  fidelity: number;
  lagHealth: number;
  autonomyHealth: number;
}
```

Update `PILLARS` (lines 9-13):

```typescript
// Old:
const PILLARS = [
  { key: 'fidelity', label: 'Fidelity' },
  { key: 'lag', label: 'Latency' },
  { key: 'response', label: 'Agility' },
] as const;
// New:
const PILLARS = [
  { key: 'fidelity', label: 'Fidelity' },
  { key: 'lag', label: 'Latency' },
  { key: 'autonomy', label: 'Autonomy' },
] as const;
```

Update the function signature and scores array (lines 31-32):

```typescript
// Old:
export function RadarChart({ fidelity, lagHealth, responseHealth }: RadarChartProps) {
  const scores = [fidelity, lagHealth, responseHealth];
// New:
export function RadarChart({ fidelity, lagHealth, autonomyHealth }: RadarChartProps) {
  const scores = [fidelity, lagHealth, autonomyHealth];
```

- [ ] **Step 2: Run type check**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No type errors.

---

### Task 6: ModelYourOrg — What-If Scenario + Methodology

**Files:**
- Modify: `src/components/model/ModelYourOrg.tsx`
- Modify: `src/data/methodologyMetrics.tsx`

- [ ] **Step 1: Add "Empower frontline" What-If card to `ModelYourOrg.tsx`**

In `src/components/model/ModelYourOrg.tsx`, add store reads after line 15 (`const fidelityRate = ...`):

```typescript
  const dci = useCompanyStore((s) => s.dci);
```

Add autonomy import and calculation:

```typescript
import { calcAutonomyScore } from '../../lib/autonomy';
```

Inside the component, add the autonomy What-If calculation:

```typescript
  const autonomyNow = useMemo(() => calcAutonomyScore(dci, levels), [dci, levels]);
  const autonomyEmpowered = useMemo(() => calcAutonomyScore(Math.min(dci + 15, 100), levels), [dci, levels]);
  const autonomyDelta = autonomyEmpowered.score - autonomyNow.score;
```

In the What-If grid (`grid-cols-2 md:grid-cols-4`, line 47), change to `md:grid-cols-5` and add a fifth card after the Fidelity card:

```tsx
              <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-lg px-3 py-2.5 text-center">
                <div className="text-[10px] text-stone-500 uppercase font-semibold tracking-wide mb-1">Autonomy</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900 drop-shadow-sm">
                  +{autonomyDelta}
                </div>
                <div className="text-[10px] text-stone-400 font-medium">Points · if DCI +15</div>
              </div>
```

Also update the What-If description text (line 43-44) to mention the combined scenario:

```tsx
              <span className="text-[11px] text-stone-600 font-medium">
                You reduced depth by one ({restructure.currentLevels} → {restructure.proposedLevels}) and empowered ICs (DCI +15)
              </span>
```

- [ ] **Step 2: Add Autonomy Score to methodology metrics**

In `src/data/methodologyMetrics.tsx`, update the `MetricDefinition` category type (line 9):

```typescript
// Old:
  category: 'fidelity' | 'latency' | 'agility' | 'supplementary';
// New:
  category: 'fidelity' | 'latency' | 'agility' | 'autonomy' | 'supplementary';
```

Add the Autonomy metric entry after the Agility section (after line 77, before the Supplementary comment):

```typescript
  // ── Autonomy Pillar ──
  {
    id: 'methodology-autonomy-score',
    title: 'Autonomy Score',
    formula: <>min(DCI × log(L) / log(3), 100)</>,
    description:
      'Measures how effectively decision authority is distributed, weighted by organizational depth. Deep orgs with centralized decisions face compounding delays; the depth multiplier captures this exponential cost. Based on Decision-Centrality Index research showing rank inversions at DCI≥35 for deep organizations.',
    constants: 'DCI = Decision-Centrality Index (0-100), L = depth',
    category: 'autonomy',
  },
```

- [ ] **Step 3: Add `autonomy` to MethodologyCard badge styles**

In `src/components/model/MethodologyCard.tsx`, add the `autonomy` entry to `BADGE_STYLES` (line 3-8). After the `agility` entry:

```typescript
  autonomy: { stripe: 'bg-warm-stone', badge: 'bg-warm-stone/10 text-warm-stone', label: 'Autonomy' },
```

- [ ] **Step 4: Add Autonomy section to MethodologySection**

In `src/components/model/MethodologySection.tsx`, add the autonomy filter after line 7:

```typescript
const autonomy = METHODOLOGY_METRICS.filter((m) => m.category === 'autonomy');
```

Add the Autonomy section block after the Agility section (after line 52, before the Supplementary comment):

```tsx
      {/* ── Autonomy Pillar ── */}
      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-10 mb-3">
        Autonomy
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {autonomy.map((m) => (
          <MethodologyCard key={m.id} {...m} />
        ))}
      </div>
```

- [ ] **Step 4: Run full verification**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit && npx vitest run && npx eslint . --max-warnings 0`
Expected: Type check passes. All tests pass (178 existing + new autonomy tests). No lint errors.

---

### Task 7: Final Verification + Dev Server

**Files:** None (verification only)

- [ ] **Step 1: Run full test suite**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run`
Expected: All tests pass (existing + new autonomy tests).

- [ ] **Step 2: Run type check**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Run linter**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx eslint . --max-warnings 0`
Expected: No errors. If there are auto-fixable issues, run `npx eslint . --fix` first.

- [ ] **Step 4: Start dev server and verify**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm run dev`
Expected: Dev server starts. Navigate to `#model` section and verify:
- InputStrip shows 5 sliders in 3 groups (Structure | Dynamics | Authority)
- DCI slider shows warm-stone accent, ticks at 20/50/80, hint text
- Company presets load DCI values (click Haier → DCI 88%, click Amazon → DCI 40%)
- Three pillar cards show: Fidelity, Latency, Autonomy
- Autonomy card shows DCI-based health score with depth multiplier
- Expanding Autonomy shows AuthoritySpectrum (bar + depth leverage)
- RadarChart shows Fidelity | Latency | Autonomy columns
- What-If panel shows 5 cards including Autonomy delta
- Share URL includes `&ci=` parameter
- TorqueProfile is gone — no "Agility" anywhere in the UI
