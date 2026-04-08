# LLM Council Transcript — Pillar Dimension Naming
**Date:** 2026-04-07
**Topic:** Renaming "Signal Fidelity / Propagation Lag / Change Response" to single-word pillar names

---

## Framed Question

We're building "Shape Matters" (org-shape) — a physics-based organizational diagnostic tool that models how org structure affects performance. It has three pillar dimensions that users interact with in a modal/dashboard UI. Each pillar uses a physics model but needs a name that's intuitive and memorable for a business audience (executives, org designers, consultants).

The three pillars and what they measure:
1. **How much of a CEO's message survives after passing through 5+ management layers** (exponential decay model, Bartlett's serial reproduction). Currently "Signal Fidelity." Shows a percentage — e.g., only 30% of the original message reaches the front line.
2. **How many days for a strategic decision to reach the people who execute it** (quadratic scaling model, Fourier's Law). Currently "Propagation Lag." Key insight: adding one layer costs way more than you'd think — delay scales with the square of depth, not linearly.
3. **How the org responds to a strategic pivot — overshoot and oscillate, land smoothly, or barely move** (damped harmonic oscillator). Currently "Change Response." Produces a damping ratio (ζ) that determines the regime: under-damped (fishtailing), critically-damped (optimal), over-damped (stuck).

The proposed rename: simplify all three to single words — **Clarity**, **Speed**, **Resilience**.

The question: Are these three single-word names the right call? Do they accurately convey what each dimension measures? Are they memorable and distinctive enough? Is anything lost by going from two-word technical names to single-word plain names? Would a different set of single words work better?

---

## Advisor Responses

### The Contrarian

The rename has a fatal flaw: none of these three words are specific enough to be diagnostic.

"Clarity" is the worst offender. It already means a dozen different things in business contexts — communication clarity, strategic clarity, role clarity. Attaching it to "percentage of message that survives hierarchical decay" requires explanation every single time. You haven't simplified; you've created ambiguity that the two-word name avoided.

"Speed" is generic to the point of meaninglessness. Every consultant deck has a "Speed" slide. The actual insight here — that delay scales quadratically, not linearly — is completely invisible in this name. The word "Speed" implies a linear problem with a simple fix. That's the opposite of what this model reveals.

"Resilience" is the most egregious mismatch. Resilience in organizational literature means ability to survive shocks and recover. What this pillar actually measures is responsiveness to strategic pivots — specifically whether the org overshoots and oscillates versus converges smoothly. That's agility or adaptability, not resilience. A highly damped system that barely moves when you pull the wheel isn't resilient; it's sluggish. You've picked a word with positive connotations that can mask a serious pathology.

The deeper problem: single-word names optimized for memorability trade away precision and self-evidence. When a CEO asks "what does Resilience measure?" and you need a paragraph to answer, the name failed.

Better candidates that don't sacrifice meaning: Fidelity, Latency, Responsiveness. These are still single words, still accessible, but each points at the actual phenomenon. Executives know what latency means. "Responsiveness" captures the oscillation problem without the false positive framing of "resilience."

The current proposal passes a first-impression test and fails every follow-up question.

---

### The First Principles Thinker

The real problem here isn't naming — it's whether these three dimensions are actually the right decomposition of organizational health in the first place.

Strip it back. What is org-shape actually trying to answer? One question: "Does your org structure help or hurt your ability to execute strategy?" Every dimension should be a direct answer to that.

Signal Fidelity measures **translation loss** — does intent degrade into noise by the time it reaches executors? The word "Clarity" is dangerously misleading. Clarity implies the message was well-written. This measures structural distortion, not message quality. An executive will hear "Clarity" and think "we need better communication." Wrong diagnosis. The phenomenon is **Reach** or **Fidelity** — how much of the original signal arrives intact.

Propagation Lag → "Speed" loses the most critical insight: quadratic scaling. "Speed" sounds like a traffic problem. The actual finding is that adding one layer doesn't cost you one day, it costs you exponentially more. That's not "Speed" — that's **Leverage** or **Amplification** of delay. The word should invoke "small structural changes have massive time consequences."

Change Response → "Resilience" is the least wrong of the three, but resilience typically means "withstands shocks." Your model measures responsiveness dynamics — whether the org overshoots, oscillates, or absorbs. That's closer to **Agility** or **Responsiveness**.

The actual first-principles answer: the single-word simplification is solving the wrong problem. The two-word names were wrong because they were technical, not because they were two words. Better names: **Reach**, **Leverage**, **Agility** — each implicitly answers "what happens to strategy in your org?"

---

### The Expansionist

Clarity, Speed, Resilience are fine. They're not the opportunity.

Here's what's being undervalued: these three dimensions together tell a complete story about organizational health that no competitor has named yet. You're not just renaming metrics — you're defining a new diagnostic vocabulary. That's the real asset.

Single words are the right move, but you're leaving upside on the table by picking generic ones. "Clarity" is used everywhere. "Speed" is used everywhere. "Resilience" has been beaten to death post-COVID. A business audience hears these words and thinks... nothing distinctive. They're descriptors, not anchors.

The bigger opportunity is owning words that feel *invented for this context* but are instantly understood. Consider what's hiding here:

- Pillar 1 isn't just clarity — it's about how much of the original signal *survives*. "Fidelity" is already the right word. Don't abandon it. Hi-fi audio systems made "fidelity" intuitive to non-engineers decades ago.
- Pillar 2 isn't just speed — it's about *lag*, the gap between intent and execution. "Velocity" is stronger because it implies direction plus speed, which matters organizationally.
- Pillar 3 is where the real upside lives. "Resilience" undersells the oscillation insight — the damping ratio is about whether an org *absorbs* change or *fights* it. "Absorption" or "Responsiveness" is more precise and more interesting.

The bolder play: Fidelity, Velocity, Responsiveness. These are still one-to-two words, still plain English, but they're not on every consulting deck already. They position "Shape Matters" as a precision instrument, not another leadership framework.

Clarity, Speed, Resilience gets you to launch. Fidelity, Velocity, Responsiveness gets you to a category.

---

### The Outsider

The single-word names have a problem: they describe desired outcomes, not what the tool actually measures.

**Clarity** makes sense for pillar 1. Message fidelity decaying through layers — yes, that's about clarity. This one works.

**Speed** is wrong for pillar 2. Speed implies how fast something moves. But "Propagation Lag" measures delay — the opposite of speed. If your score is high, is that good (fast) or bad (slow lag)? The framing is ambiguous. The real insight — that delay compounds quadratically with depth — gets completely lost. A first-time user seeing "Speed: 47 days" will ask "47 days of what?" whereas "Propagation Lag: 47 days" is self-explanatory. Consider **Reach** or **Depth** or just **Lag**.

**Resilience** is the biggest mismatch. Resilience implies bouncing back from adversity. But the damped oscillator measures *how smoothly* the org responds to intentional change — not whether it survives shocks. An org that barely moves has low resilience in common usage but might score "well" on a stability metric. An org that overshoots is reactive, not resilient. The word actively misleads. Consider **Agility**, **Response**, or **Adaptability**.

The deeper problem: these three words (Clarity, Speed, Resilience) are so commonly used in corporate language that they carry zero distinctiveness. Every consulting deck already has a slide with exactly these three words. They signal nothing about physics-based modeling or what makes this tool different.

The two-word technical names were actually doing more work. The loss is real. If you want single words, at least make them specific enough that someone couldn't have guessed them before seeing the tool.

---

### The Executor

The rename works. Ship it.

Here's the Monday morning test: a VP opens the dashboard and sees three numbers. With "Signal Fidelity / Propagation Lag / Change Response," they're reading a physics textbook. With "Clarity / Speed / Resilience," they immediately know which number to show their CEO and what conversation to have.

Specifics:

**Clarity** — accurate. The signal decay model literally measures how clear the message stays. No loss here.

**Speed** — this one has a problem. Speed implies you want more of it. But your model measures *delay* — you want less of it. The insight is "decision lag scales quadratically." A low Speed score means slow. A high Speed score means fast. That's fine, but make sure the UI makes the direction obvious. Consider "Velocity" if you want something with more directional weight, though Speed is cleaner.

**Resilience** — wrong word. Resilience means bouncing back from disruption. Your damping ratio measures *response to intentional change*, not adversity. The right single word is **Agility**. It maps directly to "how well does the org respond to a strategic pivot" without the connotation of surviving shocks.

Final answer: keep Clarity, keep Speed (just mind the directionality in the UI), replace Resilience with **Agility**.

That's three words any executive knows, can repeat in a meeting, and immediately associates with org health. Done.

---

## Peer Reviews

### Anonymization Key
- Response A = The Contrarian
- Response B = The First Principles Thinker
- Response C = The Expansionist
- Response D = The Outsider
- Response E = The Executor

### Review 1
**Strongest: Response A (Contrarian)** — Only one that diagnoses all three with precision. The "Resilience vs. responsiveness" distinction is sharpest. "Fidelity/Latency/Responsiveness" is concrete and defensible.
**Biggest blind spot: Response B (First Principles)** — Pivots to questioning decomposition, sidesteps actual question. "Leverage" isn't defended as mapping to quadratic delay.
**All missed:** The naming question can't be separated from the UI's explanatory layer. A single word is only a handle — tooltips and subtitles carry the precision.

### Review 2
**Strongest: Response A (Contrarian)** — Most precise, commits to recommendation.
**Biggest blind spot: Response E (Executor)** — Ships on vibes. Accepts "Clarity" without interrogation, waves off "Speed" flaw.
**All missed:** Single-word constraint was never interrogated. Primary reader question (executive vs practitioner?) determines whether compression helps or hurts.

### Review 3
**Strongest: Response A (Contrarian)** — Only one with real diagnostic rigor.
**Biggest blind spot: Response B (First Principles)** — Category error: mistakes naming critique for architectural critique.
**All missed:** Audience fit — C-suite needs familiar/aspirational vocabulary, consultants need model-precision vocabulary.

### Review 4
**Strongest: Response A (Contrarian)** — Explains mechanism of each failure, not just the verdict.
**Biggest blind spot: Response E (Executor)** — Waves off Speed directional problem, doesn't ask if names carry model meaning.
**All missed:** Audience and register — executives need familiarity, practitioners need precision. Different readers, possibly different names.

### Review 5
**Strongest: Response A (Contrarian)** — Specific technical reasoning on all three names.
**Biggest blind spot: Response E (Executor)** — Doesn't engage with whether names carry the model's meaning.
**All missed:** Audience question — C-suite may need familiar words precisely *because* they're familiar; the diagnostic power lives in the score, not the label.

---

## Chairman's Verdict

### Where the Council Agrees

**"Resilience" is wrong.** Every advisor flagged it independently. A highly damped oscillator that stalls on pivots is the opposite of resilient. The word carries "bouncing back from adversity" connotations that actively mislead users about what the model measures. This is the strongest signal from the entire deliberation — four out of five advisors flagged it unprompted, and every peer review confirmed it.

**"Speed" has a directional problem.** The pillar measures *delay*, not speed. Naming a high-latency org "low speed" is intuitive, but naming it that way in a diagnostic context creates ambiguity that will surface in every executive conversation.

**Single-word compression is net positive if the words are right.** No one argued for reverting to two-word names. The debate was entirely about *which* single words.

### Where the Council Clashes

**Fidelity/Latency/Responsiveness vs. Clarity/Speed/Agility.**

The Contrarian and Expansionist both land on Fidelity as the P1 name and like precision-instrument framing throughout. The Executor argues Clarity is accurate and good enough — executives recognize it, it requires no explanation.

This is a real tension. "Fidelity" is precise and distinctive, but asks the audience to make one conceptual hop (hi-fi audio → message transmission). "Clarity" requires zero hops but loses the structural distortion mechanism entirely. Both are defensible. The choice turns on your primary audience: consultants using this as a technical instrument lean toward Fidelity; executives getting a dashboard overview lean toward Clarity.

### Blind Spots the Council Caught

**The UI's explanatory layer was never accounted for.** Single-word names don't have to carry the full diagnostic weight alone. Subtitles, tooltips, and axis labels do real work. "Clarity" paired with "message survival through management layers" is a different thing than "Clarity" standing alone.

**Audience segmentation was universally missed.** C-suite executives need familiar, aspirational vocabulary. Consultants running a diagnostic engagement need vocabulary that maps to the model. These are different readers, and the right answer might not be identical for both.

### The Recommendation

**Drop "Resilience" immediately. It's wrong and there is no version of the UI that fixes it.**

The replacement is **Agility**. It maps directly to "how well does the org respond to a strategic pivot," it's familiar to executives, and it doesn't carry the false "shock survival" connotation.

For P1, **keep "Clarity" as the default display name but verify the subtitle carries the structural mechanism.** Clarity is accurate enough and requires zero audience onboarding. Fidelity is the more precise choice if primary users are consultants.

For P2, **rename to "Latency" not "Speed."** Latency is directionally unambiguous — high latency is always bad, no mental inversion required. "Speed" measured as "days to front line" requires users to flip the frame every time.

**Final recommendation: Clarity, Latency, Agility.**

If building for a practitioner-heavy audience and want precision-instrument positioning: **Fidelity, Latency, Agility.** Either set is defensible. Neither "Speed" nor "Resilience" should ship.

### The One Thing to Do First

Pull up your current P2 pillar UI — the one measuring days for decisions to reach the front line — and ask whether the framing reads as "speed" (higher is better) or "lag" (lower is better). If the axis, color coding, or copy frames it as "more speed = green," the rename to Latency also requires a UI direction flip.
