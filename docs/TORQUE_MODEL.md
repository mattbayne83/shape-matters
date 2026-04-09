# Organizational Torque — A Physics Model for Pivot Speed

## Motivation

The original "Pivot Speed" metric used moment of inertia (mass × distance² from centroid) normalized against a variance ceiling. This produced a near-flat curve: 0.945 at L=2 vs 0.789 at L=15 — a 2.7 percentage point range that fails to differentiate a 2-level startup from a 15-level bureaucracy. The formula was self-canceling: both the numerator (variance) and the denominator (maxVariance = (L/2)²) scale with L², so the ratio converges to a constant.

This document defines a replacement model based on **rotational torque** that produces meaningful differentiation, incorporates fidelity rate (which the old model ignored), and opens the door to per-layer analysis.

---

## The Physics Analogy

### Rotational Mechanics Recap

| Physics Concept | Org Analog |
|---|---|
| Rigid body | The organization as a whole |
| Rotation | Strategic pivot — changing direction |
| Torque (τ = F × r) | A directive's ability to cause change |
| Force (F) | Signal strength: authority × fidelity at point of receipt |
| Lever arm (r) | Number of people at the receiving layer (organizational mass to move) |
| Moment of inertia (I) | Structural resistance to rotation (retained for its own visualization) |
| Angular acceleration (α = τ/I) | How quickly the org actually changes direction |

### Why Torque, Not Just Inertia

Inertia measures *resistance to change* — it's a property of the structure alone. But agility also depends on the *force applied*. A CEO directive in a high-fidelity org is a strong force; the same directive in a low-fidelity org arrives as noise. Torque captures both:

> **Organizational torque = signal strength at each layer × people at that layer**

A directive that arrives with 90% fidelity and must move 3,000 ICs generates far more organizational torque than one that arrives at 17% fidelity and must move the same 3,000 ICs.

---

## The Torque Formula

### Effective Force at Each Layer

A directive originating at layer `origin` must travel |origin - k| layers to reach layer k. At each relay, signal degrades by the fidelity rate r. The effective force (signal strength) arriving at layer k is:

```
F(k, origin) = r^|origin - k|
```

At the origin layer itself, F = 1.0 (no degradation). One layer away, F = r. Two layers away, F = r². The signal decays exponentially with distance — consistent with the Bartlett serial reproduction model already used throughout the tool.

### Torque at Each Layer

The torque contribution of layer k (the organizational mass actually moved by the directive) is:

```
τ_k(origin) = n_k × r^|origin - k|
```

Where n_k is the employee count at layer k.

### Total Organizational Torque

The total torque from a directive originating at layer `origin` is:

```
τ(origin) = Σ_{k=0}^{L-1} n_k × r^|origin - k|
```

### Pivot Efficiency (Normalized)

Normalize to [0, 1] by dividing by the total employee count N. This gives the fraction of the organization effectively reached by the directive:

```
pivot_efficiency(origin) = τ(origin) / N = (1/N) × Σ_{k=0}^{L-1} n_k × r^|origin - k|
```

**Boundary behavior:**
- At r = 1.0 (perfect fidelity): every directive reaches everyone perfectly → pivot_efficiency = 1.0 for all origins, regardless of depth
- At r = 0.0 (zero fidelity): only the origin layer receives the signal → pivot_efficiency = n_origin / N
- At L = 1 (flat org): no relays → pivot_efficiency = 1.0

### Aggregate Agility Score

Strategic pivots originate at the top. The single "Pivot Speed" metric is the **CEO's pivot efficiency**:

```
agilityScore = (1/N) × Σ_{k=0}^{L-1} n_k × r^(L-1-k)
```

The CEO sits at layer L-1. Distance to layer k is (L-1-k). The base layer (k=0, largest population) is the farthest away — this is where the most signal is lost and where the formula derives its sensitivity to depth.

---

## Numerical Validation

### Computed Values (N=5,000, r=0.82)

| Levels | Old Agility | New Agility (CEO) | Delta |
|--------|-------------|-------------------|-------|
| 2      | 0.945       | 0.823             | -12pp |
| 4      | 0.850       | 0.568             | -28pp |
| 6      | 0.816       | 0.399             | -42pp |
| 9      | 0.798       | 0.237             | -56pp |
| 12     | 0.792       | 0.143             | -65pp |
| 15     | 0.789       | 0.087             | -70pp |

The new formula spans 0.82 → 0.09 (74pp range) vs. the old formula's 0.95 → 0.79 (16pp range). Nearly 5x more differentiating.

### Sensitivity to Fidelity Rate

The old formula was independent of fidelity rate. The new formula correctly shows that a high-trust org pivots better at the same depth:

| Levels | r=0.70 | r=0.82 | r=0.95 |
|--------|--------|--------|--------|
| 2      | 0.704  | 0.823  | 0.951  |
| 6      | 0.194  | 0.399  | 0.787  |
| 9      | 0.079  | 0.237  | 0.686  |
| 12     | 0.033  | 0.143  | 0.599  |
| 15     | 0.015  | 0.087  | 0.524  |

This matches real-world intuition: a high-trust, high-fidelity 12-level org (like Toyota with its Gemba culture) pivots much better than a low-trust, politically-filtered 12-level org.

### Torque Profile Example (L=9, N=5,000, r=0.82)

Pivot efficiency by directive origin layer — shows who can actually move the org:

```
CEO  | 0.237  ############
L7   | 0.289  ##############
L6   | 0.352  ##################
L5   | 0.428  #####################
L4   | 0.519  ##########################
L3   | 0.625  ###############################
L2   | 0.742  #####################################
L1   | 0.850  ###########################################
ICs  | 0.898  #############################################
```

ICs have the highest pivot efficiency because they are closest to the mass (themselves + nearby layers). The CEO has the lowest because the signal must traverse 8 layers to reach the 3,400+ ICs at the base. This is the fundamental asymmetry of deep hierarchies: the person with the most authority has the least transmission efficiency.

---

## The Torque Profile (Per-Layer Analysis)

Beyond the single CEO score, the torque profile reveals **where change can originate effectively**:

```
torqueProfile[origin] = (1/N) × Σ_{k=0}^{L-1} n_k × r^|origin - k|
```

This produces a curve across all layers:

- **Top layers (CEO, C-suite):** High reach (traverse the whole org) but degraded signal to the massive base
- **Middle layers:** Moderate reach in both directions, moderate fidelity
- **Bottom layers (team leads):** Very high local fidelity but almost no upward reach; only move their immediate team

The torque profile can be visualized as a bar chart or line graph showing pivot efficiency by origin layer. In a flat org, the profile is nearly uniform. In a deep org, it's heavily skewed — only the top few layers can move the whole org, and even they do it poorly.

### Interpretation

The *shape* of the torque profile reveals organizational dynamics:
- **Flat profile** = decentralized; change can originate anywhere
- **Top-heavy profile** = centralized; only top leadership can pivot the org
- **Inverted/U-shaped** = middle management is the most effective origin (often seen when the base is too distant from the top but middle managers can reach both up and down)

---

## Relationship to Existing Metrics

| Metric | Relationship to Torque |
|---|---|
| Signal Fidelity (r^(L-1)) | Torque generalizes fidelity: fidelity is the *force* component; torque weights it by organizational mass |
| Moment of Inertia | Retained as a separate structural metric. Inertia is the resistance; torque is the applied force. Together they give angular acceleration (τ/I) |
| Decision Gravity | Centroid position remains useful for understanding *where* power concentrates |
| Decision Latency | Torque is about *effectiveness*, not *speed*. Latency (K × L) remains the speed metric |

---

## Breaking Change: Fidelity Rate as Input

The old `calcTriangleGeometry(levels, employees)` did not take `fidelityRate`. The new model requires it because agility fundamentally depends on signal quality:

```
calcTriangleGeometry(levels, employees, fidelityRate)
```

This is conceptually correct — an agility score that ignores communication quality was always incomplete.

---

## Academic Grounding

The torque model is grounded in:

1. **Bartlett (1932)** — Empirical basis for per-layer signal degradation (the force decay term r^d)
2. **Shannon's Channel Capacity (1948)** — Each relay is a noisy channel; cascade of noisy channels degrades exponentially
3. **Rotational mechanics** — τ = F × r is first-year physics; the org mapping is a direct analogy
4. **Network propagation theory** — Signal attenuation in multi-hop networks follows the same exponential decay pattern

The key insight is that organizational agility is not a structural property alone (like inertia) — it's a *transmission* property that depends on both structure AND communication quality. The torque model unifies these.

---

## Future Extensions

1. **Authority weighting** — Weight force by a layer's formal authority (e.g., CEO = 1.0, team lead = 0.1). Currently omitted because fidelity decay already captures the operational reality.
2. **Bidirectional torque** — Model bottom-up torque (innovation from ICs) separately from top-down torque (strategic pivots from CEO).
3. **Variable fidelity per layer** — Aligns with P0 backlog item "Variable Fidelity Rate" and Deming's Point 8 (fear increases filtering at higher levels).
4. **Torque-to-inertia ratio** — Angular acceleration α = τ/I as a compound "responsiveness" score.

---

## Signal-Decay Congestion (v1.4.0)

Large layers degrade signal transmission more than small layers.

**Formula**: `r_eff(k→k+1) = r × (1 - γ × n_k / N_max)`

Where:
- `r` = base per-layer fidelity rate
- `γ` = congestion coefficient (hardcoded at 0.1)
- `n_k` = employee count at transmitting layer k
- `N_max` = largest layer count

**Effect**: CEO torque drops ~10% for geometric distributions. The frontline layer (largest) gets the strongest congestion penalty; upper layers (smaller) are nearly unaffected.

**γ scaling**: Convergence γ ≈ 0.175 + 0.024L (from Cycle 5 research). Not exposed in UI.

---

## HHI Half-Life Generalization (Theoretical)

For non-geometric employee distributions, the half-life formula requires correction:

```
h_corr(L, r, HHI) = h_base(r) × (HHI_geo(L) / HHI)^β(L)
where h_base = log(2)/|log(r)|
      β(L) = 0                           if L ≤ ceil(h_base)
      β(L) = 0.158 × (L - ceil(h_base))^0.683   if L > ceil(h_base)
```

Phase transition at L = ceil(h_base) ≈ 4: below this depth, all distributions behave similarly.

**Note**: Not implemented in code. The tool only uses geometric distributions via `employeesPerLayer()`. Documented for theoretical completeness (Cycle 5, Finding 4).

---

## Blended Decision Model (v1.4.0)

Real organizations route decisions through multiple path lengths.

**Formula**: `blended_score(pillar) = p × pillar(L_team, d_team) + (1-p) × pillar(L, d)`

Where:
- `p` = teamDecisionMix / 100 (0 = monolithic, 100 = all team)
- `L_team` = min(L, 2) (two-pizza team depth)
- `d_team` = d × 0.5 (team decisions are faster)

**Key result**: Amazon at 70:30 blend = Fresh (74 HP) vs monolithic Expired (15 HP). Deep orgs benefit most from team-level decision routing.
