# org-shape — Shape Matters

## Product Vision
Open-source interactive diagnostic engine for understanding how organizational shape creates friction — and which realistic levers change it. Three pillars: **Fidelity** (information decay across layers), **Latency** (decision propagation delay), **Autonomy** (distribution of decision rights). Grounded in Bartlett (1932), Deming (1982), Toyota's Gemba Walk, and the Bloom–Van Reenen World Management Survey (~15k firms). A living model — the brief began as a two-channel essay; the product has evolved into a three-pillar diagnostic, with openness to additional physics/engineering principles (see `docs/PHYSICS_MODELS.md`) as they earn empirical anchoring.

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
- `src/lib/` — Pure calculation functions (orgMetrics.ts, depthTax.ts, triangleGeometry.ts, thermalLag.ts, autonomy.ts, blendedModel.ts, sensitivity.ts, fidelityColor.ts, healthScores.ts, signalRelay.ts, contextHints.ts, usePrefersReducedMotion.ts, styles.ts, scrollToAnchor.ts)
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
- `teamDecisionMix: number` (default 50, range 0-100) — blended model team-routing percentage. Default bumped from 0 to 50 post-Cycle 6 audit: the midpoint blend is a more realistic starting view than the monolithic worst-case.
- `activeScenarioId: string | null` (default `'innovation-proposal'`) — non-persisted
- `expandedPillar: 'fidelity' | 'lag' | 'autonomy' | null` (default null) — non-persisted
- `contextExpanded: boolean` (default false) — non-persisted, controls context bar expand/collapse
- ModelYourOrg + InteractiveFidelityDemo + SimulateSection write `levels`; other components read only
- Persist key: `org-shape-storage`
- `partialize` persists fidelityRate, levels, headcount, decisionCycle, dci, teamDecisionMix. Excludes activeScenarioId, expandedPillar, contextExpanded.
- `applyUrlParams()` reads `?l=&h=&f=&d=&ci=&tm=` from URL at module load + after `onRehydrateStorage`. URL params always override persisted state.
- `buildShareUrl()` builds `?l=&h=&f=&d=&ci=&tm=#model` URL from current state

### Data Model
- **15 reference companies** across **6 archetypes**: `flat`, `tech`, `flattened`, `self-managing`, `energy`, `command`
  - `flat`: Valve, Nucor, Morning Star
  - `self-managing`: Haier, Buurtzorg, Berkshire Hathaway
  - `tech`: Google, Amazon
  - `flattened`: Meta
  - `command`: GE (Welch), IBM (pre-Gerstner), Walmart, USPS, VA-VHA, Ford (pre-Mulally)
  - `energy`: (unused slot — preserved for future entries)
  - Historical-era companies (GE-Welch 1990-2001, IBM pre-Gerstner 1990-1993, Ford pre-Mulally 2001-2006) coexist with current-era entries. Components that need a "current deepest" should look up by id, not `REFERENCE_COMPANIES[length-1]` — Ford is deeper than Amazon at L=11.
- `Company` type includes `archetype`, `source`, `sourceUrl`, `dciSource` fields
- `DciSource`: `'case-study' | 'qualitative-estimate' | 'wms-sector'` — provenance tag per Cycle 9 H5. Ford is the first and only `wms-sector` entry (pegged to Bloom-Van Reenen US auto manufacturing mean).
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
- `ModelYourOrg` (~167 lines) — Layout orchestrator: InputStrip → PillarDashboard → **diagnostic row (BindingPillarCallout + LeverExchangeRates)** → What-If panel → More Metrics disclosure. The diagnostic row uses `grid-cols-[repeat(auto-fit,minmax(320px,1fr))]` so it collapses to a single column if one child is absent. More Metrics always contains 6 FlippableMetricCards (fidelity metrics) + 5 secondary MetricCards.
- `BindingPillarCallout` (~98 lines) — Always-visible diagnostic above the LeverExchangeRates. Two modes: **Bottlenecked** (pillar spread ≥ 10 points) names the weakest pillar in its accent color and the highest-impact lever; **Balanced** (spread < 10) uses warm-stone accent and acknowledges the balance while still pointing at the top marginal lever. Reads the store directly, uses `findBindingPillar()` from sensitivity.ts.
- `LeverExchangeRates` (~99 lines) — Pairwise lever substitution ratios ("+1 pt Signal Clarity ≡ +2.5 pt Team Autonomy") computed from live composite-health sensitivities. Hides rows where a ratio is non-finite (capped/inert levers). Shows a commitment-lever caveat footnote when any visible ratio touches Team Autonomy — per Cycle 7 H3, that slider is a commitment/feasibility lever, not a tradeoff lever.
- `InputStrip` — Three-tier layout. Tier 1: collapsible context bar (stone bg) with Depth + Headcount summary, "Edit" expands inline sliders (warm-stone accent). Tier 2: 4-column CSS grid of lever sliders (Fidelity, Cycle Time, Authority, Team Routing) all with ember accent — always visible, primary interaction. Tier 3: company preset pills ("Compare") + Share button. Company presets trigger a 0.5s settle animation (`@keyframes settle` in index.css) on changed lever wrappers. Custom slider CSS in `index.css` (`.custom-slider`): track fill gradient, 14px thumbs with white border + shadow, hover scale, focus ring.
- `PillarDashboard` (~220 lines) — 30/70 CSS grid layout: left column (3fr, `order-last lg:order-first`) shows 3 stacked PillarCards. Right column (7fr, `order-first lg:order-last`) swaps between EQ chart and expanded pillar content via AnimatePresence crossfade. **Mobile: detail panel renders ABOVE cards** so pillar tap updates the visible panel without scrolling off-screen; auto-scrolls into view on expand. Detail panel gets accent-colored left border (3px) when a pillar is expanded. One pillar expands at a time. Expanded panel titles standardized in PillarDashboard (not inside child components). Fidelity expanded = SignalCascade + RoundTripFidelity (side-by-side). Lag expanded = DotTimeline (propagation delay SVG). Autonomy expanded = AuthoritySpectrum (health band track with score-positioned company dots).
- `PillarCard` (~166 lines) — Summary card: 0-100 health score headline (colored by band), description, rotary knob SVG (270° sweep, needle + fill arc), directional "Explore >" / "< Back" CTA. Active card gets accent border + top bar + glowing shadow; inactive siblings dim to 55% opacity + 0.97 scale. Hover: `bg-stone-50/50` background shift. **Mobile: smaller knob (56px vs 72px), tighter padding, smaller score text.**
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
- `ComparisonView` — 6 companies in responsive grid (1→2→3 col)
- `CompanyCard` (~119 lines) — Pillar-score-first company card: header (name + era + context line), 3-cell pillar strip (Fidelity/Latency/Autonomy health scores + MiniEQ columns), round-trip fidelity punchline, narrative, source with external link. Computes all 3 pillar scores per company.
- `MiniEQ` (~41 lines) — 5-segment inline VU meter column. Same color ramp as RadarChart (stone-700 → ember). Top filled segment gets glow. Used in CompanyCard.

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
- `calcBlendedScores(params)` — blends team-path (L_team=min(L,2), d_team=d×0.5) with hierarchy-path scores using teamDecisionMix (0-100). Returns blended pillar scores + deltas from monolithic baseline. **Rounds at every step** for display — do NOT use this for derivatives, use `sensitivity.ts` helpers instead.
- **`sensitivity.ts` — shared engine for BindingPillarCallout + LeverExchangeRates.**
  - `computeScores(state)` — pillar scores + composite `(F+L+A)/3`, all as **raw continuous floats** (mirrors blended math but skips rounding so finite-difference derivatives don't get quantized to zero).
  - `calcLeverSensitivity(state, lever)` — `∂composite/∂lever` per +1 unit nudge. Sign-flipped for decisionCycle so "positive = better" across all levers. `atCap` flag honors the actual UI slider bounds.
  - `calcAllLeverSensitivities(state)` — same, all four levers, deterministic order.
  - `findBindingPillar(state)` — returns the lowest-scoring pillar, the **highest-impact lever across all four** (not just the primary lever for the lowest pillar — matters when a pillar is capped), the multiplier vs the 2nd-best lever, and `allTied` (true when pillar spread < 10).
  - `calcExchangeRates(state)` — three pairwise substitution ratios: fidelityRate↔teamDecisionMix, fidelityRate↔dci, decisionCycle↔teamDecisionMix. Inert/capped levers return `Infinity` and the UI hides those rows.
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
- **InputStrip is three tiers** — Tier 1: context bar (stone bg, collapsible Depth/Headcount), Tier 2: 4-col lever grid (ember, always visible), Tier 3: compare pills + share. Tier 3 uses `overflow-x-auto` with `shrink-0` items for mobile horizontal scroll. Context bar expand controlled by `contextExpanded` store field (not persisted). Lever sliders get a 0.5s settle animation on company preset change via `@keyframes settle` in index.css.
- **PillarDashboard is 30/70 CSS grid** — `grid-cols-[3fr_7fr]`. Cards column (`order-last lg:order-first`) = 3 PillarCards. Detail column (`order-first lg:order-last`) swaps EQ chart ↔ expanded content. Detail panel uses `lg:absolute lg:inset-0` for height fill. **On mobile, detail panel renders first (above cards)** so pillar explore/collapse is visible without scrolling. Auto-scrolls detail into view on pillar expand (mobile only).
- **RadarChart is NOT a radar chart** — despite the filename, it renders EQ-style segmented columns. The name is historical. Don't add SVG spider/polygon logic.
- **PillarCard has a Knob sub-component** — inline SVG rotary knob (270° arc). Uses `score` prop (0-100 number) not `value` (string). Both must be passed from PillarDashboard.
- **FlippableMetricCards always render in More Metrics** — not gated by `expandedPillar`. The auto-open linkage was removed.
- **LayerDiagram `bottomUp`** — reverses render order (L0 at bottom). Used by GembaComparison only.
- **CompanyCard no longer uses LayerDiagram** — redesigned with pillar scores + MiniEQ. Computes lag and autonomy scores internally using `company.decisionCycle` and `company.dci` (falls back to defaults 3 and 50).
- **MiniEQ segment count is fixed at 5** — no configurable `segments` prop. Color ramp is hardcoded to match RadarChart's first 5 of 10 VU segments.
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
- **BindingPillarCallout is always visible** — two modes gated by `allTied`, which is computed via the **theorem-backed binary rule** `scoreBand(min) === scoreBand(composite)` (Cycle 9 H2 + H4). When the min pillar and the composite share a band → balanced mode (warm-stone accent). When they differ → bottlenecked mode with the pillar's accent color. This is a strict refinement of the old `max−min < 10` threshold: it correctly catches Amazon's 8pt-gap false-Fresh case that the threshold missed. The theorem `band(min) ≤ band(mean)` (AM-min + band monotonicity) guarantees the min-band is never *higher* than the composite band, so band differences are always downward flips.
- **BindingPillarCallout picks the highest-impact lever across all four**, not just the primary lever for the lowest pillar. Matters when a pillar is capped — e.g., Amazon's autonomy is often the lowest pillar but DCI is a dead slider there because team-path autonomy saturates at 100 (Cycle 7 H2 + H3). Computing `topLever` globally keeps the recommendation correct.
- **`sensitivity.ts` computes raw continuous pillar scores**, bypassing the `Math.round` calls inside `calcBlendedScores`. Rounding quantizes 1-unit finite-difference derivatives to zero, which would break both BindingPillarCallout and LeverExchangeRates. The sensitivity engine mirrors the blend math but returns floats.
- **`LEVER_BOUNDS` in sensitivity.ts mirrors the actual InputStrip slider ranges** (fidelityRate 50-98, decisionCycle 1-14, dci 0-100, teamDecisionMix 0-100). Keep these in sync with the sliders so `atCap` detection matches what the user can actually push.
- **Team Autonomy is a commitment lever, not a tradeoff lever** (Cycle 7 H3 refutation) — the team path strictly dominates on all three pillars, so the optimal `teamDecisionMix` is always 100 in the current model. LeverExchangeRates surfaces this as a footnote caveat whenever a visible rate touches it. The real-world limit is governance feasibility, not score geometry. A future "team-path context penalty" (strategic-decision haircut) would restore this as a genuine tradeoff — see Cycle 7 seed #1.
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

### Cycle Status (as of 2026-04-10)
- **10 cycles complete** (C1–C10 in `evals/journal/`). Key results in `evals/insights.md`.
- **Cycle 6 H5**: `DCI = 25 × (WMS − 1)` linear mapping grounds DCI in the Bloom–Van Reenen World Management Survey (~15k firms).
- **Cycle 7 H2**: Amazon is "false-Fresh" (composite Fresh, fidelity Aging). Now resolved in code via the theorem-backed binary rule.
- **Cycle 7 H3 (refuted)**: Team path strictly dominates → `teamDecisionMix` is a commitment lever, not a tradeoff lever.
- **Cycle 8 → 9 → 10 convergent arc**: four separate mechanisms tested for breaking team-path strategic dominance (team-A tax, team-F tax, mono-F bonus, depth-stratified F tax). Every fidelity-only mechanism fails. **Autonomy, not fidelity, is the dominance mechanism.** The minimum viable fix is a joint mono F+A bonus for Strategy scenarios (`kF ≥ 5, kA ≥ 2.75`) — the "CEO-flat Strategy model" in Cycle 10 H1b. Depth-monotone flip cascade: Haier → Nucor → Meta → Google → Amazon.
- **Cycle 9 H4 + Cycle 10 H4**: `band(min) ≤ band(mean)` proven as a theorem and exhaustively verified on the full 1,030,301-triple integer grid (0 upflips). Codified in `findBindingPillar` via the `scoreBand(min) === scoreBand(composite)` rule.
- **Cycle 10 H3**: 4-of-6 band-flip count is calibration-stable — Nucor, Meta, Haier, Amazon flip under current DCIs. Amazon's 9pt gap is below any naive threshold but caught by the binary rule.
- **Cycle 10 open seed (HIGH)**: implement CEO-flat Strategy bonus in `blendedModel.ts` — first constructive mechanism in the Cycle 7→10 arc that survives all refutations.

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
- **223 unit tests across 11 files** in `src/lib/__tests__/`:
  - `orgMetrics.test.ts` — span, flatness, fidelity, managers, edge cases
  - `depthTax.test.ts` — signal, drift, latency, decision quality, formula verification
  - `triangleGeometry.test.ts` — layer distribution, shape gap, torque/agility, classification, restructuring
  - `fidelityColor.test.ts` — monochrome/semantic modes, clamping, HSL output
  - `signalRelay.test.ts` — transformation rules, cumulative application, truncation logic, scenario data integrity
  - `thermalLag.test.ts` — quadratic propagation delay, marginal cost, lag ratio, per-layer delays, edge cases
  - `healthScores.test.ts` — lag health (exponential decay), band colors, edge cases
  - `autonomy.test.ts` — DCI scoring, depth discount, crossover floor, band labels, + **Cycle 7 H4 structural invariants** (L=1/L=3 identity, DCI=0 → score=0, non-increasing in L for L≥3, 100-cap, L=1→L=2 lift for sub-cap DCIs)
  - `contextHints.test.ts` — slider context hint strings, boundary conditions
  - `blendedModel.test.ts` — team-path blending, delta calculations, edge cases
  - `sensitivity.test.ts` — computeScores raw-float math, finite-difference lever sensitivities, bounds-aware `atCap`, findBindingPillar (10pt threshold + topLever = argmax across all four), calcExchangeRates pairwise ratios + capped-lever handling

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
