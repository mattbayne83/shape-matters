# org-shape Backlog

Prioritized by impact on the research tool's credibility, usability, and reach.

---

## P0 — High Impact

### Evaluate InteractiveFidelityDemo Redundancy
The Simulate section now provides a more compelling interactive demo of signal decay. InteractiveFidelityDemo in the Problem section partially overlaps — evaluate whether it should be simplified to a minimal teaser or removed.
- [ ] Evaluate whether InteractiveFidelityDemo can be removed or simplified (it partially duplicates Simulate)
- [ ] Audit GeometricHero — pure decoration, question whether it earns its weight or should be deleted

### Expand Reference Dataset
- [ ] Add 5-10 more companies across underrepresented industries (healthcare, finance, government, military, non-profit)
- [ ] Add historical snapshots for companies that restructured (e.g., Microsoft pre/post Nadella, GE under Welch vs. Immelt)

### Variable Fidelity Rate
- [ ] Research per-layer fidelity rate ranges from Bartlett, Roediger et al., and organizational communication studies
- [ ] Consider modeling variable rates (lower retention at higher levels due to political filtering — Deming Point 8)
- [ ] Allow users to set per-layer rates in the calculator, not just a single global rate

---

## P1 — Medium Impact

### ~~Shareable Calculator URL~~ (/elon Step 4) — DONE
Moved to Completed section.

### Testing
- [x] Add Vitest for unit tests
- [x] Test `calcOrgMetrics()` and `calcDepthTax()` with known inputs/outputs
- [x] Test edge cases: 1 level, 1 employee, extreme fidelity rates (50%, 98%)
- [x] Test `calcTriangleGeometry()`, `calcRestructuringImpact()`, `fidelityColor()`, `metricColor()`
- [ ] Snapshot tests for key visualization components

### Data Export
- [ ] Export comparison data as CSV
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

### ~~Community Features~~ — DONE
Moved to Completed section.

### Academic Rigor
- [ ] Formal paper writeup of the unified model (Bartlett + Deming + Toyota → Shape Theory)
- [ ] Cite additional studies: Microsoft 2024 communication network study (241K employees), Axios HQ 2025
- [ ] Sensitivity analysis: how much does the model change across the 70-90% fidelity range?

---

## Completed

### Shareable Calculator URL
- [x] URL params `?l=&h=&f=` encode calculator state, `#model` hash scrolls to section
- [x] `applyUrlParams()` hydrates store at module load + after persist rehydration (`onRehydrateStorage`)
- [x] "Copy shareable link" button in ModelYourOrg input panel with 2s "Copied!" feedback
- [x] `hcSlider` sync useEffect for external headcount changes
- [x] Programmatic scroll-to-hash in ScrollPage (150ms delay for React render + persist)

### README Cleanup
- [x] Fixed stale company count (13 → 6), removed 7 non-existent companies from table
- [x] Updated component count (14 → 18), font list, fidelityColor description, store description
- [x] Added test commands, test directory, scrollToAnchor to project structure
- [x] Confirmed no Cloudflare Pages references

### Dead Code Cleanup + Testing + Terminology
- [x] Deleted `InertiaProfile.tsx` (151 lines dead code)
- [x] Deleted `TheoryView.tsx` (196 lines dead code)
- [x] Set up Vitest 4 with 95 unit tests across 4 calc modules
- [x] Established terminology rule: "levels" = structural count, "layer" = relay/process
- [x] Renamed "Org Levels" → "Levels" in all interactive controls
- [x] Made Levels the hero control (top position) in both Problem and Model sections

### Narrative Restructuring (8 → 6 sections)
- [x] Reordered sections for TED-talk persuasion flow (hook → proof → theory → tool)
- [x] Merged Problem + Math into unified Problem section
- [x] Moved company comparison from section 6 → section 2 ("The Proof")
- [x] Merged Calculator + Depth Tax into "Model Your Org" (3 sliders, 3-way viz toggle)
- [x] Streamlined Geometry → "The Shape" (6 metrics → 4: slope, gravity, agility, shape gap)
- [x] Deleted InertiaComparison, Triangle Area, Coord. Overhead
- [x] Consolidated formulas to Methodology section only (removed 3 duplicate formula boxes)
- [x] Updated hero stats for visceral contrast (17% red → 100% green → 13 blue)

### Community Features
- [x] GitHub Discussions integration for company data debate
- [x] "Suggest a company" form that opens a pre-filled GitHub issue

### Message Relay Simulator
- [x] 5 hand-authored scenarios (Safety, Customer, Innovation, Strategy, Operations) with 8 relay levels each
- [x] Rule-based transformation engine for custom messages (regex-based, 6 progressive tiers)
- [x] Collapsed cascade: Origin + L1 visible, expandable middle layers, Verdict card anchored
- [x] Opacity fade: card opacity mirrors signal fidelity (floor 0.35)
- [x] Innovation scenario selected by default (never blank)
- [x] 23 new unit tests (signal relay + scenario data integrity)
- [x] Slider styling matches Problem/Model sections

### Shape Section Removed + Narrative Reorder
- [x] Removed ShapeSection + ShapeOverlay components (544 lines)
- [x] Removed 3 CSS keyframe animations (shape-draw, horn-grow, gap-breathe)
- [x] Kept triangleGeometry.ts + types (shared with ModelYourOrg)
- [x] Reordered sections: Problem → Simulate → Evidence → Proof → Model → Methodology
- [x] Updated background alternation (stone-50 → white → stone-50 → white → stone-50 → white)

### Cross-Platform Font Rendering Fix
- [x] `font-black` (900) → `font-bold` (700) on all `font-mono` elements (DM Mono only ships 300/400/500)
- [x] `font-extrabold` (800) → `font-bold` (700) on CompanyCard + MetricCard
- [x] `tracking-tighter` → `tracking-tight` on hero metric numbers (prevents clipping on Windows fallback fonts)
- [x] Added `tabular-nums` to all numeric `font-mono` displays (safety net for proportional fallback fonts)
- [x] Added `-webkit-font-smoothing: antialiased` + `-moz-osx-font-smoothing: grayscale` to body
- [x] Files fixed: index.css, HeroSection, ModelYourOrg, InteractiveFidelityDemo, GembaComparison, CompanyCard, MetricCard
