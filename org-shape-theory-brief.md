# Org Shape Theory — Project Brief & Conversation Context

**Live Interactive Demo:** [https://mattbayne83.github.io/shape-matters/](https://mattbayne83.github.io/shape-matters/)

## Vision

An interactive research tool exploring how organizational shape affects effectiveness through multiple interacting mechanisms. The goal is diagnostic, not polemic: help people see the frictions in their own orgs and identify the realistic levers that change them.

This is a **living model**. It began as a two-channel argument — Bartlett-style information fidelity loss and Deming/Gemba decision latency. It has since earned a third pillar, Autonomy, anchored in the Bloom–Van Reenen World Management Survey. The product remains open to additional physics/engineering principles that correlate with org effectiveness as they become empirically defensible — see `docs/PHYSICS_MODELS.md` for candidate channels currently under exploration.

The core claim is narrow and testable: **if all else is held constant, shape matters.** Height, width, span of control, and the distribution of decision rights together produce predictable frictions that a diagnostic model can surface.

## Three Pillars

The current model evaluates three interacting pillars. Each has a named mechanism, a formula, and a source.

### 1. Fidelity — Information Decay Across Relays
- **Mechanism**: Every management layer is a lossy relay. Bartlett's (1932) serial reproduction experiments showed that information accuracy declines markedly at each person-to-person transmission; Deming's Point 8 ("drive out fear") explains the directional asymmetry — subordinates filter upward to avoid blame, so upward signal decays faster than downward.
- **Formula**: `r^(L-1)` for upward fidelity, `r^(2(L-1))` round-trip, where `r` is per-layer retention (default 82%) and `L` is the number of levels.
- **Source**: Bartlett (1932); Roediger et al. (2014) replication; Deming (1982) *Out of the Crisis*, Points 8, 9, 11, 12.

### 2. Latency — Decision Propagation Delay
- **Mechanism**: Round-trip decision time grows quadratically with depth because each layer adds not just transit time but reinterpretation and political filtering on both legs. Toyota's Gemba Walk exists precisely as a bypass circuit around this lossy chain — if hierarchical communication were lossless, the Gemba Walk would be unnecessary.
- **Formula**: `d × (L-1)²` total delay, where `d` is the per-layer decision cycle (days). Health score maps delay → 0-100 via exponential decay `100 × e^(-delay/100)`.
- **Source**: Deming (1982); Taiichi Ohno / Toyota Production System (1950s); Gemba methodology.

### 3. Autonomy — Decision Rights Distribution (Depth-Discounted)
- **Mechanism**: Where decisions are allowed to happen matters as much as how cleanly information moves. The Decision-Centrality Index (DCI, 0-100) captures distribution of authority; depth then discounts it, because even well-distributed authority gets bottlenecked if escalation still must cross many layers.
- **Formula**: `score = DCI × log(3)/log(L)`, capped at 100. Pillar health is this score directly.
- **Source**: Bloom & Van Reenen, World Management Survey (~15,000 firms, 35 countries). Cycle 6 H5 established the linear mapping `DCI = 25 × (WMS − 1)`, grounding the pillar in the strongest available empirical anchor for management quality.

## Foundational Frameworks

### Bartlett's Serial Reproduction (1932)
- Information accuracy declines markedly at each person-to-person transmission.
- Distortion and rationalization increase with each link in the relay.
- The same information retold by the same person stays stable — it's the relay that destroys signal.
- Replicated by Roediger et al. (2014) using DRM word lists.

### Deming's 14 Points (1982, *Out of the Crisis*)
Four points map directly to org-shape theory:
- **Point 8: Drive out fear** — fear increases per layer; subordinates filter upward to avoid blame, compounding fidelity loss.
- **Point 9: Break down barriers between departments** — silos force lateral communication to route vertically, multiplying relay hops.
- **Point 11: Eliminate management by numbers** — aggregated KPIs climbing a tall hierarchy are themselves lossy summaries.
- **Point 12: Remove barriers to pride of workmanship** — deep hierarchies distance decision-makers from the people who understand the work.

### Toyota / Gemba Walk (Taiichi Ohno, 1950s)
- "Gemba" = "the real place" — leaders physically go to where value is created.
- The Gemba Walk is a **bypass circuit around the lossy relay chain**.
- Three rules: Go See (direct observation = 100% fidelity), Ask Why (avoids editorial filtering), Show Respect (removes fear that distorts upward communication).
- Key insight: the *existence* of the Gemba Walk is itself an admission that hierarchical communication degrades information.

### Bloom–Van Reenen World Management Survey (2007–)
- ~15,000 firms across 35 countries surveyed on 18 management practices.
- Decentralization of decision rights is one of the scored dimensions, using a 5-point scale.
- Cycle 6 H5 grounded the Autonomy pillar's DCI in the WMS by fitting a linear map `DCI = 25 × (WMS − 1)`. Ford pre-Mulally is the first reference company to be pegged to a sector mean (US auto manufacturing, WMS ≈ 3.3), rather than a case study or qualitative estimate.
- This is the strongest empirical anchor for any of the three pillars at current model maturity.

### Unified Model
- **Bartlett (1932)** — information degrades per serial relay → fidelity loss is structural.
- **Deming (1982)** — every layer adds variation + fear → quality degrades with hierarchy depth.
- **Toyota (1950s)** — the Gemba Walk was invented to bypass hierarchy → hierarchy is acknowledged as the problem.
- **Bloom–Van Reenen (2007–)** — decentralization and management quality correlate with firm performance across 15,000 firms → the Autonomy pillar has empirical footing.

## Reference Dataset

The dataset has expanded from 3 ONEOK-relevant entries in the original brief to **15 reference companies across 6 archetypes**, including historical-era snapshots (GE-Welch, IBM pre-Gerstner, Ford pre-Mulally). Each company carries a `dciSource` provenance tag (`case-study`, `qualitative-estimate`, or `wms-sector`). See `src/data/referenceCompanies.ts` for the full list and citations.

## Current Artifact

Single-page interactive React app with six sections: Problem (Bartlett story + fidelity demo), Simulate (scenario-driven message relay), Evidence (Gemba + Deming), Proof (6+ company comparison with per-pillar health scores), Model Your Org (3-pillar dashboard + lever sliders + binding-pillar diagnostic + lever exchange rates), Methodology. All metrics trace back to formulas documented in the Methodology section.

## Data Sources

- Bartlett (1932) serial reproduction research
- Roediger et al. (2014) replication study
- Deming, W.E. (1982) *Out of the Crisis*
- Ohno, T. — Toyota Production System / Gemba Walk methodology
- Bloom, N. & Van Reenen, J. — World Management Survey (ongoing, ~15k firms)
- Axios HQ 2025 State of Internal Communications ($10,140/employee/year comm loss figure)
- SEC 10-K filings and published case histories for all 15 reference companies
- Microsoft organizational communication network study (2024, 241K employees)

## Triangle Geometry Principles

(Preserved from the original brief. Geometry remains part of the intellectual texture of the project and is one of the "additional principles" the product stays open to as it earns further empirical grounding.)

### The Fundamental Constraint: Area = ½bh
For a fixed organizational size (area), height (levels) and base (span of control) are inversely proportional. This IS the core org design trade-off: every level you add narrows the span, and vice versa. You can't independently choose both — the geometry enforces a constraint.

### The Shape Gap (Critical Insight)
A triangle narrows linearly at each layer. Real organizations narrow geometrically (N/span^k). The actual organizational "shape" is an exponential horn, not a straight-sided triangle. The gap between the idealized triangle and the actual exponential curve is where fidelity loss hides — middle layers of deep hierarchies are wider than the triangle predicts, meaning more relays, more bottleneck nodes, and more degradation than the simple pyramid metaphor suggests.

**Shape Gap Index** = Σ|w_ideal(k) - w_actual(k)| / 2N — normalized 0 to 1, where higher values indicate greater structural deviation from the idealized linear hierarchy.

### Geometric Properties as Organizational Metrics

| Geometry | Org Meaning | Formula |
|---|---|---|
| Slope angle θ | Span of control steepness — steep = narrow span, deep hierarchy | arctan(2L/base) |
| Slant height | Communication distance — longest path from IC to CEO | √(L² + (base/2)²) |
| Centroid (h/3) | Decision gravity — where authority concentrates | Σ(k·count_k)/N |
| Moment of inertia | Organizational rigidity/agility — higher = resists change | Σ(count_k·(k-centroid)²) |
| Perimeter/Area | Communication overhead ratio — boundary surface per unit capacity | (2·slant + base)/(½·b·h) |
| Triangle inequality | Design constraint feasibility — not all combinations possible | height < base/2 + slant |

### Structural Rigidity Inversion
In structural engineering, triangles are the strongest shape — they resist deformation because forces distribute across all three sides. In organizations, this "strength" maps to rigidity: a tall, narrow hierarchy resists change. The apex (CEO) is not a strength but a bottleneck — all information load flows through a single point. The very property that makes triangles structurally strong makes them organizationally brittle.

### Similar Triangles and Scaling
Proportional scaling (doubling both height and base) preserves all shape ratios but quadruples area. This asks: does growing an organization change its shape or just its size? Data shows this is a design choice, not an inevitability — Google at 183K employees has 8 levels, while Valve at 350 has 1 level. Some orgs scale by adding levels (changing shape), others by widening span (preserving shape).

## Open Questions / Next Steps

- **Per-layer fidelity rate**: Currently using 82% as a tunable assumption. Could be derived empirically from human factors research rather than fixed. Bartlett's serial reproduction studies suggest 70-90% depending on message complexity.
- **Industry-relative benchmarking**: Revenue/employee should only be compared within industry. Consider using revenue per dollar of SG&A to strip out capital-heavy distortions.
- **Additional data sources**: Military units, non-profits, and other team/org structures could expand the dataset further.
- **Testing composite and separate dimensions**: Which of the three pillars correlates most strongly with observed productivity? The recursive autoresearch loop in `evals/` is exactly the mechanism for probing this.
- **Fear multiplier on fidelity**: Deming's Point 8 suggests the per-layer retention rate should actually decrease at higher levels (more political filtering near the top). Could model as a variable rate rather than fixed.
- **Additional physics/engineering principles**: What else correlates with org effectiveness? Candidates currently under exploration include thermal lag, torque/agility, and shape geometry — see `docs/PHYSICS_MODELS.md`. A principle only earns its way into the live model after it survives refutation in the eval loop.

## Living Document Caveat

This brief is a snapshot of the current model state, not a final specification. The recursive autoresearch loop in `evals/` continuously tests, refutes, and refines hypotheses — 10 cycles complete as of April 2026. Mechanisms that fail to earn empirical anchoring get deleted (the original congestion-γ signal-decay term, for example, was removed after Cycle 6 H4 proved it inert at its default value). The brief will be updated as the model evolves.
