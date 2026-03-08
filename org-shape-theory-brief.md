# Org Shape Theory — Project Brief & Conversation Context

**Live Interactive Demo:** [https://mattbayne83.github.io/shape-matters/](https://mattbayne83.github.io/shape-matters/)

## The Theory

The shape of an organization (height, width, span of control, overall size) directly and materially affects its effectiveness. If all other variables are held constant, a flatter team is more effective than a tall (many-level) team. This is testable through both first-principles modeling and empirical productivity proxies like revenue per employee.

## Three Cost Channels of Organizational Depth

1. **Information Fidelity Loss** — Each management layer acts as a lossy relay. Using Bartlett's (1932) serial reproduction research as the empirical basis, information degrades at each person-to-person handoff. At an estimated 82% per-layer fidelity rate, a 4-level org retains ~55% signal at the top vs. a 9-level org retaining ~19%. Round-trip fidelity (info up, decision down) compounds this further: r^(2(L-1)).

2. **Communication Complexity** — In a flat org, communication paths are direct. In a layered org, most paths funnel through manager bottleneck nodes, creating queues. Cross-functional communication in tall orgs must route vertically (up one silo, across at the top, down another), multiplying relay hops exponentially.

3. **Decision Latency** — Round-trip time for information to travel up and decisions to travel back down scales with 2×(levels - 1). Each layer adds not just time but reinterpretation and political filtering on both legs.

## Key Formulas

- **Signal Fidelity (up):** r^(L-1) where r = per-layer retention rate, L = number of levels
- **Round-trip Fidelity:** r^(2(L-1))
- **Avg Span of Control:** N^(1/L) where N = total employees
- **Flatness Index:** Span / L (higher = flatter, composite shape score)
- **Decision Latency:** 2(L-1) × t_relay
- **Bottleneck Nodes:** Σ(N / Span^k) for k = 1..L-1

## Supporting Theoretical Frameworks

### Bartlett's Serial Reproduction (1932)
- Information accuracy declines markedly at each person-to-person transmission
- Distortion and rationalization increase with each link
- The same information retold by the same person stays stable — it's the relay that destroys signal
- Replicated by Roediger et al. (2014) using DRM word lists

### Deming's 14 Points (1982, Out of the Crisis)
Four points map directly to org-shape theory:
- **Point 8: Drive out fear** — Fear increases per hierarchical layer; subordinates filter information upward to avoid blame, compounding fidelity loss
- **Point 9: Break down barriers between departments** — Silos force lateral communication to route vertically, multiplying relay hops
- **Point 11: Eliminate management by numbers** — Aggregated KPIs climbing a tall hierarchy are themselves lossy summaries
- **Point 12: Remove barriers to pride of workmanship** — Deep hierarchies distance decision-makers from the people who understand the work

### Toyota / Gemba Walk (Taiichi Ohno, 1950s)
- "Gemba" = "the real place" — leaders physically go to where value is created
- The Gemba Walk is a **bypass circuit around the lossy relay chain**
- Three rules: Go See (direct observation = 100% fidelity), Ask Why (avoids editorial filtering), Show Respect (eliminates fear that distorts upward communication)
- Key insight: If hierarchical communication were lossless, the Gemba Walk would be unnecessary. Its existence is an admission that tall structures degrade information.
- In a flat org, the Gemba Walk is short or unnecessary. In a tall org, it's a critical corrective. The *need* for Gemba Walks is itself a measure of structural dysfunction.

### Unified Model
- Bartlett (1932): Information degrades per serial relay → fidelity loss is structural
- Deming (1982): Every layer adds variation + fear → quality degrades with hierarchy depth
- Toyota (1950s): Gemba Walk invented to bypass hierarchy → hierarchy acknowledged as problem
- Shape Theory: Flatness Index predicts fidelity + productivity → testable hypothesis

## Reference Company Data

| Company | Era | Levels | Employees | Revenue ($M) | Rev/Employee | Industry |
|---|---|---|---|---|---|---|
| Chesapeake Energy | 2009-2013 (McClendon) | 4 | 12,600 | 11,600 | ~$921K | E&P / Upstream |
| Williams Companies | 2024 | 7-8 | 5,829 | 10,503 | ~$1.80M | Midstream |
| ONEOK | 2024 | 9 | 5,177 | 21,698 | ~$4.19M | Midstream |

**Caveat:** Revenue/employee across E&P vs. midstream is distorted by capital intensity and business model. ONEOK's high rev/employee reflects pipeline throughput economics, not organizational efficiency. The fidelity and shape metrics are the more apples-to-apples comparison.

**Chesapeake note:** Aubrey McClendon was ideologically committed to a flat structure — max 4 levels from CEO to IC. This is a clean signal, not an accident of org design.

## Current Artifact

An interactive React (.jsx) component with three tabs:
1. **Company Comparison** — Side-by-side cards for CHK, WMB, OKE with headline revenue/employee bar chart, shape metrics, signal fidelity bars, and productivity data
2. **Shape Calculator** — Sliders for levels, headcount, and revenue; computes full metric suite including flatness index, signal degradation visualization, manager ratio, communication cost
3. **Theory & Formulas** — Mathematical framework, fidelity comparison across 3/6/9/12-level scenarios, Deming/Gemba section with mapped points and bypass circuit analysis

Design: White background, Inter + DM Mono fonts, suitable for Miro export or presentation use.

## Data Sources

- Bartlett (1932) serial reproduction research
- Roediger et al. (2014) replication study
- Deming, W.E. (1982) Out of the Crisis
- Ohno, T. — Toyota Production System / Gemba Walk methodology
- Axios HQ 2025 State of Internal Communications ($10,140/employee/year comm loss figure)
- SEC 10-K filings for CHK, OKE, WMB (employee counts, revenue)
- Microsoft organizational communication network study (2024, 241K employees)

## Triangle Geometry Principles

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

- **Per-layer fidelity rate:** Currently using 82% as a tunable assumption. Could be derived empirically from human factors research rather than fixed. Bartlett's serial reproduction studies suggest 70-90% depending on message complexity.
- **Industry-relative benchmarking:** Revenue/employee should only be compared within industry. Consider using revenue per dollar of SG&A to strip out capital-heavy distortions.
- **Additional data sources:** Military units, non-profits, other team/org structures could expand the dataset beyond Matt's direct experience companies.
- **Testing both composite and separate dimensions:** The flatness index is the composite score; individual metrics (height, span, manager ratio) can be analyzed separately to see which correlates most strongly with productivity.
- **Fear multiplier on fidelity:** Deming's Point 8 suggests the per-layer retention rate should actually decrease at higher levels (more political filtering near the top). Could model as a variable rate rather than fixed.
