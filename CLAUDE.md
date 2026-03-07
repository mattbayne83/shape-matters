# org-shape — The Shape of Effectiveness

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
- `#proof` — The Proof (13 company comparison, key observations)
- `#shape` — The Shape (triangle vs horn overlay, 4 geometry metrics)
- `#evidence` — The Evidence (Gemba Walk, Deming framework, unified model)
- `#model` — Model Your Org (unified interactive playground: sliders + 3-way viz toggle + metrics)
- `#methodology` — Methodology (formulas, assumptions, data sources — sole formula reference)

`SectionNav` component renders the nav bar with these anchors.

### Key Directories
- `src/lib/` — Pure calculation functions (orgMetrics.ts, depthTax.ts, triangleGeometry.ts, fidelityColor.ts, styles.ts)
- `src/data/` — Reference company data (13 companies, 5 archetypes)
- `src/store/` — Zustand persist store (global fidelity rate)
- `src/components/model/` — Visualization & interaction components (ModelYourOrg, ShapeSection, ComparisonView, etc.)
- `src/components/layout/` — SectionNav
- `src/components/ui/` — Prose typography wrapper
- `src/pages/` — ScrollPage (single entry page)
- `src/types/` — TypeScript interfaces (Company, OrgMetrics, DepthTaxResult, Archetype)

### Data Model
- 13 reference companies across 5 archetypes: `flat`, `tech`, `flattened`, `experimental`, `energy`
- `Company` type includes `archetype`, `source`, `sourceUrl` fields
- `ARCHETYPE_LABELS` and `ARCHETYPE_COLORS` lookup tables in `src/types/index.ts`
- ComparisonView has archetype filter pills

### Key Patterns
- **Dynamic colors**: Runtime hex values use inline `style={{ color: hex }}` — Tailwind can't JIT runtime hex
- **calcOrgMetrics()**: Returns raw numbers — format at render time
- **Fidelity rate**: Global state in Zustand persist store (default 82%), accessible from all components
- **Visualizations**: All custom SVG/Canvas — no charting library
- **Persist key**: `org-shape-storage` in localStorage

### Core Calculations
- `calcOrgMetrics(levels, employees, fidelityRate)` — span, flatness, fidelity %, managers
- `calcDepthTax(levels, headcount, fidelityRate)` — signal cost, drift cost, decision cost
- `calcTriangleGeometry(levels, employees)` — slope, shape gap, decision gravity, agility, inertia
- `fidelityColor(percentage)` — Maps 0-100% to green → amber → red (HSL interpolation)

### Gotchas
- **Formulas live ONLY in Methodology** — do not add formula boxes to other sections
- **Only ModelYourOrg writes fidelityRate** to Zustand — all other components read only
- **TheoryView.tsx is dead code** — unused legacy component, safe to delete
- **Background alternation**: Hero (white) → Problem (slate-50) → Proof (white) → Shape (slate-50) → Evidence (white) → Model (slate-50) → Methodology (slate-50)
- **Product name**: "Shape Matters" (footer + nav logo)

## Deployment
- Cloudflare Pages
- `public/_redirects` — SPA fallback (`/* /index.html 200`)
- `public/_headers` — Security headers (X-Frame-Options, etc.)

## Commands
```bash
npm run dev      # Vite dev server (HMR)
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint
npm run preview  # Preview production build
```
