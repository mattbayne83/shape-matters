# Proof Section Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace data-heavy company cards with pillar-score-first cards featuring mini EQ columns, matching the Model section's visual language.

**Architecture:** New `MiniEQ` component renders a 5-segment VU meter column. Rewritten `CompanyCard` computes all 3 pillar scores and renders the new card layout: header → pillar strip (score + MiniEQ per pillar) → round-trip punchline → narrative → source.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4. Uses existing libs: `calcOrgMetrics`, `calcThermalLag`, `calcLagHealth`, `calcAutonomyScore`, `healthBandColor`, `fidelityColor`.

**Spec:** `docs/superpowers/specs/2026-04-09-proof-section-redesign.md`

---

### Task 1: Create MiniEQ Component

**Files:**
- Create: `src/components/model/MiniEQ.tsx`

- [ ] **Step 1: Create MiniEQ component**

```tsx
import { healthBandColor } from '../../lib/healthScores';

// VU meter color ramp — bottom (low) to top (high), 5 segments
const SEG_COLORS = [
  '#44403c', // 0-20   stone-700
  '#57534e', // 20-40  stone-600
  '#A8967A', // 40-60  warm-stone
  '#F4A261', // 60-80  ember-light
  '#E05A1B', // 80-100 ember
];

interface MiniEQProps {
  score: number;
  segments?: number;
}

export function MiniEQ({ score, segments = 5 }: MiniEQProps) {
  const filledCount = Math.round(Math.min(Math.max(score, 0), 100) / (100 / segments));

  return (
    <div className="flex flex-col-reverse gap-[1.5px]" style={{ height: 32, width: 10 }}>
      {Array.from({ length: segments }, (_, i) => {
        const isFilled = i < filledCount;
        const isTop = i === filledCount - 1 && filledCount > 0;
        const color = SEG_COLORS[Math.min(i, SEG_COLORS.length - 1)];

        return (
          <div
            key={i}
            className="w-full flex-1 rounded-[1.5px]"
            style={{
              backgroundColor: isFilled ? color : '#e7e5e4',
              opacity: isFilled ? 1 : 0.4,
              boxShadow: isTop ? `0 0 6px ${color}88` : 'none',
              transition: 'background-color 300ms ease-out, opacity 300ms ease-out',
            }}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify build compiles**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm run build 2>&1 | tail -5`

Expected: Build succeeds (MiniEQ is created but not yet imported anywhere — tree-shaking is fine).

### Task 2: Rewrite CompanyCard

**Files:**
- Modify: `src/components/model/CompanyCard.tsx` (full rewrite)

- [ ] **Step 1: Rewrite CompanyCard with pillar scores and MiniEQ**

Replace the entire contents of `src/components/model/CompanyCard.tsx` with:

```tsx
import { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import type { Company } from '../../types';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { calcThermalLag } from '../../lib/thermalLag';
import { calcLagHealth, healthBandColor } from '../../lib/healthScores';
import { calcAutonomyScore } from '../../lib/autonomy';
import { fidelityColor } from '../../lib/fidelityColor';
import { MiniEQ } from './MiniEQ';

interface CompanyCardProps {
  company: Company;
  fidelityRate: number;
}

export function CompanyCard({ company, fidelityRate }: CompanyCardProps) {
  const m = useMemo(
    () => calcOrgMetrics(company.levels, company.employees, fidelityRate),
    [company.levels, company.employees, fidelityRate],
  );

  const fidelityScore = Math.round(m.fidelityAtTopPct);

  const lagScore = useMemo(() => {
    const delay = calcThermalLag(company.levels, company.decisionCycle ?? 3).totalDelay;
    return calcLagHealth(delay).score;
  }, [company.levels, company.decisionCycle]);

  const autonomyScore = useMemo(
    () => calcAutonomyScore(company.dci ?? 50, company.levels).score,
    [company.dci, company.levels],
  );

  const pillars = [
    { label: 'Fidelity', score: fidelityScore },
    { label: 'Latency', score: lagScore },
    { label: 'Autonomy', score: autonomyScore },
  ];

  const formatEmployees = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`
    : String(n);

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 hover:shadow-lg hover:shadow-stone-200/50 hover:-translate-y-1 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="text-sm font-bold text-stone-900">{company.name}</div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            {company.levels} {company.levels === 1 ? 'level' : 'levels'} · {formatEmployees(company.employees)} employees · {company.industry}
          </div>
        </div>
        <span className="text-[10px] text-stone-400 shrink-0">{company.era}</span>
      </div>

      {/* Pillar strip */}
      <div className="flex gap-1.5 my-3">
        {pillars.map((p) => (
          <div
            key={p.label}
            className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-1.5 py-2"
          >
            <div className="text-[8px] font-bold uppercase tracking-wide text-stone-400 text-center mb-1.5">
              {p.label}
            </div>
            <div className="flex items-center justify-center gap-2">
              <span
                className="text-xl font-extrabold font-mono tabular-nums leading-none"
                style={{ color: healthBandColor(p.score) }}
              >
                {p.score}
              </span>
              <MiniEQ score={p.score} />
            </div>
          </div>
        ))}
      </div>

      {/* Punchline stat */}
      <div className="flex items-baseline justify-between px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg mb-3">
        <span className="text-[10px] text-stone-500">Round-trip fidelity</span>
        <span
          className="text-sm font-bold font-mono tabular-nums"
          style={{ color: fidelityColor(m.roundTripFidelity) }}
        >
          {m.roundTripFidelity.toFixed(1)}%
        </span>
      </div>

      {/* Narrative */}
      {company.narrative && (
        <p className="text-[11px] text-stone-600 leading-relaxed mb-2">
          {company.narrative}
        </p>
      )}

      {/* Source */}
      {company.source && (
        <div className="pt-2 border-t border-stone-100">
          {company.sourceUrl ? (
            <a
              href={company.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-0.5"
            >
              {company.source}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ) : (
            <span className="text-[10px] text-stone-400">{company.source}</span>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build compiles**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm run build 2>&1 | tail -5`

Expected: Build succeeds. No TypeScript errors.

- [ ] **Step 3: Visual check in browser**

Open `http://localhost:5173/shape-matters/#proof` and verify:
- 6 company cards in 3-column grid (desktop)
- Each card shows 3 pillar scores with mini EQ columns
- Valve shows high scores (near 100) with full EQ bars
- Amazon shows low fidelity/lag scores with mostly empty EQ bars
- Round-trip fidelity displays correctly with color
- Narrative text and source links render
- Hover lifts card with shadow

- [ ] **Step 4: Check mobile responsiveness**

Resize browser to ~375px width and verify:
- Cards stack single-column
- Pillar strip cells don't overflow or clip
- Score text and EQ bars are legible

### Task 3: Run Quality Gates

**Files:** None (verification only)

- [ ] **Step 1: Run linter**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx eslint src/components/model/MiniEQ.tsx src/components/model/CompanyCard.tsx --max-warnings 0`

Expected: No errors, no warnings.

- [ ] **Step 2: Run full test suite**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm test 2>&1 | tail -10`

Expected: All 200 tests pass. (No new tests needed — MiniEQ is a pure presentational component with no logic beyond `Math.round`, and CompanyCard's computation uses already-tested library functions.)

- [ ] **Step 3: Run full build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm run build 2>&1 | tail -5`

Expected: TypeScript strict + Vite build succeed.
