# org-shape — The Shape of Effectiveness

An interactive research tool exploring how organizational depth degrades information fidelity, increases communication costs, and impacts effectiveness.

**Live site:** Deployed on Cloudflare Pages

## The Thesis

Every management layer is a lossy relay. Using Bartlett's (1932) serial reproduction research as the empirical basis, information degrades ~18% per layer (82% retention). A 9-level org retains only ~17% of original signal at the top. Round-trip fidelity (info up, decision down) compounds further.

Three cost channels of organizational depth:

1. **Fidelity Loss** — Information decays per relay: r^(L-1) upward, r^(2(L-1)) round-trip
2. **Communication Complexity** — Bottleneck nodes at each level create queues; cross-functional paths route vertically through silos
3. **Decision Latency** — Round-trip time scales 2x(levels-1), with reinterpretation and political filtering at each layer

## Features

- **Interactive Fidelity Demo** — Animated visualization of signal decay across management layers
- **Decay Curve** — Two-line chart showing upward fidelity vs. round-trip fidelity
- **Company Comparison** — 13 reference companies across 5 archetypes with shape metrics and signal fidelity
- **Shape Overlay** — Exponential horn vs. idealized triangle visualization with shape gap analysis
- **Model Your Org** — Unified interactive playground: 3 sliders, 3-way visualization toggle (Rings/Signal/Shape), depth tax + structure metrics
- **Gemba Walk Analysis** — Illustrates direct observation vs. relay chain information loss

## Reference Companies (13)

| Archetype | Companies |
|---|---|
| **Flat by Design** | Valve (1 level), W.L. Gore (3), Nucor (4), Chesapeake Energy (4) |
| **Tech Giants** | Google (8), Microsoft (8), Amazon (9) |
| **Recently Flattened** | Meta (6), X/Twitter (4) |
| **Experimental** | Haier (3), Spotify (5) |
| **Energy** | Williams (7.5), ONEOK (9) |

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
- Inter + DM Mono fonts

## Getting Started

```bash
npm install
npm run dev       # Start dev server (Vite HMR)
npm run build     # TypeScript check + production build
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

## Project Structure

```
src/
  components/
    layout/       SectionNav — anchor-based navigation bar
    model/        14 visualization & interaction components
    ui/           Prose, GeometricHero
  pages/
    ScrollPage    Single-page layout with all sections
  lib/
    orgMetrics    Core calculations (span, flatness, fidelity, managers)
    depthTax      Depth tax model (signal, drift, decision costs)
    triangleGeometry  Shape gap, slope, gravity, agility calculations
    fidelityColor Gradient mapping utility (green → amber → red)
    styles        Tailwind class constants
  store/
    useCompanyStore  Zustand persist store (global fidelity rate)
  data/
    referenceCompanies  13 curated reference companies
  types/
    index         Company, OrgMetrics, DepthTaxResult, Archetype
```

## Architecture

- **No router** — Single-page scroll layout with anchor-based navigation (`#problem`, `#proof`, `#shape`, `#evidence`, `#model`, `#methodology`)
- **Global fidelity rate** — User-adjustable (default 82%), stored in Zustand persist, accessible from all visualizations
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
