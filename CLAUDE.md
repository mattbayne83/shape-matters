# org-shape — Shape Matters

## Product Vision
Open-source interactive research tool exploring how organizational depth degrades information fidelity, increases communication costs, and impacts effectiveness. Based on Bartlett (1932), Deming (1982), and Toyota's Gemba Walk.

## Tech Stack
- React 19, TypeScript 5.9, Vite 7
- Tailwind CSS 4 + Typography plugin
- Zustand 5 (persist) for state
- Lucide React for icons
- Inter + DM Mono fonts

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
- `src/lib/` — Pure calculation functions (orgMetrics.ts, depthTax.ts, triangleGeometry.ts, fidelityColor.ts, styles.ts)
- `src/data/` — Reference company data (6 companies, 5 archetypes)
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
- `ModelYourOrg` — Two-column: sticky inputs (3 sliders + preset dropdown), outputs (6 primary cards, restructuring panel, 5 secondary cards)
- `FlippableMetricCard` — Primary metric card with value, sub-text, outcome range bar, `infoHref` link to methodology
- `MetricCard` — Secondary metric card with `infoHref` link
- `ShapeSection` — Prose + classification badge + ShapeOverlay only (reads from store)
- `ShapeOverlay` — SVG triangle vs horn overlay with center-of-mass dot
- `SensitivitySweep` — Fidelity sensitivity SVG chart
- `ComparisonView` — 6 companies, archetype filter pills
- `KeyObservations` — Auto-generated insights (flattest, best signal, leanest, most agile)

### Core Calculations
- `calcOrgMetrics(levels, employees, fidelityRate)` — span, flatness, fidelity %, managerRatio, annualCommLoss
- `calcDepthTax(levels, headcount, fidelityRate)` — signalFidelity, decisionQuality, decisionLatency, driftCost, throughput
- `calcTriangleGeometry(levels, employees, fidelityRate)` — slope, shapeGap, agilityScore (torque model), inertia, torqueProfile, shape classification
- `calcRestructuringImpact(levels, employees, fidelityRate)` — deltas for agility, inertia, managerRatio, fidelity
- `fidelityColor(percentage, semantic?)` — Maps 0-100% to green → amber → red

### Methodology Section
- Per-metric formula entries with anchor IDs (e.g., `#methodology-signal-fidelity`)
- Cards link via `infoHref` → `scrollToAnchor()` opens `<details>` + smooth scrolls
- Sections: Primary Metrics → Secondary Metrics → Geometry Internals → Shape Classification → Assumptions → Data Sources

### Gotchas
- **Formulas live ONLY in Methodology** — no formula boxes in other sections
- **Only ModelYourOrg writes** to Zustand — all other components read only
- **Torque model replaced old variance-based agility** — see docs/TORQUE_MODEL.md
- **`decisionGravityRatio` still computed** but NOT displayed — replaced by Management Tax (`managerRatio`)
- **`InertiaProfile.tsx` is dead code** — unused since Shape section streamlining
- **`TheoryView.tsx` is dead code** — unused legacy
- **Background alternation**: white → slate-50 → white → slate-50...
- **Product name**: "Shape Matters" (footer + nav logo)
- **`calcRestructuringImpact` imports `calcOrgMetrics`** for managerRatioDelta (safe — no circular dep)

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
