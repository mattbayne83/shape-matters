# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- **Three Pillars: Lag + Response models** — two new physics-based models alongside existing Signal Fidelity
  - **Thermal Lag** (Pillar 2): Fourier-inspired quadratic propagation delay model (`thermalLag.ts`). Delay scales with L² — removing 1 layer from a 6-level org saves 27 days, not 3.
  - **Damped Response** (Pillar 3): Spring-mass-damper oscillator model (`dampedResponse.ts`). Classifies orgs as under-damped (overshoots), critically-damped (optimal), or over-damped (sluggish).
- **Health Scores** — unified 0-100 scoring for all 3 pillars (`healthScores.ts`)
  - **Lag Health**: exponential decay `100 × e^(-delay/100)` with "Signal Freshness" labels (Live → Expired)
  - **Response Health**: Gaussian `100 × e^(-((ζ-1)/0.65)²)` with dual "Vehicle Handling" labels (under-damped: Nimble/Twitchy/Fishtailing; over-damped: Steady/Lumbering/Dragging)
  - 5-tier color banding shared across all pillars: stone-700, warm-stone, ember-light, ember, red-600
- **EQ-style health chart** — 3 vertical segmented columns (Fidelity, Lag, Response) with VU meter color ramp (stone-700 → red-600), top-segment glow, 0/100 scale markers
- **Rotary knob indicators** on PillarCards — 270° SVG arc with needle showing 0-100 health score
- **Company preset pills** — 6 clickable company buttons replacing the dropdown select, with active state (dark pill)
- **Share button with feedback** — Share2 icon + "Copied" flash (green) replacing ambiguous link icon
- **Custom slider styling** — CSS `.custom-slider` class: track fill gradient, 14px thumbs with white border + shadow, hover scale, focus-visible ring
- **Visual bridge** — expanded pillar's accent color extends as 3px left border on the detail panel
- **Dashboard-first layout** for Model Your Org:
  - **InputStrip** — two-row layout: 5 sliders (grouped with dividers) + company pills + share
  - **30/70 split** — stacked pillar cards (left) + EQ chart / detail content (right)
  - **In-place expand** — clicking a pillar replaces EQ chart with detailed viz (no page jump)
  - **Explore/Back CTAs** — "Explore >" / "< Back" with correct directional chevrons
- **PropagationDelay** visualization: horizontal bars with quadratic acceleration
- **ChangeResponseTimeline**: SVG step-response curve with org-native labels (Mobilize → Overshoot → Correct → Align) and ghost reference curves
- **ThreeFutures** narrative cards: regime-aware stories with dynamic verdict sentence
- 2 new Zustand store inputs: `decisionCycle` (days/layer), `culturalAgility` (0-100)
- URL params extended: `&d=` (decision cycle), `&a=` (cultural agility)
- `decisionCycle` and `culturalAgility` fields on reference companies
- 5 new methodology metric definitions (2 Lag, 3 Response)
- 76 new unit tests: thermalLag, dampedResponse, healthScores, contextHints (total: 214)

### Changed
- **Model Your Org** restructured from hero slider + grouped cards to dashboard-first mixer layout
- PillarCard headlines now show 0-100 health scores (colored by band) instead of raw values; raw values moved to subtext
- PillarCard CTA changed from "← Details / → Back" to "Explore > / < Back" with hover bg-stone-50/50
- Fidelity metric cards (6 FlippableMetricCards) always visible in More Metrics section, not gated by fidelity expand
- ThreeFutures compacted: tighter padding, inline title + zeta range, smaller text for fixed-height container
- PropagationDelay removed redundant card wrapper (parent container provides the card)
- MetricDefinition category type extended: `'primary' | 'secondary' | 'lag' | 'response'`

### Removed
- Hero Levels slider (absorbed into InputStrip as one of 5 equal sliders)
- Structure/Dynamics grouped input cards (replaced by two-row InputStrip with dividers)
- "Advanced inputs" desktop toggle (all inputs always visible)
- Radar/spider SVG chart (replaced by EQ segmented columns)
- Preset dropdown select (replaced by pill buttons)
- Progress bars on PillarCards (replaced by rotary knobs)

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
