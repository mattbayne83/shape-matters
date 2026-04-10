# Cycle 6 Seeds — Full Enrichment

Focus: Empirical grounding, scenario-specific blending, calibration of existing constants.

> Note: For cycles > 1 the orchestrator reads seeds from the prior journal's
> "Seeds for Next Cycle" section automatically. This file is for human reference.

## Carried forward from Cycle 5

1. [HIGH] **Bloom & Van Reenen WMS → DCI calibration.** Map the World Management Survey's
   5-point decentralization scale to the 0-100 DCI used in org-shape. Is it linear
   (`DCI = 25 × WMS_score`) or does it need a nonlinear transform? The WMS covers ~15,000
   firms across 35 countries — this is the strongest candidate for grounding DCI empirically.
   (From C5 seed #2.)

2. [HIGH] **Scenario-dependent blend ratio.** Classify the 5 relay simulation scenarios
   (Safety, Customer, Innovation, Strategy, Operations) by typical escalation depth.
   Hypothesis: Safety/Customer decisions resolve at L=2-3 (team-local); Strategy/Innovation
   require L=5+ (executive approval). If confirmed, `teamDecisionMix` becomes a per-scenario
   parameter rather than a global slider. (From C5 seed #4.)

3. [MED] **Blended model cross-validation.** Research 1-2 new reference companies not in
   the current set — Spotify (squad model, ~8K), Netflix (~13K, high-freedom), Bridgewater
   (~1.5K, radical transparency), or Toyota (~375K, Gemba). Predict their blended health
   scores from archetype-estimated teamDecisionMix, then compare to published accounts of
   their decision speed and agility. (From C5 seed #5.)

## New seeds (Cycle 6)

4. [HIGH] **Default teamDecisionMix sensitivity.** The store default was changed from 0
   (monolithic worst-case) to 50 (midpoint blend) during the Cycle 5 UI audit. Is 50 the
   right default? Sweep `p=0..100` for all 6 reference companies and compute the `p` at
   which each company lands in its "expected" health band (Amazon ≈ Fresh, Meta ≈ barely Fresh,
   Haier/Nucor ≈ Live, Valve ≈ Live, Google ≈ Fresh). Find the population-weighted default
   that best preserves ranking fidelity across the set. If no single value works, propose
   a per-company override and eliminate the global default.

5. [MED] **Congestion γ back-fit.** `CONGESTION_GAMMA = 0.1` is a module-level constant in
   `triangleGeometry.ts` with no empirical grounding. Back-fit γ per company such that
   predicted CEO torque matches a plausible "actual agility" proxy (e.g., time-to-ship for
   tech companies, safety incident response time for manufacturing). Test whether a single γ
   fits all 6 companies, or if γ is archetype-dependent.
