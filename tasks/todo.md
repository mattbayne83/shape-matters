# Cycle 12 Implementation Plan

> Landing the architectural deliverables from [evals/journal/cycle-012.md](../evals/journal/cycle-012.md).
> Authored 2026-04-10 in a planning session. Execute in phased order, verify each gate before the next phase.
> Do NOT commit at any phase. Strict no-auto-commit rule.

## Decisions locked in

- **Multiplier shape (Q1)**: Option (a) — land `L_STAR_STRATEGY = 5` as a named constant computed from the Shannon derivation at construction time. Defer the general `scenarioCriticalDepth(weights)` multiplier function until the scenario picker ships and provides real usage data. `calcShannonFidelity` still lands as infrastructure with tests.
- **Latency annotation (Q2)**: Defer. Ship only the Methodology Nyquist card in Phase 4. The PillarDashboard annotation is a follow-up session.
- **Gate test scope (Q3)**: Full 15-company invariant test. Locks the Cycle 12 15/15 correctness finding as a regression fence.

## Files touched (summary)

Phase 1 (infrastructure):
- [src/lib/orgMetrics.ts](../src/lib/orgMetrics.ts) — add `calcShannonFidelity` + `SHANNON_BASE_SNR`
- [src/lib/__tests__/orgMetrics.test.ts](../src/lib/__tests__/orgMetrics.test.ts) — tests
- [src/lib/thermalLag.ts](../src/lib/thermalLag.ts) — add `calcLStar` + `calcNyquistStability`
- [src/lib/__tests__/thermalLag.test.ts](../src/lib/__tests__/thermalLag.test.ts) — tests
- [src/types/index.ts](../src/types/index.ts) — NyquistStability return type

Phase 2 (H3 gate):
- [src/lib/blendedModel.ts](../src/lib/blendedModel.ts) — gate on `levels >= L_STAR_STRATEGY`
- [src/lib/__tests__/blendedModel.test.ts](../src/lib/__tests__/blendedModel.test.ts) — rewrite Cycle 10 cascade tests + add 15-company invariant
- [src/lib/sensitivity.ts](../src/lib/sensitivity.ts) — verify pickup without modification; update TODO if needed

Phase 3 (Meta DCI):
- [src/data/referenceCompanies.ts](../src/data/referenceCompanies.ts) — `dci: 28` → `dci: 35` + comment update
- Any test files found in Phase 0 that hardcode Meta's DCI
- Doc sweep: `CLAUDE.md`, `docs/THEORY_BRIEF.md`, `org-shape-theory-brief.md`, `evals/insights.md`

Phase 4 (Methodology + CLI):
- [src/data/methodologyMetrics.tsx](../src/data/methodologyMetrics.tsx) — new Nyquist Ceiling card
- [evals/helpers/run-models.ts](../evals/helpers/run-models.ts) — expose `scenarioWeights`

## Out of scope

- Scenario picker UI in `InputStrip` — follow-up session
- Bureaucratic slack badge (Cycle 11 H5) — independent follow-up
- `dciSource` badge on CompanyCard — independent follow-up
- PillarDashboard stability annotation — deferred per Q2
- Regrounding relay simulator in SNR ladder — future cycle per seed #4
- Berkshire `subsidiaryPattern` annotation — low priority, dissolved by H3

---

## Phase 0 — Pre-flight reads (no edits)

- [ ] Read [src/lib/blendedModel.ts](../src/lib/blendedModel.ts) current state
- [ ] Read [src/lib/__tests__/blendedModel.test.ts](../src/lib/__tests__/blendedModel.test.ts) — note which tests will need rewriting
- [ ] Read [src/lib/orgMetrics.ts](../src/lib/orgMetrics.ts) and its test file — find insertion point
- [ ] Read [src/lib/thermalLag.ts](../src/lib/thermalLag.ts) and its test file — find insertion point
- [ ] Read [src/lib/sensitivity.ts](../src/lib/sensitivity.ts) — check the TODO from Phase 1 two sessions ago; verify it picks up the gate via `calcBlendedScores` without modification
- [ ] Grep for `dci: 28` and `Meta` hardcoded references across src/, tests, and docs
- [ ] Read [src/data/methodologyMetrics.tsx](../src/data/methodologyMetrics.tsx) — scope the Nyquist card addition
- [ ] Read [evals/helpers/run-models.ts](../evals/helpers/run-models.ts) — scope the `scenarioWeights` exposure

**Gate:** report findings. Confirm no phase plan surprises. List any tests that will break under Phase 2's gate change and under Phase 3's Meta DCI shift.

---

## Phase 1 — Infrastructure helpers (pure functions, no behavior change)

Three new pure functions land with tests. Project stays green — no existing behavior changes.

### Phase 1A — `calcShannonFidelity` in orgMetrics.ts

- [ ] Re-read [src/lib/orgMetrics.ts](../src/lib/orgMetrics.ts) immediately before editing
- [ ] Add `SHANNON_BASE_SNR` constant derived from `r = 0.82`: `SNR = r / (1 - r) = 4.5556`
- [ ] Add `calcShannonFidelity(levels, scenarioSnrMultiplier, baseR = 82)`:
  - Compute `snr = SHANNON_BASE_SNR * scenarioSnrMultiplier`
  - Compute `rScenario = snr / (1 + snr)`
  - Return `100 * Math.pow(rScenario, levels - 1)` for `levels >= 1`, `100` for `levels === 1`
- [ ] Add JSDoc citing Cycle 12 H3 and the Shannon-channel derivation

### Phase 1B — `calcShannonFidelity` tests

- [ ] Re-read [src/lib/__tests__/orgMetrics.test.ts](../src/lib/__tests__/orgMetrics.test.ts)
- [ ] Add `describe('calcShannonFidelity — Shannon channel model (Cycle 12 H3)')` block
- [ ] Test: `calcShannonFidelity(L, 1.0, 82) ≈ calcOrgMetrics(L, N, 82).fidelityAtTopPct` for L in [3, 6, 9] (round-trip with Bartlett at unit multiplier)
- [ ] Test: `calcShannonFidelity(1, mult)` returns 100 regardless of multiplier
- [ ] Test: halving the multiplier (`0.5`) produces stricter decay than `1.0` at L=9 (monotonicity)
- [ ] Test: `SHANNON_BASE_SNR` constant equals 4.5556 ± 0.001

### Phase 1C — `calcLStar` and `calcNyquistStability` in thermalLag.ts

- [ ] Re-read [src/lib/thermalLag.ts](../src/lib/thermalLag.ts)
- [ ] Add `calcLStar(d: number, T: number): number` returning `1 + Math.sqrt(T / (4 * d))`
- [ ] Add `calcNyquistStability(L, d, T)` returning `{ lStar, margin, band }` where:
  - `lStar = calcLStar(d, T)`
  - `margin = L - lStar`
  - `band: 'stable' | 'thin' | 'oscillatory'` with thresholds `margin <= 0` → stable, `margin <= 1` → thin, `margin > 1` → oscillatory
- [ ] JSDoc cites Cycle 12 H2 and the Nyquist phase-margin derivation `τ_crit = T/4`

### Phase 1D — NyquistStability type

- [ ] Re-read [src/types/index.ts](../src/types/index.ts)
- [ ] Add `NyquistStabilityBand = 'stable' | 'thin' | 'oscillatory'`
- [ ] Add `NyquistStability` interface: `{ lStar: number; margin: number; band: NyquistStabilityBand }`

### Phase 1E — Nyquist tests

- [ ] Re-read [src/lib/__tests__/thermalLag.test.ts](../src/lib/__tests__/thermalLag.test.ts)
- [ ] Add `describe('calcLStar and calcNyquistStability — Nyquist ceiling (Cycle 12 H2)')` block
- [ ] Test invariant: `calcThermalLag(Math.round(calcLStar(d, T)), d).totalDelay ≈ T/4` for `(d, T) ∈ {(3, 90), (1, 90), (3, 365)}` (within rounding tolerance)
- [ ] Test: `calcLStar(3, 90) ≈ 3.739` (quarterly cadence, daily-ish cycle)
- [ ] Test: monotone in `d` (deeper cycle → lower ceiling) and `T` (longer cadence → higher ceiling)
- [ ] Test: `calcNyquistStability(3, 3, 90).band === 'stable'` (Nucor-ish)
- [ ] Test: `calcNyquistStability(9, 3, 90).band === 'oscillatory'` (Amazon-ish)
- [ ] Test: band thresholds are inclusive at the boundaries as documented

### Phase 1 verification gate

- [ ] `npm run lint` — clean
- [ ] `npm run test` — all 235+ tests pass, new tests added
- [ ] `npm run build` — TypeScript strict + Vite build succeed
- [ ] `npm run eval:lint` — clean
- [ ] Confirm NO existing test was modified. Only additions.

**STOP. Report Phase 1 status before starting Phase 2.**

---

## Phase 2 — H3 structural gate in blendedModel.ts

The behavior change. This rewrites the Cycle 10 cascade tests because the gate changes which companies get the bonus.

### Phase 2A — Gate implementation

- [ ] Re-read [src/lib/blendedModel.ts](../src/lib/blendedModel.ts) immediately before editing
- [ ] Import `calcShannonFidelity` or add a `L_STAR_STRATEGY` constant locally. The constant should be computed at module load via the Shannon derivation: for strategy weighting, assume the SNR multiplier that reproduces Bartlett's 82% is reduced to reflect higher message complexity. Per seed #1, the formula is `L*_strategy = 1 + log(0.20) / log(r_strategy)` where `r_strategy` derives from an SNR multiplier we derive to give L* ≈ 4.68, with `ceil(L*) = 5`.
- [ ] Document the derivation in a code comment citing Cycle 12 H3, showing how `L_STAR_STRATEGY = 5` falls out of the math
- [ ] Modify the `scenarioWeights` branch: only apply the `monoF ← 100, monoA ← 100` saturation when BOTH `scenarioWeights.fidelity >= STRATEGY_FIDELITY_THRESHOLD` AND `levels >= L_STAR_STRATEGY`
- [ ] When the gate blocks the bonus, `scenarioMode` should still report `'strategy'` (the user asked for strategy mode, we just declined to apply the bonus). Add a new field `bonusApplied: boolean` OR extend `scenarioMode` to `'operational' | 'strategy-gated' | 'strategy-applied'`. Pick one and document.

### Phase 2B — Rewrite existing Cycle 10 cascade tests

- [ ] Re-read [src/lib/__tests__/blendedModel.test.ts](../src/lib/__tests__/blendedModel.test.ts)
- [ ] Identify every assertion from Phase 1 two sessions ago that assumed Haier flips to mix=0 under strategy weighting
- [ ] Rewrite those tests: Haier (L=3), Berkshire (L=4), Valve (L=1), any other L<5 company must NOT flip. Their strategy optimum should stay at mix=100 (or wherever operational dictates)
- [ ] Preserve tests for Amazon, Google, Meta, Ford pre-Mulally, IBM pre-Gerstner, GE-Welch, Walmart, USPS, VA-VHA (all L>=5) — these should still flip to mix=0 under strategy weighting
- [ ] The Cycle 10 depth-monotone cascade should still reproduce on the original 6 companies, but only for the L>=5 subset. Update the cascade test accordingly OR split it into "gate fires" and "gate blocks" sub-tests.

### Phase 2C — New 15-company invariant test

- [ ] Add `describe('H3 structural gate — 15-company invariant (Cycle 12)')` block
- [ ] Import `REFERENCE_COMPANIES` from `src/data/referenceCompanies.ts`
- [ ] For each company, under strategy weighting `{ fidelity: 0.55, lag: 0.10, autonomy: 0.35 }`:
  - If `levels >= L_STAR_STRATEGY` (5), assert bonus applied and strategy optimum flipped to mix=0
  - If `levels < L_STAR_STRATEGY`, assert bonus NOT applied and strategy optimum follows operational logic (likely mix=100 for non-L1 companies)
- [ ] Verify exactly which live companies fall in each group and document the expected split as a comment in the test

### Phase 2D — Sensitivity engine check

- [ ] Re-read [src/lib/sensitivity.ts](../src/lib/sensitivity.ts)
- [ ] Verify whether it calls `calcBlendedScores` directly (auto-picks up the gate) or mirrors its math inline (needs parallel update)
- [ ] If the latter, mirror the gate; if the former, update the TODO comment to reflect the new state

### Phase 2 verification gate

- [ ] `npm run lint` — clean
- [ ] `npm run test` — all tests pass
- [ ] `npm run build` — clean
- [ ] `npm run eval:lint` — clean
- [ ] Manual verification: call `calcBlendedScores` with Haier (L=3) + strategy weights, confirm `monoFidelity` is NOT overridden to 100
- [ ] Manual verification: call `calcBlendedScores` with Amazon (L=9) + strategy weights, confirm `monoFidelity` IS overridden to 100

**STOP. Report Phase 2 status before starting Phase 3.**

---

## Phase 3 — Meta DCI 28 → 35

### Phase 3A — Data change

- [ ] Re-read [src/data/referenceCompanies.ts](../src/data/referenceCompanies.ts)
- [ ] Locate Meta entry (~line 94 per journal)
- [ ] Change `dci: 28` → `dci: 35`
- [ ] Update the adjacent comment block to cite Cycle 11 H10 and Cycle 12 H10 convergent confirmations + the command-archetype lower-bound argument
- [ ] Keep `dciSource: 'qualitative-estimate'` (it's still an estimate, just a better one)

### Phase 3B — Test ripple

- [ ] For each file identified in Phase 0 that hardcodes Meta's DCI=28 or any derived value, update to reflect DCI=35
- [ ] Expected impact zones: `blendedModel.test.ts`, `sensitivity.test.ts`, possibly `healthScores.test.ts` if it has Meta-specific assertions
- [ ] Run `npm run test` after each test file update to catch cascading failures

### Phase 3C — Documentation ripple

- [ ] Update [CLAUDE.md](../CLAUDE.md) — search for `28` in Meta context, update
- [ ] Update [docs/THEORY_BRIEF.md](../docs/THEORY_BRIEF.md) — search for Meta DCI citations
- [ ] Update [org-shape-theory-brief.md](../org-shape-theory-brief.md) — same
- [ ] Do NOT touch [evals/insights.md](../evals/insights.md) or journal files — those are historical record
- [ ] Do NOT touch [evals/journal/*.md](../evals/journal/) — historical record

### Phase 3 verification gate

- [ ] `npm run lint` — clean
- [ ] `npm run test` — all tests pass
- [ ] `npm run build` — clean
- [ ] `npm run eval:lint` — clean

**STOP. Report Phase 3 status before starting Phase 4.**

---

## Phase 4 — Methodology Nyquist card + CLI helper exposure

### Phase 4A — Methodology Nyquist card

- [ ] Re-read [src/data/methodologyMetrics.tsx](../src/data/methodologyMetrics.tsx)
- [ ] Add new `MetricDefinition` entry under the latency category:
  - Category: `latency`
  - Title: "Nyquist Ceiling" (or similar)
  - Anchor ID: `methodology-nyquist-ceiling`
  - Formula block: `L*(d, T) = 1 + √(T / (4d))`
  - Description: cites Cycle 12 H2, classical control theory, explains that depths above `L*` trigger feedback-loop oscillation ("policy whiplash"). Give concrete examples at quarterly (T=90) and annual (T=365) cadences.
- [ ] Verify the card renders correctly in the Methodology section (via dev server in the verification gate)

### Phase 4B — `scenarioWeights` exposure in run-models.ts

- [ ] Re-read [evals/helpers/run-models.ts](../evals/helpers/run-models.ts)
- [ ] Add `scenarioWeights` to the `calcBlendedScores` argument parsing
- [ ] Add a brief comment showing the CLI invocation shape:
  `npx tsx evals/helpers/run-models.ts '{"fn":"calcBlendedScores","args":{"levels":9,...,"scenarioWeights":{"fidelity":0.55,"lag":0.10,"autonomy":0.35}}}'`
- [ ] Test the invocation manually to confirm it works end-to-end

### Phase 4 verification gate

- [ ] `npm run lint` — clean
- [ ] `npm run test` — all tests pass
- [ ] `npm run build` — clean
- [ ] `npm run eval:lint` — clean
- [ ] `npm run dev` — start dev server in background
- [ ] Provide localhost URL to user and ask them to eyeball:
  - Methodology section: new Nyquist Ceiling card renders with correct formula + description
  - `#proof` section: Meta CompanyCard shows updated health scores (DCI=35 should lift Meta's autonomy)
  - No visual regressions elsewhere

---

## Post-implementation

- [ ] Summary report for the user covering: files touched, test delta (before/after pass counts), behavioral changes visible in the UI, any deviations from the plan, any follow-up items that surfaced during implementation
- [ ] Prompt the user to decide whether to run Cycle 13 next (which would probe post-landing behavior) or ship the shippable follow-ups (scenario picker, bureaucratic slack badge, dciSource badge)
- [ ] Do NOT commit. User commits explicitly when ready.
