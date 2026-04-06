# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

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
