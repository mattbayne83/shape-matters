# Research Implications — Autoresearch Cycles 1-4

> Derived from `evals/insights.md`. Raw findings live there; this doc translates them into product decisions.
> Last updated: 2026-04-08

---

## Model Integrity Issues

### Fidelity-Agility are the same metric (Finding 2, 5)

The torque (agility) model algebraically reduces to `r^(L-1)` for bottom-heavy orgs — identical to signal fidelity. The F-A Spearman correlation is ~1.0 across all 6 reference companies. The app currently presents them as independent diagnostics.

**Why this matters:** Users making decisions from the Agility pillar are reading a signal they've already seen in the Fidelity pillar. The "three-pillar" framing is misleading.

**Options:**
- A) Add a genuinely independent Agility input (Decision-Centrality Index — how IC-empowered vs CEO-centric). DCI≥35 is enough to produce rank inversions between companies.
- B) Merge Fidelity + Agility into one pillar and make the two dimensions Fidelity + Lag.
- C) Acknowledge the correlation transparently in the UI ("Agility tracks fidelity closely in most orgs; it diverges when decision authority is distributed").

Option A is richest. Option C is the minimum honest fix.

### Shape classification is a depth proxy (Finding 3)

For L≥6, every real company is classified "Diamond." The shapeClass taxonomy adds no information beyond knowing the depth.

**Options:**
- Remove `shapeClassLabel` from any user-facing display at L≥6.
- Reframe as "Deep org" label rather than shape name.
- Keep internally for calculations but don't surface in UI.

---

## New Metrics Worth Adding

### Signal Half-life (Finding 4)

**Formula:** `h = log(2) / |log(r)|` — the number of layers at which pivot efficiency crosses 50%.

At 82%: h = 3.49. This means layers 1-4 are doing real work; layers 5+ are broadcasting into diminishing returns.

**Proposed indicator:** In the Fidelity pillar expanded view, show:
- "Effective layers: 3.5 / 9" for Amazon
- "Broadcast zone: layers 4-9" (these relays have <50% signal strength)

### Fidelity Cliff (Finding 1, 8)

**Formula:** `r_min = 0.05^(1/(2*(L-1)))` — minimum per-layer retention for 5% round-trip fidelity.

Amazon at L=9: cliff is 82.8%. Current default: 82%. Margin: -0.8pp.

**Proposed indicator:** A "Safety Margin" reading in the Fidelity pillar:
- Green: >5pp above cliff
- Yellow: 0-5pp above
- Red: below cliff (like Amazon at defaults)

### Effective Depth Ratio — EDR (Finding 13)

**Formula:** `EDR = effective_layers / total_layers` = `h / L`

| Company | L | h | EDR |
|---------|---|---|-----|
| Haier | 3 | 3.49 | 100% |
| Nucor | 4 | 3.49 | 87% |
| Meta | 6 | 3.49 | 58% |
| Google | 8 | 3.49 | 44% |
| Amazon | 9 | 3.49 | 39% |

**Proposed location:** Summary metric card in Model Your Org, alongside existing metrics. Simple, intuitive, ranks companies correctly without needing to explain the math.

---

## Strategic Insights for the Model Section

### Culture vs Structure lever (Finding 7)

Improving `fidelityRate` (culture, tools, training) fixes Fidelity and Agility. It does **nothing** for Lag.
Reducing `levels` (restructuring) fixes all three. Reducing `decisionCycle` (CI/CD, process) fixes Lag only.

These are three genuinely different levers with non-overlapping effects.

**Proposed What-If scenarios:**
- "Improve communication culture" — slides fidelityRate +5pp, shows fidelity/agility gains but zero lag change
- "Remove a management layer" — reduces levels by 1, shows all three deltas
- "Accelerate decisions" — reduces decisionCycle by 30%, shows lag change only

Currently the sliders exist but the differentiation isn't surfaced.

### Restructuring ROI degrades with depth (Finding 6)

Exchange rate (fidelity gain per lag day saved) decays 49× from L=3 to L=9. At L=9, removing a level gives constant x1.22 fidelity but near-zero lag improvement. At that depth, cycle-time reduction (CI/CD) gives 2.2× more lag impact per unit effort.

**Proposed annotation in the restructuring panel:**
- "At your depth, removing a level improves fidelity by 1.22× but reduces lag by only X days"
- "Halving cycle time saves equivalent lag to removing sqrt(2) ≈ 1.4 levels"

### Structural speed limit (Finding 11)

**Formula:** `L_max = floor(1 + sqrt(16.25/d))`

At d=3 (Google/Amazon default): L_max = 3 levels for "Live" lag health. Validated externally: McKinsey "3 layers for agile", Amazon two-pizza teams (L=2 operational cells bypassing L=9 chain).

**Proposed annotation in Lag pillar:** "At your current cycle time (Xd/layer), Live lag health requires ≤N levels. You are N levels above this floor."

---

## Validated Theory (no UI change needed, useful for copy)

- McKinsey's "3 layers for agile" matches the model's `L_max` formula at d≥2. The theoretical framework is empirically grounded.
- Amazon/Google CI/CD investment makes more structural sense than flattening: 10% cycle reduction = 0.38 health levels at L=9 vs 0.17 at L=4. Deep orgs get double the ROI from cycle-time investment.
- Amazon's two-pizza teams are a practical implementation of bypassing the L=9 chain by creating L=2 operational cells.

---

## Prioritized Backlog

| # | Change | Effort | Priority |
|---|--------|--------|----------|
| 1 | Fidelity cliff + safety margin indicator | Low | 🔴 High |
| 2 | Signal half-life "effective layers" display | Low | 🔴 High |
| 3 | EDR as a new headline metric | Low | 🟠 Medium |
| 4 | Structural speed limit annotation on Lag pillar | Low | 🟠 Medium |
| 5 | Split What-If into Culture / Structure / Speed levers | Medium | 🟡 Medium |
| 6 | Add DCI slider to break F-A redundancy (or add correlation note) | Medium | 🔴 High |
| 7 | Restructuring exchange rate in the remove-a-level panel | Low | 🟡 Low |
| 8 | Reframe/remove shape labels for L≥6 | Low | 🟡 Low |
