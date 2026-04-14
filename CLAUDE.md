# org-shape — Shape Matters

Open-source interactive diagnostic engine for organizational shape. **Three pillars**: Fidelity (information decay) + Latency (decision propagation) + Autonomy (decision rights distribution). Grounded in Bartlett, Deming, Toyota Gemba, and the Bloom–Van Reenen WMS.

## Tech
React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, Zustand 5 (persist), Lucide React. Source Serif 4 / Inter / DM Mono.

## Docs
- [docs/TECHNICAL.md](docs/TECHNICAL.md) — full architecture, components, calculations, evals, gotchas
- [design-system.md](design-system.md) — design token reference
- [docs/THEORY_BRIEF.md](docs/THEORY_BRIEF.md), [docs/TORQUE_MODEL.md](docs/TORQUE_MODEL.md), [docs/PHYSICS_MODELS.md](docs/PHYSICS_MODELS.md), [docs/BAHCALL_LOONSHOTS.md](docs/BAHCALL_LOONSHOTS.md)
- `evals/insights.md` — accumulated findings from 10 autoresearch cycles

## Critical Gotchas

- **Stone, NOT slate.** All neutrals are warm stone scale. Slate is never used. SVG hex must use stone (`#e7e5e4`, `#a8a29e`, `#44403c`, `#1C1917`). Slider accents = `accent-ember`, focus rings = `focus:ring-ember/30`.
- **PillarDashboard mobile reorder**: detail panel renders **above** cards on mobile via `order-first lg:order-last`. Don't change — pillar tap must be visible without scrolling.
- **PillarCard uses a single Knob SVG.** Never render two — duplicate SVG filter IDs kill the LED glow.
- **RadarChart is NOT a radar chart.** Filename is historical — it renders EQ-style segmented columns. Don't add spider/polygon logic.
- **BindingPillarCallout uses a theorem-backed binary rule** `scoreBand(min) === scoreBand(composite)` (Cycle 9/10 H4, exhaustively verified on 1,030,301 integer triples). Strict refinement of the old 10pt threshold — catches Amazon's 8pt false-Fresh case.
- **`sensitivity.ts` must use raw floats.** `calcBlendedScores` rounds at every step, which quantizes 1-unit finite-difference derivatives to zero. The sensitivity engine mirrors blended math without rounding. `LEVER_BOUNDS` must mirror actual InputStrip slider ranges.
- **Team Autonomy is a commitment lever, not a tradeoff lever** (Cycle 7 H3). Team path strictly dominates → optimal `teamDecisionMix` is always 100. LeverExchangeRates surfaces this as a footnote.
- **Historical-era reference companies exist.** Ford pre-Mulally is L=11, deeper than Amazon. Never use `REFERENCE_COMPANIES[length-1]` to find "the deepest current org" — look up by id.
- **`command` archetype is operational, not pejorative.** Houses Walmart/USPS/Welch-era GE — effective at their missions using deep hierarchy + centralized objective-setting.
- **Shareable URL uses query params** (`?l=&h=&f=&d=&ci=&tm=`), NOT hash. Hash is reserved for section anchors. `applyUrlParams()` runs twice (module scope + onRehydrateStorage) — intentional.
- **`expandedPillar` is NOT persisted** — always start collapsed on reload.
- **SignalCascade keyframes** must include input values (levels + fidelityRate) so animations restart on slider change. Plain `useId()` won't do it.
- **Terminology**: "Depth" = structural count (UI text); "Layer" = relay/process; "Levels" = code variables only, never in UI.
- **Pillar names**: Fidelity / Latency / Autonomy across all UI surfaces. `lag` is code-only.

## Commands

```bash
npm run dev         # Vite dev server
npm run build       # TS check + Vite build
npm run lint        # ESLint
npm test            # Vitest (228 tests across 11 files)
npm run test:watch
npm run eval        # Run next autoresearch cycle
```

## Deployment
GitHub Pages: https://mattbayne83.github.io/shape-matters/

**Current state:** 10 eval cycles complete. Cycle 10 open seed (HIGH): implement CEO-flat Strategy bonus in `blendedModel.ts`. See [docs/TECHNICAL.md](docs/TECHNICAL.md) for full eval status.
