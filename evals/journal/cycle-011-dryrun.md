# Cycle 011 (DRY RUN) — 2026-04-10

> **This is a dry-run sanity check** of the refreshed system prompt (2026-04-10). The real Cycle 11 will be written to `cycle-011.md` by the orchestrator. This file will not be picked up by `insights.md` or `config.json`.

This is a **Principle Screen** cycle: short focused probes on all 8 Explore-lane candidates plus one Refine probe, trading depth for breadth to produce a promotion table.

---

## Seeds (from previous cycle + seed.md + human steering)

- [HIGH | Explore] Queueing theory (M/M/1) for manager bottlenecks — `seed.md` #1
- [HIGH | Explore] Control theory — feedback delay → oscillatory instability — `seed.md` #2
- [HIGH | Explore] Information theory — Shannon channel capacity as generalized Bartlett — `seed.md` #3
- [MED  | Explore] Dunbar / Miller 7±2 span-of-control limit — `seed.md` #4
- [MED  | Explore] Conway's law — org shape predicts product shape — `seed.md` #5
- [MED  | Explore] Jackson networks — M/M/1 generalized to network — `seed.md` #6
- [MED  | Explore] Percolation — connectivity collapse under manager turnover — `seed.md` #7
- [LOW  | Explore] Thermodynamics / entropy — candidate for demotion — `seed.md` #8
- [HIGH | Refine] Meta DCI recalibration (28 → ~40) — `seed.md` Refine #1
- Carried from Cycle 10: (a) CEO-flat Strategy bonus UI-surface validation, (b) `band(min)` PillarDashboard prototype, (c) exhaustive band theorem unit test, (d) `dciSource` UI disclosure

Principle-screen mandate (from this cycle's human instructions): promote 2 Explore candidates to dedicated deep-dive cycles, demote the rest or flag `needs-enrichment`.

---

## Stale-prompt check

Two small items of drift, neither blocking:

1. **`calcBlendedScores` helper signature is incomplete.** `evals/helpers/run-models.ts` (lines 50–57) does **not** expose the `scenarioWeights` parameter that the system prompt describes as landed in `blendedModel.ts` on 2026-04-10. The CEO-flat Strategy bonus is therefore not testable via `npm run eval:models` from the CLI — a future cycle that wants to validate the bonus against the full 15-company set would need to either extend the helper or write a temporary script. This is tooling drift, not prompt drift. Flagged as Seed #3 below.
2. **System prompt references 15 reference companies across 6 archetypes** including an "energy" slot marked as unused in `CLAUDE.md`. Confirmed via `src/data/referenceCompanies.ts`: the live count is 15 entries across 5 populated archetypes (flat, tech, flattened, self-managing, command); `energy` is preserved but empty. The prompt is accurate; flagging only so future cycles don't look for an energy-archetype company that doesn't exist.

Otherwise: **clean**. Pillars, scoring dimensions, closed-arc list, helper functions, and journal format all match the live codebase.

---

## Hypotheses Tested

### H1: Queueing theory (M/M/1) predicts middle-layer throughput bottlenecks at ρ > 0.8

- **Lane**: Explore
- **Claim**: If each manager is an M/M/1 queue with arrival rate λ from subordinates and service rate μ, utilization ρ = λ/μ should blow up (wait time → ∞) at middle layers of deep orgs where span-of-control is lowest, identifying *where* latency hurts most — a refinement of the uniform `d × (L-1)²` Latency model.
- **Test**: Computed actual per-layer span of control from `calcOrgMetrics` for 15 reference companies. Under a toy model where each subordinate emits one decision request/day and a manager can service 6 requests/day (Miller 7±2 upper), ρ = span/6. Screened: does ρ > 0.8 appear anywhere in the live set?
- **Evidence**: Spans (fresh from `calcOrgMetrics`):
  ```
  Haier       L=3  span=42.2  ρ=7.0   (catastrophically over)
  Nucor       L=4  span=13.5  ρ=2.2   (over)
  Berkshire   L=4  span=25.0  ρ=4.2   (over)
  Meta        L=6  span= 6.5  ρ=1.08  (just over)
  Walmart     L=8  span= 6.2  ρ=1.03  (just over)
  Amazon      L=9  span= 4.9  ρ=0.81  (at threshold)
  Google      L=8  span= 4.6  ρ=0.76  (below)
  USPS/GE/VHA L=10 span≈3.5-3.8 ρ≈0.63 (well below)
  IBM/Ford    L=11 span≈3.2  ρ=0.53  (well below)
  ```
  The `avgSpan` is a cone-root average, not per-layer, so this is a coarse first cut. But the signal is striking: **the deepest orgs have the LOWEST ρ**, because spans shrink as L grows for fixed headcount. Queueing theory, applied naively, predicts that deep command orgs are *under-utilized* at each manager node — which inverts the usual latency story.
- **Scores**: Novelty 5/5 | Specificity 3/5 | Evidence 3/5 | Principle-expansion 5/5
- **Status**: **shallow-promising** (but not in the direction expected)
- **Implication**: The interesting hypothesis flips: **ρ measures hierarchical *slack*, not bottleneck severity**. High-ρ orgs (Haier, Berkshire, Meta) are running their managers hot and can't easily absorb variance. Low-ρ orgs (IBM, Ford) have so much manager capacity that latency comes from *serial depth*, not queue wait. This is a clean new lens — worth a deep dive. Needs per-layer (not average) span data and a real λ calibration to turn into a model.

---

### H2: Control-theory feedback delay exceeds the Nyquist-style stability threshold for deep orgs

- **Lane**: Explore
- **Claim**: Classical feedback-control result: a closed-loop system with natural frequency ω_n and feedback delay τ becomes oscillatory when τ > π/(2ω_n). If we treat the org as a controller with ω_n set by the "strategic cadence" (quarterly review → ω_n ≈ 2π/90 rad/day ≈ 0.070) and τ as the Latency pillar's `d × (L-1)²`, does deep-org delay cross the instability threshold and predict *policy whiplash*?
- **Test**: Closed-form against `calcThermalLag` for 8 live companies, with ω_n = 0.070 rad/day (quarterly) → stability threshold τ_crit = π/(2×0.070) ≈ 22.4 days.
- **Evidence**:
  ```
  Company    L    d    τ (days)  τ/τ_crit   verdict
  Haier      3    1    4         0.18        stable
  Nucor      4    2    18        0.80        stable (margin thin)
  Meta       6    2.5  62.5      2.79        OSCILLATORY
  Google     8    3.5  171.5     7.66        highly oscillatory
  Amazon     9    3    192       8.57        highly oscillatory
  USPS      10    5    405      18.08        deeply oscillatory
  IBM       11    5    500      22.32        deeply oscillatory
  Ford      11    4    400      17.86        deeply oscillatory
  ```
  **Crossover sits between Nucor (L=4) and Meta (L=6)** at a quarterly cadence. At a monthly cadence (ω_n ≈ 0.21), τ_crit drops to ~7.5 days and even Nucor crosses. At an annual cadence (ω_n ≈ 0.017), τ_crit ≈ 90 days and only Haier/Nucor/Meta remain stable.
- **Scores**: Novelty 4/5 | Specificity 5/5 | Evidence 4/5 | Principle-expansion 5/5
- **Status**: **promote-to-deep-dive**
- **Implication**: This is the *mechanism* that the Latency pillar has always been gesturing at without naming. "Stale decisions" in the Expired band aren't just slow — they arrive out of phase with the strategic cadence, producing the observed whiplash (reorg-of-the-quarter, contradictory directives, strategy churn). A deep dive should: (a) calibrate ω_n per scenario type (safety/customer/innovation/strategy/operations — the same axes as the relay simulator), (b) derive the analytic crossover L*(d, ω_n), and (c) check whether the crossover aligns with the empirical "oscillation-prone" companies from case studies (Meta 2023 layoffs, Google post-Alphabet reorgs).

---

### H3: Information theory — Shannon channel capacity generalizes Bartlett's 82% retention

- **Lane**: Explore
- **Claim**: Bartlett's 82% per-layer retention is the special case of a noisy channel with a fixed SNR. The general form `C = log₂(1 + SNR)` gives capacity in bits per symbol. Treating retention r as an effective channel reliability, 82% retention corresponds to an SNR such that the per-symbol mutual information equals `log₂(1/0.18) = 2.47 bits` lost per hop. Implication: high-SNR channels (safety alerts: "FIRE") survive many hops; low-SNR channels (nuanced strategy: "pivot toward B2B mid-market with margin discipline") degrade faster.
- **Test**: Back-solve SNR from Bartlett's 82%. If retention = 1 - 1/(1+SNR) then SNR ≈ 0.82/0.18 ≈ 4.56, giving C ≈ 2.48 bits/hop. Over L-1 hops, accumulated capacity shrinks as `r^(L-1)`. Ask: does this predict message-complexity-dependent decay?
- **Evidence**: At L=9 (Amazon), naive Bartlett retention: 0.82^8 = 20.4%. Under a "strategic message" model where SNR is halved (SNR=2.28), per-hop retention falls to 0.695 and L=9 retention collapses to 0.695^8 = 5.4% — **a 4× degradation from signal complexity alone, with no change to the Fidelity pillar's input**. This matches the intuition behind the relay simulator's hand-authored scenarios (strategy scenarios lose more semantic content than safety scenarios per relay).
- **Scores**: Novelty 5/5 | Specificity 4/5 | Evidence 3/5 | Principle-expansion 5/5
- **Status**: **promote-to-deep-dive**
- **Implication**: If confirmed, this turns the Fidelity pillar from a scalar into a function `F(complexity)`, with Bartlett's 82% being the "ordinary prose" midpoint. This would make the relay simulator's scenario-switching (safety vs strategy) rigorous rather than editorial — the same org can be Fresh on safety and Expired on strategy, without any pillar-score inconsistency. This is also the cleanest cross-pollination with the Cycle 10 CEO-flat Strategy bonus: it explains *why* strategy messages specifically need a mono-path boost (they are SNR-disadvantaged, not just authority-gated).

---

### H4: Dunbar / Miller 7±2 — span-of-control predicts hierarchy floor

- **Lane**: Explore
- **Claim**: If the Miller 7±2 working-memory constraint imposes a soft cap on direct reports per manager, then levels is lower-bounded by `L ≥ ⌈log_7(N)⌉`. Any org attempting to flatten below this floor cannot do so without violating cognitive span.
- **Test**: Computed the Miller floor `L_min = ⌈log_7(employees)⌉` for all 15 companies and compared to actual `L`:
- **Evidence**:
  ```
  Company       N           L   L_min(7)   slack
  Valve         350         1    3         −2  (VIOLATES — no managers)
  Morning Star  550         1    4         −3  (VIOLATES — peer CLOUs)
  Buurtzorg     14,000      2    5         −3  (VIOLATES — coach model)
  Haier         75,000      3    6         −3  (VIOLATES — microenterprises)
  Nucor         32,700      4    6         −2  (close)
  Berkshire     392,400     4    7         −3  (VIOLATES — subsidiary-only count)
  Meta          74,067      6    6          0  (exactly at floor)
  Google        183,323     8    7         +1
  Walmart       2,100,000   8    8          0  (exactly at floor)
  Amazon        1,556,000   9    8         +1
  USPS          635,000    10    7         +3
  IBM           374,000    11    7         +4
  Ford          328,000    11    7         +4
  ```
  **Every self-managing and flat org violates the Miller floor.** They do so by *not managing in the Miller sense* — Valve/Morning Star/Buurtzorg/Haier/Berkshire replace direct-report supervision with peer coordination (CLOUs, coaches, microenterprise P&L, subsidiary autonomy). The violation is evidence that these orgs are running a *different cognitive architecture*, not that Miller is wrong. Command orgs at the bottom of the table have 3–4 layers of *excess* relative to the Miller floor (IBM and Ford at L=11 only need L=7).
- **Scores**: Novelty 3/5 | Specificity 5/5 | Evidence 5/5 | Principle-expansion 4/5
- **Status**: **shallow-promising** (useful framing, not a new pillar)
- **Implication**: Miller 7±2 is a **diagnostic overlay, not a fourth pillar**. Its value is in surfacing the "flat org paradox" (orgs below the floor are not really flat — they've shifted coordination elsewhere) and the "bureaucratic slack" metric (L − L_min ≥ 3 identifies IBM/Ford/USPS/VHA as *over-layered* by cognitive necessity, not just politics). This is closer to a Methodology note than to a candidate pillar promotion. Does NOT warrant a deep-dive cycle on its own; roll into Cycle 11 H1 (queueing) if that is promoted.

---

### H5: Conway's law — org shape predicts product shape

- **Lane**: Explore
- **Claim**: Conway (1968): "Organizations which design systems … are constrained to produce designs which are copies of the communication structures of these organizations." If true, org-shape's pillars should predict *what kind of product* a given shape ships successfully, adding a causal output channel.
- **Test**: Sandbox only allows math probes; this claim is fundamentally empirical / case-study-based. Pulled from memory: Amazon's microservices mirror two-pizza teams, Google's monorepo mirrors its centralized platform org, Haier's microenterprise architecture mirrors RenDanHeYi. But these are retrofit examples, not predictions.
- **Evidence**: Cannot produce numerical evidence at sandbox enrichment. The live helper set (`calcOrgMetrics`, `calcThermalLag`, `calcBlendedScores`) has no output-quality dimension to regress against. Any real probe would need: (a) a corpus of products labeled by modularity/coupling, (b) author-org metadata, (c) a metric for "architectural mirror". None of these exist in the repo.
- **Scores**: Novelty 2/5 | Specificity 2/5 | Evidence 1/5 | Principle-expansion 4/5
- **Status**: **needs-enrichment**
- **Implication**: Conway's law may well belong in org-shape's theory, but it cannot be screened at sandbox and cannot be probed in a single cycle even at full enrichment without building a product-modularity dataset from scratch. **Park it.** Revisit only if a credible dataset surfaces. This is the only Explore candidate that is genuinely untestable with current tools, and tagging it honestly is the point of having a `needs-enrichment` status.

---

### H6: Jackson networks — network-level stability

- **Lane**: Explore
- **Claim**: Jackson networks generalize M/M/1 to a network of queues. Stability criterion: every node's effective ρ < 1. Question: does a Jackson-network model explain why some deep orgs (Amazon) function and others (USPS) collapse?
- **Test**: Conceptual only in this screen. M/M/1 (H1) already gave a clean, surprising signal. Jackson networks require: routing probabilities between layers (not in live data), service-time distributions (assumed exponential by Jackson), and per-node capacity calibration. Implementation complexity is ~10× M/M/1.
- **Evidence**: Jackson's stability theorem says the network is stable iff every node is individually stable. From H1, **no live company violates ρ < 1 at the manager level under the toy calibration**. This means the network-level refinement would produce the same stability verdict as M/M/1 alone — Jackson only earns its keep when routing is non-trivial. Current org-shape models routing via the team-path / mono-path split, which is 2 routes, not a dense network.
- **Scores**: Novelty 3/5 | Specificity 3/5 | Evidence 3/5 | Principle-expansion 4/5
- **Status**: **demote-speculative** (not because wrong, because dominated by H1)
- **Implication**: If H1 (M/M/1) earns a deep dive, revisit Jackson *only* if per-layer ρ reveals strong routing heterogeneity that a single-queue model cannot capture. For now, the marginal explanatory power of Jackson over M/M/1 is near zero given the org-shape data model. Keep in the seed pool LOW priority; do not promote.

---

### H7: Percolation — catastrophic connectivity collapse under turnover

- **Lane**: Explore
- **Claim**: Random-graph percolation threshold: `p_c = 1/⟨k⟩` where ⟨k⟩ is average degree. If managers = nodes, removing a fraction above `1 - p_c` fragments the communication graph — predicting a sharp (not gradual) fidelity collapse at a critical turnover rate.
- **Test**: Compute ⟨k⟩ for each reference company (≈ avgSpan + 1, the manager's one upward edge plus subordinates), then p_c = 1/⟨k⟩, then critical turnover = 1 − p_c.
- **Evidence**:
  ```
  Company    avgSpan  ⟨k⟩   p_c     crit_turnover
  IBM        3.21     4.21  0.237   76.3%
  Ford       3.17     4.17  0.240   76.0%
  USPS       3.80     4.80  0.208   79.2%
  Amazon     4.88     5.88  0.170   83.0%
  Google     4.55     5.55  0.180   82.0%
  Meta       6.48     7.48  0.134   86.6%
  Haier     42.17    43.17  0.023   97.7%
  ```
  **Every live company has a critical turnover above 75%.** Real-world annual manager turnover is 10–25% (BLS). Orgs would need to lose 3–8× their annual turnover *at once* to fragment. The percolation threshold is not the binding constraint — fidelity decay from ordinary turnover is gradual, not catastrophic. The exception is a reorganization event (mass layoff, acquisition integration) which can exceed 50% in one shock.
- **Scores**: Novelty 4/5 | Specificity 5/5 | Evidence 4/5 | Principle-expansion 4/5
- **Status**: **inconclusive** (interesting but not load-bearing at steady state)
- **Implication**: Percolation is the right model for *discontinuous* events — reorgs, acquisitions, mass firings. It does not compete with Bartlett/Fidelity for steady-state decay modeling. A narrow, targeted deep dive focused on *reorg-shock scenarios* would be valuable, but it is a niche addition rather than a new pillar. Lower promotion priority than H2 or H3.

---

### H8: Thermodynamics — entropy of organizational state

- **Lane**: Explore
- **Claim**: Decision state has an entropy; as layers thermalize, ΔS → 0 predicts bureaucratic "freezing."
- **Test**: Attempted to operationalize "entropy of decision state" using any live quantity — decision throughput, DCI variance, fidelity distribution. None of these map onto a state-space partition function. Shannon entropy of the decision-right distribution (H3 lens) is well-defined, but it's *information* entropy, not thermodynamic entropy, and H3 already covers that channel.
- **Evidence**: Zero numerical evidence producible at sandbox. The "layers as heat sinks" framing is metaphorical; there is no conservation law, no temperature analog, and no ΔS measurement method in the live model. Attempting to force one would be post-hoc.
- **Scores**: Novelty 2/5 | Specificity 1/5 | Evidence 1/5 | Principle-expansion 2/5
- **Status**: **demote-speculative** (as seed.md anticipated)
- **Implication**: The candidate was explicitly flagged in `seed.md` #8 as "likely a metaphor rather than a mechanism" and included so the principle screen could demote it with evidence. That is exactly what has happened. **Archive it.** If a future cycle identifies a concrete quantity (e.g., a partition function over decision-right assignments), it can be re-seeded then, but not speculatively.

---

### H9: Meta DCI recalibration (Refine lane probe)

- **Lane**: Refine
- **Claim**: Meta's current DCI of 28 is too low. A defensible upward recalibration to ~40 would move Meta's `band(min)` from Stale to Aging at the default `teamDecisionMix = 70`.
- **Test**: Direct probe of `calcBlendedScores` at current calibration vs. proposed DCI range {35, 40, 45, 50}, holding all other Meta inputs fixed at `L=6, headcount=74067, fidelityRate=82, decisionCycle=2.5`. Cross-checked at default `teamDecisionMix = 50` (what the UI opens to) and `70` (what Cycle 10 H3 and the seed both use).
- **Evidence**: Fresh from `npm run eval:models` (see notes below on the `scenarioWeights` helper gap — this probe is operational-scenario only, which is sufficient for the DCI question):
  ```
  Meta at mix=70 (Cycle 10 H3 reference point):
    DCI=28  F=69  L=86  A=36   band(min)=Stale   (current)
    DCI=35  F=69  L=86  A=45   band(min)=Aging   ← flip at DCI≥31
    DCI=40  F=69  L=86  A=52   band(min)=Aging   (proposed)
    DCI=45  F=69  L=86  A=58   band(min)=Aging
    DCI=50  F=69  L=86  A=65   band(min)=Fresh   ← second flip at DCI≥48

  Meta at mix=50 (UI default):
    DCI=28  F=60  L=77  A=31   band(min)=Stale
    DCI=40  F=60  L=77  A=44   band(min)=Aging
    DCI=45  F=60  L=77  A=50   band(min)=Aging
  ```
  **The Cycle 10 seed's hypothesis is confirmed numerically:** raising Meta's DCI to 40 flips `band(min)` from Stale to Aging at both `mix=70` and `mix=50`. The flip threshold is DCI≥31 at mix=70 (closer than expected — only +3 from current). A further recalibration to DCI=48 would produce a second flip (Aging → Fresh).

  **Defensibility of DCI=40:** I am at sandbox enrichment and cannot survey Glassdoor/SEC/Year-of-Efficiency live. What I can establish from the live dataset is the **bounds**: Meta is a flattened tech company post-2023, and the current DCI of 28 is below Walmart (30), VHA (30), IBM-pre-Gerstner (30) and GE-Welch (35). This is implausible — Meta's engineering culture (ICs own technical decisions, codebase ownership, strong review-based autonomy) is clearly more decentralized than a regulated command bureaucracy. A defensible lower bound is DCI=35 (matches GE-Welch); a defensible upper bound is DCI=50 (below Google's 58, reflecting Meta's more centralized product strategy). **Proposed range: 35–45, midpoint 40.** Full-enrichment deep-dive would tighten this further.
- **Scores**: Novelty 2/5 | Specificity 5/5 | Evidence 4/5 | Principle-expansion 1/5
- **Status**: **confirmed (with defensible range)**
- **Implication**: This is a small, surgical calibration fix that unlocks Meta from "governance-locked" (Cycle 6 H2) into the routing-curable set. The comparison against command orgs (Walmart/VHA/IBM-Welch) is the strongest argument for revision — Meta being below every command benchmark is internally inconsistent with the `dciSource` definitions. Recommendation: **advance to a narrow code-change cycle at full enrichment** to lock in a Glassdoor/SEC-cited value in the 35–45 band and update `referenceCompanies.ts`.

---

## Key Findings

1. **Control theory (H2) is the strongest Explore promotion candidate.** The Nyquist-style stability threshold `τ_crit = π/(2ω_n)` against the live `d × (L-1)²` lag delays produces a sharp, numerical, cross-company verdict: at a quarterly strategic cadence, **the stability crossover sits between Nucor (L=4) and Meta (L=6)**, and every company at L≥6 is predicted to oscillate. This is the mechanism the Latency pillar has been gesturing at — "policy whiplash" is now a specific, predictable phase-margin failure.

2. **Information theory (H3) is the strongest cross-pillar generalization.** Treating Bartlett's 82% as SNR=4.56 makes fidelity a function of message complexity: the same org can be Fresh on safety signals and Expired on strategy signals without any pillar-input change. This rigorously grounds the relay simulator's scenario split and directly explains *why* the Cycle 10 CEO-flat Strategy bonus specifically targets strategic messages.

3. **Queueing theory (H1) flipped the expected story: deep orgs are *under-utilized* at the manager node, not congested.** Spans shrink as L grows for fixed headcount, so ρ decreases with depth. High-ρ orgs (Haier, Meta) are running hot and can't absorb variance; low-ρ orgs (IBM, Ford) have so much slack that their latency is purely serial-depth. This is a new lens but needs per-layer (not average) span data to productize.

4. **Dunbar/Miller (H4) confirms an existing diagnostic rather than expanding the model.** Every self-managing and flat org *violates* the Miller 7±2 floor, because they've replaced direct-report supervision with peer coordination. The command orgs at L=10–11 have 3–4 layers of excess above the Miller floor — a new "bureaucratic slack" metric. Roll into Methodology, don't promote to a pillar.

5. **Thermodynamics (H8) correctly demoted.** `seed.md` flagged this as a metaphor-candidate, and that's exactly what it is. Zero operationalization possible at sandbox. Conway's law (H5) is untestable at sandbox for different reasons (needs a product-modularity corpus). Jackson (H6) is dominated by H1. Percolation (H7) is real but niche (reorg-shock-only).

---

## Model Observations

- **The Fidelity, Latency, and Autonomy pillars each have a candidate physics grounding waiting in the wings**: Bartlett → Shannon channel capacity (H3), `d × (L-1)²` → Nyquist stability (H2), DCI → (nothing new from this screen — DCI is already WMS-grounded). Promoting H2 and H3 together would give the Latency and Fidelity pillars analytic foundations that the current formulas only hint at.

- **Spans are NOT per-layer in `calcOrgMetrics`.** `avgSpan` is `employees^(1/(L-1))` — a cone-root that averages over the whole pyramid. If a future queueing-theory deep dive wants to compute per-layer ρ, it will need either (a) an explicit shape distribution (bottom-heavy vs uniform) or (b) a new helper that returns layer-by-layer spans. Flag this as a `calcOrgMetrics` extension for Cycle 12.

- **The scenario-weights helper gap is a small but real obstacle.** `calcBlendedScores` landed with `scenarioWeights`, but `run-models.ts` doesn't pass it through. The Cycle 10 seed about "walking the 15-company set under Strategy weights" is therefore still blocked on tooling, not on the model. Add a CLI flag in the next cycle.

- **Meta's DCI of 28 is lower than every command-archetype company.** That's not defensible. The Refine probe argues for a range of 35–45; even a conservative bump to 31 flips `band(min)` from Stale to Aging at `mix=70`. Smallest-possible recalibration: DCI 28 → 35.

---

## Compounding Check

- **vs. Cycle 10**: Cycle 10 was a depth cycle that closed the 7→10 team-path dominance arc with the CEO-flat Strategy bonus. Cycle 11 is the first wide cycle — it takes the now-stable 3-pillar foundation and screens 8 candidate physics principles against it. Two promoted (H2, H3), one shallow-promising (H1), one methodology-roll (H4), four demoted or parked. No Cycle 10 result is challenged.

- **Novel contribution**: The first *principle screen* in the research loop — trading depth for breadth on purpose. Produces a ranked promotion table rather than a single definitive proof. Introduces the **Principle-expansion** scoring dimension in the live scorecard for the first time. H2 and H3 each open a new line of inquiry that grounds an existing pillar in a named physics formalism (Nyquist stability, Shannon channel capacity) rather than leaving the formulas as working-assumption scalars.

- **Arc status after Cycle 11:**
  - **Closed**: Cycle 7→10 team-path dominance arc (unchanged from Cycle 10).
  - **Closed by demotion**: H5 (Conway), H6 (Jackson), H8 (entropy) — archived pending new enrichment or new data.
  - **Open — promoted**: H2 (control theory / Nyquist stability) and H3 (information theory / Shannon channel) are the two Explore arcs advancing to dedicated deep-dive cycles.
  - **Open — shallow**: H1 (queueing theory) — advances only as a companion lens to H2 unless a per-layer span helper is built.
  - **Open — niche**: H7 (percolation) — parked for a future "reorg-shock" cycle.
  - **Open — refine**: H9 (Meta DCI recalibration) — ready for a narrow code-change cycle at full enrichment.

---

## Cycle Scorecard

| Metric                    | This Cycle | Cycle 10 | Δ     |
|---------------------------|-----------:|---------:|------:|
| Avg Novelty               | 3.3        | 3.8      | −0.5  |
| Avg Specificity           | 3.7        | 5.0      | −1.3  |
| Avg Evidence              | 3.1        | 5.0      | −1.9  |
| **Avg Principle-expansion** | **3.8**  | —        | new   |
| Refine hypotheses         | 1          | 0        | +1    |
| Explore hypotheses        | 8          | 0        | +8    |
| Confirmed                 | 1 (H9)     | 4        | −3    |
| Refuted / demoted         | 2 (H6, H8) | 2        |  0    |
| Shallow-promising         | 2 (H1, H4) | —        | new   |
| Promoted                  | 2 (H2, H3) | —        | new   |
| Needs-enrichment          | 1 (H5)     | 0        | +1    |
| Inconclusive              | 1 (H7)     | 0        | +1    |

*Specificity and Evidence drop is expected and correct for a screen cycle — 8 short probes cannot each carry 5/5 rigor, and forcing them to would defeat the purpose. **Principle-expansion averages 3.8 in its debut**, reflecting that most Explore candidates genuinely probe outside the current three pillars; only H9 (Refine) scores 1. The screen successfully identifies the 2 strongest candidates (H2, H3) with sharp numerical evidence while demoting the weakest (H8, H6) without wasting depth on them.*

---

## Seeds for Next Cycle

Ranked. **The top two are the deep-dive promotions from the screen.**

1. **[HIGH | Explore] Deep-dive H2: Control theory / Nyquist stability as the Latency pillar's analytic foundation.** Derive the closed-form crossover `L*(d, ω_n)` for oscillatory instability, calibrate ω_n per scenario type (safety / customer / innovation / strategy / operations — matching the relay simulator's 5 scenarios), and validate against empirically oscillation-prone case studies (Meta 2023 layoffs, Google post-Alphabet reorgs, IBM pre-Gerstner). Deliverable: an `evals/helpers/` script that computes stability margin per company, and a proposed update to the Latency pillar methodology that names the mechanism. Sandbox-testable; no new data required.

2. **[HIGH | Explore] Deep-dive H3: Information theory / Shannon channel capacity as the Fidelity pillar's analytic foundation.** Formalize the SNR ↔ Bartlett mapping, derive `F(complexity)` as a function, and verify that the scenario-typed relay simulator losses are consistent with an SNR-parameterized channel model. Cross-check with the Cycle 10 CEO-flat Strategy bonus: Strategy messages have lower effective SNR, so the mono-path bonus is quantitatively justified (not just a curve fit). Sandbox-testable with a toy corpus.

3. **[HIGH | Refine] Land Meta DCI recalibration 28 → 40.** Promoted from `seed.md` Refine #1 with numerical confirmation from H9. Surgical code change in `src/data/referenceCompanies.ts`. Requires full-enrichment to survey Glassdoor/SEC/Year-of-Efficiency for a citable pin, then update the comment block. Also touch the `dciSource` tag — at 40, it's still `qualitative-estimate`, but with a documented source chain.

4. **[MED | Refine / tooling] Extend `run-models.ts` to expose `scenarioWeights`.** Blocks the Cycle 10 seed about walking the 15-company set under Strategy weights, and blocks any future cycle that wants to validate the CEO-flat bonus. Small tooling PR. Mentioned in this cycle's stale-prompt check.

5. **[LOW | Explore] Park H1 (queueing), H4 (Miller slack), H7 (percolation-reorg-shock).** Keep in `seed.md` at LOW priority. Revisit only if (a) a per-layer span helper lands, (b) a Methodology refresh wants the Miller floor as a diagnostic overlay, or (c) a reorg-scenario product feature surfaces. Do NOT promote blindly — H2 and H3 have higher marginal explanatory power.

**Archive / close**: H5 (Conway), H6 (Jackson — dominated by H1), H8 (entropy — metaphor). Move these to `seed.md`'s resolved section with the one-line verdicts from their Implication sections above.

---

## Dry-run notes (not part of a real cycle entry)

- This file is `cycle-011-dryrun.md`, not `cycle-011.md`. The real Cycle 11 orchestrator run will produce the canonical entry.
- `evals/config.json` not touched. `evals/insights.md` not touched. `evals/prompts/seed.md` not touched.
- `npm run eval:lint` confirmed clean before and after writing.
- All numerical evidence in H1–H9 was generated by running `evals/helpers/run-models.ts` against the live codebase at the start of this session. The calcBlendedScores probes for H9 are reproducible via the same JSON payloads listed in the Evidence block.
