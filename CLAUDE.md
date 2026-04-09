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
- `#model` — Model Your Org (progressive disclosure: 3 pillar cards + expandable visualizations)
- `#methodology` — Methodology (per-metric formula entries with anchor IDs, assumptions, data sources)

`SectionNav` component renders the nav bar with these anchors.

### Key Directories
- `src/lib/` — Pure calculation functions (orgMetrics.ts, depthTax.ts, triangleGeometry.ts, thermalLag.ts, autonomy.ts, blendedModel.ts, fidelityColor.ts, healthScores.ts, signalRelay.ts, contextHints.ts, styles.ts, scrollToAnchor.ts)
- `src/data/` — Reference company data (6 companies, 5 archetypes) + methodologyMetrics.tsx (13 metric definitions) + scenarios.ts (5 relay simulation scenarios)
- `src/store/` — Zustand persist store (fidelityRate, levels, headcount, decisionCycle, dci, teamDecisionMix — shared across sections) + non-persisted UI state (activeScenarioId, expandedPillar, contextExpanded)
- `src/components/model/` — Visualization & interaction components
- `src/components/layout/` — SectionNav
- `src/components/ui/` — Prose, FadeIn, GeometricHero
- `src/pages/` — ScrollPage (single entry page)
- `src/types/` — TypeScript interfaces (Company, OrgMetrics, DepthTaxResult, TriangleGeometry, RestructuringImpact, ThermalLagResult, AutonomyResult, HealthScore, Scenario, RelayLevel, ScenarioCategory)
- `docs/` — THEORY_BRIEF.md, TORQUE_MODEL.md, PHYSICS_MODELS.md, BAHCALL_LOONSHOTS.md
- `evals/` — Recursive autoresearch system (see below)

### Zustand Store (`useCompanyStore`)
Shared inputs across sections:
- `fidelityRate: number` (default 82), `levels: number` (default 6), `headcount: number` (default 5000)
- `decisionCycle: number` (default 3, days/layer) — Lag model input
- `dci: number` (default 50, range 0-100) — Decision-Centrality Index for Autonomy pillar
- `teamDecisionMix: number` (default 0, range 0-100) — blended model team-routing percentage
- `activeScenarioId: string | null` (default `'innovation-proposal'`) — non-persisted
- `expandedPillar: 'fidelity' | 'lag' | 'autonomy' | null` (default null) — non-persisted
- `contextExpanded: boolean` (default false) — non-persisted, controls context bar expand/collapse
- ModelYourOrg + InteractiveFidelityDemo + SimulateSection write `levels`; other components read only
- Persist key: `org-shape-storage`
- `partialize` persists fidelityRate, levels, headcount, decisionCycle, dci, teamDecisionMix. Excludes activeScenarioId, expandedPillar, contextExpanded.
- `applyUrlParams()` reads `?l=&h=&f=&d=&ci=&tm=` from URL at module load + after `onRehydrateStorage`. URL params always override persisted state.
- `buildShareUrl()` builds `?l=&h=&f=&d=&ci=&tm=#model` URL from current state

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
- `ModelYourOrg` (~178 lines) — Layout orchestrator: InputStrip at top, PillarDashboard below, What-If panel, More Metrics disclosure. More Metrics always contains 6 FlippableMetricCards (fidelity metrics) + 5 secondary MetricCards.
- `InputStrip` — Three-tier layout. Tier 1: collapsible context bar (stone bg) with Depth + Headcount summary, "Edit" expands inline sliders (warm-stone accent). Tier 2: 4-column CSS grid of lever sliders (Fidelity, Cycle Time, Authority, Team Routing) all with ember accent — always visible, primary interaction. Tier 3: company preset pills ("Compare") + Share button. Company presets trigger a 0.5s settle animation (`@keyframes settle` in index.css) on changed lever wrappers. Custom slider CSS in `index.css` (`.custom-slider`): track fill gradient, 14px thumbs with white border + shadow, hover scale, focus ring.
- `PillarDashboard` (~207 lines) — 30/70 CSS grid layout: left column (3fr, `order-first`) shows 3 stacked PillarCards. Right column (7fr, `order-last`) swaps between EQ chart and expanded pillar content via AnimatePresence crossfade. Detail panel gets accent-colored left border (3px) when a pillar is expanded. One pillar expands at a time. Expanded panel titles standardized in PillarDashboard (not inside child components). Fidelity expanded = SignalCascade + RoundTripFidelity (side-by-side). Lag expanded = DotTimeline (propagation delay SVG). Autonomy expanded = AuthoritySpectrum (health band track with score-positioned company dots).
- `PillarCard` (~151 lines) — Summary card: 0-100 health score headline (colored by band), description, rotary knob SVG (270° sweep, needle + fill arc), directional "Explore >" / "< Back" CTA. Active card gets accent border + top bar + glowing shadow; inactive siblings dim to 55% opacity + 0.97 scale. Hover: `bg-stone-50/50` background shift.
- `RadarChart` (~93 lines) — EQ-style segmented column chart (NOT a radar/spider chart despite the filename). 3 vertical columns (Fidelity, Lag, Autonomy) with 10 segments each. VU meter color ramp: stone-700 at bottom → warm-stone → ember-light → ember → red-600 at top. Unfilled segments at 40% opacity. Top filled segment gets colored glow. "100"/"0" scale markers on left edge.
- `PropagationDelay` — Lag visualization: horizontal bars per layer showing cumulative delay with quadratic acceleration. Blue→warm color gradient. "Removing 1 layer saves N days" annotation.
- `TorqueProfile` — Horizontal bar chart showing pivot efficiency by origin layer. CEO (lowest) to ICs (highest). Ember accent for CEO bar, warm-stone for others. Summary annotation with agility verdict.
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
- `calcThermalLag(levels, decisionCycle)` — totalDelay (d×(L-1)²), marginalLayerCost, lagRatio, per-layer delays
- `calcAutonomyScore(dci, levels)` — score (0-100), depthDiscount (log(3)/log(L)), crossoverFloor, label, color. DCI × depthDiscount, capped at 100.
- `calcBlendedScores(params)` — blends team-path (L_team=min(L,2), d_team=d×0.5) with hierarchy-path scores using teamDecisionMix (0-100). Returns blended pillar scores + deltas from monolithic baseline.
- `fidelityColor(percentage, semantic?)` — Monochrome: stone-300 → stone-900. Semantic mode: ember → stone-700.
- `metricColor(goodness)` — Maps 0-1 score to stone-700 (best) → ember (worst)
- `calcLagHealth(totalDelay)` — 0-100 health score: `100 × e^(-delay/100)`. Labels: Live (85+), Fresh (65-84), Aging (40-64), Stale (20-39), Expired (0-19)
- `healthBandColor(score)` — Maps 0-100 score to 5-tier color: stone-700 (85+), warm-stone (65-84), ember-light (40-64), ember (20-39), red-600 (0-19)

### Methodology Section
- Full visible section (not collapsible) with "pokemon card" style metric definition cards in responsive grid
- `MethodologySection` component wraps card grids + supplementary prose
- `MethodologyCard` component: category stripe (ember/warm-stone), badge pill, serif title, formula block, description
- `methodologyMetrics.tsx` data file: 13 typed `MetricDefinition` entries across categories: fidelity, latency, agility, supplementary
- Per-metric anchor IDs preserved (e.g., `#methodology-signal-fidelity`)
- Cards link via `infoHref` → shared `scrollToAnchor()` utility → smooth scroll

### Gotchas
- **Formulas live ONLY in Methodology** — no formula boxes in other sections
- **InputStrip + InteractiveFidelityDemo + SimulateSection write** to Zustand (levels) — PillarDashboard reads levels, headcount, fidelityRate, decisionCycle
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
- **Terminology rule**: "Depth" = structural count (sliders, UI text), "Layer" = relay/process ("per-layer fidelity", "each layer retains"). "Levels" = code variables only, never in UI text.
- **InputStrip is three tiers** — Tier 1: context bar (stone bg, collapsible Depth/Headcount), Tier 2: 4-col lever grid (ember, always visible), Tier 3: compare pills + share. Context bar expand controlled by `contextExpanded` store field (not persisted). Lever sliders get a 0.5s settle animation on company preset change via `@keyframes settle` in index.css.
- **PillarDashboard is 30/70 CSS grid** — `grid-cols-[3fr_7fr]`. Left column (`order-first`) = 3 PillarCards. Right column (`order-last`) swaps EQ chart ↔ expanded content. Detail panel uses `lg:absolute lg:inset-0` for height fill.
- **RadarChart is NOT a radar chart** — despite the filename, it renders EQ-style segmented columns. The name is historical. Don't add SVG spider/polygon logic.
- **PillarCard has a Knob sub-component** — inline SVG rotary knob (270° arc). Uses `score` prop (0-100 number) not `value` (string). Both must be passed from PillarDashboard.
- **FlippableMetricCards always render in More Metrics** — not gated by `expandedPillar`. The auto-open linkage was removed.
- **LayerDiagram `bottomUp`** — reverses render order (L0 at bottom). Used by GembaComparison only; CompanyCard uses default top-down.
- **Shareable URL uses query params** (`?l=9&h=150000&f=82&d=3`), NOT hash params — hash is reserved for section anchors
- **`applyUrlParams()` runs twice** — once at module scope (first-visit), once via `onRehydrateStorage` (overrides persist rehydration). This is intentional.
- **`expandedPillar` is NOT persisted** — always start at radar view (all collapsed) on reload.
- **Health scores are 0-100** — All 3 pillars show unified health scores with "/100" suffix on pillar cards. Signal Fidelity % IS the score natively. Lag converted via exponential decay (τ=100). Autonomy uses DCI × depth discount (log(3)/log(L)).
- **ScrollPage hash scroll** — 150ms `setTimeout` after mount to scroll to hash anchor. Needed because browser processes hash before React renders DOM.
- **ShapeSection + ShapeOverlay deleted** — Shape was removed from the section flow. `triangleGeometry.ts` and related types remain (used by ModelYourOrg for Pivot Speed/Shape Gap metrics).
- **Relay simulator uses no animation** — cards render instantly. Opacity fades via CSS `transition-opacity`. No framer-motion in RelayCard, RelayCascade, or SignalVerdictCard.
- **Collapsed relay cascade** — Origin + L1 always visible. Middle layers hidden behind "Show N more layers" expander. Verdict card always anchored at bottom.
- **`activeScenarioId` defaults to `'innovation-proposal'`** — simulator is never blank on load.
- **Scenario relay levels are hand-authored** — 5 scenarios × 8 levels each. Custom message engine (`applyRelayTransforms`) exists but is not currently wired to the UI.
- **Autonomy pillar uses DCI, NOT oscillator** — damped harmonic oscillator was removed. Autonomy score = DCI × depth discount (log(3)/log(L)). DCI slider (0-100) is a separate input from fidelity, breaking the prior Fidelity-Agility redundancy. See docs/TORQUE_MODEL.md and council-transcript-20260407-agility.md.
- **CONGESTION_GAMMA=0.1** is a module-level constant in `triangleGeometry.ts` — not exposed in UI or store. Per-hop fidelity adjusted as `r_eff = r × (1 - γ × n_k/N_max)`.
- **Slider labels renamed** — Signal Clarity (was Fidelity/Layer), Decision Speed (was Cycle Time), Decision Rights (was Authority), Team Autonomy (was Team Routing). All lever sliders use ember accent.
- **AuthoritySpectrum uses health band track** — 5-segment colored track (Expired→Live) at 35% opacity. "You" dot and company dots positioned by computed autonomy SCORE, not raw DCI. Dot has colored ring glow shadow.
- **Pillar expanded titles standardized** — All 3 panel titles rendered in PillarDashboard (not inside child components). Same class: `text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center mb-3`.
- **PillarCard delta prop exists but unused** — `delta?: number` is defined but not passed from PillarDashboard (removed per UX decision — scores reflect blend directly).

## Evals (Recursive Autoresearch)

Research loop for model exploration and hypothesis testing. Inspired by Karpathy autoresearch.

### Directory Structure
```
evals/
  orchestrator.sh       # Main loop: reads config → assembles prompt → calls claude -p → updates state
  config.json           # current_cycle, enrichment_level (sandbox/validated/full), model_params
  insights.md           # Accumulated findings across all cycles (long-term memory)
  prompts/
    system-prompt.md    # Research agent identity, scoring rubric, journal format template
    seed.md             # Research seeds (hand-written for C1, agent-generated after)
  journal/
    cycle-NNN.md        # Per-cycle findings (hypotheses, evidence, scores, compounding check)
  helpers/
    run-models.ts       # CLI bridge: npx tsx run-models.ts '{"fn":"calcOrgMetrics","args":{...}}'
    sweep.ts            # Sweep runner: --fn calcThermalLag --vary levels=2:10 --fixed decisionCycle=3
```

### Running a Cycle
```bash
./evals/orchestrator.sh        # Run next cycle (auto-reads current_cycle from config.json)
npm run eval                   # Same via npm
npm run eval:models -- '{"fn":"calcLagHealth","args":{"totalDelay":50}}'
npm run eval:sweep -- --fn calcThermalLag --vary levels=2:10 --fixed decisionCycle=3
```

### Enrichment Levels
- `sandbox` (cycles 1-2): model functions + parameter sweeps + 6 reference companies only
- `validated` (cycles 3-4): + web search to validate specific claims from prior cycles
- `full` (cycle 5+): + proactive web research, new company data, cross-domain analogies
Set manually in `evals/config.json` — does NOT auto-escalate.

### Gotchas
- **Guard prevents overwrite**: if `cycle-NNN.md` already exists, orchestrator exits with error
- **BSD sed on macOS**: use `awk` for multi-condition extraction, not sed with `{...}` groups
- **tsx required**: `npm install -D tsx` needed to run helpers directly

## Deployment
- GitHub Pages: [https://mattbayne83.github.io/shape-matters/](https://mattbayne83.github.io/shape-matters/)
- `public/_redirects` — SPA fallback (`/* /index.html 200`)
- `public/_headers` — Security headers (X-Frame-Options, etc.)

## Testing
- **Vitest 4** with separate `vitest.config.ts`
- 200 unit tests across 10 files in `src/lib/__tests__/`:
  - `orgMetrics.test.ts` — span, flatness, fidelity, managers, edge cases
  - `depthTax.test.ts` — signal, drift, latency, decision quality, formula verification
  - `triangleGeometry.test.ts` — layer distribution, shape gap, torque/agility, classification, restructuring
  - `fidelityColor.test.ts` — monochrome/semantic modes, clamping, HSL output
  - `signalRelay.test.ts` — transformation rules, cumulative application, truncation logic, scenario data integrity
  - `thermalLag.test.ts` — quadratic propagation delay, marginal cost, lag ratio, per-layer delays, edge cases
  - `healthScores.test.ts` — lag health (exponential decay), band colors, edge cases
  - `autonomy.test.ts` — DCI scoring, depth discount, crossover floor, band labels
  - `contextHints.test.ts` — slider context hint strings, boundary conditions
  - `blendedModel.test.ts` — team-path blending, delta calculations, edge cases

## Commands
```bash
npm run dev        # Vite dev server (HMR)
npm run build      # TypeScript check + Vite build
npm run lint       # ESLint
npm run test       # Vitest (single run)
npm run test:watch # Vitest (watch mode)
npm run preview    # Preview production build
npm run eval       # Run next autoresearch cycle (./evals/orchestrator.sh)
npm run eval:models -- '{"fn":"...","args":{...}}'  # Run a single model function
npm run eval:sweep -- --fn <fn> --vary <p=start:end> --fixed <p=v ...>  # Parameter sweep
```
