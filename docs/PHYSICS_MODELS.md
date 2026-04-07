# Physics Models for Organizational Shape

Six cross-disciplinary models mapping known physics to organizational phenomena.
Each produces calculable, interactive insights about how org shape affects performance.

The existing **Signal Fidelity** model (Bartlett compound decay) proved the pattern:
known physics + novel organizational application = genuine discovery.
These six candidates follow the same principle.

---

## Selected for Development

### 1. Damped Harmonic Oscillator — Change Response

**Physics:** Classical Mechanics (Spring-Mass-Damper)
**Status:** Selected — Most Novel

An org responding to change behaves like a spring-mass-damper system.
Layers add damping (bureaucratic friction). The physics predicts three regimes:

| Regime | Org Behavior | Characteristic |
|--------|-------------|----------------|
| **Under-damped** (too few layers) | Oscillates wildly, overshoots targets, whiplash | ζ < 1 |
| **Critically damped** (optimal depth) | Fastest possible response without chaos | ζ = 1 |
| **Over-damped** (too many layers) | Sluggish, never overshoots but agonizingly slow | ζ > 1 |

**Variable Mapping:**

| Physics | Symbol | Org Analog |
|---------|--------|------------|
| Spring stiffness | k | Org agility / cultural adaptability |
| Damping coefficient | c | Bureaucratic friction per layer (processes, approvals) |
| Mass | m | Headcount / organizational inertia |
| Natural frequency | ω₀ = √(k/m) | Maximum org response speed |
| Damping ratio | ζ = c / 2√(km) | Layer friction relative to size and agility |

**Core Equation:**
```
x(t) = response to step change (new strategy, pivot, market shift)

m·x'' + c·x' + k·x = F(t)

where:
  m = headcount-derived inertia
  c = f(levels) — damping scales with org depth
  k = agility constant (culture, decision rights)
  F(t) = external forcing function (market change, directive)
```

**The Discovery:** There's a mathematically optimal org depth for any given size —
not too flat, not too tall — that produces the fastest change response without
oscillation. It's the org design equivalent of critically damped suspension.

**Why This Matters:**
- Explains why startups (under-damped) oscillate between strategies
- Explains why large enterprises (over-damped) respond too slowly to market shifts
- Predicts the optimal depth for a given headcount — a prescriptive, not just descriptive, tool
- The math is well-understood (solved ODE) and produces clean interactive visualizations

---

### 2. Heat Transfer & Thermal Lag — Priority Propagation

**Physics:** Thermodynamics (Fourier's Law of Conduction)
**Status:** Selected — Novel

Strategic urgency is temperature. Each layer is insulation with an R-value.
Fourier's Law governs how quickly "heat" (urgency, context, intent) conducts through.

**Variable Mapping:**

| Physics | Symbol | Org Analog |
|---------|--------|------------|
| Temperature | T | Strategic urgency / priority level |
| Thermal resistance | R | Information resistance per layer |
| Heat flux | q = ΔT / ΣR | Effective priority reaching front line |
| Thermal diffusivity | α | How quickly context propagates (not just magnitude) |
| Thermal lag | τ | Time delay before front line feels the urgency |

**Core Equations:**
```
Steady-state (Fourier's Law):
  q = ΔT / (R₁ + R₂ + ... + Rₙ)
  → Priority reaching front line = urgency gap / total layer resistance

Time-dependent (diffusion):
  ∂T/∂t = α · ∂²T/∂x²
  → τ ∝ L² / α  (lag scales with SQUARE of depth)
```

**The Discovery:** Fidelity loss and time lag are *independent failure modes*.
An org can preserve signal perfectly (high fidelity) but still act too late
(high thermal lag). The existing model captures amplitude loss; this captures
temporal delay. Together they form the complete picture: **what arrives** vs **when it arrives**.

**Why This Matters:**
- Thermal lag scales with the SQUARE of depth — adding one layer doesn't add linear delay
- Explains "we got the message but it was too late" — high fidelity, high lag
- Introduces time as a first-class dimension alongside fidelity
- Natural complement to the existing signal decay model

---

### 3. Fluid Dynamics & Turbulence — Decision Flow

**Physics:** Fluid Mechanics (Reynolds Number, Bernoulli's Principle)
**Status:** Selected — Deep Model

Decisions flow through orgs like fluid through pipes. The geometry of the org
(span of control, depth) determines whether flow is orderly or chaotic.

**Variable Mapping:**

| Physics | Symbol | Org Analog |
|---------|--------|------------|
| Pipe diameter | D | Span of control |
| Flow velocity | v | Decision speed / throughput demand |
| Fluid density | ρ | Decision complexity / weight |
| Viscosity | μ | Process friction (approvals, reviews, sign-offs) |
| Reynolds number | Re = ρvD/μ | Order-to-chaos threshold |
| Pressure drop | ΔP | Priority / urgency loss per layer |

**Core Equations:**
```
Reynolds Number:
  Re = ρvD / μ
  → Re_org = (decision_complexity × speed × span) / process_friction

  Re < ~2300: laminar (orderly decision flow)
  Re > ~4000: turbulent (chaotic, unpredictable outcomes)
  2300-4000: transitional (fragile order)

Bernoulli's Principle:
  P + ½ρv² = constant
  → Narrowing bottlenecks increase speed but DECREASE quality (pressure)
```

**The Discovery:** There's a calculable threshold where an org's decision flow
transitions from orderly to chaotic — and it depends on the *ratio* of speed
to span, not just depth. An org can be deep and orderly (wide span, slow pace)
or flat and chaotic (narrow span, high speed).

**Why This Matters:**
- Reynolds number unifies speed, span, complexity, and friction into one diagnostic number
- Predicts when "move fast" directives will produce chaos vs results
- Bernoulli explains the quality-speed tradeoff at bottleneck layers
- Laminar-to-turbulent transition is a phase change — it happens suddenly, not gradually

---

### 4. Electrical Impedance & Bandwidth — Signal Throughput

**Physics:** Electrical Engineering (Circuit Theory, Transmission Lines)
**Status:** Selected — Extends Fidelity Model

Each org layer is a resistor + capacitor in series. The existing fidelity model
captures resistance (attenuation). This adds capacitance (decision backlog),
impedance mismatch (signal reflection), and bandwidth limits.

**Variable Mapping:**

| Physics | Symbol | Org Analog |
|---------|--------|------------|
| Resistance | R | Per-layer fidelity loss (existing model) |
| Capacitance | C | Layer's decision absorption / backlog capacity |
| Impedance | Z = R + 1/jωC | Combined resistance + backlog at a given pace |
| Impedance mismatch | Γ | Culture/incentive misalignment between layers |
| Bandwidth | BW = 1/(2πRC) | Maximum decision throughput (decisions/quarter) |
| Reflection coefficient | Γ = (Z₂-Z₁)/(Z₂+Z₁) | Fraction of signal bounced back |

**Core Equations:**
```
Bandwidth per layer:
  BW = 1 / (2π · R · C)
  → Max throughput = 1 / (2π × friction × backlog_capacity)

Total bandwidth (series):
  BW_total ≈ min(BW₁, BW₂, ..., BWₙ)  (bottleneck-limited)

Impedance mismatch / reflection:
  Γ = (Z₂ - Z₁) / (Z₂ + Z₁)
  → When layers have different impedances (incentives, culture),
     a fraction Γ of the signal reflects BACKWARD instead of propagating
```

**The Discovery:** Org throughput isn't just about speed — it has a hard frequency
ceiling determined by the slowest layer. And misaligned layers don't just slow
signals, they *reflect* them backward. An idea that hits an impedance mismatch
between engineering and sales doesn't just attenuate — part of it bounces back
as confusion, rework, or "that's not what we asked for."

**Why This Matters:**
- Bandwidth is bottleneck-limited (weakest link), not average
- Reflection is a genuinely new concept for org design — distinct from attenuation
- Extends the existing fidelity model with throughput and reflection dimensions
- Impedance matching gives a framework for why some reorgs work (better matching) and others don't

---

## Parked (Not Selected, Worth Revisiting)

### 5. Wave Resonance & Standing Waves

**Physics:** Wave Mechanics (Resonance, Superposition)
**Status:** Parked

Organizations have a natural frequency — the pace at which they can absorb
and respond to change. When the market's disruption frequency matches the
org's natural frequency, resonance amplifies the effect catastrophically
(Tacoma Narrows bridge). Tall orgs develop standing wave nodes — layers
where nothing actually happens.

**Key Mappings:**
- Natural frequency → org's change absorption rate
- Driving frequency → market disruption pace
- Resonance → catastrophic amplification at frequency match
- Standing wave nodes → "dead" layers that add no value

**The Insight:** Reorgs sometimes fail because they change the org's natural
frequency to match the exact disruption hitting it — accidental resonance.

---

### 6. Entropy & the Second Law

**Physics:** Thermodynamics (Statistical Mechanics)
**Status:** Parked

Every relay point increases entropy — the disorder of information. The Second
Law says entropy in a closed system only increases. Middle managers are
Maxwell's Demons — they attempt to locally decrease entropy (filter, clarify,
prioritize) but the total system entropy still grows.

**Key Mappings:**
- Entropy (S) → information disorder
- Free energy (G) → useful decision capacity
- Maxwell's Demon → middle management filtering
- Heat death → total bureaucratic stasis

**The Insight:** The energy an org spends on coordination isn't waste — it's
the thermodynamic cost of fighting entropy. But beyond a certain depth, you
spend more energy fighting entropy than doing useful work.

---

## How These Models Relate

```
                    Signal Fidelity (existing)
                    "What arrives?"
                          │
              ┌───────────┼───────────┐
              │           │           │
        Thermal Lag   Impedance   Entropy
        "When does    "How much    "How much energy
         it arrive?"   bounces      to fight disorder?"
                       back?"
              │           │
              └─────┬─────┘
                    │
              Fluid Dynamics
              "When does orderly
               flow become chaos?"
                    │
              Oscillator
              "How does the whole
               system respond to
               a forcing function?"
```

The models form a hierarchy:
1. **Signal Fidelity** — amplitude of what arrives (existing)
2. **Thermal Lag** — timing of when it arrives (new dimension)
3. **Impedance** — throughput ceiling and reflection (extends fidelity)
4. **Fluid Dynamics** — phase transition from order to chaos (emergent)
5. **Oscillator** — whole-system dynamic response (integrative)

---

*Created 2026-04-06. See also: docs/THEORY_BRIEF.md, docs/TORQUE_MODEL.md*
