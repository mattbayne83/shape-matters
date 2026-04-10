# Living Seed Pool — Explore & Refine Lanes

> This file is the **living backlog** for the research loop. Unlike the previous version, it is read on **every cycle** (not just Cycle 1) and merged with seeds carried forward from the prior journal. Maintained by the human + main agent; updated when new candidates surface or old ones resolve.
>
> Keep entries terse. Full hypotheses are formed inside the cycle.

---

## How to use this file

- **Explore lane** = probes a physics/engineering principle *outside* the current three pillars (Fidelity, Latency, Autonomy) — either as a candidate fourth pillar or as a challenge to an existing one
- **Refine lane** = sharpens, calibrates, or empirically grounds what's already in the model
- **Priority**: HIGH / MED / LOW — based on leverage on the product mission, not difficulty
- Every cycle should attempt **at least one seed from each lane** unless a lane is justifiably empty
- When a seed resolves (confirmed / refuted / abandoned), move it to the resolved section at the bottom with a 1-line verdict

---

## Active Explore lane — principle candidates

Ranked by prima facie fit to org-shape's evolved mission. A "principle screen" cycle (Cycle 11) evaluates all candidates with short probes and promotes the top 2 to dedicated deep-dive cycles.

1. **[HIGH | Explore] Queueing theory (M/M/1, M/M/c) for manager bottlenecks.**
   Manager nodes are literally decision queues. Utilization `ρ = λ/μ` near 1 predicts unbounded wait time. Question: does a per-layer queue model predict *where* latency blows up (middle layers? top?) better than the uniform `d × (L-1)²` model? Deliverable: an M/M/1 sweep across the 15 reference companies, comparing predicted vs observed bottleneck locations. Sandbox-testable.

2. **[HIGH | Explore] Control theory — feedback delay and oscillatory instability.**
   Gemba Walk is a closed-loop controller. Classical result: feedback delay > ~π/(2ω_n) causes phase margin collapse and oscillation (policy whiplash). Question: does the Latency pillar's `d × (L-1)²` cross a stability threshold for deep orgs, predicting *oscillation* rather than just lag? Reference: Nyquist stability criterion. Sandbox-testable as a math probe.

3. **[HIGH | Explore] Information theory — Shannon channel capacity as a generalization of Bartlett decay.**
   Bartlett's 82% per-layer retention is a special case of a noisy channel with fixed SNR. The general form is `C = B · log₂(1 + S/N)`. Question: does treating fidelity as a bandwidth-limited channel predict why some messages (high-signal, low-bandwidth — e.g. safety alerts) survive more relays than others (nuanced strategy)? This would turn the Fidelity pillar from a scalar into a function of message complexity. Sandbox-testable with a toy SNR sweep.

4. **[MED | Explore] Dunbar / cognitive span-of-control limit.**
   Hard ceiling (~150 total relationships, ~7±2 direct reports per manager, Cowan 2001). Question: does imposing a Dunbar cap on span force a floor on levels that predicts which companies *can't* actually flatten further? Bounds the Autonomy pillar's lower-L edge. Needs one external citation (well-documented, no web search needed in sandbox).

5. **[MED | Explore] Conway's law — architecture mirrors communication structure.**
   "Organizations design systems that mirror their communication structure." Closest thing to a "shape → output quality" causal channel. Question: can org-shape's pillars predict which *kinds of products* a given shape ships successfully? Needs case study evidence; likely needs validated or full enrichment.

6. **[MED | Explore] Jackson networks — queueing generalized to a network of managers.**
   M/M/1 generalized. Predicts throughput collapse across the whole hierarchy, not just one node. Question: does the network-level stability criterion explain why some deep orgs (Amazon) function and others (late-stage bureaucracies) don't? Sandbox-testable as a math probe, but more complex than #1.

7. **[MED | Explore] Percolation / network connectivity.**
   When does an org lose connectivity? Classical percolation threshold in random graphs is `p_c = 1/⟨k⟩`. Question: does removing a fraction of relay nodes (manager turnover, reorg churn) predict catastrophic fidelity collapse at a threshold, not gradually? Sandbox-testable.

8. **[LOW | Explore] Thermodynamics — entropy of organizational state.**
   Speculative. If decision state has an entropy, layers might act as heat sinks. Could predict "freezing" (bureaucratization) as `ΔS → 0`. **Screen carefully — likely a metaphor rather than a mechanism.** Include in Cycle 11 screen only to demote it with evidence if it doesn't carry load.

---

## Active Refine lane — existing-pillar work

1. **[HIGH | Refine] Meta DCI recalibration.** Across Cycles 6–10, Meta is the only company whose binding constraint is DCI-locked autonomy (A=36 even at mix=70). `dciSource` is `qualitative-estimate`. Survey public sources (Year of Efficiency blog, SEC filings, Glassdoor aggregates, Levels.fyi L5-L7 banks) and propose a defensible range. Testable: does raising Meta's DCI from 28 to ~40 move band(min) from Stale to Aging? Enrichment: validated or full.

2. **[MED | Refine] CEO-flat Strategy bonus validation under scenario picker use.** The bonus is implemented in `blendedModel.ts` but has no UI surface yet. Before the scenario picker ships, walk the 15 reference companies under `scenarioWeights = { fidelity: 0.55, lag: 0.10, autonomy: 0.35 }` and verify the Cycle 10 H1b depth-monotone flip cascade reproduces under the full 15-company set (not just the original 6).

3. **[MED | Refine] Expose `scenarioWeights` in `evals/helpers/run-models.ts`.** Tooling gap flagged by the Cycle 11 dry run: `calcBlendedScores` accepts `scenarioWeights` in `src/lib/blendedModel.ts` but the eval helper doesn't surface it, so research agents can't probe the CEO-flat Strategy bonus via `npm run eval:models`. Small wrapper update; unblocks scenario-weighted cycles.

4. **[LOW | Refine] Second research pass for dataset gaps.** Agent research (2026-04-10) flagged: only 1 middle-band company besides Google/Ford; only 1 `wms-sector` entry (Ford); no non-Haier Chinese company; thin healthcare coverage. Would strengthen calibration but is not blocking.

---

## Closed arcs — do not re-open without new evidence

- **Cycle 7→10 team-path dominance arc** — closed 2026-04-10 by the CEO-flat Strategy bonus (`calcBlendedScores` now accepts `scenarioWeights`; when `fidelity >= 0.5`, mono F/A saturate to 100). Four cycles of failed fidelity-only fixes produced the insight that autonomy, not fidelity, is the dominance mechanism. Cycle 10 H1b's joint F+A mono bonus is the first constructive mechanism that survived all refutations.
- **`CONGESTION_GAMMA` back-fit** — deleted 2026-04-10. Cycle 6 H4 proved <1.1pp impact. Mechanism removed from `triangleGeometry.ts` as zombie scaffolding.
- **Log-form coordination cost correction** — refuted Cycle 4 H2 (inert for uniform distributions).

---

## Resolved seeds (graveyard)

_(Move resolved seeds here with a one-line verdict so the active list stays lean.)_

- [Cycle 6] **Bloom–Van Reenen WMS → DCI calibration** → confirmed (`DCI = 25 × (WMS − 1)`). Source: Cycle 6 H5.
- [Cycle 6] **Default `teamDecisionMix` sensitivity** → resolved (default bumped 0 → 50 post-Cycle 5 audit).
- [Cycle 10] **CEO-flat Strategy bonus implementation** → landed in `blendedModel.ts` 2026-04-10.
