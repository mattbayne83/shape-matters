# Backlog

> See `docs/RESEARCH_IMPLICATIONS.md` for the full analysis behind these items.

## In Progress

**Cycle 8 autoresearch** — running in background as of 2026-04-09. Seeds focus on team-path context penalty (strategic-decision haircut to restore scenario-mix coupling) and variance-aware DCI store migration (`dciStrategic` + `dciOperational`).

## Next Up

### 🔴 High Priority

**Team-path context penalty**
Modify `calcBlendedScores` so the team path applies a DCI (or fidelity) haircut for "strategic" decisions — minimum fix to make `teamDecisionMix` a genuine tradeoff lever rather than a strict dominator. Cycle 7 H3 refutation showed the current team path wins on all three pillars simultaneously; adding a strategic-decision penalty would restore scenario coupling.
_Source: Research cycle 7 (refuted H3) → cycle 8 seed #1_

**Variance-aware DCI store migration**
Add `dciStrategic` + `dciOperational` to `useCompanyStore` (or replace scalar `dci` with a mean+spread representation). Cycle 7 H1 showed Amazon's composite drops 3.6 points under variance-aware DCI and its binding constraint shifts from fidelity to strategic autonomy — a second-order binding-pillar problem the current UI can't see.
_Source: Research cycle 7 H1 → cycle 8 seed #2_


### 🔴 High Priority

**Fidelity cliff + safety margin indicator**
Add a "Safety Margin" reading to the Fidelity pillar expanded view. Formula: `r_min = 0.05^(1/(2*(L-1)))`. Amazon at defaults is -0.8pp below the cliff. Show green/yellow/red band.
_Source: Research cycles 1, 2_

**Signal half-life "effective layers" display**
In the Fidelity pillar, show `h = log(2)/|log(r)|` (effective layers at >50% pivot efficiency) and the resulting broadcast zone. At 82%, h=3.49 — Amazon layers 4-9 are in the broadcast zone.
_Source: Research cycle 2_

### 🟠 Medium Priority

**Effective Depth Ratio (EDR) metric**
EDR = effective_layers / total_layers = h / L. Haier=100%, Amazon=39%. Simple, intuitive, orthogonal to existing pillars. Strong candidate for a new summary metric card.
_Source: Research cycle 3_

**Structural speed limit annotation on Lag pillar**
`L_max = floor(1 + sqrt(16.25/d))` — the max levels for "Live" lag health at a given cycle time. At d=3: L_max=3. Validated by McKinsey "3 layers for agile" and Amazon two-pizza team architecture. Show as annotation: "Live health requires ≤N levels at your current cycle time."
_Source: Research cycles 3, 4_

### 🟡 Low Priority

**Split What-If into Culture / Structure / Speed levers**
fidelityRate changes fix Fidelity+Agility only. Level changes fix all three. decisionCycle changes fix Lag only. These are non-overlapping levers — surfacing the difference would be instructive.
_Source: Research cycle 2_

**Restructuring exchange rate in the remove-a-level panel**
The exchange rate (fidelity gain per lag day saved) decays 49× from L=3 to L=9. At L=9, cycle-time reduction has 2.2× more lag ROI than restructuring. Show this ratio in the restructuring panel.
_Source: Research cycle 2_

**Reframe shape labels for L≥6**
For L≥6, every real org is classified "Diamond" — the label adds no information beyond depth. Either remove from UI at this depth or relabel as "Deep org."
_Source: Research cycle 1_

## Recently Added

- **BindingPillarCallout + LeverExchangeRates + `sensitivity.ts` engine** — Cycle 6/7 UI implementation: diagnostic row under the PillarDashboard. Binding pillar diagnostic is always visible with adaptive copy (Bottlenecked / Balanced modes, 10pt spread threshold). Lever exchange rates show pairwise substitution ratios with a commitment-lever footnote when Team Autonomy is involved. (2026-04-09)
- **Cycle 7 research** — variance-aware DCI, false-Fresh diagnosis, first refutation in 7 cycles (teamDecisionMix commitment lever), autonomy structural invariants locked. (2026-04-09)
- **Cycle 6 research** — WMS→DCI linear calibration, CONGESTION_GAMMA proven inert at γ=0.1, elasticity monotonic in depth, Meta governance-locked vs Amazon routing-curable 2×2. (2026-04-09)
- **Cycle 5 research** — DCI variance is the sole F-A decorrelation mechanism, two-pizza blended model framework. (2026-04-09)
- **Default `teamDecisionMix` bumped 0→50**, DCI recalibration across all 6 companies with a methodology comment header. (2026-04-09)
- Blended model with teamDecisionMix parameter (two-pizza model) (2026-04-09)
- v1.3.0: Autonomy pillar with DCI slider — fixes Fidelity-Agility correlation (Option A) (2026-04-08)
- Recursive autoresearch eval system (`evals/`) — cycles 1-4 complete (2026-04-08)
- v1.2.0: Torque Profile visualization, slider tick marks, dashboard-first layout
- v1.1.0: Message Relay Simulator (5 scenarios)
- v1.0.0: Initial release
