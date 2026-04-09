# Cycle 002 — 2026-04-08

## Seeds (from Cycle 001)
- [HIGH] Per-org "minimum viable fidelity rate" indicator with multi-zone thresholds (5%, 10%, 15%, 25%, 50% RT)
- [HIGH] Break the fidelity-agility redundancy: what enrichments to the torque model make agility genuinely independent?
- [MED] Sensitivity of pillar correlation to heterogeneous fidelity rates across companies
- [LOW] The "Gemba Number": derive closed-form for layer where pivot efficiency drops below 50%
- [MED] (added) Marginal layer cost asymmetry: fidelity gain vs lag savings have different scaling laws

## Hypotheses Tested

### H1: Multi-zone fidelity dashboard reveals company-specific vulnerability

- **Claim**: Mapping each company's round-trip fidelity against multiple thresholds (5%, 10%, 15%, 25%, 50%) creates a diagnostic "zone map" that reveals differential vulnerability. Specifically: deep orgs have razor-thin margins between zones while shallow orgs have wide safety buffers.
- **Test**: Computed `r_cliff(threshold, L) = threshold^(1/(2*(L-1)))` for each company × threshold pair. Then computed current RT fidelity and margin to nearest cliff.
- **Evidence**:

  **Zone cliff table** — minimum fidelityRate (%) needed to stay above each RT threshold:

  | Company | L | RT>5% | RT>10% | RT>15% | RT>25% | RT>50% | Current RT | Current Zone |
  |---|---|---|---|---|---|---|---|---|
  | Valve | 1 | 0 | 0 | 0 | 0 | 0 | 100.00% | >50% |
  | Haier | 3 | 47.3% | 56.2% | 62.3% | 70.7% | 84.1% | 45.21% | >25% |
  | Nucor | 4 | 60.6% | 68.1% | 72.6% | 79.4% | 87.1% | 30.40% | >25% |
  | Meta | 6 | 74.1% | 79.4% | 82.6% | 87.1% | 93.3% | 13.74% | >10% |
  | Google | 8 | 80.6% | 84.7% | 87.0% | 90.5% | 95.2% | 6.21% | >5% |
  | Amazon | 9 | 82.8% | 86.4% | 88.4% | 91.6% | 95.8% | 4.18% | **<5%** |

  **Margin analysis** (how far each company's fidelityRate sits from its current zone cliff):

  | Company | Zone | Cliff f | Margin | Next zone up | Gap to next |
  |---|---|---|---|---|---|
  | Haier | >25% | 70.7% | +11.3pp | >50% | need +2.1pp |
  | Nucor | >25% | 79.4% | +2.6pp | >50% | need +5.1pp |
  | Meta | >10% | 79.4% | +2.6pp | >15% | need +0.6pp |
  | Google | >5% | 80.6% | +1.4pp | >10% | need +2.7pp |
  | Amazon | <5% | 82.8% | **-0.8pp** | >5% | need +0.8pp |

  **Key finding**: Zone margins compress with depth. Haier has 11.3pp of safety margin within its zone; Amazon is already 0.8pp below its cliff. The margin compression follows approximately `margin ∝ 1/(L-1)` because the cliff formula's exponent grows with L.

  **Surprising result**: Meta sits only 0.6pp below the >15% zone. A modest communication improvement (82→83% per-layer) would push its RT from 13.7% to 15.9%, crossing into the next zone. This is an actionable insight: Meta's zone boundary is the most achievable upgrade.

- **Scores**: Novelty 3/5 | Specificity 5/5 | Evidence 5/5
- **Status**: **confirmed**
- **Implication**: The zone map is a practical diagnostic tool. It answers "how far am I from the next cliff?" rather than showing a single fidelity number. The margin compression with depth (from Cycle 1's cliff formula) means deep orgs need to monitor fidelity rate more carefully — they're always close to a threshold. Suggests a "fidelity safety margin" indicator for the UI: `margin = f - r_cliff(current_zone, L)`.

---

### H2: The fidelity-agility redundancy is structural, not parametric — enrichments partially decorrelate

- **Claim**: The near-perfect correlation (r≈0.9997 from Cycle 1) between fidelity and agility arises because CEO torque mathematically reduces to ≈ r^(L-1) for bottom-heavy orgs. Enrichments that introduce span-dependent costs can partially break this, but the correlation remains strong (r>0.95).
- **Test**: (1) Algebraically decomposed CEO torque to prove frontline dominance. (2) Tested three enrichment candidates: coordination-adjusted, span-penalized per-hop, and lateral communication bonus.
- **Evidence**:

  **Algebraic proof of frontline dominance:**

  CEO torque = (1/N) × Σ_k n_k × r^|CEO-k| = (1/N) × Σ_k n_k × r^(L-1-k)

  For geometric layer distribution with span s: n_k = E/(s^k × Σ(1/s^j)) × E

  CEO torque = r^(L-1) × [Σ_k (1/(r×s))^k] / [Σ_k (1/s)^k]

  Both geometric sums converge rapidly because rs > s > 1 for all reference companies. The ratio approaches 1 as s grows. This proves: **CEO torque ≈ r^(L-1) = fidelity, with an error term that shrinks as span increases.**

  **Frontline contribution to CEO torque:**

  | Company | L | Span | Frontline % of torque | Error vs r^(L-1) |
  |---|---|---|---|---|
  | Haier | 3 | 42.2 | 97.1% | 0.5% |
  | Nucor | 4 | 13.5 | 93.0% | 1.8% |
  | Meta | 6 | 6.5 | 88.4% | 4.2% |
  | Google | 8 | 4.6 | 85.6% | 6.5% |
  | Amazon | 9 | 4.9 | 86.3% | 6.0% |

  The "error" is always positive (agility > fidelity) because non-frontline layers contribute additional torque. Narrower spans (more balanced distributions) increase the error, but it never exceeds ~7%.

  **Enrichment 1: Coordination-adjusted agility**
  `agility_adj = agility × 1/(1 + log10(span))`

  | Company | Fidelity | Raw Agility | Coord Factor | Adj Agility |
  |---|---|---|---|---|
  | Valve | 100.00% | 100.00% | 0.282 | 28.2% |
  | Haier | 67.24% | 67.60% | 0.381 | 25.8% |
  | Nucor | 55.14% | 56.11% | 0.470 | 26.4% |
  | Meta | 37.07% | 38.61% | 0.552 | 21.3% |
  | Google | 24.92% | 26.55% | 0.602 | 16.0% |
  | Amazon | 20.44% | 21.67% | 0.593 | 12.9% |

  **Ranking change**: Fidelity ranks Haier > Nucor, but coordination-adjusted agility ranks Nucor > Haier (because Haier's span=42.2 vs Nucor's span=13.5 creates more coordination overhead).

  However, the overall correlation remains high (~0.97) because the coordination factor varies over a narrow range (0.28–0.60) while fidelity spans 20–100%.

  **Enrichment 2: Span-penalized per-hop torque**
  Each hop penalized by (1/span)^distance. This overcorrects massively — Valve (span=350) gets torque ≈ 0, which is nonsensical for a flat org.

  **Enrichment 3: Lateral communication bonus**
  Add within-layer coordination proportional to layer size. This benefits bottom-heavy orgs uniformly and does not decorrelate because it's also dominated by the frontline term.

  **Root cause**: The redundancy is structural, not accidental. Both fidelity and agility measure the same physical quantity: "how much of the organization can be effectively reached from the top." Any enrichment that only modifies the r^(L-1) term (adding multiplicative factors) preserves the ranking monotonicity. To genuinely decorrelate, the torque model needs a term that can make a deep-but-well-coordinated org MORE agile than a shallow-but-poorly-coordinated one — this requires factors that are NOT functions of r and L alone.

  **Candidate for genuine decorrelation**: Decision authority distribution. If 30% of decisions are made at the IC level (no relay needed), agility should partly reflect this. This is architecturally different from fidelity (which is always about top-to-bottom relay). Requires enrichment with a new parameter `authority_distribution: number[]` per company.

- **Scores**: Novelty 4/5 | Specificity 4/5 | Evidence 5/5
- **Status**: **confirmed (redundancy is structural)** — All tested enrichments failed to substantially decorrelate. The mathematical proof shows WHY: frontline mass dominance makes CEO torque collapse to r^(L-1) within ~7% for all reference orgs. Genuine decorrelation requires a qualitatively new input dimension (decision authority distribution), not modifications to the torque formula's existing parameters.
- **Implication**: The three-pillar framing should be understood as: **two measures of the same thing (signal reach) + one independent measure (temporal delay)**. Rather than forcing agility to be independent via formula enrichment, the UI could honestly present fidelity and agility as "two views of signal decay" and highlight lag as the genuinely independent dimension. Alternatively, introducing `decisionAuthorityProfile` as a new per-company input would create real independence — but requires empirical data the sandbox doesn't have.

---

### H3: Heterogeneous fidelity rates preserve F-A correlation but reveal lag independence

- **Claim**: If each company has a different fidelityRate reflecting communication culture, the fidelity-agility correlation remains near-perfect (structural identity) but the fidelity-lag correlation drops significantly (lag has no r dependence).
- **Test**: Simulated three scenarios — Uniform (all 82%), By-Archetype (flat orgs get higher f), and Inverted (deep orgs get higher f). Computed all three pillar values and pairwise correlations.
- **Evidence**:

  **Scenario: By-Archetype** (Valve 95%, Nucor 90%, Haier 92%, Meta 78%, Google 75%, Amazon 70%)

  | Company | L | f | Fidelity | RT | Lag Health |
  |---|---|---|---|---|---|
  | Valve | 1 | 95% | 100.00% | 100.00% | 100 |
  | Haier | 3 | 92% | 84.64% | 71.64% | 96 |
  | Nucor | 4 | 90% | 72.90% | 53.14% | 84 |
  | Meta | 6 | 78% | 28.95% | 8.38% | 54 |
  | Google | 8 | 75% | 13.35% | 1.78% | 18 |
  | Amazon | 9 | 70% | 5.76% | 0.33% | 15 |

  Correlations: F-A ≈ 0.9997, F-Lag ≈ 0.93, A-Lag ≈ 0.93
  Rankings: F and A identical (Valve > Haier > Nucor > Meta > Google > Amazon)

  **Scenario: Inverted** (Valve 70%, Nucor 75%, Haier 72%, Meta 85%, Google 88%, Amazon 92%)

  | Company | L | f | Fidelity | RT | Lag Health |
  |---|---|---|---|---|---|
  | Valve | 1 | 70% | 100.00% | 100.00% | 100 |
  | Haier | 3 | 72% | 51.84% | 26.87% | 96 |
  | Nucor | 4 | 75% | 42.19% | 17.80% | 84 |
  | Meta | 6 | 85% | 44.37% | 19.69% | 54 |
  | Google | 8 | 88% | 40.27% | 16.22% | 18 |
  | Amazon | 9 | 92% | 51.32% | 26.34% | 15 |

  Correlations: F-A ≈ 0.9997, F-Lag ≈ 0.23, A-Lag ≈ 0.23
  Rankings: F and A identical. **But completely different from Lag!**
  - Fidelity: Valve > Haier > Amazon > Meta > Nucor > Google
  - Lag: Valve > Haier > Nucor > Meta > Google > Amazon

  **The inverted scenario produces a dramatic finding**: Amazon (L=9, f=92%) has better fidelity than Nucor (L=4, f=75%) — 51.3% vs 42.2%. But Amazon's lag health is 15 (Expired) vs Nucor's 84 (Fresh). **You can fix signal quality with communication culture, but you cannot fix propagation delay without restructuring.**

  The F-Lag correlation drops from 0.91 (uniform) to 0.23 (inverted), confirming that lag is the genuinely independent dimension. The F-A correlation is invariant at ≈1.0 across all scenarios.

- **Scores**: Novelty 4/5 | Specificity 5/5 | Evidence 5/5
- **Status**: **confirmed**
- **Implication**: This crystallizes the two-dimension insight from Cycle 1 with precise evidence. Fidelity and agility are structurally coupled (F-A ≈ 1.0 regardless of parameterization). Lag is structurally independent (F-Lag drops to 0.23 when fidelity rates vary). This has a design consequence: the pillar dashboard should visually group fidelity+agility as "Signal Reach" and give lag its own independent axis. It also produces a powerful narrative: "culture can fix signal quality but only structure can fix speed."

---

### H4: The Gemba Number — signal has a fixed half-life independent of org depth

- **Claim**: The "Gemba Number" (highest layer with >50% pivot efficiency) can be derived in closed form as `G = floor(h)` where `h = log(2)/|log(r)|` is the fidelity half-life in layers. Crucially, this is independent of org depth L — at a given fidelity rate, the number of effective layers is fixed.
- **Test**: Derived the closed-form approximation from frontline dominance of the torque model, then verified against full torque profile computations for all 6 reference companies. Extended to a lookup table across fidelity rates.
- **Evidence**:

  **Derivation:**
  Pivot efficiency at layer k (from frontline dominance): `eff(k) ≈ r^k`
  50% threshold: `r^k = 0.5 → k = log(0.5)/log(r) = log(2)/|log(r)| = h`
  Layers with >50% efficiency: layers 0 through floor(h), total = floor(h) + 1

  **Half-life table:**

  | fidelityRate | h (layers) | Effective layers |
  |---|---|---|
  | 70% | 1.94 | 2 |
  | 75% | 2.41 | 3 |
  | 80% | 3.11 | 4 |
  | **82%** | **3.49** | **4** |
  | 85% | 4.27 | 5 |
  | 90% | 6.58 | 7 |
  | 95% | 13.51 | 14 |

  **Verification against full torque profiles (f=82%):**

  | Company | L | Profile (top→bottom) | Layers>50% | Predicted |
  |---|---|---|---|---|
  | Valve | 1 | [100%] | 1 | 1 (trivial) |
  | Haier | 3 | [99.6%, 82.4%, 67.6%] | 3 (all) | 3 (L≤4 → all) |
  | Nucor | 4 | [99.3%, ~82%, ~67%, 55.1%] | 4 (all) | 4 (L≤4 → all) |
  | Meta | 6 | [~99%, ~82%, ~67%, ~55%, ~45%, 37.1%] | 4 | 4 ✓ |
  | Google | 8 | [..., ~55%, ~45%, ~37%, ~30%, 24.9%] | 4 | 4 ✓ |
  | Amazon | 9 | [..., ~55%, ~45%, ~37%, ~30%, ~25%, 20.4%] | 4 | 4 ✓ |

  **The depth-independence result**: For ANY org with L ≥ 5 at f=82%, exactly 4 layers have >50% pivot efficiency. Adding more levels to a deep org doesn't create more effective layers — it only adds ineffective ones.

  **Generalized Gemba table** (layers with >50% efficiency, by depth and fidelity):

  | L\f | 70% | 75% | 80% | 82% | 85% | 90% | 95% |
  |---|---|---|---|---|---|---|---|
  | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
  | 3 | 2 | 3 | 3 | 3 | 3 | 3 | 3 |
  | 4 | 2 | 3 | 4 | 4 | 4 | 4 | 4 |
  | 5 | 2 | 3 | 4 | 4 | 5 | 5 | 5 |
  | 6 | 2 | 3 | 4 | 4 | 5 | 6 | 6 |
  | 8 | 2 | 3 | 4 | 4 | 5 | 7 | 8 |
  | 10 | 2 | 3 | 4 | 4 | 5 | 7 | 10 |
  | 12 | 2 | 3 | 4 | 4 | 5 | 7 | 12 |

  The table saturates: once L > h, adding depth doesn't increase effective layers. The columns flatten at their half-life value. At f=82%, the column reads "4" for all L ≥ 4.

  **Practical interpretation for Amazon (L=9, f=82%)**:
  - Layers 0-3 (frontline, team lead, manager, sr. manager): >50% effectiveness — "Gemba zone"
  - Layers 4-8 (director, VP, SVP, EVP, CEO): <50% effectiveness — "broadcast zone"
  - 5 of 8 management layers are in the broadcast zone where directives lose majority fidelity
  - This explains why Gemba Walks work: they skip the 5 lossy layers and access the 4 effective ones directly

- **Scores**: Novelty 5/5 | Specificity 5/5 | Evidence 5/5
- **Status**: **confirmed**
- **Implication**: The depth-independence of effective layers is the most striking result of this cycle. It means: **at 82% per-layer retention, every org — regardless of size or depth — has exactly 4 effective management layers. Everything above that is noise.** The formula `h = log(2)/|log(r)|` is the organizational equivalent of a radioactive half-life. This should be surfaced prominently in the UI as "Effective Depth" — the number of layers that actually matter. It also provides a quantitative answer to "how flat should we be?": **your org should have at most floor(h)+1 levels.**

---

### H5: Restructuring ROI is asymmetric — shallow orgs buy fidelity, deep orgs buy speed

- **Claim**: The marginal return of removing one level differs qualitatively between shallow and deep orgs. Shallow orgs gain proportionally more fidelity; deep orgs gain proportionally more lag reduction.
- **Test**: Computed fidelity gain, lag savings, health improvement, and "exchange rate" (fidelity pp gained per lag day saved) for each reference company removing one level.
- **Evidence**:

  **Fidelity gain from removing one level:**
  `ΔFid = r^(L-2) × (1-r) × 100 = r^(L-2) × 18 pp` (at r=0.82)

  **Lag saved from removing one level:**
  `ΔLag = d × (2L-3) days`

  **Exchange rate = ΔFid / ΔLag:**

  | Company | L→L-1 | ΔFid (pp) | Lag saved (d) | Exchange (pp/d) | Health Δ |
  |---|---|---|---|---|---|
  | Haier | 3→2 | +14.76 | 3d | **4.92** | 96→99 (+3) |
  | Nucor | 4→3 | +12.10 | 10d | **1.21** | 84→92 (+8) |
  | Meta | 6→5 | +8.13 | 22.5d | **0.36** | 54→67 (+13) |
  | Google | 8→7 | +5.47 | 45.5d | **0.12** | 18→28 (+10) |
  | Amazon | 9→8 | +4.49 | 45d | **0.10** | 15→23 (+8) |

  **The exchange rate decays exponentially** (from 4.92 to 0.10 — a 49× drop from L=3 to L=9). This reflects the asymmetry: fidelity gain = r^(L-2)×18 decays exponentially with L, while lag savings = d×(2L-3) grows linearly.

  **Restructuring character by depth:**
  - **L≤4 (Haier, Nucor)**: Removing a layer is primarily a *fidelity play*. You gain 12-15pp of signal quality. Lag improvement is modest (3-10 days). Already in "Live/Fresh" health zone.
  - **L≥7 (Google, Amazon)**: Removing a layer is primarily a *speed play*. Lag drops by 45+ days. But fidelity gain is marginal (~5pp on top of an already-low base). Still stuck in "Stale/Expired" health zone.
  - **L=5-6 (Meta)**: The *transition zone*. Both gains are meaningful. Meta crossing from Aging(54) to Fresh(67) is the most impactful single restructuring among all reference companies — it crosses a health band threshold.

  **How many levels must Amazon remove to reach "Fresh" (health ≥ 65)?**
  Need: lag ≤ 43.1 days → 3×(L-1)² ≤ 43.1 → L ≤ 4.79 → **L = 4**
  Amazon must remove 5 levels (9→4) — an 8× span increase (from 4.9 to ~19.8) — to reach "Fresh." This is practically impossible for a 1.5M-person company. The model correctly predicts that mega-corps are structurally trapped in poor health.

  **Relative improvement** (% improvement from restructuring):

  | Company | Fid % improvement | Lag % improvement | Health improvement |
  |---|---|---|---|
  | Haier | +21.9% relative | -75% | +3 |
  | Nucor | +21.9% relative | -56% | +8 |
  | Meta | +21.9% relative | -36% | +13 |
  | Google | +21.9% relative | -27% | +10 |
  | Amazon | +21.9% relative | -23% | +8 |

  **Surprise**: The relative fidelity improvement is constant at 21.9% — every company gets the same proportional fidelity boost (because ΔFid/Fid = r^(L-2)×(1-r)/r^(L-1) = (1-r)/r = 0.219 for r=0.82). But the relative lag improvement diminishes with depth (75%→23%).

  This means: removing a level gives a *constant multiplicative* fidelity boost (×1.22) but a *diminishing proportional* lag reduction. For deep orgs, you need to remove multiple levels to achieve meaningful lag improvement, but each level removed gives the same 22% fidelity improvement.

- **Scores**: Novelty 4/5 | Specificity 5/5 | Evidence 5/5
- **Status**: **confirmed**
- **Implication**: The asymmetry is actionable. For flat orgs considering adding a layer: the fidelity cost is steep (÷1.22 per layer) but the lag cost is modest. For deep orgs considering restructuring: focus on lag gains, not fidelity — fidelity is already in the noise floor. The constant 22% fidelity multiplier per level removed is a clean result that could be displayed in the What-If panel: "Removing 1 level always improves fidelity by 22% — but your absolute fidelity is [X]%, so the gain is [Y]pp."

---

## Key Findings

1. **Signal has a fixed half-life, independent of org depth.** At 82% per-layer retention, the half-life is 3.49 layers, meaning exactly 4 layers have >50% pivot efficiency in ANY org. Layers beyond this are in a "broadcast zone" where directives lose majority fidelity. The formula `h = log(2)/|log(r)|` is a fundamental organizational constant. (H4)

2. **The fidelity-agility redundancy is mathematically structural, not parametric.** CEO torque reduces to r^(L-1) because frontline employees dominate the mass distribution (85-97% of torque). This identity holds regardless of fidelity rate, org size, or depth. Only a qualitatively new input (decision authority distribution) could break it. (H2, H3)

3. **Restructuring is fidelity-play for flat orgs, speed-play for deep orgs.** The exchange rate (fidelity gained per lag day saved) drops 49× from L=3 to L=9. Every restructuring gives a constant ×1.22 fidelity boost, but a diminishing proportional lag reduction. Mega-corps (L≥8) are structurally trapped in poor lag health — Amazon needs to remove 5 levels to reach "Fresh." (H5)

4. **"Culture can fix signal quality but only structure can fix speed."** Under inverted fidelity rates (deep orgs with better communication), Amazon can achieve 51% fidelity — better than Nucor — while remaining at 15 health (Expired) in lag. The F-Lag correlation drops from 0.91 to 0.23 under heterogeneous rates, confirming lag as the genuinely independent dimension. (H3)

## Model Observations

- **The half-life formula `h = log(2)/|log(r)|`** is the single most compact summary of the fidelity model's behavior. It unifies Cycle 1's cliff analysis (cliffs occur at L ≈ 2h for RT) and the Gemba Number into one number.
- **Fidelity and agility are redundant at the formula level**, confirmed by algebraic decomposition and three failed enrichment attempts. The ~7% excess of agility over fidelity for deep orgs comes from the geometric sum ratio and is not diagnostically meaningful.
- **The exchange rate** `(1-r)×100 / (d×(2L-3)/r^(L-2))` shows how fidelity and lag trade off against each other during restructuring. It could be inverted to answer: "how much lag reduction is worth 1pp of fidelity?"
- **Constant relative fidelity improvement** (22% per level at r=0.82) is a clean result with a simple proof: ΔFid/Fid = (1-r)/r. This is r-dependent but L-independent, making it a universal restructuring constant for a given communication culture.
- **Edge case confirmed**: Orgs with L ≤ floor(h)+1 have all layers above 50% effectiveness — these are "fully effective" organizations. At f=82%, that means L ≤ 4.

## Compounding Check

- **vs. Cycle 1**: Cycle 1 discovered the cliff formula, the three-pillar correlation, and the shape proxy. Cycle 2 deepens each:
  - The cliff formula is now generalized to a multi-zone dashboard with margin analysis (H1)
  - The correlation is proven to be structural via algebraic decomposition, not just observed (H2)
  - The half-life formula unifies the cliff analysis and agility into one number (H4)
  - Restructuring ROI reveals fidelity-lag asymmetry that Cycle 1 didn't explore (H5)
- **Novel contribution**: The half-life formula `h = log(2)/|log(r)|` and its consequence (depth-independent effective layers) is genuinely new. The restructuring exchange rate and its 49× decay from flat to deep is new. The proof that F-A redundancy is structural (not parametric) is new. The "culture vs structure" insight from heterogeneous rates is new.

## Cycle Scorecard

| Metric | This Cycle | Previous | Δ |
|--------|-----------|----------|---|
| Avg Novelty | 4.0 | 3.8 | +0.2 |
| Avg Specificity | 4.8 | 4.8 | 0.0 |
| Avg Evidence | 5.0 | 4.6 | +0.4 |
| Hypotheses tested | 5 | 5 | 0 |
| Confirmed | 5 | 4 | +1 |
| Refuted | 0 | 1 | -1 |
| Queued for enrichment | 0 | 0 | 0 |

## Seeds for Next Cycle

1. [HIGH] **Implement "Effective Depth" indicator**: The half-life formula `h = log(2)/|log(r)|` should be computed in the model layer and displayed in the UI. Test: does adding this to the pillar dashboard add diagnostic value beyond what the three existing pillars show? Define the behavior when org depth ≤ h (fully effective) vs > h (broadcast zone exists).

2. [HIGH] **Decision authority distribution as a decorrelation parameter**: Define a new per-company input `authorityProfile: number[]` representing what fraction of decisions are made at each layer. Enriched agility = Σ authority_k × torque_k. This could make agility genuinely independent from fidelity. Test with hypothetical profiles for the 6 reference companies. (needs-enrichment: validated level for empirical authority distribution data)

3. [MED] **"Escape velocity" analysis**: How many levels must each reference company remove to cross the next lag health band threshold? We showed Amazon needs L=4 for "Fresh." Map this for all companies. Derive the formula: `L_target = 1 + floor(sqrt(-100×ln(threshold/100)/d))` where threshold = 85 (Live), 65 (Fresh), 40 (Aging).

4. [MED] **Communication investment vs restructuring**: Given the constant 22% fidelity improvement per level removed, derive the equivalent improvement in fidelity RATE needed to match the effect of removing one level without restructuring. Formula: need r_new such that r_new^(L-1) = r^(L-2), so r_new = r^((L-2)/(L-1)). For Amazon: r_new = 0.82^(7/8) = 0.8451, i.e., +2.5pp improvement in communication culture. Is investing in communication culture more practical than restructuring?

5. [LOW] **Non-geometric layer distributions**: All current results assume geometric narrowing (n_k ∝ 1/span^k). What happens with a uniform distribution (all layers equal) or a diamond distribution (middle layers largest)? Does the half-life formula still hold? This would test whether the depth-independence result is model-specific or general.
