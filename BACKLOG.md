# Backlog

> See `docs/RESEARCH_IMPLICATIONS.md` for the full analysis behind these items.

## In Progress

_Nothing active._

## Next Up

**Research pause** — Council recommends validation (adversarial case study) or UI work over further engine refinement (2026-04-09).

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

- Blended model with teamDecisionMix parameter (two-pizza model) (2026-04-09)
- v1.3.0: Autonomy pillar with DCI slider — fixes Fidelity-Agility correlation (Option A) (2026-04-08)
- Recursive autoresearch eval system (`evals/`) — cycles 1-4 complete (2026-04-08)
- v1.2.0: Torque Profile visualization, slider tick marks, dashboard-first layout
- v1.1.0: Message Relay Simulator (5 scenarios)
- v1.0.0: Initial release
