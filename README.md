# org-shape — The Shape of Effectiveness

An interactive diagnostic engine for understanding how organizational shape creates friction, and for identifying realistic levers to change it. A living research tool — we started with two cost channels (fidelity and latency) and have since added a third pillar (autonomy) grounded in the Bloom–Van Reenen World Management Survey. The model remains open to additional physics/engineering principles as they earn empirical anchoring.

**Live site:** [https://mattbayne83.github.io/shape-matters/](https://mattbayne83.github.io/shape-matters/)

## Three Pillars

1. **Fidelity** — Information decays at each person-to-person relay. Bartlett (1932) serial reproduction + Deming's Point 8 (fear filter). Formulas: `r^(L-1)` upward, `r^(2(L-1))` round-trip.
2. **Latency** — Decision propagation delay grows quadratically with depth. Deming + Toyota Gemba Walk as the bypass circuit around the lossy chain. Formula: `d × (L-1)²`.
3. **Autonomy** — Distribution of decision rights, discounted by depth. Grounded in Bloom & Van Reenen's World Management Survey (~15k firms); Cycle 6 H5 maps WMS scores to DCI via `DCI = 25 × (WMS − 1)`. Formula: `DCI × log(3)/log(L)`, capped at 100.

Together these form a diagnostic: users model their org, see which pillar is binding, and explore which lever (signal clarity, decision speed, decision rights, team autonomy) actually moves the composite.

## Features

- **Interactive Fidelity Demo** — Animated visualization of signal decay across management layers
- **Message Relay Simulator** — 5 scenario-driven simulations showing how messages distort through org levels with incentive annotations explaining *why* each layer reframes the signal
- **Company Comparison** — 6 reference companies across 5 archetypes with shape metrics and signal fidelity
- **Model Your Org** — Three-pillar diagnostic: Fidelity (signal decay), Latency (propagation delay), Autonomy (decision centrality). Workbench layout: 4 lever sliders + collapsible structural context. Explore each pillar's visualization independently. Below the dashboard: a diagnostic row with a **Binding Pillar** callout (names the weakest pillar + highest-impact lever) and **Lever Exchange Rates** (pairwise substitution ratios computed from live sensitivities).
- **Thermal Lag Model** — Fourier-inspired quadratic delay model showing how org depth compounds propagation time
- **Torque Model** — Physics-based pivot efficiency showing what fraction of the org actually receives a CEO directive
- **Gemba Walk Analysis** — Illustrates direct observation vs. relay chain information loss

## Reference Companies (15)

| Archetype | Companies |
|---|---|
| **Flat by Design** | Valve (1), Nucor (4), Morning Star (1) |
| **Self-Managing** | Haier (3), Buurtzorg (2), Berkshire Hathaway (4) |
| **Tech Giants** | Google (8), Amazon (9) |
| **Recently Flattened** | Meta (6) |
| **Command** | GE–Welch (10), IBM pre-Gerstner (11), Walmart (8), USPS (10), VA-VHA (10), Ford pre-Mulally (11) |

Historical-era entries (GE, IBM, Ford) are snapshots of a specific organizational moment, not current-state. Each company's `dciSource` field tags whether its DCI value is grounded in a case study, a qualitative estimate, or the Bloom–Van Reenen World Management Survey sector mean.

## Key Formulas

| Metric | Formula |
|---|---|
| Signal Fidelity (up) | r^(L-1) |
| Round-trip Fidelity | r^(2(L-1)) |
| Avg Span of Control | N^(1/L) |
| Flatness Index | Span / L |
| Propagation Delay | d × (L-1)² |
| Signal Half-life | log(2) / \|log(r)\| layers |
| Min Viable Fidelity Rate | 0.05^(1/(2(L-1))) |
| Structural Speed Limit | L_max = floor(1 + sqrt(16.25/d)) |
| Effective Depth Ratio | effective_layers / total_layers |

Where r = per-layer retention rate, L = levels, N = total employees, d = decision cycle (days/layer).

## Tech Stack

- React 19, TypeScript 5.9, Vite 7
- Tailwind CSS 4 + Typography plugin
- Zustand 5 (persist) for state management
- Lucide React for icons
- Source Serif 4 + Inter + DM Mono fonts

## Getting Started

```bash
npm install
npm run dev        # Start dev server (Vite HMR)
npm run build      # TypeScript check + production build
npm run lint       # ESLint
npm run test       # Vitest (single run)
npm run test:watch # Vitest (watch mode)
npm run preview    # Preview production build locally
npm run eval       # Run next autoresearch cycle
```

## Project Structure

```
src/
  components/
    layout/       SectionNav — anchor-based navigation bar
    model/        31 visualization & interaction components
    ui/           Prose, FadeIn, GeometricHero
  pages/
    ScrollPage    Single-page layout with all sections
  lib/
    orgMetrics    Core calculations (span, flatness, fidelity, managers)
    depthTax      Depth tax model (signal, drift, decision costs)
    triangleGeometry  Shape gap, slope, gravity, agility calculations
    thermalLag    Thermal lag model (quadratic propagation delay, marginal cost)
    autonomy      DCI × depth discount scoring for the Autonomy pillar
    blendedModel  Team-path/hierarchy blended scores (two-pizza model)
    sensitivity   Composite-health derivatives, binding pillar, lever exchange rates
    healthScores  Unified 0-100 pillar health scoring (lag health, band colors)
    fidelityColor Gradient mapping utility (stone monochrome + ember semantic)
    signalRelay   6-tier regex distortion engine + scenario level truncation
    contextHints  Slider descriptive-text strings
    styles        Tailwind class constants
    scrollToAnchor Smooth scroll utility for metric → methodology links
    __tests__/    223 unit tests across 11 files
  store/
    useCompanyStore  Zustand persist store (levels, headcount, fidelityRate, decisionCycle, dci, teamDecisionMix)
  data/
    referenceCompanies  6 curated reference companies (with decisionCycle, dci, teamDecisionMix)
    scenarios       5 relay simulation scenarios (safety, customer, innovation, strategy, operations)
    methodologyMetrics  13 metric definitions for the Methodology section
  types/
    index         Company, OrgMetrics, DepthTaxResult, TriangleGeometry, ThermalLagResult, AutonomyResult, BlendedScores, Scenario, RelayLevel
```

## Architecture

- **No router** — Single-page scroll layout with anchor-based navigation (`#problem`, `#simulate`, `#evidence`, `#proof`, `#model`, `#methodology`)
- **Shared inputs** — Levels (default 6), headcount (default 5000), fidelity rate (default 82%), decision cycle (default 3), DCI (default 50), team decision mix (default 50) stored in Zustand persist, accessible from all visualizations
- **Custom SVG/Canvas** — All charts and visualizations are built from scratch (no charting library)
- **Dynamic colors** — Runtime hex values use inline `style` (Tailwind can't JIT runtime hex)

## Theoretical Foundation

- **Bartlett (1932)** — Serial reproduction: information accuracy declines at each person-to-person relay
- **Deming (1982)** — Points 8, 9, 11, 12 from *Out of the Crisis* map directly to org-shape costs
- **Toyota / Ohno (1950s)** — Gemba Walk as bypass circuit around lossy hierarchy
- **Axios HQ (2025)** — $10,140/employee/year communication loss figure

See [docs/THEORY_BRIEF.md](docs/THEORY_BRIEF.md) for the full theoretical framework.

## Contributing

Community-sourced company data is the most impactful contribution. See [CONTRIBUTING.md](CONTRIBUTING.md) for submission requirements, accepted data sources, and how to count "levels."

## License

MIT
