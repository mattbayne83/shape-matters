# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

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
