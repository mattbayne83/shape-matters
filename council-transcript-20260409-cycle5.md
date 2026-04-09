# Council Transcript — Cycle 5 Autoresearch Findings
**Date:** 2026-04-09
**Topic:** Evaluating org-shape Cycle 5 research findings for theoretical soundness, implementability, and prioritization

---

## Framed Question

**Context:** org-shape ("Shape Matters") is an open-source interactive research tool that models how organizational depth degrades information fidelity, increases latency, and impacts decision authority. It has a three-pillar model (Fidelity, Lag, Autonomy) backed by 189 unit tests, 6 reference companies, and 5 completed autoresearch cycles. The tool is live at GitHub Pages and used for presentations/analysis.

**The Cycle 5 findings to evaluate:**

1. **Signal-decay congestion model** — `r_eff = r(1 - γ × n_k/N_max)` reduces Uniform/Geometric torque divergence from 2.3x to ~1.5x at L=9. Trade-off: γ>0 also reduces geometric baseline CEO torque by ~10%. Convergence γ ≈ 0.175 + 0.024L. This is the first correction that works on uniform distributions (a log-form was proved inert in Cycle 4).

2. **DCI variance as sole decorrelation mechanism** — At uniform DCI (any value 0-100), fidelity and authority-agility have Spearman ρ = 1.0 exactly. The DCI slider is the *only* mechanism that breaks the Fidelity-Agility redundancy identified in Cycles 1-2. Monte Carlo minimum ρ = -0.14.

3. **Two-pizza blended model** — Amazon monolithic = Expired (15 HP). At 70:30 team/escalation blend = Fresh (74 HP). Introduces `teamDecisionMix` parameter capturing what fraction of decisions route through short paths (L=2-3) vs full hierarchy. Deep orgs benefit most from blending.

4. **β(L) = 0.158 × (L-4)^0.683** — Completes the HHI half-life generalization with ≤6.8% error across L=5-12. Phase transition at L=4 = ceil(half-life). Below this depth, all employee distributions behave similarly.

5. **DCI empirical calibration** — Archetype DCIs directionally validated by management literature (Collins, Hamel, HBS cases). Proposed adjustments: Meta 10→18, Google 65→58, Valve 100→92. Bloom & Van Reenen World Management Survey identified as path to quantitative grounding.

**What's at stake:** These findings could drive the next feature (blended model UI), recalibrate reference data, and add mathematical rigor. But they also add complexity to an already nuanced tool. The tool's audience includes product leaders, org designers, and executives — not mathematicians.

**The question:** Are these findings theoretically sound, practically implementable, and worth pursuing? Which should be prioritized for the UI vs kept as theoretical backing? Are there red flags in the methodology or conclusions?

---

## Advisor Responses

### The Contrarian

Finding 2 is a red flag, not a finding. Spearman ρ = 1.0 between fidelity and authority-agility at uniform DCI means your model has a structural degeneracy. You've documented a bug and called it a discovery. The fact that only DCI variance breaks the correlation means your three-pillar model is actually a two-pillar model with a cosmetic third axis. If the only thing separating two "independent" pillars is slider noise, the pillars aren't independent. Your audience of org designers will eventually notice they're looking at the same number twice with different labels.

The congestion model (Finding 1) is curve-fitting dressed as theory. γ ≈ 0.175 + 0.024L is a linear fit to simulation outputs — it has no organizational interpretation. Why does congestion scale linearly with depth? What real-world mechanism produces that coefficient? And accepting a 10% baseline torque reduction to fix a divergence problem means you're degrading accuracy in the common case to improve accuracy in the edge case (uniform distributions, which are rare in real orgs).

The two-pizza model is the most dangerous finding. You're introducing a blending parameter (teamDecisionMix) that lets users tune away bad results for deep orgs. That's not modeling — that's giving people a knob to confirm their priors. "My 15-layer org scores 74 HP if I assume 70% of decisions skip the hierarchy" is exactly the kind of flattering output that makes tools popular and wrong.

Finding 4 is solid math but irrelevant to the UI. Keep it in the paper, out of the product.

Finding 5 adjustments are trivially small. Meta 10→18 doesn't change anyone's decision. Don't ship recalibrations that look like noise.

Priority: Fix the pillar degeneracy before adding features. Everything else is decoration on a cracked foundation.

### The First Principles Thinker

The core question isn't "are these findings sound?" It's: does this tool need more mathematical precision, or does it need to be more useful?

Strip away the academic apparatus. You have a tool that shows people "deep orgs lose information and slow down." That insight is already powerful. The question is whether γ corrections and β(L) power laws make that insight more actionable for your actual audience — product leaders and executives.

Finding 2 is the only one that matters fundamentally. It reveals that your model has a structural redundancy — Fidelity and Agility are the same axis unless DCI variance exists. That's not a finding to implement; it's a finding that says your three-pillar model is actually a two-pillar model in most configurations. That should worry you. Either collapse the pillars honestly or make DCI variance a first-class input, not a hidden slider.

Finding 3 (two-pizza blended model) is the real product. Forget the math — the insight is: "deep orgs aren't doomed if decisions route through short paths." That's the actionable thing an executive takes away. Build this.

Findings 1, 4, and 5 are calibration work — they make the engine more accurate but don't change what users do with the tool. Keep them as engine internals. Don't surface γ or β(L) in UI.

Red flag: You're five cycles into autoresearch on a presentation tool. The diminishing returns are visible — you're now fitting power-law exponents to sixth-decimal precision for a model whose inputs (DCI scores, employee distributions) are qualitative guesses. You're overfitting the engine while the interface questions remain unsolved.

Priority: Build the blended model UI. Fix the pillar redundancy. Stop researching.

### The Expansionist

The blended model is the breakout finding and it's not close. You've accidentally discovered a general-purpose framework for modeling how autonomous teams coexist with hierarchy. That's not an org-shape feature — that's the entire future of the tool. Every serious org above 500 people runs some version of this blend. The `teamDecisionMix` parameter turns org-shape from an academic curiosity into something a VP of Engineering would actually use to argue for structural change. Ship the UI for this first, make it the headline feature, and frame it as "what if your org isn't purely hierarchical?" Because none of them are.

The congestion model is undervalued by everyone who will look at it. Right now it's a correction factor. But γ scaling with depth means you've found an empirical law about how organizational bandwidth saturates. That's publishable. Not in a blog — in an actual journal. Don't bury it as a tooltip. Surface it as a named concept: "congestion drag" or "signal saturation." Give it a dedicated visualization showing how adding layers doesn't just degrade fidelity linearly but hits bandwidth walls. Executives viscerally understand bottlenecks. This is the bottleneck, mathematized.

DCI variance as the sole decorrelation mechanism is a finding that makes the tool more defensible, not more complex. It tells you the model has exactly one degree of freedom where it matters. That's elegant. Use it to simplify the UI — make DCI the primary "personality" slider and let fidelity/agility be derived outputs.

The β(L) formula and DCI recalibrations are important but they're infrastructure. Ship them silently.

Priority: Blended model UI > congestion visualization > DCI as primary slider > everything else as backend upgrades.

### The Outsider

Here's what I see as someone with no context walking into this:

I don't know what half of this means, and that's the finding.

You say your audience is "product leaders, org designers, and executives." I am closer to that audience than you are right now. And I'm telling you: γ ≈ 0.175 + 0.024L, β(L) = 0.158 × (L-4)^0.683, and "HHI half-life generalization" are not things those people will engage with. They will nod politely and never open the tool again.

The two-pizza blended model is the only finding here that speaks human. "Amazon as a monolith is broken; blend short-path team decisions with hierarchy and it gets healthy" — that's a sentence a VP of Eng can act on tomorrow. Ship that. The teamDecisionMix parameter is intuitive. The 70:30 split is concrete. The "deep orgs benefit most" insight is counterintuitive enough to be interesting.

DCI as the sole decorrelation mechanism is architecturally important but not a feature. It's a constraint you discovered about your own model. Document it, don't UI it.

The signal-decay congestion model and β(L) formula are for your appendix. They reduce model error from numbers most users will never see. If the divergence between uniform and geometric was already invisible to non-experts at L=9, fixing it from 2.3x to 1.5x is polish on something nobody noticed was rough.

The DCI recalibration (Meta 10→18, etc.) is low-effort, high-trust. Do it. Reference companies that feel wrong undermine everything else.

Red flag: Five research cycles deep with 189 tests and you're still finding that pillars are redundant (ρ=1.0). That suggests the model's core dimensionality might be simpler than three pillars. Have you considered that the tool might be overfit to its own framework?

### The Executor

Here's my Monday morning list, ranked by "can ship this week" to "nice paper, park it."

Ship first: DCI empirical recalibration (#5). Three numbers change. Meta 10→18, Google 65→58, Valve 100→92. You update a data file, tests pass or they don't, push it. Half a day. This is the only finding that improves what users already see without touching the engine. Do it now.

Ship second: Two-pizza blended model (#3). This is the only finding that produces a new UI feature users can actually interact with. A `teamDecisionMix` slider at 0-100%, defaulting to 0 for legacy behavior. The 70:30 Amazon result is a great demo story for presentations. Implementation is straightforward — you're blending two existing path-length calculations. I'd budget 2-3 days for engine + UI + tests. This is your Cycle 6 headline.

Keep as engine internals, no UI: Signal-decay congestion (#1) and β(L) generalization (#4). Both improve mathematical accuracy. Neither produces something a product leader would interact with. Wire them into the engine behind the scenes. Users see better numbers without knowing why. Don't expose γ or β parameters in the UI — that's complexity for complexity's sake. Budget a day each.

Do nothing yet: DCI variance as sole decorrelation (#2). This is a diagnostic finding, not a feature. It tells you DCI variance matters, which you already knew since you built the DCI slider. The Spearman ρ=1.0 result is useful for documentation explaining why the slider exists, but there's no implementation action here. Write it up in the methodology docs and move on.

Red flag: The congestion model's γ varying with L (γ ≈ 0.175 + 0.024L) means you're fitting a correction to a correction. If you need a third term later, stop and question the base model instead.

---

## Peer Reviews

### Anonymization Mapping
- Response A = The Contrarian
- Response B = The First Principles Thinker
- Response C = The Expansionist
- Response D = The Outsider
- Response E = The Executor

### Review 1
**Strongest: B.** Correctly reframes to product utility and prescribes stop condition. **Biggest blind spot: A.** Calls degeneracy a "bug" but ρ=1.0 under uniform DCI is mathematically expected — fidelity and autonomy are both monotonic in depth when depth is the only free variable. Misdiagnosis would lead to unnecessary rework. **All missed:** Whether five cycles of technical findings have drifted the tool away from audience mental models.

### Review 2
**Strongest: B.** "Overfitting engine while interface unsolved" is sharpest diagnosis. **Biggest blind spot: A.** Pillar degeneracy is internal concern, not user-facing crisis. Chasing theoretical purity before delivering value is over-engineering. **All missed:** Who validates against real organizations? No predictions tested against actual restructuring outcomes.

### Review 3
**Strongest: B.** **Biggest blind spot: A.** Near-perfect F-A correlation is empirically expected — same layers degrade and slow information. Autonomy (DCI) IS the independent axis; the two co-moving is the model working, not breaking. **All missed:** 6 reference companies is interpolation, not validation. One adversarial company profile would be worth more than UI polish. Sample size is the real structural risk.

### Review 4
**Strongest: B.** **Biggest blind spot: C.** Enthusiastic about outputs while ignoring input soundness. If ρ=1.0 between pillars, congestion modeling atop a degenerate foundation is building on sand. **All missed:** 6 data points can't support the claims being made. Sample size is the real structural risk.

### Review 5
**Strongest: B.** **Biggest blind spot: C.** Calls congestion model "publishable" without confronting the degeneracy problem. **All missed:** Can the target users actually consume any of this? If a VP of Product can't explain the tool's output in a meeting, theoretical soundness is irrelevant.

---

## Chairman's Verdict

### Where the Council Agrees

**The blended model (Finding 3) is the most important output of Cycle 5.** All five advisors, despite radically different frames, converged on this. The ability to show that a deep org isn't doomed if decisions route through short paths — that's the first finding in five cycles that speaks the language of the target audience. A VP can grasp "Amazon looks broken at 12 layers, but two-pizza teams route 70% of decisions through 2-layer paths, so the effective health is 74 not 15." That's a story worth shipping.

**Findings 1, 4, and 5 are engine internals, not UI features.** The congestion model, HHI half-life generalization, and DCI recalibrations are calibration work. They make the engine more accurate, but exposing them to users would add complexity without adding insight. Ship them as backend improvements, document them in technical docs, and move on.

**Five autoresearch cycles have reached diminishing returns.** The strongest single diagnosis across the entire council came from the First Principles Thinker: "overfitting the engine while interface questions remain unsolved." The peer reviews unanimously confirmed this. The research phase needs a hard stop.

### Where the Council Clashes

**Is the pillar degeneracy (Finding 2) a crisis or expected behavior?**

The Contrarian calls it a bug — if fidelity and authority-agility are perfectly correlated at uniform DCI, then you have two pillars pretending to be three. This is a legitimate structural concern if you're claiming three independent dimensions.

The peer reviews pushed back hard. Three separate reviewers noted that fidelity and authority-agility co-moving under uniform conditions is *empirically expected* — the same layers that degrade signal also slow decisions. DCI (autonomy) IS the independent axis. The two co-moving pillars aren't broken; they're reflecting a real organizational truth. DCI variance is what breaks the correlation because it represents actual structural decisions about where authority lives.

**The verdict on this clash:** The peer reviews are right. The degeneracy isn't a bug — it's the model correctly showing that depth hurts both fidelity and agility in the same way, and only deliberate authority allocation (DCI) creates differentiation. However, the Contrarian's concern has a residual truth: if users see three pillars and two always move together, they'll wonder why there are three. The UI needs to make clear that autonomy is the *independent lever* while fidelity and lag are *consequences of structure*.

**Is the congestion model (Finding 1) valuable or overfitting?**

The Expansionist sees a potentially publishable empirical law. The Executor sees a correction on a correction. The truth is somewhere between: it meaningfully reduces the Uni/Geo torque divergence (2.3x to 1.5x), which matters for model credibility, but gamma varying with depth (γ ≈ 0.175 + 0.024L) is a fit, not a theory. Keep it in the engine. Don't expose it. Don't publish it until there's a theoretical justification for *why* gamma scales with depth.

### Blind Spots the Council Caught

**Validation gap.** Multiple peer reviewers flagged what no individual advisor fully addressed: six reference companies is interpolation, not validation. The model has never been tested against a real restructuring outcome. One adversarial case — predicting the health impact of a known reorg *before* looking at results — would be worth more than another research cycle. This is the single biggest risk to the tool's credibility.

**Audience comprehension.** The Outsider and Peer Review 5 converged on something important: if the target user (VP of Product, org designer, executive) cannot explain the output in a meeting, theoretical soundness is irrelevant. Five cycles of technical depth may have drifted the tool's internal language away from the mental models of its audience. The blended model is the only finding that naturally maps to how leaders actually think about org structure.

**Sample size is the structural risk, not pillar degeneracy.** Peer Review 4 nailed this. Six data points cannot support the parametric claims being made. Adding more reference companies — especially adversarial or unusual ones — matters more than refining gamma or beta.

### The Recommendation

**Ship the blended model as the headline Cycle 6 feature. Apply DCI recalibrations quietly. Stop researching.**

Specifically:

1. **DCI recalibrations (Finding 5):** Apply immediately as a maintenance commit. Half a day. No UI changes needed.
2. **Blended model UI (Finding 3):** This is the feature. Build a `teamDecisionMix` slider or input that lets users model how decisions actually route through their org. Show the before/after health score. This is the first thing in org-shape that gives users agency over their org's score rather than just diagnosing doom.
3. **Congestion model (Finding 1) and HHI generalization (Finding 4):** Merge into the engine. No UI exposure. Document in technical docs.
4. **Pillar presentation:** Reframe the three-pillar display to make clear that Fidelity and Lag are structural consequences while Autonomy (DCI) is the design lever. This isn't a rewrite — it's a labeling and emphasis change.
5. **No Cycle 6 autoresearch.** The next investment should be validation (one adversarial case study) or UI/UX, not more engine refinement.

### The One Thing to Do First

**Build the blended model UI with the `teamDecisionMix` parameter.** This is the single change that transforms org-shape from a diagnostic tool ("your org is broken, here's a score") into a design tool ("here's what happens if you route decisions differently"). It's the only Cycle 5 finding that changes what a user *does* after seeing the output, which is the only thing that matters for a tool meant to influence organizational decisions.
