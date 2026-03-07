# org-shape Backlog

Prioritized by impact on the research tool's credibility, usability, and reach.

---

## P0 — High Impact

### Expand Reference Dataset
- [ ] Add 5-10 more companies across underrepresented industries (healthcare, finance, government, military, non-profit)
- [ ] Add historical snapshots for companies that restructured (e.g., Microsoft pre/post Nadella, GE under Welch vs. Immelt)

### Variable Fidelity Rate
- [ ] Research per-layer fidelity rate ranges from Bartlett, Roediger et al., and organizational communication studies
- [ ] Consider modeling variable rates (lower retention at higher levels due to political filtering — Deming Point 8)
- [ ] Allow users to set per-layer rates in the calculator, not just a single global rate

---

## P1 — Medium Impact

### Testing
- [ ] Add Vitest for unit tests
- [ ] Test `calcOrgMetrics()` and `calcDepthTax()` with known inputs/outputs
- [ ] Test edge cases: 1 level, 1 employee, extreme fidelity rates (1%, 99%)
- [ ] Snapshot tests for key visualization components

### Data Export
- [ ] Export comparison data as CSV
- [ ] Export calculator results as shareable URL (encode params in hash)
- [ ] PDF/image export for charts (html-to-image or similar)

### Accessibility & Mobile
- [ ] Audit keyboard navigation through all interactive controls
- [ ] Ensure all SVG visualizations have aria labels and screen reader descriptions
- [ ] Test and optimize mobile layout for all sections (especially calculator sliders and comparison grid)

### Research Articles Section
- [ ] Build article listing page with TSX + Prose wrapper pattern
- [ ] Write first article: "Why the Gemba Walk Exists" (expand the existing Gemba comparison section)
- [ ] Write second article: "Deming's 14 Points Through the Lens of Organizational Shape"

---

## P2 — Nice to Have

### Enhanced Visualizations
- [ ] Animated org chart showing information flow degradation in real-time
- [ ] Side-by-side org shape comparison (pick two companies, see structures overlaid)
- [ ] Time-series view for companies with historical data points

### Simulation Mode
- [ ] "What if" simulator: take a real company, flatten by N levels, show projected metric changes
- [ ] Monte Carlo simulation on fidelity rate ranges to show confidence intervals

### Community Features
- [ ] GitHub Discussions integration for company data debate
- [ ] "Suggest a company" form that opens a pre-filled GitHub issue

### Academic Rigor
- [ ] Formal paper writeup of the unified model (Bartlett + Deming + Toyota → Shape Theory)
- [ ] Cite additional studies: Microsoft 2024 communication network study (241K employees), Axios HQ 2025
- [ ] Sensitivity analysis: how much does the model change across the 70-90% fidelity range?

---

## Completed

### Narrative Restructuring (8 → 6 sections)
- [x] Reordered sections for TED-talk persuasion flow (hook → proof → theory → tool)
- [x] Merged Problem + Math into unified Problem section
- [x] Moved company comparison from section 6 → section 2 ("The Proof")
- [x] Merged Calculator + Depth Tax into "Model Your Org" (3 sliders, 3-way viz toggle)
- [x] Streamlined Geometry → "The Shape" (6 metrics → 4: slope, gravity, agility, shape gap)
- [x] Deleted InertiaComparison, Triangle Area, Coord. Overhead
- [x] Consolidated formulas to Methodology section only (removed 3 duplicate formula boxes)
- [x] Updated hero stats for visceral contrast (17% red → 100% green → 13 blue)
