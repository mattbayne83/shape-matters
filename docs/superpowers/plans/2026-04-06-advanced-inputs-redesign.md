# Advanced Inputs Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat advanced inputs section in ModelYourOrg with two semantically grouped cards (Structure + Dynamics) featuring unified slider styling, dynamic context hints, and proper design system alignment.

**Architecture:** Extract a reusable `SliderInput` component and a pure `contextHints.ts` module. Rewrite the advanced inputs section of `ModelYourOrg.tsx` to use a 2-column card grid that's always visible on desktop, collapsible on mobile. Move the share link outside the cards.

**Tech Stack:** React 19, TypeScript 5.9, Tailwind CSS 4, Vitest 4, Zustand 5

**Spec:** `docs/superpowers/specs/2026-04-06-advanced-inputs-redesign.md`

---

### Task 1: Create `contextHints.ts` — Pure Hint Logic

**Files:**
- Create: `src/lib/contextHints.ts`
- Test: `src/lib/__tests__/contextHints.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/__tests__/contextHints.test.ts
import { describe, it, expect } from 'vitest';
import {
  orgSizeHint,
  fidelityHint,
  decisionCycleHint,
  culturalAgilityHint,
} from '../contextHints';

describe('orgSizeHint', () => {
  it('returns startup label for tiny orgs', () => {
    expect(orgSizeHint(80, 3.2)).toBe('Startup — everyone knows everyone');
  });

  it('includes span for small orgs', () => {
    expect(orgSizeHint(400, 5.1)).toBe('Small — ~1 manager per 5 people');
  });

  it('includes span for mid-size orgs', () => {
    expect(orgSizeHint(5000, 7.2)).toBe('Mid-size — ~1 manager per 7 people');
  });

  it('includes manager ratio for large orgs', () => {
    expect(orgSizeHint(50000, 4.5, 18.3)).toBe('Large — 18% management overhead');
  });

  it('includes manager ratio for mega-corps', () => {
    expect(orgSizeHint(200000, 3.8, 22.1)).toBe('Mega-corp — 22% management overhead');
  });
});

describe('fidelityHint', () => {
  it('returns low label', () => {
    expect(fidelityHint(60)).toBe('Low — 40% signal lost per hop');
  });

  it('returns below-average label', () => {
    expect(fidelityHint(72)).toBe('Below average — 28% signal lost per hop');
  });

  it('returns typical label', () => {
    expect(fidelityHint(82)).toBe('Typical — 18% signal lost per hop');
  });

  it('returns high label', () => {
    expect(fidelityHint(90)).toBe('High — only 10% lost per hop');
  });

  it('returns exceptional label', () => {
    expect(fidelityHint(95)).toBe('Exceptional — near-lossless relay');
  });
});

describe('decisionCycleHint', () => {
  it('returns startup-fast with total days', () => {
    expect(decisionCycleHint(2, 9)).toBe('Startup-fast — 16d CEO → front line');
  });

  it('returns moderate with total days', () => {
    expect(decisionCycleHint(4, 6)).toBe('Moderate — 20d CEO → front line');
  });

  it('returns bureaucratic with total days', () => {
    expect(decisionCycleHint(7, 8)).toBe('Bureaucratic — 49d CEO → front line');
  });

  it('returns glacial with total days', () => {
    expect(decisionCycleHint(12, 6)).toBe('Glacial — 60d CEO → front line');
  });
});

describe('culturalAgilityHint', () => {
  it('returns rigid with settling weeks', () => {
    expect(culturalAgilityHint(10, 42)).toBe('Rigid — settling time ~42wk');
  });

  it('returns resistant with settling weeks', () => {
    expect(culturalAgilityHint(30, 28)).toBe('Resistant — settling time ~28wk');
  });

  it('returns moderate with settling weeks', () => {
    expect(culturalAgilityHint(55, 14)).toBe('Moderate — settling time ~14wk');
  });

  it('returns adaptive with settling weeks', () => {
    expect(culturalAgilityHint(70, 8)).toBe('Adaptive — settling time ~8wk');
  });

  it('returns highly agile with settling weeks', () => {
    expect(culturalAgilityHint(90, 4)).toBe('Highly agile — settling time ~4wk');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run src/lib/__tests__/contextHints.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement contextHints.ts**

```ts
// src/lib/contextHints.ts

/**
 * Pure functions returning dynamic context hints for each slider.
 * Each hint mixes a factual comparison with a derived data point.
 */

export function orgSizeHint(
  headcount: number,
  avgSpan: number,
  managerRatio?: number,
): string {
  const spanRounded = Math.round(avgSpan);
  if (headcount < 100) return 'Startup — everyone knows everyone';
  if (headcount < 500) return `Small — ~1 manager per ${spanRounded} people`;
  if (headcount < 5_000) return `Mid-size — ~1 manager per ${spanRounded} people`;
  const pct = Math.round(managerRatio ?? 0);
  if (headcount < 50_000) return `Large — ${pct}% management overhead`;
  return `Mega-corp — ${pct}% management overhead`;
}

export function fidelityHint(fidelityRate: number): string {
  const loss = 100 - fidelityRate;
  if (fidelityRate < 65) return `Low — ${loss}% signal lost per hop`;
  if (fidelityRate < 80) return `Below average — ${loss}% signal lost per hop`;
  if (fidelityRate <= 85) return `Typical — ${loss}% signal lost per hop`;
  if (fidelityRate <= 92) return `High — only ${loss}% lost per hop`;
  return 'Exceptional — near-lossless relay';
}

export function decisionCycleHint(decisionCycle: number, levels: number): string {
  const totalDays = Math.round(decisionCycle * (levels - 1));
  let label: string;
  if (decisionCycle <= 2) label = 'Startup-fast';
  else if (decisionCycle <= 5) label = 'Moderate';
  else if (decisionCycle <= 10) label = 'Bureaucratic';
  else label = 'Glacial';
  return `${label} — ${totalDays}d CEO → front line`;
}

export function culturalAgilityHint(
  culturalAgility: number,
  settlingWeeks: number,
): string {
  const weeks = Math.round(settlingWeeks);
  let label: string;
  if (culturalAgility <= 20) label = 'Rigid';
  else if (culturalAgility <= 40) label = 'Resistant';
  else if (culturalAgility <= 60) label = 'Moderate';
  else if (culturalAgility <= 80) label = 'Adaptive';
  else label = 'Highly agile';
  return `${label} — settling time ~${weeks}wk`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run src/lib/__tests__/contextHints.test.ts`
Expected: All 15 tests PASS

- [ ] **Step 5: Commit**

```bash
cd /Users/mattbayne/Documents/SoftwareProjects/org-shape
git add src/lib/contextHints.ts src/lib/__tests__/contextHints.test.ts
git commit -m "feat: add contextHints pure functions for slider context lines"
```

---

### Task 2: Create `SliderInput` — Reusable Slider Component

**Files:**
- Create: `src/components/model/SliderInput.tsx`

- [ ] **Step 1: Create SliderInput component**

```tsx
// src/components/model/SliderInput.tsx

interface SliderInputProps {
  label: string;
  value: number;
  displayValue: string;
  hint: string;
  accent: 'ember' | 'warm-stone';
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  id?: string;
  ariaValueText?: string;
}

const ACCENT_STYLES = {
  ember: { accentColor: '#E05A1B' },
  'warm-stone': { accentColor: '#A8967A' },
} as const;

export function SliderInput({
  label,
  value,
  displayValue,
  hint,
  accent,
  min,
  max,
  step = 1,
  onChange,
  id,
  ariaValueText,
}: SliderInputProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label htmlFor={id} className="text-[11px] font-semibold text-stone-600">
          {label}
        </label>
        <span className="text-[15px] font-bold font-mono tabular-nums text-stone-900">
          {displayValue}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={ariaValueText}
        className="w-full h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ember/30"
        style={ACCENT_STYLES[accent]}
      />
      <div className="text-[10px] italic text-warm-stone mt-1">{hint}</div>
    </div>
  );
}
```

- [ ] **Step 2: Verify dev server compiles without errors**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
cd /Users/mattbayne/Documents/SoftwareProjects/org-shape
git add src/components/model/SliderInput.tsx
git commit -m "feat: add SliderInput component with unified slider pattern"
```

---

### Task 3: Rewrite ModelYourOrg Advanced Section

**Files:**
- Modify: `src/components/model/ModelYourOrg.tsx`

This is the main rewrite. The Levels hero slider and everything below the advanced section (PillarDashboard, What-If, More Metrics) stays unchanged. Only the advanced inputs section and share link change.

- [ ] **Step 1: Read ModelYourOrg.tsx fresh before editing**

Read the full file to ensure context is current.

- [ ] **Step 2: Add new imports**

Add these imports at the top of `ModelYourOrg.tsx`:

```tsx
import { SliderInput } from './SliderInput';
import { orgSizeHint, fidelityHint, decisionCycleHint, culturalAgilityHint } from '../../lib/contextHints';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { calcDampedResponse } from '../../lib/dampedResponse';
```

Note: `calcOrgMetrics` is already imported. `calcDampedResponse` is new. Remove the unused `ChevronDown` and `ChevronUp` imports from lucide-react (they were only used for the advanced toggle, which is now mobile-only — but we'll use a simple inline SVG for mobile). Also remove `AnimatePresence` and `motion` from framer-motion since the collapse animation is removed on desktop. Check whether these are still needed for the "More metrics" section lower in the file — if so, keep them.

- [ ] **Step 3: Add derived metrics for context hints**

Inside the component, after the existing `useMemo` blocks for `tax`, `m`, `geo`, `restructure`, add:

```tsx
const dampedResp = useMemo(
  () => calcDampedResponse(levels, headcount, culturalAgility),
  [levels, headcount, culturalAgility]
);
```

Note: `m` (from `calcOrgMetrics`) is already computed — we'll use `m.avgSpan` and `m.managerRatio` for the org size hint.

- [ ] **Step 4: Replace the advanced inputs section**

Replace everything between the `{/* ── HERO: Levels slider */}` closing `</div>` and the `{/* ── Pillar Dashboard ── */}` comment with the new grouped cards layout. This means removing the old advanced toggle button, the old `AnimatePresence` block, and the old share link.

Replace with:

```tsx
{/* ── Grouped Input Cards (desktop: always visible, mobile: collapsible) ── */}
<button
  onClick={() => setAdvancedInputsOpen(!advancedInputsOpen)}
  className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors cursor-pointer md:hidden"
>
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${advancedInputsOpen ? 'rotate-180' : ''}`}
    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
  Advanced inputs
</button>

<div className={`${advancedInputsOpen ? 'block' : 'hidden'} md:block`}>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
    {/* ═══ STRUCTURE CARD ═══ */}
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
      {/* Group Header */}
      <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-stone-100">
        <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #E05A1B, #F4A261)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
            <path d="M3 21h18" /><rect x="5" y="13" width="4" height="8" rx="0.5" /><rect x="10" y="8" width="4" height="13" rx="0.5" /><rect x="15" y="11" width="4" height="10" rx="0.5" />
          </svg>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-stone-700">Structure</div>
          <div className="text-[10px] text-stone-400">How your org is built</div>
        </div>
      </div>

      {/* Company Preset */}
      <div className="mb-4">
        <label htmlFor="mo-preset" className="text-[11px] font-semibold text-stone-600 block mb-1.5">
          Start from a real company
        </label>
        <select
          id="mo-preset"
          value={preset}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-ember/30 cursor-pointer"
        >
          <option value="custom">Custom</option>
          {REFERENCE_COMPANIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.levels} levels, {c.employees.toLocaleString()} employees
            </option>
          ))}
        </select>
      </div>

      {/* Org Size */}
      <div className="mb-4">
        <SliderInput
          id="mo-headcount"
          label="Organization Size"
          value={hcSlider}
          displayValue={headcount.toLocaleString()}
          hint={orgSizeHint(headcount, m.avgSpan, m.managerRatio)}
          accent="ember"
          min={0}
          max={100}
          onChange={handleHeadcount}
          ariaValueText={`${headcount.toLocaleString()} employees`}
        />
      </div>

      {/* Fidelity */}
      <SliderInput
        id="mo-fidelity"
        label="Per-Layer Fidelity"
        value={fidelityRate}
        displayValue={`${fidelityRate}%`}
        hint={fidelityHint(fidelityRate)}
        accent="ember"
        min={50}
        max={98}
        onChange={setFidelityRate}
        ariaValueText={`${fidelityRate}% per-layer fidelity`}
      />
    </div>

    {/* ═══ DYNAMICS CARD ═══ */}
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
      {/* Group Header */}
      <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-stone-100">
        <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #A8967A, #c4b49a)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
            <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
          </svg>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-stone-700">Dynamics</div>
          <div className="text-[10px] text-stone-400">How your org behaves</div>
        </div>
      </div>

      {/* Decision Cycle */}
      <div className="mb-4">
        <SliderInput
          id="mo-decision-cycle"
          label="Decision Cycle"
          value={decisionCycle}
          displayValue={`${decisionCycle}d`}
          hint={decisionCycleHint(decisionCycle, levels)}
          accent="warm-stone"
          min={1}
          max={14}
          step={0.5}
          onChange={setDecisionCycle}
          ariaValueText={`${decisionCycle} days per layer`}
        />
      </div>

      {/* Cultural Agility */}
      <div className="mb-4">
        <SliderInput
          id="mo-cultural-agility"
          label="Cultural Agility"
          value={culturalAgility}
          displayValue={String(culturalAgility)}
          hint={culturalAgilityHint(culturalAgility, dampedResp.settlingTimeWeeks)}
          accent="warm-stone"
          min={0}
          max={100}
          onChange={setCulturalAgility}
          ariaValueText={`Cultural agility ${culturalAgility} out of 100`}
        />
      </div>

      {/* Pillar connection callout */}
      <div className="p-3 bg-stone-50 rounded-lg border border-dashed border-stone-200 text-center">
        <div className="text-[10px] text-stone-400">
          These inputs feed the <span className="font-semibold text-stone-500">Propagation Lag</span> and <span className="font-semibold text-stone-500">Change Response</span> pillars below
        </div>
      </div>
    </div>
  </div>

  {/* ── Share Link (outside cards) ── */}
  <button
    onClick={handleCopyLink}
    className="flex items-center justify-center gap-1.5 w-full text-xs text-stone-500 hover:text-stone-700 border border-stone-200 hover:border-stone-300 rounded-lg py-2 bg-white transition-colors cursor-pointer mt-3"
  >
    <Link className="w-3.5 h-3.5" />
    {copied ? 'Copied!' : 'Copy shareable link'}
  </button>
</div>
```

- [ ] **Step 5: Clean up removed code and imports**

Remove the `advancedRef` useRef and the auto-scroll `useEffect` that references it (lines 45-58 in original). These were only needed for the collapsible animation which is removed on desktop.

Check if `motion` and `AnimatePresence` are still used in the "More metrics" section lower in the file. If they are, keep the import. If the advanced inputs collapse was the only usage, remove the framer-motion import.

Remove `ChevronDown` and `ChevronUp` from the lucide-react import if they are no longer used anywhere in the file.

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 7: Verify dev server renders correctly**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm run dev`
Open the dev server URL, navigate to #model section. Verify:
- Two cards visible side by side on desktop
- Sliders use ember accent (Structure) and warm-stone accent (Dynamics)
- Context hints update dynamically when dragging sliders
- Company preset dropdown works
- Share link button visible below cards
- On narrow viewport (<768px), cards stack and toggle button appears

- [ ] **Step 8: Commit**

```bash
cd /Users/mattbayne/Documents/SoftwareProjects/org-shape
git add src/components/model/ModelYourOrg.tsx
git commit -m "feat: rewrite advanced inputs as grouped Structure/Dynamics cards"
```

---

### Task 4: Verification & Cleanup

**Files:**
- All files from Tasks 1-3

- [ ] **Step 1: Run full test suite**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run`
Expected: All 164 existing tests + 15 new contextHints tests PASS (179 total)

- [ ] **Step 2: Run linter**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx eslint . --max-warnings 0`
Expected: No errors or warnings. If there are issues, fix them.

- [ ] **Step 3: Run production build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm run build`
Expected: Build succeeds with no TypeScript errors

- [ ] **Step 4: Final commit if any lint/build fixes were needed**

```bash
cd /Users/mattbayne/Documents/SoftwareProjects/org-shape
git add -A
git commit -m "fix: lint and build fixes for advanced inputs redesign"
```

Only create this commit if Step 2 or 3 required changes. Skip if clean.
