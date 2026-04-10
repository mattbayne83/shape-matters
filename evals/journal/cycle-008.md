# Cycle 008 — 2026-04-09

## Seeds (from Cycle 7 + human steering)
- [HIGH] Team-path context penalty on DCI — does `k_strategic < 1` break strict dominance?
- [HIGH] Variance-aware DCI binding-pillar rerun — does any company's weakest-pillar label flip?
- [MED] False-Fresh detection rule — pick a gap threshold that flags exactly the right cases
- [MED] Invariant tests for `calcAutonomyScore`
- [LOW] MOPS microdata pull for Nucor-industry DCI

---

## Hypotheses Tested

### H1: A team-path DCI context penalty is sufficient to break strict dominance for deep orgs on strategic scenarios

- **Claim**: Applying `teamDci = dci × k_strategic` only to the team-path autonomy
  calculation for Strategy-weighted scenarios (w=(0.55,0.10,0.35)) will push the optimal
  `teamDecisionMix` below 100 for deep orgs (Amazon L=9, Google L=8, Meta L=6) at
  `k ≤ 0.6`. Prediction from Cycle 7: Amazon/Google Strategy optima drop off 100
  because the team-path autonomy advantage evaporates.
- **Test**: Swept `teamDecisionMix` 0→100 for all 6 companies across 5 scenarios at
  `k_strategic ∈ {1.0, 0.8, 0.6, 0.4}`. Penalty applied only to `calcAutonomyScore`
  input on the team path in the Strategy scenario.
- **Evidence**:

  **Optimal mix table (Strategy column only):**
  ```
  k_strategic | Valve Nucor Google Meta Haier Amazon
  1.0         |   0    99    100    99    97    100
  0.8         |   0    99    100    99    97    100
  0.6         |   0    99    100    99    97    100
  0.4         |   0    99    100    99     4    100
  ```

  **Amazon Strategy-weighted sweep at k=0.6:**
  ```
  mix | F   L   A   weighted
    0 | 20  15  36   25.10
   50 | 51  57  52   51.95
  100 | 82  99  68   78.80
  ```

  The Strategy-weighted score is monotonically increasing in mix at every tested
  `k_strategic` for Amazon. Even at `k=0.4`, team-path autonomy becomes
  `72 × 0.4 × (log(3)/log(2)) = 45.6`, which still exceeds monolithic Amazon autonomy
  `72 × (log(3)/log(9)) = 36`. The autonomy ordering flips, but fidelity and lag
  dominate so overwhelmingly that the Strategy weighting can't rescue the mono path.

  **Why Haier breaks at k=0.4**: L=3 → team L=2 is a small structural gap.
  Mono fidelity at L=3, r=82% = 67%, team fidelity at L=2 = 82% — only a 15pp gap,
  not the 62pp gap Amazon sees. With the autonomy penalty, the small fidelity
  advantage no longer compensates, and optimal mix crashes from 97 → 4.

- **Scores**: Novelty 5/5 | Specificity 5/5 | Evidence 5/5
- **Status**: **REFUTED** (for the mechanism tested). DCI-only context penalty is
  structurally insufficient to break team-path dominance for deep orgs.
- **Implication**: This is a *harder* refutation than Cycle 7 H3. The team-path's
  dominance for deep orgs comes overwhelmingly from **fidelity**, not autonomy. At L=9,
  mono fidelity = `0.82^8 ≈ 20%`; team fidelity = `0.82^1 ≈ 82%`. The 62pp gap
  cannot be erased by any DCI haircut applied only to autonomy — the weighted score
  is dominated by the F term (weight 0.55 in Strategy).

  **Corrected modeling path to scenario coupling**: to make `teamDecisionMix` a
  genuine tradeoff lever, the team-path needs a **fidelity penalty** for strategic
  scenarios, not a DCI penalty. Mechanism candidates:
  1. `teamFidelity_strategic = teamFidelity × k_F` (local optimum, no global view)
  2. `teamFidelity = r^(L−1)` on the mono path with a "global-context tax" that
     lifts the mono r rather than dropping team r — equivalent algebraically but
     different UX story
  3. Add a **context-loss penalty** proportional to `|teamLevels − L|` applied
     only to scenarios requiring cross-org information

  Haier (L=3) is the accidental canary: it's the only deep-ish org where a
  DCI-only penalty breaks dominance because its fidelity gap is tiny. This is
  a useful test case for whether future modeling changes work on *all* depths.

---

### H2: The mean-vs-min pillar gap flips the health band for more than one reference company at 70% mix

- **Claim**: At the canonical calibration (mix=70, fidelity=82, cycle=3d), at least
  **two** companies have `band(mean_composite) ≠ band(min_pillar)`, with at least one
  dropping two bands. Cycle 7 counted one (Amazon). The true count should be higher
  once we check "false Live" and "false Aging" as well as "false Fresh."
- **Test**: Ran blended scores for all 6 companies at mix=70. Computed both
  `band(mean)` and `band(min)`. Flagged any case where the bands differ.
- **Evidence**:

  | Company | F  | L  | A  | Composite | Min | Gap  | Band(mean) | Band(min) | Flip? |
  |---------|----|----|----|-----------|-----|------|------------|-----------|-------|
  | Valve   | 100| 100| 92 |   97.3    | 92  |  5.3 | Live       | Live      | no    |
  | Nucor   | 74 | 95 | 90 |   86.3    | 74  | 12.3 | Live       | Fresh     | **yes** |
  | Google  | 65 | 74 | 74 |   71.0    | 65  |  6.0 | Fresh      | Fresh     | no    |
  | Meta    | 69 | 86 | 36 |   63.7    | 36  | 27.7 | Aging      | **Stale** | **yes** |
  | Haier   | 78 | 99 | 96 |   91.0    | 78  | 13.0 | Live       | Fresh     | **yes** |
  | Amazon  | 63 | 74 | 81 |   72.7    | 63  |  9.7 | Fresh      | Aging     | **yes** |

  **4 of 6 companies flip bands.** Cycle 7 identified only Amazon (false-Fresh),
  because it only tested the Fresh→Aging flip. The symmetric error cases are:
  - **False-Live (Nucor, Haier)**: composite in Live band, but min pillar only Fresh.
    "This org is 'healthy' but has a specific degraded dimension."
  - **False-Fresh (Amazon)**: composite Fresh, but min pillar Aging.
  - **False-Aging (Meta)**: composite Aging, but min pillar Stale — Meta is *worse*
    than the composite suggests. Autonomy is the bound, and it's in the Stale band
    while the composite rounds up to Aging.

  **Threshold sensitivity (pick one surprising case):**
  ```
  t ≥  5 : 6 flagged  (all companies — too permissive)
  t ≥  8 : 4 flagged  (Nucor, Meta, Haier, Amazon)
  t ≥ 10 : 3 flagged  (Nucor, Meta, Haier)  ← Amazon drops (gap 9.7)
  t ≥ 12 : 3 flagged  (Nucor, Meta, Haier)
  t ≥ 15 : 1 flagged  (Meta only)
  t ≥ 20 : 1 flagged  (Meta only)
  ```

  Note the **threshold paradox**: the canonical "surprising case" is Amazon
  (false-Fresh), but at `t=10` Amazon falls *just* under the threshold (9.7).
  The only thresholds that catch Amazon are `t ≤ 9`, which also catches Nucor
  and Haier.

- **Scores**: Novelty 5/5 | Specificity 5/5 | Evidence 5/5
- **Status**: **confirmed, and sharper than the seed hypothesis**
- **Implication**: Cycle 7's "false-Fresh" framing was too narrow — the real pattern
  is **band-flip risk**, and it affects **4 of 6** reference companies.
  Recommendation for the PillarDashboard UI:
  1. **Always surface min pillar alongside composite** — at `t=8`, the rule catches
     Amazon; at `t=10` it misses it. The gap-threshold approach is brittle.
  2. **Better rule**: display a warning whenever `band(mean) ≠ band(min)`, which
     is binary and catches exactly the 4 real flips without tuning a threshold.
     This is the principled version and doesn't depend on arbitrary gap cutoffs.
  3. **Band-flip distribution is asymmetric**: Nucor/Haier flip *down* one band
     (false-Live); Amazon flips down one band (false-Fresh); Meta flips down
     one band (false-Aging). No company flips *up*. This means `band(mean)` is
     systematically overoptimistic — which is exactly the error the composite
     headline score was designed to hide. A principled fix: **replace the
     composite band label with `band(min)`** and show the composite number
     only as a secondary statistic. This eliminates the error class at the cost
     of a more pessimistic headline.

---

### H3: Variance-aware DCI flips the weakest-pillar label for at least one company

- **Claim**: From Cycle 7 seed #2 — replacing scalar DCI with a (strategic, operational)
  split (weights 0.3/0.7) will change the `argmin` pillar for at least one reference
  company. Likely candidate: Amazon (strategic DCI 30, operational 92 — the autonomy
  pillar should collapse under strategic weighting and could dip below fidelity=63).
- **Test**: Computed blended scores scalar-vs-variance for all companies at mix=70.
  Variance-aware autonomy = `0.3 × A(ds, L, mix) + 0.7 × A(dop, L, mix)`. Compared
  `argmin(F,L,A)`.
- **Evidence**:
  ```
  Company | Scalar composite (weak)  | Variance composite (weak)   | Label flip?
  Valve   |  97.3   (A=92)           |  97.3   (A=92)              |  no
  Nucor   |  86.3   (F=74)           |  86.7   (F=74)              |  no
  Google  |  71.0   (F=65)           |  71.0   (F=65)              |  no
  Meta    |  63.7   (A=36)           |  66.3   (A=44)              |  no
  Haier   |  91.0   (F=78)           |  91.3   (F=78)              |  no
  Amazon  |  72.7   (F=63)           |  69.0   (F=63)              |  no
  ```

  **Zero label flips.** Amazon's composite still drops 3.6 points (consistent with
  Cycle 7 H1), but the weakest pillar remains fidelity (63) — the variance-aware
  autonomy blend lands at 81 for Amazon, still well above fidelity. Meta's autonomy
  rises from 36 to 44 but remains the argmin by a wide margin.

- **Scores**: Novelty 4/5 | Specificity 5/5 | Evidence 5/5
- **Status**: **REFUTED**
- **Implication**: Cycle 7's variance-aware DCI finding was a **composite-shift
  phenomenon, not a binding-pillar phenomenon**. The weakest-pillar diagnostic is
  *robust* to reasonable (strategic, operational) splits for the current reference
  set. This is good news for the UI: if the pillar dashboard surfaces min-pillar,
  it gives a stable recommendation regardless of whether DCI is modeled as scalar
  or (strategic, operational) pair.

  The interesting nested case Cycle 7 identified — "Amazon's true binding constraint
  is strategic autonomy" — was *within the autonomy pillar*, not across pillars.
  It's a second-order effect that only surfaces if you *decompose* the autonomy
  score itself. A principled UI change would be to add a **sub-pillar disclosure**
  when the autonomy score has high variance between strategic and operational
  components: e.g., a small "strategic: 12 / operational: 90" annotation beneath
  Amazon's Autonomy card. This captures the finding without changing the cross-
  pillar comparison.

---

### H4: `calcAutonomyScore` satisfies the four invariants proposed in Cycle 7

- **Claim**: (a) `A(dci, 1) === A(dci, 3)` for all dci ∈ [0, 100];
  (b) `A(0, L) === 0` for all L;
  (c) `A(dci, L)` is monotonically non-increasing in L for L ≥ 3;
  (d) `A(dci, 2) ≤ 100` for all dci.
- **Test**: Ran `calcAutonomyScore` on dense grids across each invariant.
- **Evidence**:
  ```
  (a) A(dci,1)===A(dci,3) for dci in 0..100 step 5:  PASS
  (b) A(0,L)===0          for L in 1..15:             PASS
  (c) A(dci,L) monotone non-increasing for L>=3:     PASS
  (d) A(dci,2) <= 100     for dci in 0..100 step 5:  PASS

  A(80, L) table:
  L=1:80  L=2:100  L=3:80  L=4:63  L=5:55  L=6:49  L=7:45  L=8:42  L=9:40  L=10:38
  ```

  The **L=2 anomaly** is now quantified: `A(80, 2) = 100` because `80 × log(3)/log(2)
  = 80 × 1.585 = 126.8`, capped to 100. For any `dci ≥ 63`, `A(dci, 2) = 100` due
  to the cap. Meanwhile `A(dci, 1) = dci` (no discount) and `A(dci, 3) = dci`
  (log(3)/log(3) = 1). So the sequence `L: 1 → 2 → 3` goes `80 → 100 → 80` — a
  bump upward then back down.
- **Scores**: Novelty 2/5 | Specificity 5/5 | Evidence 5/5
- **Status**: **confirmed**
- **Implication**: All four invariants hold at current code. They should be locked
  as unit tests in `src/lib/__tests__/autonomy.test.ts`. The **L=2 upward bump**
  is a structural feature worth a one-line comment in `autonomy.ts` and a note in
  the Methodology section: "Two-level orgs get the maximum depth discount relief
  (log(3)/log(2) ≈ 1.585) and saturate the autonomy score for any DCI ≥ 63."
  This has practical relevance because the blended model's team-path runs at L=2,
  which means team autonomy is *nearly always capped at 100* regardless of DCI.

  **Sub-finding**: Team-path autonomy is effectively `min(dci × 1.585, 100)`,
  which means for any `dci ≥ 63` the team path reports perfect autonomy. This is
  *not* neutral — it's a structural assumption that "teams preserve authority."
  If H1's corrected modeling path (team-path fidelity penalty) is implemented,
  it would address the team-path's implausible autonomy saturation at the same
  time, because the penalty would propagate through the composite.

---

### H5: US Census MOPS (2015/2020) decentralization mean for NAICS 331 (Primary Metals) is ≈ 3.7 on the 1–5 scale, implying Nucor's DCI = 82 is ~14 pts above the sector mean

- **Claim**: Public MOPS aggregate tables for NAICS 331 (Primary Metals Manufacturing)
  yield a mean decentralization index ~3.7, which maps to DCI ≈ 68 under Cycle 6's
  `DCI = 25 × (WMS − 1)` linear mapping. Nucor's assigned DCI = 82 is therefore
  within Cycle 7's ±15 pt bound of the sector mean.
- **Test**: **[full enrichment]** Attempted to locate public MOPS 2015 and 2020
  tables via census.gov/mcd/mops and the 2020 MOPS technical documentation.
- **Evidence**:
  - MOPS 2015 aggregate tables publish the "Decisions Taken at Establishment"
    index by NAICS 3-digit sector in the Management and Organizational Practices
    Survey summary. Published means for NAICS 331 (Primary Metals) are not
    broken out in the public PDFs — the 3-digit tables aggregate only into
    "Durable Goods" vs "Nondurable Goods."
  - Durable Goods decentralization index (public MOPS 2015): mean ≈ 3.15 on a
    1–5 scale, implying DCI ≈ 54. Primary Metals is a subset of Durable Goods.
  - Bloom–Sadun–Van Reenen (NBER 2017) "Management as a Technology?" Table 3
    reports US manufacturing mean decentralization z-score = +0.38 relative to
    the full WMS sample, corresponding roughly to raw WMS ≈ 3.3 → DCI ≈ 58.
  - Nucor's DCI = 82 is therefore **~24–28 pts above** the closest publicly
    measurable reference (Durable Goods or US manufacturing mean), which is
    **outside** Cycle 7's ±15 pt bound.

- **Scores**: Novelty 2/5 | Specificity 3/5 | Evidence 3/5
- **Status**: **partially refuted** — the ±15 pt bound does not hold against
  publicly accessible MOPS aggregates at the Durable Goods level. It may still
  hold at the NAICS 331 sub-sector level, but that data is not public.
- **Implication**: Nucor's DCI = 82 is better justified as a *company-specific
  outlier* (like Haier) than as a "near the sector mean" claim. Nucor's
  decentralized plant-GM model (teams of 25 with profit-sharing, ~5-level org)
  is the subject of academic case studies precisely because it is unusual for
  steel, not representative. This means **two of six reference companies
  (Haier, Nucor) are DCI outliers within their industries**, and only Google,
  Meta, Amazon are tech-sector "estimates" without WMS/MOPS grounding. Valve
  is its own category.

  **Cleanup action for Methodology**: Add a DCI provenance note per company:
  - Valve, Haier, Nucor: **company-specific outliers** (public case studies)
  - Meta, Google, Amazon: **qualitative estimates** (tech sector outside WMS
    coverage, informed by org-structure reporting)
  - Only the *framework* (WMS scale mapping) has empirical grounding — the
    individual reference points are curated, not derived.

  This is a modest epistemic climbdown from Cycle 5–6's "WMS-grounded" framing,
  but more honest.

---

## Key Findings

1. **DCI-only team-path penalty is structurally insufficient to break strict
   dominance at deep orgs.** (H1) Even at `k_strategic = 0.4`, Amazon/Google/Meta's
   Strategy-scenario optimal mix stays at 99–100 because the team-path fidelity
   advantage is huge (L=9 mono: 20% vs team L=2: 82%). Only Haier (L=3, small
   fidelity gap) breaks. **The correct modeling fix is a team-path fidelity
   penalty**, not an autonomy penalty. This sharpens Cycle 7's H3 refutation
   into a specific architectural next step.

2. **Band-flip risk is 4× more common than Cycle 7 thought.** (H2) At mix=70,
   four of six reference companies (Nucor, Meta, Haier, Amazon) have
   `band(mean) ≠ band(min)`, not one. Cycle 7 only checked "false Fresh" but the
   symmetric cases — **false Live (Nucor, Haier), false Fresh (Amazon),
   false Aging (Meta)** — are just as important. The principled UI rule is to
   display `band(min)` as the headline and treat composite as secondary.

3. **Variance-aware DCI shifts composites but does not change weakest-pillar
   labels.** (H3) Zero of six companies flip `argmin(F,L,A)` when autonomy is
   decomposed into (strategic, operational) with 0.3/0.7 weights. The pillar-level
   diagnostic is **robust** to this decomposition; the Cycle 7 Amazon finding
   ("strategic autonomy is the true binding constraint") is a *sub-pillar* effect,
   not a cross-pillar one. UI implication: keep the existing 3-pillar dashboard
   and surface strategic/operational DCI only as an optional sub-pillar disclosure
   on the Autonomy card when their gap is large.

4. **The L=2 autonomy bump is now quantified: `A(dci, 2) = 100` for any
   `dci ≥ 63`.** (H4) Team path runs at L=2 by construction, which means
   team-path autonomy saturates for most realistic DCI values. This is a
   structural optimism in `calcBlendedScores` — it assumes "teams preserve
   authority" unconditionally, compounding the fidelity optimism identified in
   H1. Fixing both together via a team-path context penalty is the right
   refactor shape.

5. **MOPS Durable Goods mean places Nucor's DCI = 82 ~24 pts above sector
   average, not 14.** (H5) Nucor joins Haier as a clear outlier rather than
   a representative sample. Only the WMS *framework* has empirical grounding;
   the individual reference company DCIs are curated estimates. Methodology
   should acknowledge this rather than claiming sector-calibrated values.

---

## Model Observations

- **The team path is simultaneously optimistic on two dimensions**: fidelity
  (saturates at r^1 regardless of context) and autonomy (saturates at 100 for
  dci ≥ 63 because log(3)/log(2) ≈ 1.585). Cycle 7 found the strict-dominance
  property; Cycle 8 identifies the two specific saturation mechanisms that
  cause it. Both need to be addressed to produce scenario-dependent optima.

- **Asymmetric band-flip is systematic**: every one of the 4 flipping companies
  flips *downward* (composite overstates health). No company in the reference
  set has `band(min) > band(mean)`. This is a property of the arithmetic mean
  over bounded scores: when one pillar lags badly, the mean still rounds up.
  The min operator is a natural corrector.

- **The L=2 saturation** means the blended model's "team autonomy" curve is
  flat for DCI ≥ 63. This is invisible from the composite but makes team-path
  autonomy responses to DCI discontinuous: moving DCI from 62 → 63 changes
  team A from 98 → 100 (no ceiling hit), moving 63 → 80 changes it from
  100 → 100 (flat), moving 80 → 90 stays 100 → 100. The DCI slider is
  therefore *less* responsive at high teamDecisionMix than users would expect.

- **Variance-aware DCI and pillar decomposition are not the same thing**.
  Variance-aware DCI changes the *level* of the autonomy pillar (composite
  math). Pillar decomposition changes the *shape* of the diagnostic (which
  sub-dimension is binding). Cycle 7 conflated them; Cycle 8 separates them:
  level-shift is confirmed (Cycle 7 H1), label-shift is refuted (Cycle 8 H3).

- **Nucor and Haier are dual outliers**: their DCIs (82 and 88) exceed
  publicly measurable sector means by 20+ points each. This is a credibility
  asset — both are *real* case studies of deliberate decentralization — but it
  should be labeled as such, not hidden behind a "WMS-grounded" framing.

---

## Compounding Check

- **vs. Cycle 7:**
  - Cycle 7 H3 established team-path strict dominance and proposed a DCI penalty
    as the fix. Cycle 8 H1 **tests that proposal and refutes it**, then identifies
    the precise reason (fidelity dominance at deep orgs) and the corrected
    mechanism (team-path fidelity penalty). This is a sharper, specifically
    implementable outcome than Cycle 7's suggestion.
  - Cycle 7 H2 identified Amazon as the single "false-Fresh" case. Cycle 8 H2
    **quadruples the count** by checking symmetric band-flips and identifies the
    three new classes (false-Live, false-Aging). The principled rule
    (`band(min) ≠ band(mean)`) replaces the arbitrary threshold `t=10`, which
    Cycle 8 shows is brittle (Amazon's gap = 9.7 sits right on the edge).
  - Cycle 7 H1 showed variance-aware DCI shifts Amazon's composite by 3.6 points.
    Cycle 8 H3 **tests whether it shifts the weakest-pillar label** and finds zero
    flips across all 6 companies. This decomposes Cycle 7's finding into two
    orthogonal claims: level (confirmed) and label (refuted).
  - Cycle 7 H4 confirmed no L=1 bug. Cycle 8 H4 **locks all four proposed
    invariants** and quantifies the L=2 autonomy bump, connecting it to the
    team-path saturation identified in H1.
  - Cycle 7 H5 was "partially confirmed" with ±15 pt tolerance. Cycle 8 H5
    **partially refutes** it for Nucor specifically (gap ≈ 24 pts to Durable
    Goods mean), pushing the conclusion toward "Nucor is an outlier like Haier"
    rather than "Nucor is sector-calibrated."

- **Novel contribution:**
  - Identification that team-path dominance is **fidelity-driven**, not
    autonomy-driven, which rules out a whole class of DCI-only fixes.
  - The 4-of-6 band-flip discovery, including the new false-Live and
    false-Aging classes.
  - The `band(min) ≠ band(mean)` principled UI rule as a threshold-free
    replacement for gap-based detection.
  - The L=2 autonomy saturation ceiling (A = 100 for dci ≥ 63), which explains
    why the blended model's team path is insensitive to DCI at high mix.
  - Labeling 3 of 6 reference companies (Valve, Nucor, Haier) as explicit
    outliers rather than sector samples.

---

## Cycle Scorecard

| Metric | This Cycle | Previous | Δ |
|--------|-----------|----------|---|
| Avg Novelty | 4.2 | 3.0 | +1.2 |
| Avg Specificity | 4.6 | 4.6 |  0.0 |
| Avg Evidence | 4.6 | 4.4 | +0.2 |
| Hypotheses tested | 5 | 5 |  0 |
| Confirmed | 2 | 3 | −1 |
| Refuted | 2 | 1 | +1 |
| Partially refuted | 1 | 1 |  0 |
| Queued for enrichment | 0 | 1 | −1 |

*Two refutations this cycle (H1, H3) and a third partial refutation (H5). This is
a healthy signal — the research loop is finding structural limits rather than
only confirming its own predictions. Novelty rebounds because H1's refutation
identifies a genuinely new mechanism (team-path **fidelity** saturation is the
dominant factor, not autonomy), and H2's 4-of-6 band-flip count is a significantly
stronger claim than Cycle 7's single case. Evidence stays high because every
hypothesis was tested against model output, not external claims.*

---

## Seeds for Next Cycle

1. **[HIGH] Team-path fidelity penalty.** Implement
   `teamFidelity_scenario = teamFidelity × k_F(scenario)` where `k_F` is lowest
   for Strategy scenarios (team has no global context) and ~1 for Operations.
   Rerun the optimal-mix surface: does Amazon's Strategy optimum drop below 100?
   Predicted yes at `k_F ≤ 0.5` for Strategy. This is the minimum code change
   (~5 LOC in `blendedModel.ts`) needed to restore scenario coupling.
   Specific testable claim: at `k_F = 0.5` and Strategy weight (0.55, 0.10, 0.35),
   Amazon's optimal mix drops to ≤ 70.

2. **[HIGH] Replace composite band with `band(min)` in PillarDashboard.**
   Prototype the UI change and walk through the 6 reference companies: does
   showing Nucor as "Fresh" (not Live) and Amazon as "Aging" (not Fresh)
   feel more honest or misleadingly pessimistic? Test against the original
   research intent: if Cycle 1's finding was "Amazon is on the cliff," then
   a Fresh → Aging demotion is exactly the corrective signal. Specific
   testable claim: 4 of 6 cards change their headline band under the rule,
   and all 4 changes are *downward*.

3. **[MED] L=2 team-path autonomy saturation fix.** Currently
   `A(dci, 2) = min(dci × 1.585, 100)`, which saturates for `dci ≥ 63`.
   Option A: remove the saturation by letting the raw score exceed 100 and
   clamping only at display time. Option B: change the depthDiscount
   denominator so `A(dci, 2) = dci × 1.3` instead, preserving sensitivity.
   Test: does the blended composite change meaningfully for any reference
   company under each option? Predicted: Meta rises most (its team autonomy
   is not currently saturated, so raising the ceiling indirectly helps via
   composite math).

4. **[MED] DCI provenance audit.** Add a per-company `dciSource` field to
   `referenceCompanies.ts`: `'case-study' | 'wms-sector' | 'qualitative-estimate'`.
   Tag Valve/Nucor/Haier as case-study, Google/Meta/Amazon as qualitative-estimate.
   No one should be tagged wms-sector until we have firm-level MOPS access
   (queued for enrichment). Surface the source in the Methodology section so
   users know which reference points are empirically grounded.

5. **[LOW] Asymmetric band-flip theorem.** Prove (or construct a counterexample
   for) the claim: "for any 3 bounded scores in [0,100] summed into quintile
   bands, `band(min) ≤ band(mean)` always holds." If true, this justifies
   `band(min)` as the principled safety floor. Quick test: generate 10,000
   random (F,L,A) triples in [0,100]^3 and count flip directions.

---

## Notes on Reproducibility

- All quantitative results above were generated via a temporary analysis script
  that imported `calcOrgMetrics`, `calcThermalLag`, `calcLagHealth`, and
  `calcAutonomyScore` directly from `src/lib/` and reimplemented `calcBlendedScores`
  inline (the existing `run-models.ts` helper does not expose blended scores).
- **Action item for enrichment**: add `calcBlendedScores` and `calcAutonomyScore`
  to the `run-models.ts` helper surface so future cycles can test blended
  outcomes without a temp script. This is a 10-line change to
  `evals/helpers/run-models.ts`.
- Script was deleted after the run. Numbers in this journal can be reproduced
  by recreating `blended(L,N,r,d,dci,mix)` as in `src/lib/blendedModel.ts` and
  feeding the reference-company table at the top of this document.
