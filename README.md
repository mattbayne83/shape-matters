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
- **Decay Curve** — Two-line chart showing upward fidelity vs. round-trip fidelity
- **Company Comparison** — 6 reference companies across 4 archetypes with shape metrics and signal fidelity
- **Shape Overlay** — Exponential horn vs. idealized triangle visualization with shape gap analysis
- **Model Your Org** — Unified interactive calculator: 3 sliders (levels, headcount, fidelity rate), depth tax metrics, sensitivity sweep, restructuring impact
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
| Decision Latency | 2(L-1) x t_relay |

Where r = per-layer retention rate, L = levels, N = total employees.

## Tech Stack

- React 19, TypeScript 5.9, Vite 7
- Tailwind CSS 4 + Typography plugin
- Zustand 5 (persist) for state management
- Lucide React for icons
- Source Serif 4 + Inter + DM Mono fonts

## Getting Started

```bash
npm install
npm run dev       # Start dev server (Vite HMR)
npm run build     # TypeScript check + production build
npm run lint      # ESLint
npm run test      # Vitest (single run)
npm run test:watch # Vitest (watch mode)
npm run preview   # Preview production build locally
```

## Project Structure

```
src/
  components/
    layout/       SectionNav — anchor-based navigation bar
    model/        18 visualization & interaction components
    ui/           Prose, FadeIn, GeometricHero
  pages/
    ScrollPage    Single-page layout with all sections
  lib/
    orgMetrics    Core calculations (span, flatness, fidelity, managers)
    depthTax      Depth tax model (signal, drift, decision costs)
    triangleGeometry  Shape gap, slope, gravity, agility calculations
    fidelityColor Gradient mapping utility (stone monochrome + ember semantic)
    styles        Tailwind class constants
    scrollToAnchor Smooth scroll utility for metric → methodology links
    __tests__/    95 unit tests (orgMetrics, depthTax, triangleGeometry, fidelityColor)
  store/
    useCompanyStore  Zustand persist store (levels, headcount, fidelityRate)
  data/
    referenceCompanies  6 curated reference companies
  types/
    index         Company, OrgMetrics, DepthTaxResult, TriangleGeometry, Archetype
```

## Architecture

- **No router** — Single-page scroll layout with anchor-based navigation (`#problem`, `#proof`, `#shape`, `#evidence`, `#model`, `#methodology`)
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
