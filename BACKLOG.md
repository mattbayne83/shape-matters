# Backlog

> See `docs/RESEARCH_IMPLICATIONS.md` for the full analysis behind these items.

## In Progress

_Cycles 8–10 complete as of 2026-04-10. No active cycle._

## Next Up

### 🔴 High Priority

**CEO-flat Strategy bonus — the first constructive mechanism**
Cycles 7→10 ran four separate mechanisms for breaking team-path strategic dominance. Every fidelity-only mechanism failed. Cycle 10 H1b identified the minimum viable fix: a joint mono-path F+A bonus (`kF ≥ 5, kA ≥ 2.75`) applied only when Strategy-weighted. Cleaner reformulation: for Strategy scenarios, set `monoF ← 100` and `monoA ← 100` directly ("CEO-flat Strategy model"). Produces a clean bimodal scenario optimum with a depth-monotone flip cascade (Haier → Nucor → Meta → Google → Amazon). Add an optional `scenarioWeights` parameter to `calcBlendedScores`, implement the bonus, verify all 6 original reference companies' Strategy optima flip to mix ≤ 70 while Operational optima stay at mix = 100.
_Source: Cycle 10 H1b (the first constructive result of the Cycle 7→10 arc)_

**Meta DCI recalibration**
Across Cycles 6–10, Meta is the only company whose binding constraint is DCI-locked autonomy (A=36 even at mix=70). `dciSource` is `qualitative-estimate`. Survey public sources (Year of Efficiency, SEC filings, Glassdoor, Levels.fyi L5-L7 interview banks) and propose a defensible range. Testable: does raising Meta's DCI from 28 to ~40 move band(min) from Stale to Aging?
_Source: Cycle 10 seed #2_

### 🟠 Medium Priority

**`band(min)` PillarDashboard prototype behind a feature flag**
Cycle 10 H3 showed the rule is calibration-stable; Cycle 10 H4 proved it's a hard safety floor. One-line change in PillarDashboard: use `scoreBand(min(F,L,A))` for the headline band color + label instead of `scoreBand((F+L+A)/3)`. Ship behind a feature flag and walk all 15 reference companies to validate the UX. Under this rule, 4 of the original 6 flip downward: Nucor (Live → Fresh), Haier (Live → Fresh), Meta (Aging → Stale), Amazon (Fresh → Aging). All 4 are downward flips, all are theoretically correct per the Cycle 10 H4 theorem.
_Source: Cycle 9 seed #3 → Cycle 10 seed #3_

**Surface `dciSource` in Methodology + CompanyCard**
The data field exists for all 15 companies. UI disclosure remains. Show the tag (`Case study` | `Qualitative estimate` | `WMS sector`) as a subtle badge next to each company's DCI value in CompanyCard, plus a one-paragraph note in the Methodology Autonomy card. Epistemic hygiene for the published framework.
_Source: Cycle 10 seed #5_

**Second research pass for dataset gaps**
Agent-led research flagged 4 remaining gaps for a future cycle: (1) only 1 middle-band company besides Google/Ford — a Southern European manufacturer or US hospital system would strengthen mechanism-probing; (2) only 1 `wms-sector` entry (Ford) and 1 partial (MHI deferred) — Cycle 9 H5 audit only partially addressed; (3) no non-Haier Chinese company; (4) healthcare is thin — a US hospital system in the middle band would bridge Buurtzorg (high DCI) and VA-VHA (low).
_Source: Agent research 2026-04-10_

**Deferred candidates from agent research**
- **Toyota** — deferred pending variance-aware DCI architecture. Bimodal structure (operational DCI ≈ 85, strategic DCI ≈ 25) would be hidden under a single scalar DCI.
- **Deutsche Bank, Mitsubishi Heavy Industries, GE-Immelt** — MEDIUM confidence, deferred pending better operational-authority data or a second research pass.
- **Spotify** — LOW confidence, published sources directly contradict (Kniberg 2012 vs. Lee 2020 vs. Kniberg's disavowal). Requires a project-level decision on whether to represent "stated models" as a separate category.
_Source: Agent research 2026-04-10_


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

- **9 new reference companies (N=6 → N=15)** from agent-led research. Self-managing cluster: Morning Star, Buurtzorg, Berkshire. Command cluster (bureaucratic counterweights): GE-Welch, IBM pre-Gerstner, Walmart, USPS, VA-VHA, Ford pre-Mulally. Ford is the first `wms-sector`-anchored DCI. New `command` archetype added. `experimental` renamed to `self-managing`. (2026-04-10)
- **BindingPillarCallout swapped to theorem-backed binary rule** `scoreBand(min) === scoreBand(composite)` — strict refinement of the old 10pt threshold. Catches Amazon's 8pt-gap false-Fresh case the threshold missed. Backed by exhaustive 1.03M-triple theorem verification. (2026-04-10)
- **Cycles 8–10 complete.** Cycle 8 proved H2 false-Fresh extends to 4-of-6 companies. Cycle 9 proved `band(min) ≤ band(mean)` as a theorem. Cycle 10 H1b identified the CEO-flat Strategy model as the first constructive mechanism in the Cycle 7→10 arc. (2026-04-09 to 2026-04-10)
- **`dciSource` field + theorem-locked unit test** — epistemic provenance tags for DCI values; property-based test on 9000+ triples locks the band safety floor. (2026-04-10)
- **BindingPillarCallout + LeverExchangeRates + `sensitivity.ts` engine** — Cycle 6/7 UI implementation: diagnostic row under the PillarDashboard. (2026-04-09)
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
