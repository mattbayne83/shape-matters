# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Removed
- **`CONGESTION_GAMMA` and the per-hop congestion factor** (`src/lib/triangleGeometry.ts`) — Cycle 6 H4 proved <1.1pp impact at γ=0.1 on every reference company; mechanism deleted as zombie scaffolding pending empirical anchoring. The torque calculation now uses uniform per-hop retention `r^hops`. Congestion-γ back-fit seed removed from `evals/prompts/seed.md`. The `CONGESTION_GAMMA constant is 0.1` test and the "congestion reduces CEO torque" test were removed from `triangleGeometry.test.ts`; all remaining numeric assertions still pass without tolerance changes (test count 223 → 225 after earlier additions, all green).

### Docs
- **Theory brief, README, CLAUDE.md Product Vision rewritten** to reflect the evolved three-pillar diagnostic mission (was: two-channel persuasive essay on fidelity + latency). Adds Bloom–Van Reenen World Management Survey as the empirical anchor for the Autonomy pillar, introduces the "living model" framing (open to additional physics/engineering principles as they earn empirical grounding), and preserves the Triangle Geometry section as intellectual texture. CLAUDE.md `CONGESTION_GAMMA` gotcha and "Cycle 6 H4 inert" cycle-status line removed to match the code.

### Added
- **9 new reference companies** (N=6 → **N=15**) from parallel agent-led research passes, partially addressing Cycle 9 H5's "zero sector-calibrated references" audit.
  - **Self-managing cluster**: Morning Star (HBR 2011, HBS case 914-013), Buurtzorg (Springer 2024 peer-reviewed), Berkshire Hathaway (Stanford GSB, Cunningham & Cuba 2020)
  - **Command cluster** (bureaucratic counterweights): GE Welch-era (Gelles, Tichy & Sherman), IBM pre-Gerstner (Gerstner memoir, HBS), Walmart (Fishman, Lichtenstein), USPS (GAO reports), VA-VHA (Shulkin memoir + GAO), Ford pre-Mulally (Hoffman, WMS)
  - **Ford is the first `wms-sector`-anchored entry** — pegged to Bloom-Van Reenen US auto manufacturing mean (WMS ≈ 3.3 → DCI ≈ 57), adjusted down ~17pts based on Hoffman's documented pre-Mulally fiefdoms
  - Final DCI distribution: 7 at DCI≥70, 2 in 40-69, 6 at DCI<40 — bimodal with a thin middle
- **New `command` archetype** — "Deep hierarchy with centralized objective-setting, standardized processes, narrow frontline discretion on anything beyond task execution." Operational descriptor, not pejorative. Houses the 6 bureaucratic counterweights.
- **Renamed `experimental` → `self-managing`** — more honest label. Haier now `self-managing`. Joined by Buurtzorg and Berkshire Hathaway.
- **`scoreBand(score)` export** (`src/lib/healthScores.ts`) — returns the band label (`Live | Fresh | Aging | Stale | Expired`) for any 0-100 score. Used by the theorem-backed `findBindingPillar` binary rule and exposed to the eval helper.
- **`BAND_RANK` const** — integer ranks (4=Live → 0=Expired) used in the property-based band theorem test.
- **Exhaustive `band(min) ≤ band(mean)` theorem test** (`src/lib/__tests__/healthScores.test.ts`) — verifies the Cycle 9 H4 / Cycle 10 H4 theorem across 1331 coarse triples + 9261 fine triples + the canonical Amazon false-Fresh case. 0 violations. Locks the safety-floor invariant against regression.
- **`dciSource` field** on the `Company` type (`src/types/index.ts`) — provenance tag: `'case-study' | 'qualitative-estimate' | 'wms-sector'`. All 15 companies tagged. Per Cycle 9 H5 audit.
- **`calcBlendedScores`, `calcAutonomyScore`, `scoreBand` exposed in `evals/helpers/run-models.ts`** — Cycles 8/9/10 all had to inline blend math in temp scripts; the helper now covers the surface. Satisfies the Cycle 8 → Cycle 10 outstanding action item.
- **BindingPillarCallout** (`src/components/model/BindingPillarCallout.tsx`) — always-visible diagnostic above LeverExchangeRates with two modes: **Bottlenecked** (weakest pillar's band differs from composite band) names the weakest pillar + highest-impact lever; **Balanced** (bands match) acknowledges the balance and still points at the top marginal lever. Now uses the theorem-backed binary rule `scoreBand(min) === scoreBand(composite)` — a strict refinement of the earlier 10pt gap threshold, catching Amazon's 8pt-gap false-Fresh case that the threshold missed.
- **LeverExchangeRates** (`src/components/model/LeverExchangeRates.tsx`) — pairwise lever substitution ratios ("+1 pt Signal Clarity ≡ +2.5 pt Team Autonomy") from live composite-health sensitivities. Hides non-finite ratios (capped levers). Shows a commitment-lever footnote when any visible rate involves Team Autonomy — per Cycle 7 H3, the team path strictly dominates, so that slider is governance-feasibility bound, not a tradeoff.
- **Sensitivity engine** (`src/lib/sensitivity.ts`, 249 lines) — shared derivative math for BindingPillarCallout + LeverExchangeRates. Exports `computeScores` (raw continuous pillar scores, bypasses `Math.round` in blendedModel), `calcLeverSensitivity`, `calcAllLeverSensitivities`, `findBindingPillar`, `calcExchangeRates`. `LEVER_BOUNDS` mirror the actual InputStrip slider ranges (fidelityRate 50-98, decisionCycle 1-14) so `atCap` detection matches what the user can actually push.
- **Cycle 7 H4 autonomy structural invariants** (`src/lib/__tests__/autonomy.test.ts`) — 5 new tests locking: L=1/L=3 identity across all DCI, DCI=0 → score=0 at any depth, monotonically non-increasing in L for L≥3, 100-cap at any input, L=1→L=2 lift for sub-cap DCIs. Prevents future cycles from silently breaking the autonomy math.
- **Cycle 7 scratch file cleanup** — `evals/helpers/cycle7-experiments.ts` and `cycle7-h3.ts` removed; they were Cycle 7's in-flight research scratchpads and were tripping the full lint rule.
- **Blended decision model** (`src/lib/blendedModel.ts`) — team-path vs hierarchy blending with `teamDecisionMix` parameter (0-100%). Amazon at 70:30 blend = Fresh (74 HP) vs monolithic Expired (15 HP).
- **Team Autonomy slider** in Tier 2 lever grid — always visible alongside Signal Clarity, Decision Speed, and Decision Rights
- `teamDecisionMix` field on reference companies (Valve 0%, Nucor 60%, Google 50%, Meta 30%, Haier 80%, Amazon 70%)
- `?tm=` URL parameter for shareable team-routing state
- **Signal-decay congestion model** (engine internal) — `CONGESTION_GAMMA=0.1` in torque calculation, per-hop `r_eff = r × (1 - γ × n_k/N_max)`
- **MiniEQ component** (`src/components/model/MiniEQ.tsx`) — 5-segment inline VU meter column, same color ramp as RadarChart. Used in redesigned CompanyCard.
- **Research cycles 5, 6, and 7 complete** — `evals/journal/cycle-005.md`, `cycle-006.md`, `cycle-007.md`. Key findings: DCI variance is the sole F–A decorrelation mechanism (C5 H2), two-pizza blended model transforms Amazon from Expired to Fresh (C5 H3), WMS→DCI linear calibration (C6 H5), Amazon false-Fresh diagnosis (C7 H2), first refutation in 7 cycles — teamDecisionMix strictly dominates so it's a commitment lever (C7 H3).
- **23 new unit tests** (total: **223 across 11 files**) — sensitivity.test.ts (18) + autonomy C7 invariants (5)

### Changed
- **Proof section redesigned** — CompanyCard now leads with 3 pillar health scores (Fidelity/Latency/Autonomy) + mini EQ columns, round-trip fidelity punchline, narrative. Removed: LayerDiagram, Avg Span, Flatness, Manager Ratio, IC count, section labels.
- **AuthoritySpectrum intro animation** — health band segments wipe left→right, "You" dot bounces in, company dots stagger, metrics fade up. Keyframe names include inputs for restart on slider change. Respects `prefers-reduced-motion`.
- **Pillar category labels removed** — "Structure" and "Design Lever" labels above PillarCards deleted (redundant with card labels + EQ chart).
- **PillarCard knob uses single SVG** — CSS-sized container (`w-14 sm:w-[72px]`) with `width/height: 100%` SVG. Fixes duplicate filter ID bug that killed LED glow on mobile.
- **Mobile-responsive Model section** — PillarDashboard detail panel renders above cards on mobile (was below, off-screen); auto-scrolls into view on pillar expand. PillarCard tighter padding on mobile. What-If grid stacks single-column on small screens (was 2-col with orphan). InputStrip Tier 3 (compare pills) scrolls horizontally on narrow viewports.
- **InputStrip redesigned** as three-tier "org designer workbench": collapsed context bar (structure) → 4-column lever grid → benchmark presets. All lever sliders now use ember accent. Company presets highlight changed sliders with a 1.5s pulse animation. `advancedInputsOpen` renamed to `contextExpanded`.
- **DCI recalibration across all 6 reference companies** — post Cycle 5 H5 web research. Valve 95→92 (informal hierarchies temper ideology), Amazon 40→72 (Bryar & Carr two-pizza literature; strategic centralization caps at 72, not 80), Nucor 70→82 (Iverson "Plain Talk" + plant GM full P&L authority justify higher than the H5 lower bound), Google 65→58 (post-2020 bureaucratic drift), Meta 10→28 (engineering ICs retain meaningful technical autonomy below the Zuckerberg-centralized strategic layer), Haier 90→88 (well-supported, minor adjustment). Full methodology comment header added to `src/data/referenceCompanies.ts`.
- **Default `teamDecisionMix` bumped from 0 to 50** (`src/store/useCompanyStore.ts`) — post Cycle 6 UI audit. Old default dropped every user onto the monolithic worst-case view; Cycle 5 H3 proved that's a worst-case bound, not reality. Midpoint blend is a more honest first-load state.
- **`CONGESTION_GAMMA` docstring expanded** (`src/lib/triangleGeometry.ts`) — Cycle 6 H4 documents that at γ=0.1 the live impact is <1.1pp on CEO agility for all 6 companies. Kept as structural scaffolding; explicitly flagged "do NOT advertise as a live lever until back-fit against observed data."
- **BindingPillarCallout rule swapped from `gap < 10` → `scoreBand(min) === scoreBand(composite)`** (`src/lib/sensitivity.ts`) — Cycle 9 H2+H4, Cycle 10 H3+H4. The binary rule is a strict refinement of any numerical threshold: Amazon's 9pt gap is below any reasonable threshold but IS caught by the band-crossing rule. Backed by the `band(min) ≤ band(mean)` theorem (AM-min + band monotonicity), exhaustively verified on 1,030,301 integer triples (0 upflips).
- **`findBindingPillar` picks `topLever` globally**, not the primary lever for the lowest pillar — matters when a pillar is capped (e.g., Amazon's DCI is a dead slider because team-path autonomy saturates at 100). Old `primaryLever` + `primaryLeverImpact` fields removed from `BindingPillarResult`.
- **`LEVER_BOUNDS` in sensitivity.ts aligned to actual UI slider ranges** — was `fidelityRate: 0-100`, `decisionCycle: 0.5-10`; now `fidelityRate: 50-98`, `decisionCycle: 1-14`. Matches InputStrip so `atCap` flags fire at the real edges the user can reach.
- Model section subheading updated: "Structure determines fidelity and speed. Authority distribution is your lever."
- Torque calculation now uses per-hop congestion-adjusted fidelity (CEO torque ~10% lower for geometric distributions)
- **Slider labels renamed** for MECE intuitiveness: Fidelity/Layer → Signal Clarity, Cycle Time → Decision Speed, Authority → Decision Rights, Team Routing → Team Autonomy
- **InputStrip preset animation** changed from ember border pulse to 0.5s settle animation (scale bounce + opacity)
- **AuthoritySpectrum redesigned** with 5-segment health band track (Expired→Live), score-based positioning for all dots, prominent "You" indicator (24px dot with ring glow)
- **Pillar expanded panel titles standardized** — all rendered in PillarDashboard at consistent position, removed from DotTimeline, RoundTripFidelity, and AuthoritySpectrum
- **Context bar click target** expanded to full row width (was only "Edit" label)
- **Decision Speed tick marks** respaced: Fast (1d) / Moderate (4d) / Slow (10d) — fixes label collision
- Delta badges removed from pillar cards (scores reflect blend directly)

## [1.3.0] — 2026-04-08

### Added
- **Autonomy pillar** — replaces Response/Agility pillar with Decision-Centrality Index (DCI) model
  - `src/lib/autonomy.ts` — `calcAutonomyScore(dci, levels)`: DCI × depth discount (log(3)/log(L)), 0-100 health score
  - DCI slider (0-100, "Authority") in InputStrip with CEO-led/Balanced/Distributed tick marks
  - `?ci=` URL parameter for shareable DCI state
  - `dci` field persisted in Zustand store (default 50)
  - `AutonomyResult` type added to `src/types/index.ts`
  - `autonomy.test.ts` — 11 new unit tests (total: 189 across 9 files)
  - DCI values added to all 6 reference companies (Valve 95, Nucor 82, Google 58, Meta 28, Haier 88, Amazon 40)
- **Fidelity-Agility correlation fix** — DCI slider breaks the prior algebraic redundancy between Fidelity and Agility pillars (backlog item resolved via Option A)

### Changed
- Third pillar renamed from "Response" / "Agility" to "Autonomy" across all components
- `expandedPillar` union type updated: `'response'` → `'autonomy'`
- RadarChart columns: Fidelity, Lag, Autonomy (was Response)
- InputStrip now has 5 sliders in 3 groups (was 4 sliders in 2 groups)

## [1.2.0] — 2026-04-08

### Added
- **Recursive autoresearch eval system** (`evals/`) — CLI-based research loop for model exploration and hypothesis testing
  - `evals/orchestrator.sh` — main loop: assembles prompt, calls `claude -p`, updates state per cycle
  - `evals/helpers/run-models.ts` — CLI bridge to all 9 org-shape pure functions (JSON in, JSON out)
  - `evals/helpers/sweep.ts` — parameter sweep runner (markdown table or JSON, `--vary` + `--fixed` flags)
  - `evals/prompts/system-prompt.md` — research agent identity, scoring rubric, journal template
  - `evals/journal/` — per-cycle research journals (248-400+ lines each)
  - `evals/insights.md` — accumulated findings across cycles (auto-extracted Key Findings)
  - `evals/config.json` — cycle counter, enrichment level (`sandbox` → `validated` → `full`)
- **npm eval scripts**: `npm run eval`, `npm run eval:models`, `npm run eval:sweep`
- **tsx** added as dev dependency (required for TypeScript CLI helpers)
- **4 research cycles completed** (cycles 001-004) — 18 accumulated insights including:
  - Minimum viable fidelity rate formula: `0.05^(1/(2*(L-1)))`
  - Signal half-life formula: `h = log(2)/|log(r)|` (3.49 layers at 82%)
  - Effective Depth Ratio (EDR) metric: effective_layers/total_layers
  - Structural speed limit: `L_max = floor(1 + sqrt(16.25/d))`
  - McKinsey "3 layers for agile" independently validates the model's speed limit at d≥2

### Changed
- **Torque Profile visualization** — horizontal bar chart showing pivot efficiency by origin layer when Agility pillar is expanded. CEO bar in ember, others in warm-stone.
- **Slider tick marks** — reference points on Fidelity/Layer (Low trust 70%, Typical 82%, High trust 93%) and Cycle Time (Startup 2d, Tech 4d, Enterprise 7d)
- **Pillar card "/100" suffix** — health scores now show e.g. "23/100" to anchor the scale for users
- **Agility pillar model replaced** — damped harmonic oscillator removed (physics inverted for flat orgs); replaced by torque/fidelity model (Pivot Speed). agilityScore × 100 = health score. Flat orgs now correctly score ~97, deep bureaucracies ~27.
- **Input sliders reduced from 5 to 4** — Adaptability slider removed. Cycle Time retained for Latency pillar.
- **Dashboard-first layout** for Model Your Org: InputStrip (two rows) → 30/70 pillar cards/EQ chart split
- **Terminology standardized** — "Depth" for structural count in UI, "Layer" for relay process, "Levels" for code variables only
- EQ-style health chart (3 segmented columns) replaces radar/spider SVG
- Rotary knob indicators on PillarCards replace progress bars
- Company preset pills replace dropdown select
- `decisionCycle` field on reference companies (removed `culturalAgility`)
- 5 new methodology metric definitions (Lag + torque models)
- 76 new unit tests: thermalLag, healthScores, contextHints (total: 178)

### Removed
- **Damped harmonic oscillator** — `dampedResponse.ts`, `ChangeResponseTimeline.tsx`, `ThreeFutures.tsx` deleted
- **`culturalAgility` store field** — removed from Zustand store, URL params, Company type
- **`calcResponseHealth`** — removed from healthScores.ts

## [1.1.0] — 2026-04-05

### Added
- **Message Relay Simulator** (`#simulate` section) — 5 scenario-driven simulations (Safety, Customer, Innovation, Strategy, Operations) showing how messages distort through org levels with incentive annotations
- Signal relay transformation engine (`src/lib/signalRelay.ts`) with 6 progressive distortion tiers
- 5 hand-authored scenarios with 8 relay levels each (`src/data/scenarios.ts`)
- 23 new unit tests for relay engine + scenario data integrity (total: 124)
- Collapsed cascade UX: Origin + L1 visible by default, expandable middle layers, verdict card anchored
- Opacity fade on relay cards mirroring signal fidelity (floor 0.35)

### Changed
- **Section order** reordered for narrative flow: Problem → Simulate → Evidence → Proof → Model → Methodology
- Background alternation updated: stone-50 → white → stone-50 → white → stone-50 → white
- Zustand store now uses `partialize` to exclude `activeScenarioId` from persistence
- Innovation scenario selected by default (simulator never blank on load)

### Removed
- **Shape section** (`#shape`) — ShapeSection.tsx, ShapeOverlay.tsx, and 3 CSS keyframe animations deleted (544 lines)
- Custom message input (MessageInput.tsx) — regex engine produced inconsistent results vs hand-authored scenarios

## [1.0.0] — 2026-03-25

### Added
- Interactive fidelity demo with signal cascade visualization
- 6 reference companies across 5 archetypes (Valve, Nucor, Google, Amazon, Meta, Haier)
- Model Your Org calculator with 3 sliders, depth tax metrics, sensitivity sweep, restructuring impact
- Gemba Walk comparison visualization
- Methodology section with 11 metric definition cards
- Shareable calculator URLs via query params
- 101 unit tests across 4 calculation modules
- GitHub Pages deployment
