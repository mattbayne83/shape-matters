# org-shape — The Shape of Effectiveness

An interactive research tool exploring how organizational depth degrades information fidelity, increases communication costs, and impacts effectiveness.

**Live site:** [https://mattbayne83.github.io/shape-matters/](https://mattbayne83.github.io/shape-matters/)

## The Thesis

Every management layer is a lossy relay. Using Bartlett's (1932) serial reproduction research as the empirical basis, information degrades ~18% per layer (82% retention). A 9-level org retains only ~17% of original signal at the top. Round-trip fidelity (info up, decision down) compounds further.

Three cost channels of organizational depth:

1. **Fidelity Loss** — Information decays per relay: r^(L-1) upward, r^(2(L-1)) round-trip
2. **Communication Complexity** — Bottleneck nodes at each level create queues; cross-functional paths route vertically through silos
3. **Decision Latency** — Round-trip time scales 2x(levels-1), with reinterpretation and political filtering at each layer

## Features

- **Interactive Fidelity Demo** — Animated visualization of signal decay across management layers
- **Message Relay Simulator** — 5 scenario-driven simulations showing how messages distort through org levels with incentive annotations explaining *why* each layer reframes the signal
- **Company Comparison** — 6 reference companies across 4 archetypes with shape metrics and signal fidelity
- **Model Your Org** — Three-pillar diagnostic: Fidelity (signal decay), Lag (propagation delay), Response (change dynamics). 4 sliders, progressive disclosure. Explore each pillar's visualization independently.
- **Thermal Lag Model** — Fourier-inspired quadratic delay model showing how org depth compounds propagation time
- **Torque Model** — Physics-based pivot efficiency showing what fraction of the org actually receives a CEO directive
- **Gemba Walk Analysis** — Illustrates direct observation vs. relay chain information loss

## Reference Companies (6)

| Archetype | Companies |
|---|---|
| **Flat by Design** | Valve (1 level), Nucor (4) |
| **Tech Giants** | Google (8), Amazon (9) |
| **Recently Flattened** | Meta (6) |
| **Experimental** | Haier (3) |

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
    model/        26 visualization & interaction components
    ui/           Prose, FadeIn, GeometricHero
  pages/
    ScrollPage    Single-page layout with all sections
  lib/
    orgMetrics    Core calculations (span, flatness, fidelity, managers)
    depthTax      Depth tax model (signal, drift, decision costs)
    triangleGeometry  Shape gap, slope, gravity, agility calculations
    thermalLag    Thermal lag model (quadratic propagation delay, marginal cost)
    healthScores  Unified 0-100 pillar health scoring (lag health, band colors)
    fidelityColor Gradient mapping utility (stone monochrome + ember semantic)
    styles        Tailwind class constants
    scrollToAnchor Smooth scroll utility for metric → methodology links
    __tests__/    178 unit tests (orgMetrics, depthTax, triangleGeometry, fidelityColor, signalRelay, thermalLag, healthScores, contextHints)
  store/
    useCompanyStore  Zustand persist store (levels, headcount, fidelityRate, decisionCycle)
  data/
    referenceCompanies  6 curated reference companies (with decisionCycle)
    scenarios       5 relay simulation scenarios (safety, customer, innovation, strategy, operations)
  types/
    index         Company, OrgMetrics, DepthTaxResult, TriangleGeometry, ThermalLagResult, Scenario, RelayLevel
```

## Architecture

- **No router** — Single-page scroll layout with anchor-based navigation (`#problem`, `#simulate`, `#evidence`, `#proof`, `#model`, `#methodology`)
- **Shared inputs** — Levels (default 6), headcount (default 5000), fidelity rate (default 82%) stored in Zustand persist, accessible from all visualizations
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
