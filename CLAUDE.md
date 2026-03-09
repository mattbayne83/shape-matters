# org-shape — Shape Matters

## Product Vision
Open-source interactive research tool exploring how organizational depth degrades information fidelity, increases communication costs, and impacts effectiveness. Based on Bartlett (1932), Deming (1982), and Toyota's Gemba Walk.

## Tech Stack
- React 19, TypeScript 5.9, Vite 7
- Tailwind CSS 4 + Typography plugin
- Zustand 5 (persist) for state
- Lucide React for icons
- Source Serif 4 (headings) + Inter (body) + DM Mono (code) fonts

## Design System
Full reference in `design-system.md`. Key tokens:

### Color Palette
- **Neutrals**: Warm stone scale (stone-50 through stone-900) — NOT slate
- **Primary accent**: Ember `#E05A1B` (`bg-ember`), light `#F4A261` (`bg-ember-light`), deep `#B84515` (`bg-ember-deep`)
- **Warm accent**: `#A8967A` (`bg-warm-stone`)
- **Data viz**: org-green, org-blue, org-purple, org-amber, org-red, org-cyan (unchanged)
- **Nav**: Light (stone-based), not dark shell

### Typography
- Headings: `font-serif` (Source Serif 4) + `font-bold` + `tracking-tight`
- Body: `font-sans` (Inter) — 18px for prose, 16px for UI chrome
- Code/data: `font-mono` (DM Mono)
- Section labels: `text-xs font-semibold uppercase tracking-widest text-stone-500`

### Theme Tokens (index.css @theme)
```css
--font-serif: 'Source Serif 4', Georgia, serif;
--color-ember: #E05A1B;
--color-ember-light: #F4A261;
--color-ember-deep: #B84515;
--color-warm-stone: #A8967A;
```

## Architecture

### Navigation (Anchor-based, NO router)
Single-page scroll layout in `src/pages/ScrollPage.tsx`. Navigation via anchor links:
- `#problem` — The Problem (Bartlett story, fidelity demo, decay curve)
- `#proof` — The Proof (6 company comparison, key observations)
- `#shape` — The Shape (prose + classification badge + ShapeOverlay viz — no inputs, no cards)
- `#evidence` — The Evidence (Gemba Walk, Deming framework, unified model)
- `#model` — Model Your Org (two-column: sticky inputs left, outputs right)
- `#methodology` — Methodology (per-metric formula entries with anchor IDs, assumptions, data sources)

`SectionNav` component renders the nav bar with these anchors.

### Key Directories
- `src/lib/` — Pure calculation functions (orgMetrics.ts, depthTax.ts, triangleGeometry.ts, fidelityColor.ts, styles.ts, scrollToAnchor.ts)
- `src/data/` — Reference company data (6 companies, 5 archetypes) + methodologyMetrics.tsx (11 metric definitions)
- `src/store/` — Zustand persist store (fidelityRate, levels, headcount — shared across sections)
- `src/components/model/` — Visualization & interaction components
- `src/components/layout/` — SectionNav
- `src/components/ui/` — Prose, FadeIn, GeometricHero
- `src/pages/` — ScrollPage (single entry page)
- `src/types/` — TypeScript interfaces (Company, OrgMetrics, DepthTaxResult, TriangleGeometry, RestructuringImpact)
- `docs/` — THEORY_BRIEF.md, TORQUE_MODEL.md

### Zustand Store (`useCompanyStore`)
Shared inputs across Model and Shape sections:
- `fidelityRate: number` (default 82), `levels: number` (default 6), `headcount: number` (default 5000)
- Only ModelYourOrg writes; ShapeSection and others read only
- Persist key: `org-shape-storage`

### Data Model
- 6 reference companies across 5 archetypes: `flat`, `tech`, `flattened`, `experimental`, `energy`
- `Company` type includes `archetype`, `source`, `sourceUrl` fields
- `ShapeClassification`: `mesa` | `pyramid` | `diamond` | `obelisk`
- `RestructuringImpact`: Delta metrics for removing one level (agility, inertia, managerRatio, fidelity)

### Key Components
- `ModelYourOrg` — CSS grid layout (`grid-cols-[24rem_1fr]`): sticky inputs left, outputs right. Row 1: inputs + hero card. Row 2: SensitivitySweep + 6 primary FlippableMetricCards (same row = aligned heights). Row 3: What-if panel + secondary metrics.
- `SignalCascade` — Funnel visualization: shrinking bars + trapezoid connectors with cascading highlight sweep. Dynamic `@keyframes` via inline `<style>` tag, `useId()` for multi-instance safety. Keyframe names include input values so animations restart on slider change. Bars anchored to top (not vertically centered). `barScale = usable - labelSpace` reserves 48px for label text.
- `GembaComparison` — Side-by-side Evidence cards: "Without Gemba Walk" (light, 9 levels, 82% fidelity) vs "With Gemba Walk" (dark bg-stone-900, 9 levels, 100%). Both use `bottomUp` prop for org-chart orientation (L0 at bottom, L8 at top). Hover pulse animation via `group`/`group-hover`.
- `LayerDiagram` — Horizontal bar chart per org level. Props: `inverted` (warm amber bars for dark bg), `hoverPulse` (cascading `gemba-pulse` animation), `bottomUp` (L0 at bottom). `invertedBarColor()` blends stone→amber/ember.
- `InteractiveFidelityDemo` — Interactive playground in Problem section: fidelity + levels sliders → SignalCascade + metrics
- `AnimatedCounter` — Smoothly animated number transitions (framer-motion `useMotionValue`)
- `FlippableMetricCard` — Primary metric card with value, sub-text, outcome range bar, `infoHref` link to methodology
- `MetricCard` — Secondary metric card with `infoHref` link
- `MethodologyCard` — "Pokemon card" metric definition: category stripe, badge, formula block, description
- `MethodologySection` — Full methodology section: card grids + prose (geometry, classification, assumptions, sources)
- `ShapeSection` — Prose + classification badge + ShapeOverlay only (reads from store)
- `ShapeOverlay` — SVG triangle vs horn overlay with center-of-mass dot
- `SensitivitySweep` — Fidelity sensitivity SVG chart (flex-col container, SVG flex-1 to fill grid cell height)
- `ComparisonView` — 6 companies, archetype filter pills
- `KeyObservations` — Auto-generated insights (flattest, best signal, leanest, most agile)

### Core Calculations
- `calcOrgMetrics(levels, employees, fidelityRate)` — span, flatness, fidelity %, managerRatio, annualCommLoss
- `calcDepthTax(levels, headcount, fidelityRate)` — signalFidelity, decisionQuality, decisionLatency, driftCost, throughput
- `calcTriangleGeometry(levels, employees, fidelityRate)` — slope, shapeGap, agilityScore (torque model), inertia, torqueProfile, shape classification
- `calcRestructuringImpact(levels, employees, fidelityRate)` — deltas for agility, inertia, managerRatio, fidelity
- `fidelityColor(percentage, semantic?)` — Monochrome: stone-300 → stone-900. Semantic mode: ember → stone-700.
- `metricColor(goodness)` — Maps 0-1 score to stone-700 (best) → ember (worst)

### Methodology Section
- Full visible section (not collapsible) with "pokemon card" style metric definition cards in responsive grid
- `MethodologySection` component wraps card grids + supplementary prose
- `MethodologyCard` component: category stripe (ember/warm-stone), badge pill, serif title, formula block, description
- `methodologyMetrics.tsx` data file: 11 typed `MetricDefinition` entries (6 primary, 5 secondary)
- Per-metric anchor IDs preserved (e.g., `#methodology-signal-fidelity`)
- Cards link via `infoHref` → shared `scrollToAnchor()` utility → smooth scroll
- Sections: Primary Grid → Secondary Grid → Geometry Internals → Shape Classification → Assumptions → Data Sources

### Gotchas
- **Formulas live ONLY in Methodology** — no formula boxes in other sections
- **Only ModelYourOrg writes** to Zustand — all other components read only
- **Torque model replaced old variance-based agility** — see docs/TORQUE_MODEL.md
- **`decisionGravityRatio` still computed** but NOT displayed — replaced by Management Tax (`managerRatio`)
- **`InertiaProfile.tsx` is dead code** — unused since Shape section streamlining
- **`TheoryView.tsx` is dead code** — unused legacy
- **`scrollToAnchor` is shared** (`src/lib/scrollToAnchor.ts`) — used by FlippableMetricCard, MetricCard. No `<details>` logic (methodology is no longer collapsible).
- **Background alternation**: white → stone-50 → white → stone-50... (methodology section is white)
- **Product name**: "Shape Matters" (footer + nav logo)
- **`calcRestructuringImpact` imports `calcOrgMetrics`** for managerRatioDelta (safe — no circular dep)
- **All neutrals are stone, NOT slate** — slate is never used in content surfaces (only in design-system.md's dark nav spec, which was not implemented)
- **Slider accents use `accent-ember`** — not blue
- **Focus rings use `focus:ring-ember/30`** — not blue
- **SVG hardcoded hex colors use stone scale** — e.g. `#e7e5e4` (stone-200), `#a8a29e` (stone-400), `#44403c` (stone-700), `#1C1917` (stone-900)
- **fidelityColor.ts monochrome mode** uses stone HSL (h:24, s:6-10), not slate
- **SignalCascade dynamic keyframes** — keyframe names MUST include input values (levels + fidelityRate) so browsers restart animations on slider change. Plain `useId()` names are stable across renders and won't trigger restarts.
- **SignalCascade `barScale`** — reserves `labelSpace` (48px non-compact) so "100%" text doesn't clip at 1 level
- **ModelYourOrg is CSS grid** — don't add flex wrappers around columns; items use `lg:col-start-*` / `lg:row-start-*` placement. Sensitivity + metrics share row 2 for automatic height alignment.
- **LayerDiagram `bottomUp`** — reverses render order (L0 at bottom). Used by GembaComparison only; CompanyCard uses default top-down.
- **LayerDiagram `invertedBarColor()`** — warm amber for dark backgrounds (stone→ember hue blend). Don't use `fidelityColor()` on dark bg — it returns near-black at 100%.

## Deployment
- GitHub Pages: [https://mattbayne83.github.io/shape-matters/](https://mattbayne83.github.io/shape-matters/)
- `public/_redirects` — SPA fallback (`/* /index.html 200`)
- `public/_headers` — Security headers (X-Frame-Options, etc.)

## Commands
```bash
npm run dev      # Vite dev server (HMR)
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint
npm run preview  # Preview production build
```
