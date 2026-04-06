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
- `#simulate` — The Telephone Effect (scenario-driven message relay simulator)
- `#evidence` — The Evidence (Gemba Walk, Deming framework, unified model)
- `#proof` — The Proof (6 company comparison, key observations)
- `#model` — Model Your Org (two-column: sticky inputs left, outputs right)
- `#methodology` — Methodology (per-metric formula entries with anchor IDs, assumptions, data sources)

`SectionNav` component renders the nav bar with these anchors.

### Key Directories
- `src/lib/` — Pure calculation functions (orgMetrics.ts, depthTax.ts, triangleGeometry.ts, fidelityColor.ts, signalRelay.ts, styles.ts, scrollToAnchor.ts)
- `src/data/` — Reference company data (6 companies, 5 archetypes) + methodologyMetrics.tsx (11 metric definitions) + scenarios.ts (5 relay simulation scenarios)
- `src/store/` — Zustand persist store (fidelityRate, levels, headcount — shared across sections) + non-persisted simulation state (activeScenarioId)
- `src/components/model/` — Visualization & interaction components
- `src/components/layout/` — SectionNav
- `src/components/ui/` — Prose, FadeIn, GeometricHero
- `src/pages/` — ScrollPage (single entry page)
- `src/types/` — TypeScript interfaces (Company, OrgMetrics, DepthTaxResult, TriangleGeometry, RestructuringImpact, Scenario, RelayLevel, ScenarioCategory)
- `docs/` — THEORY_BRIEF.md, TORQUE_MODEL.md

### Zustand Store (`useCompanyStore`)
Shared inputs across sections:
- `fidelityRate: number` (default 82), `levels: number` (default 6), `headcount: number` (default 5000)
- `activeScenarioId: string | null` (default `'innovation-proposal'`) — non-persisted, excluded via `partialize`
- ModelYourOrg + InteractiveFidelityDemo + SimulateSection write `levels`; other components read only
- Persist key: `org-shape-storage`
- `partialize` excludes `activeScenarioId` from persistence — simulation resets on reload
- `applyUrlParams()` reads `?l=&h=&f=` from URL at module load + after `onRehydrateStorage`. URL params always override persisted state.
- `buildShareUrl()` builds `?l=&h=&f=#model` URL from current state

### Data Model
- 6 reference companies across 5 archetypes: `flat`, `tech`, `flattened`, `experimental`, `energy`
- `Company` type includes `archetype`, `source`, `sourceUrl` fields
- `ShapeClassification`: `mesa` | `pyramid` | `diamond` | `obelisk`
- `RestructuringImpact`: Delta metrics for removing one level (agility, inertia, managerRatio, fidelity)
- 5 relay simulation scenarios across categories: safety, customer, innovation, strategy, operations
- Each scenario has 8 hand-authored `RelayLevel` entries with role, message, incentive, lostDetails, addedFraming

### Key Components
- `SimulateSection` — Two-column grid: sticky left (ScenarioPicker + levels slider), scrollable right (RelayCascade). Section wrapper for `#simulate`.
- `ScenarioPicker` — Category pill buttons (Safety, Customer, Innovation, Strategy, Operations). Toggle selection via `activeScenarioId` store field.
- `RelayCascade` — Orchestrates cascade display: Origin card → first relay (always visible) → expandable middle layers → SignalVerdictCard. Uses `truncateRelayLevels` to match org depth.
- `RelayCard` — Single relay level card with level badge, role, distorted message, lost/added detail tags, incentive annotation. Opacity fades based on `fidelityPct` (floor 0.35).
- `SignalVerdictCard` — Bottom verdict card: final message in quotes, fidelity %, relay count, verdict label. Border color from `fidelityColor(pct, semantic)`.
- `ModelYourOrg` — CSS grid layout (`grid-cols-[24rem_1fr]`): sticky inputs left, outputs right. Row 1: inputs + hero card. Row 2: SensitivitySweep + 6 primary FlippableMetricCards (same row = aligned heights). Row 3: What-if panel + secondary metrics.
- `SignalCascade` — Funnel visualization: shrinking bars + trapezoid connectors with cascading highlight sweep. Dynamic `@keyframes` via inline `<style>` tag, `useId()` for multi-instance safety. Keyframe names include input values so animations restart on slider change.
- `GembaComparison` — Side-by-side Evidence cards: "Without Gemba Walk" (light, 9 levels, 82% fidelity) vs "With Gemba Walk" (dark bg-stone-900, 9 levels, 100%). Both use `bottomUp` prop.
- `LayerDiagram` — Horizontal bar chart per org level. Props: `inverted`, `hoverPulse`, `bottomUp`.
- `InteractiveFidelityDemo` — Interactive playground in Problem section: levels + fidelity sliders → SignalCascade + 2 metrics
- `AnimatedCounter` — Smoothly animated number transitions (framer-motion `useMotionValue`)
- `FlippableMetricCard` — Primary metric card with value, sub-text, outcome range bar, `infoHref` link to methodology
- `MetricCard` — Secondary metric card with `infoHref` link
- `MethodologyCard` — "Pokemon card" metric definition: category stripe, badge, formula block, description
- `MethodologySection` — Full methodology section: card grids + prose (geometry, classification, assumptions, sources)
- `SensitivitySweep` — Fidelity sensitivity SVG chart
- `ComparisonView` — 6 companies, archetype filter pills

### Signal Relay Engine (`src/lib/signalRelay.ts`)
- `applyRelayTransforms(message, level)` — progressive regex-based message distortion for custom messages (currently unused, available for future use)
- `truncateRelayLevels(source, orgLevels)` — truncates scenario's 8 authored levels to match org depth (N levels = N-1 relays)
- 6 transformation rule tiers: number stripping (L1+), name genericizing (L1+), urgency softening (L3+), passive voice (L3+), ownership dilution (L6+), action→observation (L6+)

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

### Gotchas
- **Formulas live ONLY in Methodology** — no formula boxes in other sections
- **ModelYourOrg + InteractiveFidelityDemo + SimulateSection write** to Zustand (levels) — other components read only
- **Torque model replaced old variance-based agility** — see docs/TORQUE_MODEL.md
- **`decisionGravityRatio` still computed** but NOT displayed — replaced by Management Tax (`managerRatio`)
- **`scrollToAnchor` is shared** (`src/lib/scrollToAnchor.ts`) — used by FlippableMetricCard, MetricCard
- **Background alternation**: stone-50 → white → stone-50 → white → stone-50 → white (Problem → Simulate → Evidence → Proof → Model → Methodology)
- **Product name**: "Shape Matters" (footer + nav logo)
- **`calcRestructuringImpact` imports `calcOrgMetrics`** for managerRatioDelta (safe — no circular dep)
- **All neutrals are stone, NOT slate** — slate is never used in content surfaces
- **Slider accents use `accent-ember`** — not blue
- **Focus rings use `focus:ring-ember/30`** — not blue
- **SVG hardcoded hex colors use stone scale** — e.g. `#e7e5e4` (stone-200), `#a8a29e` (stone-400), `#44403c` (stone-700), `#1C1917` (stone-900)
- **fidelityColor.ts monochrome mode** uses stone HSL (h:24, s:6-10), not slate
- **SignalCascade dynamic keyframes** — keyframe names MUST include input values (levels + fidelityRate) so browsers restart animations on slider change
- **SignalCascade `barScale`** — reserves `labelSpace` (48px non-compact) so "100%" text doesn't clip at 1 level
- **Terminology rule**: "Levels" = structural count (sliders, data), "Layer" = relay/process ("per-layer fidelity", "each layer retains"). Use "relays" when combined with the `levels` variable to avoid confusion.
- **Input order** in ModelYourOrg, InteractiveFidelityDemo, and SimulateSection: Levels (hero control) → secondary inputs. Levels is always the primary slider with accent-ember styling.
- **ModelYourOrg is CSS grid** — don't add flex wrappers around columns; items use `lg:col-start-*` / `lg:row-start-*` placement
- **LayerDiagram `bottomUp`** — reverses render order (L0 at bottom). Used by GembaComparison only; CompanyCard uses default top-down.
- **Shareable URL uses query params** (`?l=9&h=150000&f=82`), NOT hash params — hash is reserved for section anchors
- **`applyUrlParams()` runs twice** — once at module scope (first-visit), once via `onRehydrateStorage` (overrides persist rehydration). This is intentional.
- **ScrollPage hash scroll** — 150ms `setTimeout` after mount to scroll to hash anchor. Needed because browser processes hash before React renders DOM.
- **ShapeSection + ShapeOverlay deleted** — Shape was removed from the section flow. `triangleGeometry.ts` and related types remain (used by ModelYourOrg for Pivot Speed/Shape Gap metrics).
- **Relay simulator uses no animation** — cards render instantly. Opacity fades via CSS `transition-opacity`. No framer-motion in RelayCard, RelayCascade, or SignalVerdictCard.
- **Collapsed relay cascade** — Origin + L1 always visible. Middle layers hidden behind "Show N more layers" expander. Verdict card always anchored at bottom.
- **`activeScenarioId` defaults to `'innovation-proposal'`** — simulator is never blank on load.
- **Scenario relay levels are hand-authored** — 5 scenarios × 8 levels each. Custom message engine (`applyRelayTransforms`) exists but is not currently wired to the UI.

## Deployment
- GitHub Pages: [https://mattbayne83.github.io/shape-matters/](https://mattbayne83.github.io/shape-matters/)
- `public/_redirects` — SPA fallback (`/* /index.html 200`)
- `public/_headers` — Security headers (X-Frame-Options, etc.)

## Testing
- **Vitest 4** with separate `vitest.config.ts`
- 124 unit tests across 5 files in `src/lib/__tests__/`:
  - `orgMetrics.test.ts` — span, flatness, fidelity, managers, edge cases
  - `depthTax.test.ts` — signal, drift, latency, decision quality, formula verification
  - `triangleGeometry.test.ts` — layer distribution, shape gap, torque/agility, classification, restructuring
  - `fidelityColor.test.ts` — monochrome/semantic modes, clamping, HSL output
  - `signalRelay.test.ts` — transformation rules, cumulative application, truncation logic, scenario data integrity

## Commands
```bash
npm run dev        # Vite dev server (HMR)
npm run build      # TypeScript check + Vite build
npm run lint       # ESLint
npm run test       # Vitest (single run)
npm run test:watch # Vitest (watch mode)
npm run preview    # Preview production build
```
