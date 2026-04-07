# Dashboard Layout Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Model Your Org section from input-dominant vertical stack to output-dominant dashboard: compact input strip on top, 70/30 radar/pillar split below, with in-place expand that replaces the radar (no page jump).

**Architecture:** Extract input controls into a new `InputStrip.tsx` component. Restructure `PillarDashboard.tsx` from vertical flow (radar → cards → expanded below) to a 70/30 CSS grid where the left column swaps between radar chart and expanded content. Update `PillarCard.tsx` with directional arrows. Slim down `ModelYourOrg.tsx` to just layout orchestration.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, framer-motion (AnimatePresence), Lucide React icons

**Spec:** `docs/superpowers/specs/2026-04-07-dashboard-layout-redesign.md`

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/components/model/InputStrip.tsx` | Compact horizontal row of 5 sliders + preset dropdown + share link |
| Modify | `src/components/model/PillarCard.tsx` | Directional arrows (← Details / → Back), vertical layout adaptation |
| Modify | `src/components/model/PillarDashboard.tsx` | 70/30 grid layout, radar in left column, pillar cards in right column, in-place expand |
| Modify | `src/components/model/RadarChart.tsx` | Responsive sizing to fill 70% container |
| Modify | `src/components/model/ModelYourOrg.tsx` | Replace hero slider + grouped cards with InputStrip + PillarDashboard |

---

### Task 1: Create InputStrip component

**Files:**
- Create: `src/components/model/InputStrip.tsx`

This extracts all 5 input sliders, the company preset dropdown, and the share link from `ModelYourOrg.tsx` into a compact horizontal strip.

- [ ] **Step 1: Create `InputStrip.tsx`**

Create `src/components/model/InputStrip.tsx`:

```typescript
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'lucide-react';
import { useCompanyStore, buildShareUrl } from '../../store/useCompanyStore';
import { REFERENCE_COMPANIES } from '../../data/referenceCompanies';

const LOG_MIN = Math.log(50);
const LOG_MAX = Math.log(500_000);

function sliderToHeadcount(pos: number): number {
  return Math.round(Math.exp(LOG_MIN + (pos / 100) * (LOG_MAX - LOG_MIN)));
}

function headcountToSlider(n: number): number {
  return ((Math.log(n) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100;
}

interface CompactSliderProps {
  id: string;
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step?: number;
  accent: 'ember' | 'warm-stone';
  onChange: (v: number) => void;
}

const ACCENT_COLORS = {
  ember: '#E05A1B',
  'warm-stone': '#A8967A',
} as const;

function CompactSlider({ id, label, value, displayValue, min, max, step = 1, accent, onChange }: CompactSliderProps) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-0.5">
        <label htmlFor={id} className="text-[9px] font-semibold" style={{ color: ACCENT_COLORS[accent] }}>
          {label}
        </label>
        <span className="text-[15px] font-extrabold font-mono tabular-nums text-stone-900">
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
        className="w-full h-[5px] bg-stone-200 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-ember/30"
        style={{ accentColor: ACCENT_COLORS[accent] }}
      />
    </div>
  );
}

export function InputStrip() {
  const levels = useCompanyStore((s) => s.levels);
  const storeLevels = useCompanyStore((s) => s.setLevels);
  const headcount = useCompanyStore((s) => s.headcount);
  const storeHeadcount = useCompanyStore((s) => s.setHeadcount);
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);
  const setFidelityRate = useCompanyStore((s) => s.setFidelityRate);
  const decisionCycle = useCompanyStore((s) => s.decisionCycle);
  const setDecisionCycle = useCompanyStore((s) => s.setDecisionCycle);
  const culturalAgility = useCompanyStore((s) => s.culturalAgility);
  const setCulturalAgility = useCompanyStore((s) => s.setCulturalAgility);

  const [hcSlider, setHcSlider] = useState(() => Math.round(headcountToSlider(headcount)));
  const [preset, setPreset] = useState('custom');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setHcSlider(Math.round(headcountToSlider(headcount)));
  }, [headcount]);

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(buildShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handlePresetChange = (id: string) => {
    setPreset(id);
    if (id === 'custom') return;
    const company = REFERENCE_COMPANIES.find((c) => c.id === id);
    if (!company) return;
    storeLevels(company.levels);
    const pos = Math.round(headcountToSlider(company.employees));
    setHcSlider(pos);
    storeHeadcount(sliderToHeadcount(pos));
  };

  const handleLevels = (v: number) => { setPreset('custom'); storeLevels(v); };
  const handleHeadcount = (v: number) => {
    setPreset('custom');
    setHcSlider(v);
    storeHeadcount(sliderToHeadcount(v));
  };

  const formatHeadcount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n);

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-3 px-4 shadow-sm">
      <div className="grid grid-cols-[repeat(5,1fr)_auto] gap-x-4 items-end">
        <CompactSlider
          id="is-levels"
          label="Levels"
          value={levels}
          displayValue={String(levels)}
          min={1}
          max={15}
          accent="ember"
          onChange={handleLevels}
        />
        <CompactSlider
          id="is-size"
          label="Size"
          value={hcSlider}
          displayValue={formatHeadcount(headcount)}
          min={0}
          max={100}
          accent="ember"
          onChange={handleHeadcount}
        />
        <CompactSlider
          id="is-fidelity"
          label="Fidelity"
          value={fidelityRate}
          displayValue={`${fidelityRate}%`}
          min={50}
          max={98}
          accent="ember"
          onChange={setFidelityRate}
        />
        <CompactSlider
          id="is-cycle"
          label="Cycle"
          value={decisionCycle}
          displayValue={`${decisionCycle}d`}
          min={1}
          max={14}
          step={0.5}
          accent="warm-stone"
          onChange={setDecisionCycle}
        />
        <CompactSlider
          id="is-agility"
          label="Agility"
          value={culturalAgility}
          displayValue={String(culturalAgility)}
          min={0}
          max={100}
          accent="warm-stone"
          onChange={setCulturalAgility}
        />
        <div className="flex flex-col gap-0.5 pb-[1px]">
          <span className="text-[7px] font-semibold uppercase tracking-wide text-stone-400">Preset</span>
          <div className="flex gap-1.5 items-center">
            <select
              value={preset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="text-[9px] px-1.5 py-1 border border-stone-200 rounded bg-white text-stone-600 focus:outline-none focus:ring-1 focus:ring-ember/30 cursor-pointer w-[72px]"
            >
              <option value="custom">Custom</option>
              {REFERENCE_COMPANIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              onClick={handleCopyLink}
              className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              title={copied ? 'Copied!' : 'Copy shareable link'}
            >
              <Link className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors (component is created but not yet consumed)

- [ ] **Step 3: Commit**

```bash
git add src/components/model/InputStrip.tsx
git commit -m "feat: add InputStrip compact horizontal input component"
```

---

### Task 2: Update PillarCard with directional arrows

**Files:**
- Modify: `src/components/model/PillarCard.tsx`

Replace ChevronDown/ChevronUp with ChevronLeft/ChevronRight. Change "Explore"/"Collapse" to "Details"/"Back". Update styling for the vertical stacked layout in the 30% right column.

- [ ] **Step 1: Update the PillarCard component**

Replace the entire contents of `src/components/model/PillarCard.tsx` with:

```typescript
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type PillarId = 'fidelity' | 'lag' | 'response';

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
  return (
    <button
      onClick={onToggle}
      className={`
        relative w-full text-left bg-white rounded-xl border p-3
        transition-all duration-300 cursor-pointer overflow-hidden flex-1
        ${isExpanded
          ? 'border-2 shadow-md z-10'
          : hasExpandedSibling
            ? 'border-stone-100 opacity-55 scale-[0.97] hover:opacity-75 shadow-none'
            : 'border-stone-200 hover:border-stone-300 hover:shadow-md shadow-sm'}
      `}
      style={isExpanded ? { borderColor: accentColor, boxShadow: `0 2px 12px ${accentColor}1F` } : {}}
    >
      {/* Active Tab Indicator Line */}
      <div
        className={`absolute top-0 left-0 w-full h-[3px] transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundColor: accentColor }}
      />

      <p className="text-[9px] font-bold text-stone-500 uppercase tracking-wide mb-0.5 transition-colors">
        {label}
      </p>
      <p
        className="text-[28px] font-extrabold font-mono tabular-nums leading-none mb-0.5 transition-colors"
        style={{ color: healthColor ?? accentColor }}
      >
        {value}
      </p>
      <p className="text-[9px] text-stone-500 leading-tight">{sub}</p>
      <div className={`flex items-center gap-1 mt-2 text-[9px] font-semibold transition-colors ${isExpanded ? '' : 'text-stone-400'}`}
        style={isExpanded ? { color: accentColor } : {}}
      >
        {isExpanded ? (
          <>
            <ChevronRight className="w-3 h-3" />
            Back
          </>
        ) : (
          <>
            <ChevronLeft className="w-3 h-3" />
            Details
          </>
        )}
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/model/PillarCard.tsx
git commit -m "feat: PillarCard directional arrows (← Details / → Back)"
```

---

### Task 3: Make RadarChart responsive to container

**Files:**
- Modify: `src/components/model/RadarChart.tsx`

The radar chart currently has a fixed 220px size. It needs to scale to fill the 70% left column container. Change from fixed `width`/`height` attributes to `100%` width with a `viewBox` and `max-width` constraint.

- [ ] **Step 1: Update RadarChart for responsive sizing**

Replace the entire contents of `src/components/model/RadarChart.tsx` with:

```typescript
import { healthBandColor } from '../../lib/healthScores';

interface RadarChartProps {
  fidelity: number;
  lagHealth: number;
  responseHealth: number;
}

const VB = 240;
const CX = VB / 2;
const CY = VB / 2 + 8;
const RADIUS = 90;

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
    <div className="flex items-center justify-center w-full h-full">
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        className="select-none w-full h-full"
        style={{ maxWidth: 300, maxHeight: 300 }}
      >
        {[20, 40, 60, 80, 100].map((level) => (
          <polygon
            key={level}
            points={gridTriangle(level)}
            fill="none"
            stroke="#e7e5e4"
            strokeWidth={level === 100 ? 1.5 : 0.75}
          />
        ))}

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

        <polygon
          points={dataPolygon}
          fill="#E05A1B"
          fillOpacity={0.15}
          stroke="#E05A1B"
          strokeWidth={2}
        />

        {dataPoints.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={6}
            fill={healthBandColor(scores[i])}
            stroke="white"
            strokeWidth={2}
          />
        ))}

        {AXES.map(({ angle, label }, i) => {
          const labelR = RADIUS + 26;
          const [lx, ly] = polarToXY(angle, labelR);
          return (
            <g key={label}>
              <text
                x={lx}
                y={ly - 5}
                textAnchor="middle"
                dominantBaseline="auto"
                className="fill-stone-900 font-bold"
                style={{ fontSize: 17, fontFamily: 'Inter, system-ui, sans-serif', fontVariantNumeric: 'tabular-nums' }}
              >
                {scores[i]}
              </text>
              <text
                x={lx}
                y={ly + 9}
                textAnchor="middle"
                dominantBaseline="auto"
                className="fill-stone-500 font-semibold"
                style={{ fontSize: 9, fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.1em' }}
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
git commit -m "feat: make RadarChart responsive with viewBox scaling"
```

---

### Task 4: Restructure PillarDashboard to 70/30 grid with in-place expand

**Files:**
- Modify: `src/components/model/PillarDashboard.tsx`

This is the core layout change. Replace the vertical stack (radar → cards row → expanded below) with a 70/30 CSS grid where the left column swaps between radar and expanded content, and the right column always shows the 3 stacked pillar cards.

- [ ] **Step 1: Rewrite PillarDashboard layout**

Replace the entire contents of `src/components/model/PillarDashboard.tsx` with:

```typescript
import { useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanyStore } from '../../store/useCompanyStore';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { calcDepthTax } from '../../lib/depthTax';
import { calcTriangleGeometry } from '../../lib/triangleGeometry';
import { calcThermalLag } from '../../lib/thermalLag';
import { calcDampedResponse } from '../../lib/dampedResponse';
import { fidelityColor, metricColor } from '../../lib/fidelityColor';
import { calcLagHealth, calcResponseHealth, healthBandColor } from '../../lib/healthScores';
import { PillarCard } from './PillarCard';
import type { PillarId } from './PillarCard';
import { SignalCascade } from './SignalCascade';
import { SensitivitySweep } from './SensitivitySweep';
import { FlippableMetricCard } from './FlippableMetricCard';
import { PropagationDelay } from './PropagationDelay';
import { ChangeResponseTimeline } from './ChangeResponseTimeline';
import { ThreeFutures } from './ThreeFutures';
import { RadarChart } from './RadarChart';

const FADE = { duration: 0.3, ease: [0.22, 1, 0.36, 1] } as const;

export function PillarDashboard() {
  const levels = useCompanyStore((s) => s.levels);
  const headcount = useCompanyStore((s) => s.headcount);
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);
  const decisionCycle = useCompanyStore((s) => s.decisionCycle);
  const culturalAgility = useCompanyStore((s) => s.culturalAgility);
  const expandedPillar = useCompanyStore((s) => s.expandedPillar);
  const setExpandedPillar = useCompanyStore((s) => s.setExpandedPillar);

  const m = useMemo(() => calcOrgMetrics(levels, headcount, fidelityRate), [levels, headcount, fidelityRate]);
  const tax = useMemo(() => calcDepthTax(levels, headcount, fidelityRate), [levels, headcount, fidelityRate]);
  const geo = useMemo(() => calcTriangleGeometry(levels, headcount, fidelityRate), [levels, headcount, fidelityRate]);
  const lag = useMemo(() => calcThermalLag(levels, decisionCycle), [levels, decisionCycle]);
  const response = useMemo(() => calcDampedResponse(levels, headcount, culturalAgility), [levels, headcount, culturalAgility]);
  const lagHealth = useMemo(() => calcLagHealth(lag.totalDelay), [lag.totalDelay]);
  const responseHealth = useMemo(() => calcResponseHealth(response.dampingRatio, response.regime), [response.dampingRatio, response.regime]);

  const fidelityScore = Math.round(m.fidelityAtTopPct);
  const fidelityHealthColor = healthBandColor(fidelityScore);

  const containerRef = useRef<HTMLDivElement>(null);

  function togglePillar(id: PillarId) {
    setExpandedPillar(expandedPillar === id ? null : id);
  }

  return (
    <div className="grid grid-cols-[7fr_3fr] gap-3" ref={containerRef}>
      {/* ── Left column: Radar OR expanded content ── */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden min-h-[300px]">
        <AnimatePresence mode="wait">
          {!expandedPillar && (
            <motion.div
              key="radar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE}
              className="w-full h-full flex items-center justify-center p-4"
            >
              <RadarChart
                fidelity={fidelityScore}
                lagHealth={lagHealth.score}
                responseHealth={responseHealth.score}
              />
            </motion.div>
          )}

          {expandedPillar === 'fidelity' && (
            <motion.div
              key="fidelity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE}
              className="p-4"
            >
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-3 self-start">
                      Signal Cascade
                    </div>
                    <SignalCascade levels={levels} fidelityRate={fidelityRate} semantic />
                  </div>
                  <SensitivitySweep
                    levels={levels}
                    headcount={headcount}
                    currentFidelityRate={fidelityRate}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  <FlippableMetricCard
                    label="Signal Fidelity"
                    value={`${tax.signalFidelity.toFixed(1)}%`}
                    sub="one-way to top"
                    color={fidelityColor(tax.signalFidelity, true)}
                    infoHref="#methodology-signal-fidelity"
                    minOut={0} maxOut={100} currentOut={tax.signalFidelity}
                    inverseBest={false} bestLabel="Preserved" worstLabel="Distorted"
                  />
                  <FlippableMetricCard
                    label="Decision Quality"
                    value={`${(tax.decisionQuality * 100).toFixed(1)}%`}
                    sub="compound fidelity × latency"
                    color={metricColor(tax.decisionQuality)}
                    infoHref="#methodology-decision-quality"
                    minOut={0} maxOut={100} currentOut={tax.decisionQuality * 100}
                    inverseBest={false} bestLabel="High quality" worstLabel="Degraded"
                  />
                  <FlippableMetricCard
                    label="Pivot Speed"
                    value={geo.agilityScore.toFixed(2)}
                    sub={geo.agilityScore > 0.5 ? 'Strong reach — directives land' : geo.agilityScore > 0.25 ? 'Moderate reach — signal fades' : 'Weak reach — directives lost'}
                    color={metricColor(geo.agilityScore)}
                    infoHref="#methodology-pivot-speed"
                    minOut={0} maxOut={1} currentOut={geo.agilityScore}
                    inverseBest={false} bestLabel="Agile" worstLabel="Rigid"
                  />
                  <FlippableMetricCard
                    label="Decision Latency"
                    value={tax.decisionLatency}
                    unit=" days"
                    sub={`${Math.round(tax.decisionsPerMonth).toLocaleString()} decisions/month`}
                    color={metricColor(1 - Math.min((tax.decisionLatency - 3) / 42, 1))}
                    infoHref="#methodology-decision-latency"
                    minOut={0} maxOut={60} currentOut={tax.decisionLatency}
                    inverseBest={true} bestLabel="Instant" worstLabel="Delayed"
                  />
                  <FlippableMetricCard
                    label="Management Tax"
                    value={`${m.managerRatio.toFixed(1)}%`}
                    sub={m.managerRatio < 15 ? 'Lean — minimal overhead' : m.managerRatio < 30 ? 'Moderate levels of management' : 'Heavy — half the org manages'}
                    color={metricColor(1 - Math.min(m.managerRatio / 50, 1))}
                    infoHref="#methodology-management-tax"
                    minOut={0} maxOut={50} currentOut={m.managerRatio}
                    inverseBest={true} bestLabel="Lean" worstLabel="Top-heavy"
                  />
                  <FlippableMetricCard
                    label="Drift Cost"
                    value={`${(100 - tax.ninetyDayAccuracy).toFixed(1)}%`}
                    sub="signal drifted over 90 days"
                    color={metricColor(tax.ninetyDayAccuracy / 100)}
                    infoHref="#methodology-drift-cost"
                    minOut={0} maxOut={100} currentOut={100 - tax.ninetyDayAccuracy}
                    inverseBest={true} bestLabel="Accurate" worstLabel="Drifted"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {expandedPillar === 'lag' && (
            <motion.div
              key="lag"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE}
              className="p-4"
            >
              <PropagationDelay levels={levels} decisionCycle={decisionCycle} />
            </motion.div>
          )}

          {expandedPillar === 'response' && (
            <motion.div
              key="response"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE}
              className="p-4"
            >
              <div className="flex flex-col gap-4">
                <ChangeResponseTimeline
                  levels={levels}
                  headcount={headcount}
                  culturalAgility={culturalAgility}
                />
                <ThreeFutures
                  dampingRatio={response.dampingRatio}
                  overshootPct={response.overshootPct}
                  settlingTimeWeeks={response.settlingTimeWeeks}
                  regime={response.regime}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right column: 3 stacked pillar cards ── */}
      <div className="flex flex-col gap-2">
        <PillarCard
          id="fidelity"
          label="Signal Fidelity"
          value={`${fidelityScore}`}
          sub={`${m.fidelityAtTopPct.toFixed(1)}% · ${levels - 1} relays`}
          accentColor="#E05A1B"
          healthColor={fidelityHealthColor}
          isExpanded={expandedPillar === 'fidelity'}
          hasExpandedSibling={expandedPillar !== null && expandedPillar !== 'fidelity'}
          onToggle={() => togglePillar('fidelity')}
        />
        <PillarCard
          id="lag"
          label="Propagation Lag"
          value={`${lagHealth.score}`}
          sub={`${lag.totalDelay}d · ${lagHealth.label}`}
          accentColor="#A8967A"
          healthColor={lagHealth.color}
          isExpanded={expandedPillar === 'lag'}
          hasExpandedSibling={expandedPillar !== null && expandedPillar !== 'lag'}
          onToggle={() => togglePillar('lag')}
        />
        <PillarCard
          id="response"
          label="Change Response"
          value={`${responseHealth.score}`}
          sub={`ζ=${response.dampingRatio.toFixed(2)} · ${responseHealth.label}`}
          accentColor="#16A34A"
          healthColor={responseHealth.color}
          isExpanded={expandedPillar === 'response'}
          hasExpandedSibling={expandedPillar !== null && expandedPillar !== 'response'}
          onToggle={() => togglePillar('response')}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run full test suite**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run`
Expected: All 214 tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/model/PillarDashboard.tsx
git commit -m "feat: restructure PillarDashboard to 70/30 grid with in-place expand"
```

---

### Task 5: Simplify ModelYourOrg to use InputStrip

**Files:**
- Modify: `src/components/model/ModelYourOrg.tsx`

Remove the hero Levels slider, grouped Structure/Dynamics cards, share link button, and advanced inputs toggle. Replace with InputStrip + PillarDashboard. Keep the What-If panel and More Metrics section.

- [ ] **Step 1: Rewrite ModelYourOrg**

Replace the entire contents of `src/components/model/ModelYourOrg.tsx` with:

```typescript
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanyStore } from '../../store/useCompanyStore';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { calcDepthTax } from '../../lib/depthTax';
import { calcTriangleGeometry, calcRestructuringImpact } from '../../lib/triangleGeometry';
import { metricColor } from '../../lib/fidelityColor';
import { InputStrip } from './InputStrip';
import { MetricCard } from './MetricCard';
import { PillarDashboard } from './PillarDashboard';

export function ModelYourOrg() {
  const levels = useCompanyStore((s) => s.levels);
  const headcount = useCompanyStore((s) => s.headcount);
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);

  const [moreMetricsOpen, setMoreMetricsOpen] = useState(false);

  const tax = useMemo(() => calcDepthTax(levels, headcount, fidelityRate), [levels, headcount, fidelityRate]);
  const m = useMemo(() => calcOrgMetrics(levels, headcount, fidelityRate), [levels, headcount, fidelityRate]);
  const geo = useMemo(() => calcTriangleGeometry(levels, headcount, fidelityRate), [levels, headcount, fidelityRate]);
  const restructure = useMemo(() => calcRestructuringImpact(levels, headcount, fidelityRate), [levels, headcount, fidelityRate]);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Input Strip ── */}
      <InputStrip />

      {/* ── Pillar Dashboard (70/30 radar + cards) ── */}
      <PillarDashboard />

      {/* ── What-If / Restructuring Impact ── */}
      {restructure && (
        <div className="bg-orange-50/80 backdrop-blur-md border-2 rounded-xl p-4 relative overflow-hidden animate-what-if-border transition-colors duration-700">
          <div
            className="absolute -inset-[100%] animate-slide-glow pointer-events-none opacity-100"
            style={{
              background: 'radial-gradient(circle at center, rgba(224, 90, 27, 0.25) 0%, rgba(224, 90, 27, 0.1) 25%, transparent 50%)',
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wide bg-stone-100/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-stone-200/50">What if</span>
              <span className="text-[11px] text-stone-600 font-medium">
                You removed a level ({restructure.currentLevels} → {restructure.proposedLevels}) with the same {headcount.toLocaleString()} employees
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-lg px-3 py-2.5 text-center">
                <div className="text-[10px] text-stone-500 uppercase font-semibold mb-1">Pivot Speed</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900 drop-shadow-sm">
                  +{(restructure.agilityDelta * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-stone-400 font-medium">faster pivots</div>
              </div>
              <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-lg px-3 py-2.5 text-center">
                <div className="text-[10px] text-stone-500 uppercase font-semibold mb-1">Inertia</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900 drop-shadow-sm">
                  -{restructure.inertiaReduction.toFixed(0)}%
                </div>
                <div className="text-[10px] text-stone-400 font-medium">less rigidity</div>
              </div>
              <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-lg px-3 py-2.5 text-center">
                <div className="text-[10px] text-stone-500 uppercase font-semibold mb-1">Mgmt Tax</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900 drop-shadow-sm">
                  {restructure.managerRatioDelta < 0 ? '' : '+'}{restructure.managerRatioDelta.toFixed(1)}
                </div>
                <div className="text-[10px] text-stone-400 font-medium">{restructure.managerRatioDelta < 0 ? 'percentage points · leaner' : 'percentage points · more overhead'}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-lg px-3 py-2.5 text-center">
                <div className="text-[10px] text-stone-500 uppercase font-semibold mb-1">Signal Fidelity</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900 drop-shadow-sm">
                  +{restructure.fidelityGain.toFixed(1)}
                </div>
                <div className="text-[10px] text-stone-400 font-medium">percentage points · better signal</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── More Metrics Disclosure ── */}
      <div>
        <button
          onClick={() => setMoreMetricsOpen(!moreMetricsOpen)}
          className="w-full cursor-pointer flex items-center justify-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors py-2"
        >
          <span>More metrics</span>
          <svg
            className={`w-3 h-3 transition-transform duration-300 ${moreMetricsOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {moreMetricsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-3 pb-2">
                <MetricCard label="Span of Control" value={m.avgSpan.toFixed(1)} sub="avg reports per manager" accent={metricColor(Math.min((m.avgSpan - 2) / 10, 1))} infoHref="#methodology-span-of-control" />
                <MetricCard label="Shape Gap" value={`${(geo.totalShapeGap * 100).toFixed(1)}%`} sub="triangle vs. actual" accent={metricColor(1 - Math.min(geo.totalShapeGap / 0.3, 1))} infoHref="#methodology-shape-gap" />
                <MetricCard label="Throughput" value={Math.round(tax.decisionsPerMonth).toLocaleString()} unit="/month" sub="at this org size" accent="#57534e" infoHref="#methodology-throughput" />
                <MetricCard label="Flatness Index" value={m.flatnessIndex.toFixed(2)} sub="Higher = flatter" accent="#57534e" infoHref="#methodology-flatness-index" />
                <MetricCard label="Annual Comm Loss" value={`$${(m.annualCommLoss / 1000000).toFixed(1)}`} unit="M" sub="Ineffective comms cost" accent="#E05A1B" infoHref="#methodology-annual-comm-loss" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run full verification suite**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit && npx eslint . --max-warnings 0 && npx vitest run`
Expected: Type check passes, no lint warnings, all tests pass

- [ ] **Step 4: Start dev server and visually verify**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm run dev`

Navigate to the dev server URL `/#model`. Verify:
1. Compact input strip at top with 5 sliders + preset dropdown + share link
2. 70/30 split below: radar chart on left, 3 stacked pillar cards on right
3. Pillar cards show ← Details link
4. Clicking a pillar card: radar fades out, expanded content appears in same left area
5. Active card shows → Back with accent border + top bar
6. Inactive siblings dim to 55% opacity
7. Clicking Back returns to radar view
8. Input sliders still update all values in real-time
9. What-If panel and More Metrics section still work below
10. Company preset dropdown populates values correctly

- [ ] **Step 5: Commit**

```bash
git add src/components/model/ModelYourOrg.tsx
git commit -m "feat: simplify ModelYourOrg to InputStrip + PillarDashboard layout"
```
