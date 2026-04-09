# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- **Blended decision model** (`src/lib/blendedModel.ts`) — team-path vs hierarchy blending with `teamDecisionMix` parameter (0-100%). Amazon at 70:30 blend = Fresh (74 HP) vs monolithic Expired (15 HP).
- **Team Autonomy slider** in Tier 2 lever grid — always visible alongside Signal Clarity, Decision Speed, and Decision Rights
- `teamDecisionMix` field on reference companies (Valve 0%, Nucor 60%, Google 50%, Meta 30%, Haier 80%, Amazon 70%)
- `?tm=` URL parameter for shareable team-routing state
- **Signal-decay congestion model** (engine internal) — `CONGESTION_GAMMA=0.1` in torque calculation, per-hop `r_eff = r × (1 - γ × n_k/N_max)`
- **Pillar category labels** — "Structure" above Fidelity + Lag, "Design Lever" above Autonomy
- 11 new unit tests (total: 200 across 10 files)

### Changed
- **InputStrip redesigned** as three-tier "org designer workbench": collapsed context bar (structure) → 4-column lever grid → benchmark presets. All lever sliders now use ember accent. Company presets highlight changed sliders with a 1.5s pulse animation. `advancedInputsOpen` renamed to `contextExpanded`.
- DCI recalibrated: Valve 95→92 (informal hierarchies), Amazon 40→72 (Bryar & Carr literature)
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
