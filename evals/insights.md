# Accumulated Research Insights

> This file is the system's long-term memory. Updated after each cycle.
> If it exceeds 500 lines, it gets compressed (preserving confirmed/refuted findings).

---

### Cycle 1 — 2026-04-08

1. **The default 82% fidelity rate places Amazon exactly on the round-trip cliff** (RT=4.18%, just below 5%). A single percentage point change matters enormously at 9 levels. The cliff formula `0.05^(1/(2*(L-1)))` gives the minimum viable retention rate for any depth.

2. **The three pillars are really two dimensions.** Fidelity and agility are near-perfectly correlated (r≈1.0) because the torque model collapses to r^(L-1) for bottom-heavy orgs. Lag is the only genuinely independent measure.

3. **Shape classification is a depth proxy, not a size metric.** The gap check (>8%) is never binding for L≥3. The diamond/pyramid distinction is controlled entirely by slope angle. For L≥6, no realistic company avoids "diamond."

### Cycle 2 — 2026-04-08

4. **Signal has a fixed half-life: `h = log(2)/|log(r)|` layers.** At 82%, h=3.49 — exactly 4 layers have >50% pivot efficiency regardless of org depth. Layers beyond this are a "broadcast zone."

5. **The fidelity-agility redundancy is structural, not parametric.** CEO torque algebraically reduces to r^(L-1) because frontline employees dominate mass distribution (85-97%). Only a qualitatively new input dimension (decision authority) could break it.

6. **Restructuring is fidelity-play for flat orgs, speed-play for deep orgs.** Exchange rate (fidelity per lag day saved) decays 49x from L=3 to L=9. Constant x1.22 fidelity boost per level removed, but lag reduction diminishes with depth.

7. **Culture can fix signal quality but only structure can fix speed.** Under heterogeneous fidelity rates, F-Lag correlation drops from 0.91 to 0.23 while F-A stays at ~1.0.

8. **Zone margin compression**: Deep orgs have razor-thin margins. Amazon is -0.8pp below the 5% RT cliff.

### Cycle 3 — 2026-04-08

9. **The half-life formula is distribution-dependent, not universal.** Holds for geometric (bottom-heavy) distributions — which real orgs have — but breaks for uniform (+67-137% CEO torque inflation) and diamond distributions.

10. **Heterogeneous authority profiles decorrelate fidelity and agility.** IC-empowered vs CEO-centric styles produce genuine rank inversions. Spearman correlation drops from 1.0 to 0.77.

11. **Live lag health requires ≤3 levels for d≥2 days/layer.** Structural speed limit formula: `L_max = floor(1 + sqrt(16.25/d))`. Amazon reaching Live would require span=116 (physically impossible).

12. **Communication investment beats restructuring for fidelity at L≥7.** Break-even: `r_new = r^((L-2)/(L-1))`. Amazon needs only +2.06pp fidelity improvement to match removing a level, but gets ZERO lag improvement.

13. **Effective Depth Ratio (EDR) is a genuinely new metric.** EDR = effective_layers/total_layers. Haier/Nucor=100%, Amazon=44%. Orthogonal to existing pillars.

14. **Decision cycle and depth are substitutable for lag.** Halving cycle time = reducing depth by sqrt(2). More practical for deep orgs.

### Cycle 4 — 2026-04-08

15. **The DCI crossover threshold is low: Amazon needs only DCI≥35 to outperform Meta on authority-agility** despite 3× worse fidelity and 3 more levels. A 35% IC-empowered bias is sufficient to overcome Meta's structural advantage.

16. **Log-form coordination costs are mathematically inert for uniform distributions** (penalty cancels in torque normalization). Only signal-transmission corrections can break the F-A redundancy — not mass-based corrections. (REFUTED H2)

17. **McKinsey's "3 layers for agile" independently validates the structural speed limit formula.** `L_max` at d≥2 = 3 layers; at d≈1 = 6 layers. Amazon's two-pizza teams (L=2 operational cells) bypass the L=9 chain by architecture. Strongest external validation across all cycles.

18. **Cycle-time reduction is the highest-ROI lever for deep orgs.** 10% cycle reduction yields 0.38 levels of health improvement for Amazon vs 0.17 for Nucor. Deep orgs are on the steep part of the lag-health exponential curve — explains why Amazon/Google invest in CI/CD over restructuring.

### Cycle 5 — 2026-04-09

1. **DCI variance is the sole decorrelation mechanism.** At uniform DCI (any value 0-100),
   fidelity and authority-agility have Spearman ρ = 1.0. Decorrelation is entirely injected by
   DCI heterogeneity. This resolves the Cycle 1-2 redundancy concern: the F-A correlation is
   not a model flaw but an accurate reflection of uniform-authority orgs. The DCI slider is
   the surgical fix. (H2)

2. **The two-pizza blended model transforms Amazon from Expired (15 HP) to Fresh (74 HP).**
   The monolithic model is a worst-case bound that assumes all decisions traverse the full
   hierarchy. Real organizations route 60-80% of decisions through short paths (L=2-3). The
   blend ratio `p` is a new parameter: Amazon at 70:30 blend is Fresh; it needs ≥83% team
   decisions for Live. This explains how Amazon functions at L=9 without organizational paralysis.
   (H3)

3. **Signal-decay congestion is the first correction that actually works on uniform distributions.**
   The per-layer fidelity model `r_eff = r(1-γ×n_k/N_max)` reduces the Uni/Geo divergence from
   2.3× to ~1.5× at L=9, unlike the log-form correction proved inert in Cycle 4. The trade-off:
   γ > 0 also reduces geometric CEO torque. (H1)

4. **β(L) = 0.158 × (L-4)^0.683 completes the HHI half-life generalization.** The phase
   transition at L=4 = ceil(h_base) is structurally meaningful: below the half-life ceiling,
   all distributions behave similarly. The 10-point curve resolves Cycle 4's inconclusive
   two-point fit. (H4)

---


### Cycle 6 — 2026-04-09

1. **Blended-model elasticity is monotonic in depth, saturating near L=9 at ~70 health points.**
   Amazon/Google get the maximum possible upside (66–70 points of composite lift) from team
   routing; Haier/Nucor get <26 because their monolithic baseline is already Live/Fresh.
   This makes `teamDecisionMix` the highest-leverage UI control *specifically for deep
   orgs.* (H1)

2. **Meta is structurally unreachable by blending alone.** No value of teamDecisionMix
   between 0 and 100 will push Meta to Fresh, because autonomy = DCI × depthDiscount(L) is
   capped at ~44 for DCI=28 at team depth. Meta needs the DCI slider raised to ~41+ before
   routing even matters. This creates a new 2×2: deep orgs split into *routing-curable*
   (Amazon, Google) vs *governance-locked* (Meta). (H2)

3. **Amazon is 2 fidelity points under Fresh at live calibration; +1pp of r (82→83) is
   equivalent to +2.5 points of mix.** The substitution rate `Δmix/Δr ≈ 2.5` holds between
   r=80% and r=86%. Per-hop signal quality is the cheapest lever for deep orgs near
   breakeven. (H3)

4. **Congestion γ=0.1 is structurally inert for real (geometric) orgs — sub-1.1pp effect
   on CEO agility for every reference company.** The parameter survives as scaffolding
   for future matrix-org archetypes, but does *not* currently affect rankings. It is not
   advertising-worthy in UI copy. (H4)

5. **DCI ≈ 25 × (WMS_decentralization − 1) is a defensible linear mapping** to the Bloom–
   Van Reenen World Management Survey's published 1–5 scale (~15,000 firms, 35 countries).
   Current reference DCIs are consistent with WMS patterns within ±10 points. The mapping
   provides empirical grounding for DCI in Methodology. (H5)

---


### Cycle 7 — 2026-04-09

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


### Cycle 8 — 2026-04-09

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

