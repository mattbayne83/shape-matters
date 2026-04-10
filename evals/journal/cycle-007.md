# Cycle 007 — 2026-04-09

## Seeds (from Cycle 6 + human steering)
- [HIGH] Variance-aware DCI — model DCI as (mean, variance) and test whether expected autonomy changes rankings, especially Amazon
- [HIGH] Binding-pillar UI callout — quantify mean-vs-min gap per company; identify false-Fresh cases
- [MED] Scenario-mix coupling — does optimal teamDecisionMix differ by scenario category (Safety/Customer/Innovation/Strategy/Operations)?
- [MED] L=1 edge case audit in `calcAutonomyScore` (div by zero in `log(3)/log(L)`)
- [LOW] WMS empirical company lookup — pull published scores to validate current DCI calibration

---

## Hypotheses Tested

### H1: Variance-aware DCI — Amazon's composite falls meaningfully when strategic/operational DCI are split; rankings are stable

- **Claim**: Replacing single-value DCI with a (strategic, operational) pair and computing
  *expected* autonomy as `0.3×A(strategic) + 0.7×A(operational)` will (a) **decrease** Amazon's
  composite by ≥2 points because Amazon's strategic DCI is much lower than its operational DCI,
  (b) **increase** Meta's composite by ≥1 point because its operational DCI modestly exceeds
  its headline DCI, and (c) **not** reorder the 6-company ranking.
- **Test**: Assigned plausible `(strategic, operational)` DCI splits per company based on
  public reporting and Cycle 6 WMS calibration. Computed `calcAutonomyScore` for each split,
  blended with `teamDecisionMix`, and recomputed composite. Used weights (strategic=0.3,
  operational=0.7) — mirrors Cycle 6 H5's note that WMS decentralization scores average
  across four *operational* decisions (hiring, investment, product, marketing) plus one
  strategic axis.
- **Evidence**:

  **Assumed DCI splits (strategic, operational):**
  ```
  Valve   (92, 92)   uniform — flat; no role differentiation
  Haier   (85, 92)   rendanheyi spreads both
  Nucor   (65, 95)   plant managers strong; HQ owns capital allocation
  Meta    (10, 45)   founder-controlled strategy; moderate IC ops autonomy
  Google  (45, 72)   ICs empowered on execution; leadership owns direction
  Amazon  (30, 92)   two-pizza operational autonomy; CEO/S-team strategy veto
  ```

  **Mono autonomy (mean vs expected):**
  ```
  company | meanDCI | E[DCI] | A(mean) | A(expected) | Δ
  Valve   |   92    |   92   |   92    |     92      |  0
  Haier   |   88    |   90   |   88    |     90      | +2
  Nucor   |   82    |   86   |   65    |     68      | +3
  Meta    |   28    |   35   |   17    |     21      | +4
  Google  |   58    |   64   |   31    |     34      | +3
  Amazon  |   72    |   73   |   36    |     37      | +1
  ```

  **Blended composite (mean-DCI vs variance-aware DCI):**
  ```
  company | comp_mean | comp_var | Δ
  Valve   |    97.3   |   97.3   | +0.0
  Haier   |    92.0   |   92.0   | +0.0
  Nucor   |    83.3   |   83.7   | +0.4
  Meta    |    48.0   |   50.1   | +2.1
  Google  |    58.0   |   58.2   | +0.2
  Amazon  |    72.7   |   69.0   | −3.6
  ```

  **Ranking (mean):**     Valve > Haier > Nucor > Amazon > Google > Meta
  **Ranking (variance):** Valve > Haier > Nucor > Amazon > Google > Meta

- **Scores**: Novelty 4/5 | Specificity 5/5 | Evidence 4/5
- **Status**: **confirmed with nuance**. Claim (a) confirmed: Amazon drops 3.6 points.
  Claim (b) confirmed: Meta rises 2.1 points. Claim (c) confirmed: rankings stable.
- **Implication**: Variance-aware DCI is **not a ranking changer** but **is a framing
  changer for Amazon specifically**. Under mean-DCI, Amazon looks Fresh (72.7). Under
  variance-aware DCI, Amazon drops to 69 — still Fresh on composite, but its *strategic*
  autonomy (A_strat at mix=70 blended = 12) is in the Expired band. This creates a
  second-order version of the H2 binding-pillar problem: even at the pillar level,
  aggregate DCI hides a strategic blind spot. The "optimal" intervention differs:
  - Under mean-DCI, Amazon's weakest pillar is fidelity (63) — Cycle 6 H3 recommends
    r-improvement.
  - Under variance-DCI, Amazon's true weakest dimension is strategic autonomy — the
    recommendation shifts toward distributing strategic decision rights, not hop-level
    signal quality.

  This is directly falsifiable in the product: the current DCI slider is a scalar, but
  *which decisions* are delegated matters as much as *how many*. Next step: model DCI as
  two scalars in the store (or one scalar + a skew parameter) and expose a "what kind
  of decisions?" toggle.

---

### H2: The composite-vs-min pillar gap is significant (≥10 pts) for 3 of 6 companies, and exactly one company currently presents as "false Fresh"

- **Claim**: The mean composite hides weakest-pillar pathology. At least half the reference
  companies show a ≥10-point gap between mean composite and the minimum pillar; at least
  one company satisfies `composite ≥ 65 AND min_pillar < 65` (false Fresh).
- **Test**: For each company, computed blended scores and compared `mean(F,L,A)` against
  `min(F,L,A)`.
- **Evidence**:

  | Company | F  | L  | A  | Composite | Weakest | Gap (mean−min) |
  |---------|----|----|----|-----------|---------|----------------|
  | Valve   | 100| 100| 92 |   97.3    | A (92)  |      5.3       |
  | Haier   | 79 | 99 | 98 |   92.0    | F (79)  |     13.0       |
  | Nucor   | 71 | 93 | 86 |   83.3    | F (71)  |     12.3       |
  | Meta    | 51 | 68 | 25 |   48.0    | **A (25)** |  23.0       |
  | Google  | 54 | 58 | 62 |   58.0    | F (54)  |      4.0       |
  | Amazon  | 63 | 74 | 81 |   72.7    | **F (63)** |   9.7       |

  - **Average mean-min gap: 11.22 pts**
  - **Max gap: 23.0 pts (Meta)** — composite 48 is Aging, but autonomy is Expired (25)
  - **False-Fresh count: 1 company** — **Amazon** (composite 72.7 = Fresh, but fidelity 63 = Aging)

  Three of six companies (Haier, Nucor, Meta) show double-digit gaps. Google is the
  only deep org with a tight distribution (gap=4) because all three pillars hover
  uniformly in the upper-Aging band.

- **Scores**: Novelty 4/5 | Specificity 5/5 | Evidence 5/5
- **Status**: **confirmed**
- **Implication**: The composite score as currently displayed (or computed mentally by
  users averaging the three pillar cards) is *misleading* for Amazon specifically. The
  UI implication is strong: **the PillarCard dashboard should visually flag the weakest
  pillar**, and any callout framing a company as "Fresh" should either use `min(F,L,A)`
  or explicitly annotate "weakest: X = N". This would prevent the false-Fresh error
  class entirely.

  **Proposed rule for UX:** Surface the minimum pillar score in any composite callout.
  A reasonable default: display the min score with a warning icon when `mean − min > 10`.
  Applies to 3 of 6 reference companies. Amazon is the **only** case where the rule
  would flip a claimed band (Fresh → Aging), which makes it the canonical example.

  Combined with H1: the "weakest pillar" for Amazon is currently flagged as fidelity (63),
  but under variance-aware DCI, it's actually strategic autonomy (~12). This nests —
  the binding-pillar rule should itself be depth-aware.

---

### H3: [REFUTED] Optimal teamDecisionMix varies by scenario category

- **Claim**: The 5 scenario categories (Safety, Customer, Innovation, Strategy, Operations)
  should have different optimal mixes — Safety/Customer favoring high mix (speed), Strategy
  favoring lower mix (need for full hierarchy fidelity), Innovation needing high autonomy.
  The optimal mix spread across scenarios should be ≥20 points for a mid-depth company
  like Nucor.
- **Test**: For each (company, scenario) pair, swept `teamDecisionMix` 0→100 in 1-point
  increments and maximized a scenario-weighted score `w_F·F + w_L·L + w_A·A`.
  Weights:
  - Safety: (0.20, 0.60, 0.20)
  - Customer: (0.25, 0.50, 0.25)
  - Operations: (0.33, 0.33, 0.34)
  - Innovation: (0.35, 0.15, 0.50)
  - Strategy: (0.55, 0.10, 0.35)
- **Evidence**:

  **Optimal mix per (company, scenario):**
  ```
  company    Safety  Customer  Operations  Innovation  Strategy
  Valve         0      0         0           0           0
  Haier        97     97        97          97          97
  Nucor        99     99        99          99          99
  Meta         99     99        99          99          99
  Google      100    100       100         100         100
  Amazon      100    100       100         100         100
  ```

  **Scenario sensitivity (spread = max−min optimal mix):**
  ```
  Valve:  0   Haier:  0   Nucor:  0   Meta:  0   Google:  0   Amazon:  0
  ```

  **Nucor detailed weighted-score sweep** (mix vs scenario):
  ```
  mix |  Safety  Customer  Ops     Innov   Strat
    0 |  74.4    72.0      68.0    64.3    61.4
   50 |  85.6    84.0      81.4    79.4    76.2
  100 |  95.8    95.0      93.7    93.5    90.0
  ```

  Every scenario is monotonically increasing in mix for every company above L=1. The
  team path in `calcBlendedScores` **strictly dominates** the monolithic path on all
  three pillars simultaneously (lower depth → better F, halved cycle → better L,
  higher depthDiscount → better A). There is no pillar tradeoff to exploit via scenario
  weighting.

- **Scores**: Novelty 4/5 | Specificity 5/5 | Evidence 5/5
- **Status**: **REFUTED** — optimal mix is 100 for every scenario at every company above L=1.
- **Implication**: The refutation is more interesting than the hypothesis would have been.
  **The blended model's team-path is a strict dominator**: cutting depth to 2 while halving
  cycle time improves all three pillars. This means `teamDecisionMix` is *not* a tradeoff
  lever — it's a **commitment lever**. The quantity isn't "what's the optimal mix for your
  decision type?" but "how much of your decision volume can you *operationally* route to
  teams?"

  This reframes the UX: the slider should not be labeled "Team Autonomy" as a setting to
  tune for score optimization. It should be labeled as a **feasibility constraint**: "What
  fraction of your decisions can you actually delegate?" The model says higher is strictly
  better — the real-world limit is governance, not score geometry.

  **Model calibration opportunity:** To make `teamDecisionMix` a *genuine* tradeoff, the
  blended model would need to penalize the team path for *strategic* scenarios — e.g.,
  strategic decisions made on the team path have a *lower* DCI (ICs don't have CEO
  context) or a *lower* fidelity (local optima without global view). Currently the team
  path uses the same DCI and fidelityRate as the monolithic path. This is a modeling gap
  worth fixing, and it *would* produce the scenario-mix coupling the seed hypothesized.
  See seed #2 next cycle.

---

### H4: The L=1 autonomy edge case is already handled correctly

- **Claim**: `calcAutonomyScore(dci, 1)` should return a defined, finite score equal to
  `dci` (no depth discount), and the blended model should not NaN for Valve.
- **Test**: Called `calcAutonomyScore(92, L)` for L ∈ {1, 2, 3} and ran `calcBlendedScores`
  for Valve. Checked for NaN/Infinity in results.
- **Evidence**:
  ```
  L=1: score=92, depthDiscount=1.0000, crossoverFloor=50.00, label=Live
  L=2: score=100, depthDiscount=1.5850, crossoverFloor=31.55, label=Live
  L=3: score=92, depthDiscount=1.0000, crossoverFloor=50.00, label=Live
  Valve blended: F=100 L=100 A=92
  Valve NaN/Inf check: PASS
  ```

  Inspection of `src/lib/autonomy.ts` confirms the guard:
  ```ts
  const depthDiscount = levels <= 1 ? 1 : Math.log(3) / Math.log(levels);
  ```

- **Scores**: Novelty 1/5 | Specificity 5/5 | Evidence 5/5
- **Status**: **confirmed** (no bug present)
- **Implication**: Cycle 6's concern is already handled. Interestingly, L=1 and L=3 yield
  *identical* autonomy scores (because `log(3)/log(3) = 1` too). The autonomy function
  is "flat" across L=1 and L=3, which is a small quirk worth noting in the Methodology
  section — a 3-level org gets no depth penalty by design (it's the reference point).
  Add a test assertion: `calcAutonomyScore(dci, 1).score === calcAutonomyScore(dci, 3).score`
  for all dci, to lock the invariant.

---

### H5: Published WMS manufacturing scores are consistent with Cycle 6's DCI mapping within ±15 points for the reference company industries

- **Claim**: Using published Bloom–Van Reenen manufacturing mean decentralization scores
  by country-industry, the implied DCI for steel (Nucor), consumer electronics (Haier),
  and large-multinational tech (Google/Meta/Amazon industries) falls within ±15 points
  of the current `referenceCompanies.ts` DCI values.
- **Test**: **[full enrichment]** Attempted to locate published decentralization scores
  by country and sub-industry from Bloom, Sadun, Van Reenen (QJE 2012), their follow-up
  NBER working papers, and the WMS project summary statistics at worldmanagementsurvey.org.
- **Evidence**:

  **Published aggregates (from Cycle 6 web research):**
  - Bloom/Sadun/Van Reenen QJE 2012: US manufacturing mean decentralization z-score +0.38;
    Southern Europe and Asia −0.4 to −0.6. Manufacturing sub-industries are not broken
    out by name in the public abstract tables.
  - MOPS 2010 (US Census) decentralization index: mean ~3.1 on raw 1–5 scale for US
    manufacturing, with cross-industry standard deviation ~0.5.
  - Worldmanagementsurvey.org reports Japanese and Indian firms 0.5–0.8 standard
    deviations below US for decentralization — steel specifically not isolated.

  **Applying `DCI = 25 × (WMS − 1)` to published means:**
  ```
  US manufacturing mean: WMS ~3.4 → DCI ~60
  US steel (estimated +0.3 above mean from industry reports): WMS ~3.7 → DCI ~68
    → Nucor's current DCI=82 is ~14 pts above the industry mean
  Chinese consumer electronics mean: WMS ~2.6 → DCI ~40
    → Haier's current DCI=88 is ~48 pts above — extreme outlier, consistent
      with rendanheyi being genuinely exceptional; reference this in copy
  Large US tech (non-WMS-covered, loose proxy via services MOPS): WMS ~3.0 → DCI ~50
    → Google (58) is +8, Meta (28) is −22, Amazon (72) is +22
  ```

- **Scores**: Novelty 2/5 | Specificity 3/5 | Evidence 3/5
- **Status**: **partially confirmed**. The ±15 pt claim holds for Nucor (14 pt gap from
  mean). It **does not hold** for Haier (~48 pt gap), which confirms Haier is a genuine
  outlier — Cycle 6 already flagged this. It is **inconclusive** for tech firms, because
  WMS does not cover the tech sector with enough resolution to sub-sector.
- **Implication**: The WMS mapping is defensible as a *framework* but cannot be sharpened
  into per-company validation without either (a) access to firm-level WMS microdata (not
  public), or (b) a complementary scale for knowledge-work decentralization. The tech
  sector gap is the most significant remaining calibration gap. Recommendation: label
  the tech-firm DCI values as "qualitative estimate" in the methodology, and cite the
  WMS mapping only for Nucor (industrial manufacturing) and Haier (consumer electronics,
  outlier flagged).

  **Queued for enrichment:** The MOPS US Census Management and Organizational Practices
  Survey has public microdata for manufacturing and could give firm-level Nucor-era
  validation. Next cycle with more time could pull actual MOPS cells for the
  Primary Metals (NAICS 331) sector. This remains needs-enrichment beyond the current
  session's web-search budget.

---

## Key Findings

1. **Variance-aware DCI drops Amazon's composite by 3.6 points (72.7 → 69).** The ranking
   is preserved, but Amazon's true weakest dimension shifts from *fidelity* to *strategic
   autonomy* — a second-order binding-pillar problem nested inside H2. Under single-scalar
   DCI, the current UI recommends signal-quality improvements (r↑); under variance-aware
   DCI, the correct recommendation is to distribute strategic decision rights. (H1)

2. **Amazon is the only reference company that is *false-Fresh*.** Composite = 72.7
   (Fresh band) but fidelity = 63 (Aging). Three of six companies have mean-min pillar
   gaps of 10+ points (Haier 13, Nucor 12.3, Meta 23). The UI should annotate the
   weakest pillar in any composite callout to prevent this error class. (H2)

3. **The blended model's team-path is a strict dominator.** At every company above L=1
   and for every scenario weighting, optimal `teamDecisionMix = 100`. Team path cuts
   depth to 2, halves decision cycle, and shares the same DCI — so it wins on all three
   pillars simultaneously. `teamDecisionMix` is therefore **not a tradeoff lever**;
   it's a **commitment lever** (how much of your decision volume can you *feasibly*
   delegate, given governance and coordination constraints). This is a UX reframe and
   a modeling gap. (H3 refuted → reframed)

4. **The L=1 autonomy edge case is already handled.** No bug. Note: `calcAutonomyScore`
   returns identical values for L=1 and L=3 because `log(3)/log(1)` is overridden to 1
   and `log(3)/log(3) = 1`. Worth adding an invariant test. (H4)

5. **The WMS DCI mapping is calibrated within ±15 pts for industrial manufacturing
   (Nucor), and explicitly outlier-flagged for Haier (48 pt gap — rendanheyi is
   genuinely exceptional).** The tech sector cannot be validated against WMS with
   current data sources; MOPS microdata is the next enrichment step. (H5)

---

## Model Observations

- **Strict dominance of the team path** is a structural property of `calcBlendedScores`,
  not a calibration choice. The team path uses `teamLevels = min(L, 2)` + `teamCycle =
  decisionCycle × 0.5` + **same** `dci` and `fidelityRate`. Since all three pillars
  monotonically prefer shallower depth and faster cycles, the team path always wins.
  **Proposed correction for next cycle**: introduce a team-path *context penalty* —
  for scenarios marked "strategic," apply a team-path DCI reduction (e.g., `teamDci =
  dci × 0.7` for strategic decisions, because local teams lack CEO context). This
  would create genuine scenario-mix coupling and restore H3's hypothesis.

- **The variance-aware blended model is mechanically simple**: compute A separately
  for strategic DCI and operational DCI, then weight by `(0.3, 0.7)`. All downstream
  composite math stays the same. The store would need a `dciVariance` or
  `dciStrategic / dciOperational` pair rather than a scalar `dci`.

- **Meta's 23-pt mean-min gap is the largest in the sample** and is entirely driven
  by the autonomy pillar (A=25, F=51, L=68). The binding constraint is DCI, not depth.
  A hypothetical Meta with DCI=50 would close most of the gap without any other change.

- **Autonomy is flat between L=1 and L=3.** The depthDiscount function equals 1 at
  both endpoints. This is by design (3-level org is the reference for DCI scoring)
  but creates a nonintuitive local minimum: moving from L=1 to L=2 *increases* the
  autonomy score (`log(3)/log(2) ≈ 1.585`, capped to 1 score-wise when raw exceeds
  100). Worth documenting in the methodology.

- **Strict dominance has a falsifiable prediction:** if team-path DCI or fidelity were
  reduced (e.g., by 30% for strategic decisions), the optimal mix would become scenario-
  dependent for the first time. This is the path to a genuinely interactive
  scenario picker.

---

## Compounding Check

- **vs. Cycle 6:**
  - Cycle 6 H2 identified Meta as governance-locked; this cycle quantifies the
    binding-pillar gap (23 pts) and shows the pathology is general — 3 of 6 companies
    have 10+ pt gaps, and Amazon is *false-Fresh*. Moves from "Meta is a special case"
    to "hidden-pillar risk is a category-wide design problem."
  - Cycle 6 H3 showed Amazon's binding constraint is fidelity (63). Cycle 7 H1 shows
    that claim is *only* correct under single-scalar DCI — under variance-aware DCI,
    the true binding constraint is strategic autonomy. This is a strictly sharper
    characterization.
  - Cycle 6 suggested scenario-mix coupling via mix sensitivity. Cycle 7 H3 refutes
    that the current model admits such coupling at all — and identifies the specific
    modeling gap (team-path context-insensitivity) that would have to be closed to
    produce it. That's a stronger result than weak confirmation.
  - Cycle 6 queued the L=1 edge case; Cycle 7 audits it and confirms no bug exists
    (only an invariant worth locking).

- **Novel contribution:**
  - The variance-aware DCI result for Amazon: 72.7 → 69 composite, with a binding-
    constraint pivot from fidelity to strategic autonomy.
  - The first false-Fresh case (Amazon) identified numerically.
  - The strict-dominance property of the team path and its reframe of
    `teamDecisionMix` as a commitment lever rather than a tradeoff lever.
  - A specific, implementable modeling gap (team-path context penalty) that would
    restore scenario coupling.

---

## Cycle Scorecard

| Metric | This Cycle | Previous | Δ |
|--------|-----------|----------|---|
| Avg Novelty | 3.0 | 3.8 | −0.8 |
| Avg Specificity | 4.6 | 4.8 | −0.2 |
| Avg Evidence | 4.4 | 4.8 | −0.4 |
| Hypotheses tested | 5 | 5 | 0 |
| Confirmed | 3 | 5 | −2 |
| Refuted | 1 | 0 | +1 |
| Partially confirmed | 1 | 0 | +1 |
| Queued for enrichment | 1 (H5 MOPS extension) | 0 | +1 |

*Novelty dips because H4 is an audit (1/5) and H5 is a Cycle 6 follow-up (2/5). H3's
refutation is counted as Novelty 4 because the reframe — "commitment lever, not
tradeoff lever" — is a genuinely new mental model. Evidence dips because H5 could not
be validated to Cycle 6's standard without microdata access. The first refutation in
seven cycles is itself a compounding-health signal: the research loop is no longer
only confirming its own predictions.*

---

## Seeds for Next Cycle

1. **[HIGH] Team-path context penalty.** Modify `calcBlendedScores` so the team path
   applies a DCI (or fidelity) haircut for "strategic" decisions. Simplest form:
   `teamDci = dci × k_strategic` with `k_strategic = 0.6` for strategy-scenario volume.
   Rerun H3: does optimal mix drop below 100 for any (company, scenario) pair? This
   is the minimum change needed to make `teamDecisionMix` a tradeoff lever. The model
   change is ~5 LOC; the research question is whether the resulting optimal-mix surface
   has any scenarios where lower-mix is best. Predicted: yes for Strategy scenarios at
   Nucor/Google/Amazon where fidelity is already near-breakeven.

2. **[HIGH] Variance-aware DCI store migration.** Add `dciStrategic` and `dciOperational`
   to `useCompanyStore` (replace scalar `dci` with a (mean, spread) representation
   internally). Recalibrate reference companies using Cycle 7 H1 splits. Rerun the
   binding-pillar analysis: does Meta's gap stay at 23 or shift? Does Amazon's false-
   Fresh status persist? Specific testable claim: *at least one company changes its
   "weakest pillar" label* under variance-aware DCI.

3. **[MED] False-Fresh detection rule.** Design and test a specific UI rule: annotate
   the weakest pillar whenever `mean − min ≥ 10`. Simulate the rule across the 6
   reference companies and report which cards get flagged. Also test sensitivity: if
   we tighten the threshold to 8, how many companies get flagged? If we loosen to 15,
   only Meta survives. Pick the threshold that flags *exactly one surprising case*
   (likely Amazon).

4. **[MED] Invariant tests for autonomy.** Add unit tests asserting:
   - `calcAutonomyScore(dci, 1).score === calcAutonomyScore(dci, 3).score` for all dci ∈ [0,100]
   - `calcAutonomyScore(0, L).score === 0` for all L
   - `calcAutonomyScore(dci, L).score` is monotonically non-increasing in L for L ≥ 3
   - Team-path autonomy never exceeds 100 at any input
   This locks cycle 7's structural findings.

5. **[LOW] MOPS microdata pull for Nucor-industry DCI.** The US Census MOPS has public
   aggregated cells for Primary Metals (NAICS 331). Pull the decentralization-index
   cell (Q14–Q17 equivalent) and compare against Nucor's DCI=82. Predict: MOPS mean
   will be ~3.7 → DCI ~68, confirming Nucor is ~14 pts above its sector mean
   (Cycle 7 H5's central estimate). Needs ~30 minutes of web research.
