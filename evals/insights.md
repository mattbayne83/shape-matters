# Accumulated Research Insights

> This file is the system's long-term memory. Updated after each cycle.
> If it exceeds 500 lines, it gets compressed (preserving confirmed/refuted findings).

---

### Cycle 1 — 2026-04-08

1. **The default 82% fidelity rate places Amazon exactly on the round-trip cliff** (RT=4.18%, just below 5%). A single percentage point change matters enormously at 9 levels. The cliff formula `0.05^(1/(2*(L-1)))` gives the minimum viable retention rate for any depth.

2. **The three pillars are really two dimensions.** Fidelity and agility are near-perfectly correlated (r≈1.0) because the torque model collapses to r^(L-1) for bottom-heavy orgs. Lag is the only genuinely independent measure.

3. **Shape classification is a depth proxy, not a size metric.** The gap check (>8%) is never binding for L≥3. The diamond/pyramid distinction is controlled entirely by slope angle. For L≥6, no realistic company avoids "diamond."

### Cycle 2 — 2026-04-08

4. **Signal has a fixed half-life: `h = log(2)/|log(r)|` layers.** At 82%, h=3.49 — exactly 4 layers have >50% pivot efficiency regardless of org depth. Layers beyond this are a "broadcast zone."

5. **The fidelity-agility redundancy is structural, not parametric.** CEO torque algebraically reduces to r^(L-1) because frontline employees dominate mass distribution (85-97%). Only a qualitatively new input dimension (decision authority) could break it.

6. **Restructuring is fidelity-play for flat orgs, speed-play for deep orgs.** Exchange rate (fidelity per lag day saved) decays 49x from L=3 to L=9. Constant x1.22 fidelity boost per level removed, but lag reduction diminishes with depth.

7. **Culture can fix signal quality but only structure can fix speed.** Under heterogeneous fidelity rates, F-Lag correlation drops from 0.91 to 0.23 while F-A stays at ~1.0.

8. **Zone margin compression**: Deep orgs have razor-thin margins. Amazon is -0.8pp below the 5% RT cliff.

### Cycle 3 — 2026-04-08

9. **The half-life formula is distribution-dependent, not universal.** Holds for geometric (bottom-heavy) distributions — which real orgs have — but breaks for uniform (+67-137% CEO torque inflation) and diamond distributions.

10. **Heterogeneous authority profiles decorrelate fidelity and agility.** IC-empowered vs CEO-centric styles produce genuine rank inversions. Spearman correlation drops from 1.0 to 0.77.

11. **Live lag health requires ≤3 levels for d≥2 days/layer.** Structural speed limit formula: `L_max = floor(1 + sqrt(16.25/d))`. Amazon reaching Live would require span=116 (physically impossible).

12. **Communication investment beats restructuring for fidelity at L≥7.** Break-even: `r_new = r^((L-2)/(L-1))`. Amazon needs only +2.06pp fidelity improvement to match removing a level, but gets ZERO lag improvement.

13. **Effective Depth Ratio (EDR) is a genuinely new metric.** EDR = effective_layers/total_layers. Haier/Nucor=100%, Amazon=44%. Orthogonal to existing pillars.

14. **Decision cycle and depth are substitutable for lag.** Halving cycle time = reducing depth by sqrt(2). More practical for deep orgs.

### Cycle 4 — 2026-04-08

15. **The DCI crossover threshold is low: Amazon needs only DCI≥35 to outperform Meta on authority-agility** despite 3× worse fidelity and 3 more levels. A 35% IC-empowered bias is sufficient to overcome Meta's structural advantage.

16. **Log-form coordination costs are mathematically inert for uniform distributions** (penalty cancels in torque normalization). Only signal-transmission corrections can break the F-A redundancy — not mass-based corrections. (REFUTED H2)

17. **McKinsey's "3 layers for agile" independently validates the structural speed limit formula.** `L_max` at d≥2 = 3 layers; at d≈1 = 6 layers. Amazon's two-pizza teams (L=2 operational cells) bypass the L=9 chain by architecture. Strongest external validation across all cycles.

18. **Cycle-time reduction is the highest-ROI lever for deep orgs.** 10% cycle reduction yields 0.38 levels of health improvement for Amazon vs 0.17 for Nucor. Deep orgs are on the steep part of the lag-health exponential curve — explains why Amazon/Google invest in CI/CD over restructuring.
