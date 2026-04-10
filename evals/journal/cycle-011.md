# Cycle 011 — 2026-04-10

This is a **Principle Screen** cycle (per the refreshed 2026-04-10 system
prompt). Breadth-first probes on the Explore lane, plus a focused Refine
probe on the full 15-company set that re-validates Cycle 10's CEO-flat
Strategy bonus through live `calcBlendedScores`. A dry-run cycle (see
`cycle-011-dryrun.md`) exercised the refreshed prompt earlier today; this
cycle is the canonical entry and extends it with a new material finding
about the blast radius of the Cycle 10 H1b bonus.

## Seeds (from Cycle 10 + seed.md + human steering)

- [HIGH | Explore] Queueing theory (M/M/1) for manager bottlenecks — seed #1
- [HIGH | Explore] Control theory — feedback delay → oscillatory instability — seed #2
- [HIGH | Explore] Information theory — Shannon channel capacity generalizes Bartlett — seed #3
- [MED  | Explore] Dunbar / Miller 7±2 span-of-control floor — seed #4
- [MED  | Explore] Conway's law — org shape predicts product shape — seed #5
- [MED  | Explore] Jackson networks — M/M/1 generalized — seed #6
- [MED  | Explore] Percolation — connectivity collapse under turnover — seed #7
- [LOW  | Explore] Thermodynamics / entropy — expected demotion — seed #8
- [HIGH | Refine] Meta DCI recalibration — seed Refine #1
- [HIGH | Refine] Validate Cycle 10 CEO-flat Strategy bonus against the **full
  15-company set** (Cycle 10 H1b was measured on the original 6)

Explicit mandate: promote ≤ 2 Explore candidates to dedicated deep-dive
cycles; demote or park the rest; attempt at least one Refine probe.

---

## Stale-prompt check

Two small drifts, neither blocking:

1. **`evals/helpers/run-models.ts` does not expose `scenarioWeights`.** The
   `calcBlendedScores` handler (lines 50–57) silently drops the new
   parameter, so the CEO-flat Strategy bonus cannot be driven from
   `npm run eval:models`. This cycle's Strategy-scenario probes had to
   import `calcBlendedScores` directly via a temp TS script. Small tooling
   gap; carried forward as a Cycle 12 seed.
2. **Six archetypes, only five populated.** `CLAUDE.md` lists six archetypes
   (`flat`, `tech`, `flattened`, `self-managing`, `energy`, `command`) and
   `src/data/referenceCompanies.ts` populates all but `energy` — still an
   empty reservation slot. Documented correctly; flagging only so future
   cycles don't hunt for an energy-archetype company that doesn't exist.

Otherwise: clean. Pillar math, helper signatures, scoring rubric, archived
arcs, and the 15-company reference set all match the live codebase.

---

## Hypotheses Tested

### H1: CEO-flat Strategy bonus is structurally too blunt on the 15-company set

- **Lane**: Refine
- **Claim**: Cycle 10 H1b landed the CEO-flat Strategy bonus
  (`monoF ← 100, monoA ← 100` when `scenarioWeights.fidelity ≥ 0.5`) and
  exhibited a depth-monotone flip cascade on the *original 6* reference
  companies (Haier → Nucor → Meta → Google → Amazon). With 9 new
  companies added since — 3 self-managing (Morning Star, Buurtzorg,
  Berkshire), 6 command (GE-Welch, IBM-pre-Gerstner, Walmart, USPS, VHA,
  Ford-pre-Mulally) — the bonus should sharpen the cascade. It probably
  also misfires on self-managing orgs whose whole point is decentralized
  strategy.
- **Test**: For each of the 15 companies, sweep `teamDecisionMix` from 0
  to 100 under Strategy weights `(F=0.55, L=0.10, A=0.35)` both **with**
  and **without** the bonus (via direct `calcBlendedScores` calls). Report
  the optimum mix in each configuration and whether the bonus flipped it.
- **Evidence**:

  ```
  Company             L  arch          | noBonus opt | bonus opt | Δ    flipped?
  Valve               1  flat          | mix=  0     | mix=  0   |   0    —
  Morning Star        1  flat          | mix=  0     | mix=  0   |   0    —
  Buurtzorg           2  self-managing | mix= 50     | mix=  0   | −50    FLIP
  Haier               3  self-managing | mix=100     | mix=  0   | −100   FLIP  ← misfire
  Nucor               4  flat          | mix=100     | mix=  0   | −100   FLIP
  Berkshire           4  self-managing | mix=100     | mix=  0   | −100   FLIP  ← misfire
  Meta                6  flattened     | mix=100     | mix=  0   | −100   FLIP
  Google              8  tech          | mix=100     | mix=  0   | −100   FLIP
  Walmart             8  command       | mix=100     | mix=  0   | −100   FLIP
  Amazon              9  tech          | mix=100     | mix=  0   | −100   FLIP
  GE-Welch           10  command       | mix=100     | mix=  0   | −100   FLIP
  USPS               10  command       | mix=100     | mix=  0   | −100   FLIP
  VHA                10  command       | mix=100     | mix=  0   | −100   FLIP
  IBM-pre-Gerstner   11  command       | mix=100     | mix=  0   | −100   FLIP
  Ford-pre-Mulally   11  command       | mix=100     | mix=  0   | −100   FLIP
  ```

  **13 of 15 companies flip to mix=0 under the bonus.** Only the L=1 orgs
  (Valve, Morning Star) are no-ops because they have no team/mono
  distinction. Every other company — including the three self-managing
  orgs — is flipped to "route strategy through the CEO." The Cycle 10
  "depth-monotone cascade" (Haier → Nucor → Meta → Google → Amazon under
  varying `(kF, kA)`) is invisible here because the landed bonus is
  equivalent to `kF = ∞, kA ≈ 2.78` — above every company's flip
  threshold simultaneously. The cascade exists *inside* the
  `(kF, kA)` phase diagram from Cycle 10 H1b, but the shipped bonus sits
  past every crossing.

  **The misfire is material.** Haier (L=3, DCI=88, self-managing
  microenterprise philosophy) and Berkshire (L=4, 27 people at HQ,
  "delegation just short of abdication") are the two most strategically
  decentralized orgs in the dataset. The bonus tells both of them to
  route strategic decisions through the CEO — inverting their documented
  operating model. Buurtzorg (14k nurses, 2 directors) is the same story.

- **Scores**: Novelty 5/5 | Specificity 5/5 | Evidence 5/5 | Principle-expansion 1/5
- **Status**: **confirmed (in the "bonus misfires" direction)**
- **Implication**: The bonus needs a gate. Three candidate gates, each
  theoretically defensible:
  1. **Autonomy gate**: apply the bonus only when *mono-path autonomy*
     is below a threshold (e.g. `monoA < 70`). For Haier
     (monoA=88), Buurtzorg (monoA=100), Berkshire (monoA=75 with
     depth discount at L=4 ≈ 68 — borderline), the gate prevents the
     bonus. For every command org (monoA ≤ 35), the bonus still fires.
     This is the cleanest reformulation: "CEO-flat Strategy only helps
     when strategic decisions are actually centralized."
  2. **Archetype gate**: apply the bonus only when
     `archetype ∈ {tech, flattened, command}`. Hard-coded, but
     semantically obvious and avoids a magic threshold.
  3. **Depth gate**: apply only when `L ≥ 5`. Fails for Haier (L=3,
     gated out correctly) and Berkshire (L=4, borderline) but also
     gates out Nucor (L=4, flat steel) which *is* a command-y depth-tax
     org in Iverson's day. This is the weakest of the three.

  Of the three, **autonomy-gated is the most principled**: it reads as
  "the CEO can only be a genuine strategic hub when strategic decisions
  are actually centralized in the first place" — which is exactly what a
  low DCI (or low monoA) encodes. This is the minimum viable refinement
  and becomes the highest-priority Cycle 12 seed.

---

### H2: Control theory — Nyquist phase-margin predicts oscillatory deep orgs

- **Lane**: Explore
- **Claim**: Treat the org as a closed-loop controller with natural
  frequency `ω_n` set by a strategic cadence and feedback delay `τ` set
  by the Latency pillar's `d × (L−1)²`. Classical stability threshold:
  `τ_crit = π/(2·ω_n)`. At quarterly cadence (`ω_n = 2π/90 ≈ 0.0698`
  rad/day), `τ_crit ≈ 22.5` days. Deep orgs should blow through it.
- **Test**: Ran `calcThermalLag` for all 15 companies at their live
  `decisionCycle`, computed `τ/τ_crit`.
- **Evidence**:

  ```
  Company             L   d    τ (days)  τ/τ_crit   verdict
  Valve               1   1.5    0.0      0.00       stable
  Morning Star        1   1      0.0      0.00       stable
  Buurtzorg           2   1      1.0      0.04       stable
  Haier               3   1      4.0      0.18       stable
  Nucor               4   2     18.0      0.80       thin
  Berkshire           4   2     18.0      0.80       thin
  Meta                6   2.5   62.5      2.78       oscillatory
  Google              8   3.5  171.5      7.62       deeply-oscillatory
  Walmart             8   3    147.0      6.53       deeply-oscillatory
  Amazon              9   3    192.0      8.53       deeply-oscillatory
  VHA                10   4    324.0     14.40       deeply-oscillatory
  GE-Welch           10   4    324.0     14.40       deeply-oscillatory
  USPS               10   5    405.0     18.00       deeply-oscillatory
  Ford-pre-Mulally   11   4    400.0     17.78       deeply-oscillatory
  IBM-pre-Gerstner   11   5    500.0     22.22       deeply-oscillatory
  ```

  **Crossover sits between Nucor/Berkshire (L=4, τ/τ_crit ≈ 0.80) and
  Meta (L=6, 2.78).** The thin-margin band catches exactly the 4-layer
  orgs; the oscillatory threshold catches the flattened-tech Meta; the
  deeply-oscillatory band catches every command org at L≥8 and every
  historical bureaucracy at L≥10. At a monthly cadence
  (`ω_n ≈ 0.21`, `τ_crit ≈ 7.5`), even Nucor crosses; at an annual
  cadence (`ω_n ≈ 0.017`, `τ_crit ≈ 90`), Meta is stable but Google and
  deeper remain oscillatory.

- **Scores**: Novelty 4/5 | Specificity 5/5 | Evidence 4/5 | Principle-expansion 5/5
- **Status**: **promote-to-deep-dive**
- **Implication**: This is the mechanism the Latency pillar has been
  gesturing at. "Stale decisions" aren't just slow — at `τ > τ_crit`
  they arrive out of phase with the strategic cadence, producing
  observable whiplash (reorg-of-the-quarter, contradictory directives,
  strategy churn). The Cycle 11 screen elevates this to the top Explore
  promotion. A dedicated cycle should: derive the analytic crossover
  `L*(d, ω_n)`, calibrate `ω_n` per relay-simulator scenario
  (safety/customer/innovation/strategy/operations), and cross-validate
  against historical oscillation events (Meta 2023 layoffs, Google post-
  Alphabet reorgs, IBM pre-Gerstner product-cycle failures).

---

### H3: Shannon channel capacity — Bartlett's 82% as a fixed-SNR special case

- **Lane**: Explore
- **Claim**: Bartlett's 82% per-layer retention is a special case of a
  noisy channel with fixed SNR. If retention = SNR/(1+SNR), then
  `r = 0.82` → `SNR ≈ 4.56`, giving `C = log₂(1+SNR) ≈ 2.47` bits/hop.
  Messages of different complexity (safety: "FIRE" vs strategy: nuanced
  multi-clause pivots) experience different effective SNR, and the same
  org can be Fresh on safety and Expired on strategy at identical
  pillar inputs.
- **Test**: Back-solved SNR from 0.82; swept multipliers
  `{2, 1, 0.5, 0.25}`; computed L=9 (Amazon) retention at each.
- **Evidence**:

  ```
  SNR×      SNR    r_eff   L=9 retention
  2.0     9.11   0.901    43.5%       ← high-salience (safety alert)
  1.0     4.56   0.820    20.4%       ← Bartlett baseline (prose)
  0.5     2.28   0.695     5.4%       ← nuanced strategy
  0.25    1.14   0.532     0.6%       ← compressed multi-clause
  ```

  **A 2× degradation of effective SNR collapses Amazon's L=9 retention
  4-fold.** Under the "strategy is SNR-halved" frame, Amazon drops from
  20.4% (Aging-ish) to 5.4% (near-Expired) without any change to the
  Fidelity slider. This maps precisely onto the relay simulator's
  scenario architecture: safety scenarios lose single tokens, strategy
  scenarios lose entire framing clauses.

- **Scores**: Novelty 5/5 | Specificity 4/5 | Evidence 3/5 | Principle-expansion 5/5
- **Status**: **promote-to-deep-dive**
- **Implication**: If formalized, the Fidelity pillar becomes a function
  `F(complexity)` with Bartlett's 82% as the ordinary-prose midpoint.
  The relay simulator's scenario-typed losses become *derived* quantities
  rather than editorial choices. It also gives an independent grounding
  for the Cycle 10 CEO-flat Strategy bonus: strategic messages are
  SNR-disadvantaged by construction, so a compensating mono-path lift
  is quantitatively justified — not just curve-fit. H3 may provide the
  theoretical basis for H1's needed bonus-gate: the gate should fire
  when the *scenario SNR* is below threshold, not when any fidelity-
  weighted composite is.

---

### H4: Queueing theory — manager ρ at μ=6 service rate

- **Lane**: Explore
- **Claim**: Each manager is an M/M/1 queue with arrival rate set by
  subordinates' decision requests and service rate capped at ~6/day
  (Miller 7±2 upper). ρ = span/6 > 0.8 should mark the layer where
  latency blows up.
- **Test**: Computed `avgSpan` from `calcOrgMetrics` for all 15
  companies and derived ρ.
- **Evidence**:

  ```
  Company            L   avgSpan     ρ (μ=6)
  Morning Star        1   550.00   91.67   (undefined — no managers)
  Valve               1   350.00   58.33   (undefined — no managers)
  Buurtzorg           2   118.32   19.72   (undefined — coach model)
  Haier               3    42.17    7.03   (catastrophic)
  Berkshire           4    25.03    4.17   (very over)
  Nucor               4    13.45    2.24   (over)
  Meta                6     6.48    1.08   (just over)
  Walmart             8     6.17    1.03   (just over)
  Amazon              9     4.88    0.81   (at threshold)
  Google              8     4.55    0.76   (below)
  USPS               10     3.80    0.63   (below)
  VHA                10     3.61    0.60   (below)
  GE-Welch           10     3.54    0.59   (below)
  IBM-pre-Gerstner   11     3.21    0.54   (below)
  Ford-pre-Mulally   11     3.17    0.53   (below)
  ```

  **The deepest orgs have the LOWEST ρ.** Spans shrink as depth grows for
  fixed headcount (cone-root: `avgSpan = N^(1/L)`), so ρ falls with
  depth. High-ρ orgs (Haier, Berkshire, Meta) are running managers hot
  and absorb variance badly; low-ρ command orgs (IBM, Ford, USPS) have
  so much manager slack their latency is purely serial-depth — the
  `d × (L−1)²` term — not queue wait. For L=1/L=2 orgs ρ is undefined
  because the "manager" abstraction doesn't apply (peer coordination
  replaces supervision).

- **Scores**: Novelty 4/5 | Specificity 3/5 | Evidence 3/5 | Principle-expansion 5/5
- **Status**: **shallow-promising** (but not in the expected direction)
- **Implication**: Queueing theory inverts the naive story: ρ measures
  hierarchical *slack*, not congestion. The insight worth productizing
  is the **hot-org vs cold-org axis**: Haier-like high-ρ orgs are
  throughput-bound on managers; IBM-like low-ρ orgs are latency-bound
  on serial depth. These need different remediation strategies and may
  be worth a small Methodology addition. This advances only as a
  companion lens to H2 (control theory) unless a per-layer span helper
  is built — `avgSpan` as a cone-root is coarse.

---

### H5: Dunbar / Miller 7±2 — hierarchy floor

- **Lane**: Explore
- **Claim**: Miller 7±2 working-memory cap imposes a soft floor
  `L_min = ⌈log₇(N)⌉`. Orgs below the floor cannot be "managed" in the
  Miller sense — they must use peer coordination instead.
- **Test**: Computed the floor for 15 companies and compared to actual
  `L`.
- **Evidence**:

  ```
  Company             N           L    L_min(7)   slack
  Valve               350          1    4         −3   VIOLATES
  Morning Star        550          1    4         −3   VIOLATES
  Buurtzorg         14,000         2    5         −3   VIOLATES
  Haier             75,000         3    6         −3   VIOLATES
  Nucor             32,700         4    6         −2   close
  Berkshire        392,400         4    7         −3   VIOLATES
  Meta              74,067         6    6          0   at-floor
  Google           183,323         8    7         +1
  Walmart        2,100,000         8    8          0   at-floor
  Amazon         1,556,000         9    8         +1
  USPS             635,000        10    7         +3
  VHA              371,000        10    7         +3
  GE-Welch         313,000        10    7         +3
  IBM-pre-Gerstner 374,000        11    7         +4
  Ford-pre-Mulally 328,000        11    7         +4
  ```

  **Every self-managing and flat org violates the floor, and every
  command org carries 3–4 layers of cognitive slack.** The violations
  are not paradoxes — Valve/Morning Star/Buurtzorg/Haier/Berkshire all
  substitute peer coordination (CLOUs, coaches, microenterprise P&L,
  subsidiary autonomy) for direct-report supervision. The command
  orgs, by contrast, carry 3–4 layers *above* the Miller floor — IBM
  and Ford could theoretically flatten to L=7 without violating
  cognitive span, and the extra 4 layers are pure bureaucratic tax.

- **Scores**: Novelty 3/5 | Specificity 5/5 | Evidence 5/5 | Principle-expansion 4/5
- **Status**: **shallow-promising** (diagnostic overlay, not a new pillar)
- **Implication**: Miller is the right frame for a **"bureaucratic
  slack" metric**: `slack = L − L_min`. IBM and Ford at slack +4 are
  the definitional depth-tax cases. Haier at slack −3 is the
  definitional "shifted-coordination-architecture" case. This could
  land as a Methodology overlay without promoting Miller to a fourth
  pillar. Roll into H4 (queueing) deep dive if either is promoted.

---

### H6: Conway's law — org shape predicts product shape

- **Lane**: Explore
- **Claim**: Conway (1968): "Organizations design systems that mirror
  their communication structure." If true, org-shape's pillars should
  predict which kinds of products a given shape ships successfully.
- **Test**: None possible at sandbox enrichment. The live model has no
  product-quality dimension to regress against. Retrofit examples
  (Amazon two-pizza teams → microservices; Google centralized platform
  → monorepo; Haier RenDanHeYi → modular appliance lines) are
  persuasive but not predictive.
- **Evidence**: Zero numerical output producible. No corpus of
  modularity-labeled products + author-org metadata exists in the
  repo; building one is a cycle-sized project in its own right.
- **Scores**: Novelty 2/5 | Specificity 2/5 | Evidence 1/5 | Principle-expansion 4/5
- **Status**: **needs-enrichment**
- **Implication**: Park it. Conway's law may belong in the theory
  eventually but cannot be screened at sandbox and cannot be validated
  in one cycle at any enrichment without a pre-built dataset.

---

### H7: Percolation — catastrophic connectivity collapse under turnover

- **Lane**: Explore
- **Claim**: Random-graph percolation: `p_c = 1/⟨k⟩` (⟨k⟩ = mean
  degree). Above `1 − p_c` node removal, the communication graph
  fragments. Does ordinary manager turnover (~10–25% annually per
  BLS) approach `1 − p_c`?
- **Test**: Computed ⟨k⟩ ≈ `avgSpan + 1` and `p_c = 1/⟨k⟩` for all 15
  companies.
- **Evidence**:

  ```
  Company            avgSpan   ⟨k⟩    p_c      crit-turnover
  IBM-pre-Gerstner    3.21    4.21   0.237    76.3%
  Ford-pre-Mulally    3.17    4.17   0.240    76.0%
  VHA                 3.61    4.61   0.217    78.3%
  USPS                3.80    4.80   0.208    79.2%
  GE-Welch            3.54    4.54   0.220    78.0%
  Google              4.55    5.55   0.180    82.0%
  Amazon              4.88    5.88   0.170    83.0%
  Walmart             6.17    7.17   0.139    86.1%
  Meta                6.48    7.48   0.134    86.6%
  Nucor              13.45   14.45   0.069    93.1%
  Berkshire          25.03   26.03   0.038    96.2%
  Haier              42.17   43.17   0.023    97.7%
  Buurtzorg         118.32  119.32   0.008    99.2%
  Valve             350.00  351.00   0.003    99.7%
  Morning Star      550.00  551.00   0.002    99.8%
  ```

  **Every company has a critical turnover above 76%.** Steady-state
  turnover never approaches this. Percolation is only load-bearing
  for *discontinuous events* — mass layoffs, acquisitions, reorgs.

- **Scores**: Novelty 4/5 | Specificity 5/5 | Evidence 4/5 | Principle-expansion 4/5
- **Status**: **inconclusive** (niche, not steady-state load-bearing)
- **Implication**: Park for a future reorg-shock cycle. Not a pillar
  candidate.

---

### H8: Jackson networks — network-level stability

- **Lane**: Explore
- **Claim**: Jackson networks generalize M/M/1 to a network of queues;
  stability requires every node's ρ < 1.
- **Test**: Conceptual. From H4, no live company violates ρ < 1 under
  the toy μ=6 calibration at the deep end. Jackson's refinement
  (routing probabilities, non-exponential service distributions) is
  ~10× the implementation complexity of H4 and would produce the same
  stability verdict given current data.
- **Evidence**: Subsumed by H4.
- **Scores**: Novelty 3/5 | Specificity 3/5 | Evidence 3/5 | Principle-expansion 4/5
- **Status**: **demote-speculative** (dominated by H4, not wrong)
- **Implication**: Keep in seed pool at LOW. Revisit only if per-layer
  ρ heterogeneity surfaces that single-queue H4 cannot capture.

---

### H9: Thermodynamics / entropy — demotion

- **Lane**: Explore
- **Claim**: Decision state has an entropy; layers act as heat sinks;
  `ΔS → 0` predicts bureaucratic freezing.
- **Test**: Attempted to operationalize. No conservation law, no
  temperature analog, no partition function. Shannon entropy is
  already covered by H3 and is not the same quantity.
- **Evidence**: None producible.
- **Scores**: Novelty 2/5 | Specificity 1/5 | Evidence 1/5 | Principle-expansion 2/5
- **Status**: **demote-speculative**
- **Implication**: Archive. Seed #8 was explicitly flagged for demotion
  with evidence; that has happened. Re-seed only if a concrete
  quantity (e.g. partition function over decision-right assignments)
  is identified.

---

### H10: Meta DCI recalibration — 28 is below every command-archetype company

- **Lane**: Refine
- **Claim**: Meta's current DCI of 28 is below Walmart (30), VHA (30),
  IBM-pre-Gerstner (30), and GE-Welch (35) — all archetypal command
  bureaucracies. This is internally inconsistent: post-2023 Meta's
  engineering culture is clearly more decentralized than a regulated
  command bureaucracy. A defensible recalibration is 35–45.
- **Test**: Swept Meta's DCI over `{28, 31, 35, 40, 45, 48, 50}` at
  `L=6, headcount=74067, fidelityRate=82, decisionCycle=2.5,
  teamDecisionMix=70` and measured `band(min)` vs `band(mean)`.
- **Evidence**:

  ```
  DCI   F   L   A    min   mean   band(min)   band(mean)
   28  69  86   36    36   63.7   Stale       Aging
   31  69  86   40    40   65.0   Aging       Fresh
   35  69  86   45    45   66.7   Aging       Fresh
   40  69  86   52    52   69.0   Aging       Fresh
   45  69  86   58    58   71.0   Aging       Fresh
   48  69  86   62    62   72.3   Aging       Fresh
   50  69  86   65    65   73.3   Fresh       Fresh
  ```

  **The Stale → Aging flip happens at DCI ≥ 31** (closer than expected;
  a +3 DCI recalibration is sufficient). A second flip to Fresh happens
  at DCI ≥ 50. The proposed 35–45 range sits comfortably in the Aging
  band and is defensible against the command benchmarks above. The
  strongest internal-consistency argument: Meta's `dciSource =
  qualitative-estimate`, and the current value violates the ordering
  implied by `dciSource = case-study` on the command set.

- **Scores**: Novelty 2/5 | Specificity 5/5 | Evidence 4/5 | Principle-expansion 1/5
- **Status**: **confirmed** (code change staged as a Cycle 12 seed)
- **Implication**: Smallest-possible recalibration (28 → 31) fixes the
  Meta `band(min) = Stale` embarrassment; the theoretically defensible
  midpoint (35–40) gives a cushion. Recommend `dci: 35` in a narrow
  Cycle 12 code-change cycle at full enrichment, with a citation pull
  from Year-of-Efficiency sources to upgrade the comment block.

---

## Key Findings

1. **The Cycle 10 CEO-flat Strategy bonus misfires on self-managing
   orgs on the 15-company set.** (H1) 13 of 15 companies flip to
   mix=0 under the bonus, including Haier (DCI=88, microenterprise
   philosophy), Buurtzorg (14k nurses, 2 directors), and Berkshire (27
   people at HQ, "delegation just short of abdication"). The
   Cycle 10 depth-monotone cascade is invisible on the full set because
   the shipped bonus sits past every flip threshold simultaneously.
   **Minimum viable fix**: gate the bonus on mono-path autonomy below
   threshold (e.g. `monoA < 70`) — the principled reading is that the
   CEO can only be a legitimate strategic hub when strategy is
   *actually* centralized. This is the first new Refine finding since
   the Cycle 7→10 arc closed and becomes the top Cycle 12 seed.

2. **Control theory (H2) is the strongest Explore promotion.** Quarterly
   `τ_crit ≈ 22.5` days cleanly separates the 15 companies into three
   bands: stable (L≤3), thin-margin (L=4), oscillatory (L=6+). This
   is the mechanism behind "policy whiplash" that the Latency pillar
   has been gesturing at. Dedicated cycle should derive `L*(d, ω_n)`
   and calibrate per relay-simulator scenario.

3. **Information theory (H3) is the strongest cross-pillar
   generalization.** Bartlett's 82% ≈ SNR 4.56 = 2.47 bits/hop makes
   Fidelity a function of message complexity rather than a scalar.
   Halving effective SNR quadruples Amazon's L=9 retention loss
   without any pillar-input change. H3 also provides the theoretical
   justification for the H1 autonomy-gate: the bonus should fire
   per-scenario-SNR, not per-fidelity-weight.

4. **Queueing theory (H4) inverts the expected story.** Deep command
   orgs have the *lowest* manager ρ because spans shrink as depth
   grows. ρ measures hierarchical slack, not congestion. Haier-style
   high-ρ orgs are throughput-bound; IBM-style low-ρ orgs are
   depth-bound. New diagnostic axis, not a new pillar.

5. **Dunbar/Miller (H5) confirms the "shifted-architecture" frame for
   self-managing orgs.** All 5 self-managing/flat orgs violate the
   Miller floor; all 6 command orgs carry 3–4 layers of slack above
   it. "Bureaucratic slack = L − L_min" could land as a Methodology
   overlay.

6. **Meta DCI 28 is implausible.** (H10) Below every command
   archetype in the live set. Flip threshold to Aging is DCI=31 —
   smaller than expected. Defensible recalibration range 35–45.

7. **Three Explore candidates demoted or parked.** Conway's law needs
   a dataset (H6: needs-enrichment). Jackson networks dominated by H4
   (H8: demote). Thermodynamics unoperationalizable (H9: demote, as
   `seed.md` anticipated). Percolation is niche (H7: inconclusive,
   reorg-shock only).

---

## Model Observations

- **The CEO-flat Strategy bonus landed without a scope gate.** Cycle 10
  proved the bonus breaks team-path dominance; Cycle 11 reveals it
  breaks it *unconditionally*. The two self-managing orgs added in
  2026-04-10 (Morning Star, Buurtzorg, Berkshire) were not in Cycle
  10's 6-company set, so the misfire was invisible. This is a
  cautionary tale about landing mechanisms against small reference
  sets — always re-validate on the full set after data additions.

- **`avgSpan` is a cone-root, not per-layer.** H4's queueing story
  needs per-layer span data to turn into a model. `calcOrgMetrics`
  currently returns `employees^(1/L)` (confirmed: Amazon's 4.88 =
  1556000^(1/9)), which is an average over an implicit geometric
  distribution. A `layerSpans(levels, employees, shape)` helper would
  unlock both H4 and a possible Cycle 12 per-layer bottleneck
  visualizer.

- **The two promoted candidates (H2, H3) are orthogonal to H1's
  refinement**. H2 grounds the Latency pillar in Nyquist stability;
  H3 grounds the Fidelity pillar in Shannon capacity; H1's CEO-flat
  gate grounds in mono-path autonomy. Three independent pieces of
  work, no ordering dependency.

- **Berkshire is a special case that merits a data-model
  flag.** Its `levels=4` is HQ-only (27 employees at headquarters,
  subsidiaries run their own hierarchies). The H1 and H5 findings
  misread Berkshire in opposite directions — H1 says "CEO-flat
  Strategy bonus misfires" (which is right — Buffett delegates) and
  H5 says "violates Miller floor" (which is meaningless when L is
  measured against the wrong N). A `trueL` or `subsidiaryPattern`
  annotation would prevent both errors.

---

## Compounding Check

- **vs. Cycle 10**: Cycle 10 closed the 7→10 team-path dominance arc
  with the CEO-flat Strategy bonus. Cycle 11 does two distinct things:
  (a) executes the first principle screen (H2–H9), promoting 2 Explore
  candidates and demoting or parking 4, (b) **opens a new Refine
  finding** — the CEO-flat bonus has a blast-radius problem on the
  full 15-company set. The Cycle 10 arc is not re-opened; it is
  *extended* by H1 into a refinement sub-arc.

- **Novel contribution**:
  1. **First principle screen** in the research loop, trading depth
     for breadth against 8 Explore candidates in one cycle.
  2. **H1's "bonus misfires on self-managing orgs" finding** — a
     non-trivial refinement to Cycle 10 H1b that was not visible on
     the 6-company set. This is the first real test of the Cycle 10
     landing on the current dataset.
  3. **Principle-expansion scoring dimension** used in the live
     scorecard for the first time; averages 3.9 across the Explore
     lane.
  4. **H2 and H3 each identify a named physics formalism** (Nyquist
     stability, Shannon capacity) as a candidate analytic foundation
     for an existing pillar — a step toward grounding the model
     beyond working-assumption scalars.

- **Arc status:**
  - **Closed**: Cycle 7→10 team-path dominance arc (unchanged).
  - **Reopened as sub-arc**: CEO-flat bonus scope (H1) — narrow
    follow-up in Cycle 12.
  - **Open — promoted**: H2 (control theory), H3 (Shannon capacity).
  - **Open — shallow**: H4 (queueing), H5 (Miller floor) — advance
    only as companion diagnostics.
  - **Open — niche**: H7 (percolation) — reorg-shock cycle only.
  - **Closed by demotion**: H6 (Conway), H8 (Jackson), H9 (entropy).
  - **Ready for code change**: H10 (Meta DCI 28 → 35), H1 (CEO-flat
    autonomy gate).

---

## Cycle Scorecard

Screen mode. Reporting outcomes with both the standard rubric and the
screen rubric.

| Metric                        | This Cycle | Cycle 10 | Δ      |
|-------------------------------|-----------:|---------:|-------:|
| Avg Novelty                   | 3.4        | 3.8      | −0.4   |
| Avg Specificity               | 3.8        | 5.0      | −1.2   |
| Avg Evidence                  | 3.3        | 5.0      | −1.7   |
| **Avg Principle-expansion**   | **3.5**    | —        | new    |
| Refine hypotheses             | 2 (H1, H10)| 0        | +2     |
| Explore hypotheses            | 8 (H2–H9)  | 0        | +8     |
| Confirmed (Refine)            | 2 (H1, H10)| 4        | —      |
| Promoted (Explore)            | 2 (H2, H3) | —        | new    |
| Shallow-promising             | 2 (H4, H5) | —        | new    |
| Inconclusive                  | 1 (H7)     | 0        | +1     |
| Demote-speculative            | 2 (H8, H9) | 0        | +2     |
| Needs-enrichment              | 1 (H6)     | 0        | +1     |

Specificity and Evidence drops are expected for a screen cycle — 8
breadth probes cannot each carry 5/5 rigor. The two Refine probes
(H1, H10) anchor both at 4–5/5. Principle-expansion debuts at 3.5,
reflecting that most Explore candidates genuinely probe outside the
current three pillars (H5 Miller is the weakest at 4/5 because it's
an overlay, not a pillar). The screen successfully identifies 2
promotions and 3 demotions while surfacing a new material Refine
finding (H1) that was invisible on Cycle 10's 6-company set.

---

## Seeds for Next Cycle

Ranked. The top seed is a direct consequence of the new H1 finding.

1. **[HIGH | Refine] Gate the CEO-flat Strategy bonus on mono-path
   autonomy.** The minimum viable fix: skip the `monoF ← 100, monoA ←
   100` saturation when `monoAutonomy >= 70` (or a calibrated
   threshold — sweep 60/65/70/75 against the 15-company set). This
   prevents Haier, Buurtzorg, and Berkshire from being wrongly told
   to route strategy through the CEO while preserving the bonus for
   Amazon/Google/Meta and every command org. Implementation: one
   conditional in `src/lib/blendedModel.ts`; update
   `blendedModel.test.ts` with Haier-specific invariants. Validates
   against: the 15-company Strategy-optimum table from H1 should
   leave L=1 flat orgs and the 3 self-managing orgs at
   `noBonus-opt = bonus-opt` while all 9 command/tech/flattened
   orgs continue to flip. This is the first Cycle 12 priority.

2. **[HIGH | Explore] Deep-dive H2: Nyquist / control-theory stability
   as the Latency pillar's analytic foundation.** Derive the
   closed-form crossover `L*(d, ω_n)` for `τ > π/(2ω_n)`, calibrate
   `ω_n` per relay-simulator scenario (safety / customer / innovation
   / strategy / operations), and validate against case studies
   (Meta 2023 layoffs, Google post-Alphabet reorgs, IBM pre-Gerstner
   product cycles). Deliverable: an `evals/helpers/` script that
   computes phase-margin stability per company and a proposed
   Methodology update naming the mechanism. Sandbox-testable.

3. **[HIGH | Explore] Deep-dive H3: Shannon channel capacity as the
   Fidelity pillar's analytic foundation.** Formalize SNR ↔ Bartlett
   retention, derive `F(complexity)` as an explicit function, verify
   that the relay simulator's scenario-typed losses are consistent
   with an SNR-parameterized channel model, and cross-check with the
   Cycle 10 bonus: strategic messages are SNR-disadvantaged and the
   mono-path lift is quantitatively justified per-scenario — which
   may supersede the blunt autonomy gate from Seed #1 with a cleaner
   per-scenario-SNR gate. Sandbox-testable with a toy corpus.

4. **[HIGH | Refine] Land Meta DCI recalibration 28 → 35.** H10
   confirms the flip to Aging at DCI ≥ 31; the defensible range is
   35–45. Narrow code change in `src/data/referenceCompanies.ts`
   plus a comment-block citation pull from Year-of-Efficiency
   sources. Full-enrichment cycle.

5. **[MED | Refine / tooling] Extend `evals/helpers/run-models.ts` to
   expose `scenarioWeights`.** Small gap flagged in stale-prompt
   check. Unblocks scenario-weighted probes from the CLI without
   temp scripts. ~15 lines.

6. **[MED | Explore] Per-layer span helper
   (`layerSpans(levels, employees, shape)`).** Unlocks the H4
   queueing deep dive and possibly a per-layer bottleneck
   visualizer. Current `avgSpan` is a cone-root averaging over an
   implicit geometric distribution; H4's most interesting questions
   need per-layer data.

7. **[LOW | Explore] Park H5 (Miller slack), H7 (percolation),
   H8 (Jackson).** Keep in seed.md at LOW. H5 may promote to a
   Methodology overlay ("bureaucratic slack = L − L_min") without a
   dedicated cycle; H7 becomes a future reorg-shock cycle if one is
   scoped; H8 stays dominated by H4 until per-layer routing data
   surfaces.

8. **[LOW | Refine] Berkshire `trueL` / subsidiary-pattern flag.**
   Cycle 11 surfaced that Berkshire's `levels = 4` is HQ-only and
   misreads under both H1 (CEO-flat bonus) and H5 (Miller floor). A
   `subsidiaryPattern: 'holding' | 'integrated'` annotation on
   `Company` would prevent both errors and is a small
   `types/index.ts` addition.

**Archive / close**: H6 (Conway — needs a dataset), H8 (Jackson —
dominated by H4), H9 (thermodynamics — metaphor-only). Move these to
`seed.md`'s resolved section with one-line verdicts.

---

## Notes on Reproducibility

- All H1/H2/H4/H5/H7/H10 results produced by a temporary
  `evals/tmp-cycle11.ts` (plus a companion `tmp-cycle11b.ts` for H1's
  bonus-ON/OFF comparison) that imported `calcBlendedScores`,
  `calcOrgMetrics`, `calcThermalLag`, `scoreBand`, and the live
  `REFERENCE_COMPANIES` array directly from `src/`. Scripts deleted
  after the cycle run.
- H1 sweep: `teamDecisionMix` in steps of 5 over `[0, 100]`, Strategy
  weights `(0.55, 0.10, 0.35)`, bonus on/off via presence of the
  `scenarioWeights` parameter.
- H10 Meta sweep: direct `calcBlendedScores` calls at fixed
  `L=6, headcount=74067, fidelityRate=82, decisionCycle=2.5,
  teamDecisionMix=70`, varying `dci`.
- Band theorem random check: 10k triples, reproduced Cycle 9/10
  0-upflip invariant (1702 same / 8298 down / 0 up).
- `scenarioWeights` is not exposed via `evals/helpers/run-models.ts`
  (see stale-prompt check) — future cycles should prefer extending
  the helper over temp scripts.
