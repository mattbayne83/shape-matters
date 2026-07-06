# The Shape Matters Argument

**Status:** v1 — deployed to components (hero, section labels, `ObjectionsSection`, Therefore transition).

This is the site's marketing argument, in the sense Billy Broas uses the term: the
chain of claims a reader must accept for the conclusion — *go measure your org's
shape* — to feel inevitable. It is the source of truth the on-page copy is checked
against, the same way `evals/insights.md` is the source of truth for the model.

**The paradigm** (Broas): (1) build a strong argument first, (2) then find the best
words, stories, and proof to express it, (3) then use design to support it. As AI
makes sites easy to build, the argument is the differentiator.

**The rule for this repo:** every scroll-page section must advance exactly one
element of this argument (a premise, an objection, or the conclusion). Copy that
doesn't trace back to a line in this document is decoration. When the model changes
(new eval cycles, new reference companies), update this document first, then the copy.

---

## 1. Reader and desired action

**Reader:** an operator — founder, exec, senior manager, or the staff engineer who
advises them — who suspects their org is slow and lossy but attributes it to people,
culture, or "communication problems."

**The belief we must change:** *"Our problems are people problems."* → *"Our
problems have a structural floor that no amount of talent can dig below."*

**Desired actions, in order:**
1. **Run the model** with their own numbers (`#model`). This is the conversion.
2. **Share the URL.** Shareable query-param state (`?l=&h=&f=&d=&ci=&tm=`) is the
   growth mechanic — a shared link is an argument-in-miniature aimed at a colleague.
3. **Star the repo / join Discussions** — for the minority who want to interrogate
   the methodology.

---

## 2. The thesis (one sentence)

> **Your org chart is an information system — and most were never engineered as
> one. Shape, not talent, sets the ceiling on what your leaders can know and how
> fast they can act.**

Everything on the page either supports this sentence or handles an objection to it.

---

## 3. The premises

### Premise 1 — Every management relay loses signal

*This is measured, not asserted.* Bartlett (1932) ran the first controlled study of
serial reproduction: content shrank 40–50% by the fourth relay, and unfamiliar
details were replaced with familiar ones. The control condition is the killer
detail: when the *same person* retold the story over weeks, it stabilized. The
handoff — not time, not memory — destroys the signal.

- **Best proof:** Bartlett 1932; Deming 1982 (every layer adds variation + fear).
- **Best experience:** the Telephone Effect simulator — the reader *watches* a
  frontline scenario soften and reframe layer by layer.
- **On-page home:** `SimulateSection` + the Bartlett paragraph in `#problem`.

### Premise 2 — Losses compound multiplicatively with depth

One lossy relay is survivable. Nine in series is arithmetic: at 82% per-layer
retention, a 9-layer org delivers **17% of the original signal** to the CEO.
Leaders in deep hierarchies aren't badly informed by accident — they're informed
through a channel whose transfer function guarantees it.

- **Best proof:** the compounding math itself, live and manipulable
  (`InteractiveFidelityDemo`); the Valve-vs-Amazon spread in the hero cards.
- **Best story:** Ford pre-Mulally — 11 layers, feuding fiefdoms, 4–6 year vehicle
  cycles; Mulally's first act was forcing cross-silo visibility in one weekly
  meeting. IBM pre-Gerstner's "non-concur" chain is the definitional depth-tax case.
- **On-page home:** `#problem` section.

### Premise 3 — The best operators already behave as if this is true

Toyota invented the Gemba Walk decades before organizational theory formalized any
of this: send leaders to where value is created, bypassing every relay. This is an
*admission against interest* — if hierarchical communication were lossless, the
bypass would be unnecessary. Amazon's two-pizza teams, Berkshire's 27-person HQ,
and Buurtzorg's 900 manager-less nursing teams are the same admission in different
dialects: route decisions around the relay chain, or shorten it.

- **Best proof:** Gemba (Toyota, 1950s); Bryar & Carr on two-pizza teams; Munger's
  "delegation just short of abdication."
- **On-page home:** `#evidence` ("They Already Knew" — keep this title, it's the
  best line on the site).

### Therefore

> **Your organization's shape imposes a hard bound on fidelity, latency, and
> autonomy. Talent operates inside that bound, never above it. So before you blame
> the people: measure the shape.**

The tool is not a feature being demoed. It is the argument's conclusion made
operational — *if the premises hold, the only unknown left is your numbers.*

---

## 4. The objections (steelmanned)

Strong arguments answer the skeptic's inner monologue on the page, not in the
methodology appendix. These three objections are real, and the model already
contains their answers — currently buried where only the convinced will find them.

### Objection 1 — "Amazon is nine layers deep and it's winning."

**Concede the fact, keep the frame.** Amazon wins *by routing around its own
depth*: ~70% of its decision volume resolves at two-pizza-team level instead of
traversing nine layers (that's `teamDecisionMix = 70` in the model). And the model
still catches the residual cost: Amazon is the canonical **false-Fresh** case —
composite score 72.7 (Fresh band) while its fidelity pillar sits at 63 (Aging).
The composite flatters it; the binding pillar doesn't. This is exactly what the
theorem-backed binding-pillar rule (`scoreBand(min) === scoreBand(composite)`,
verified exhaustively on 1,030,301 integer triples) exists to expose. Depth didn't
stop hurting Amazon; Amazon built machinery to pay less of the tax — and still
pays it.

### Objection 2 — "Deep hierarchy works. Look at Walmart."

**Agree — and sharpen.** The model's `command` archetype (Walmart, USPS, VA Health,
Welch-era GE) is an operational descriptor, not a pejorative. Centralized
merchandising across 4,600 stores is a *strategy*, and it works at Walmart's
mission. The argument was never "flat good, deep bad." It's: **know which pillar
binds you, and pay the depth tax knowingly.** Walmart pays it with open eyes for
consistency at scale. The failure mode isn't being deep — it's being deep while
believing your information is clean (see: VHA's 2014 wait-time scandal, a
depth-tax failure inside an org with excellent people).

### Objection 3 — "Flat orgs are chaos. Zappos tried this."

**Flat is not the prescription — measurement is.** The model contains L=1 through
L=11 organizations and scores an archetype-appropriate Walmart *as effective at its
mission*. And its own research refutes naive flattening: team autonomy turned out
to be a **commitment lever, not a tradeoff lever** (Cycle 7 H3) — the binding
question is not "how flat can we go?" but "how much of our decision volume can we
*feasibly* commit to team-level resolution, given governance constraints?"
Buurtzorg (14,000 nurses, 50 back-office staff), Morning Star (peer-to-peer
CLOUs), and Berkshire (27-person HQ over 392,000 employees) are three different
shapes of the same answer — none of them is "delete the org chart."

### Objection 4 (methodological) — "These numbers are estimates."

**Yes — and the argument is robust to them.** Per-layer retention is a slider, not
a constant; sources are cited per company (SEC filings, levels.fyi, HBS cases,
GAO reports); DCI is calibrated against the Bloom–Van Reenen World Management
Survey (~15,000 firms, 35 countries); limitations are published in Methodology.
Move any estimate ±10 points and the direction never flips: loss still compounds,
depth still dominates, the binding pillar still binds. Precision is negotiable;
the shape of the curve is not.

---

## 5. Copy deployment map

How the argument lands on the scroll page, section by section. Titles marked
*(keep)* are already the best expression of their premise.

### Hero (`HeroSection.tsx`)

**Current subhead** (describes the tool):
> Every management layer is a lossy relay. This tool models how organizational
> depth degrades information fidelity, inflates communication costs, and impacts
> the decisions that shape culture and performance.

**Deployed subhead** (states the thesis — nothing else):
> Your org chart is an information system — and most were never engineered as
> one. Shape, not talent, sets the ceiling on what your leaders can know and
> how fast they can act.

Two sentences, two jobs: the reframe, then the stakes. The lossy-relay/compounding
line belongs to Premises 1–2 (the scroll delivers it seconds later), and
"here's the argument — and the tool" was meta-narration the CTA buttons
directly below already perform.

**CTAs:** primary `Measure Your Ceiling` → `#model`; secondary `Read the Argument`
→ `#simulate`. ("Model Your Org" describes a feature; "Measure Your Ceiling"
completes the thesis.)

**Hero cards:** re-caption the three metric cards as the three pillars doing
premise work — Fidelity (what survives), Decision Speed (how fast it moves),
Flatness (the shape that causes both).

### Section labels → argumentative roles

| Section | Current label | Proposed label | Title |
|---|---|---|---|
| `#simulate` | The Telephone Effect | **Premise 1 · Every relay loses signal** | Watch Your Message Decay *(keep)* |
| `#problem` | The Problem | **Premise 2 · Losses compound with depth** | Why This Happens *(keep)* |
| `#evidence` | The Evidence | **Premise 3 · The best operators already know** | They Already Knew *(keep)* |
| `#proof` | The Proof | **The Premises, Tested** | Real Companies, Real Structures *(keep)* |
| *(new)* `#objections` | — | **The Objections** | "But What About…" |
| transition | — | **Therefore** | — |
| `#model` | Model Your Org | **The Conclusion** | How Much Signal Survives Your Structure? *(keep)* |
| `#methodology` | Methodology | Methodology *(keep)* | How We Calculate *(keep)* |

The `Premise n` labels are deliberate: for a site whose brand is theorem-backed
rigor, wearing the argument's structure on its sleeve *is* the differentiation.

### New section: Objections (`#objections`, between `#proof` and the transition)

Three steelman-and-answer blocks (Objections 1–3 above, tightened to ~60 words
each; Objection 4 stays in Methodology where the skeptical reader will look for
it). Each block: the objection verbatim in the skeptic's voice as the heading,
the concession first, the reframe second. Format suggestion: match the existing
`bg-white border border-stone-200 rounded-xl` card language from `#evidence`.

### Transition ("Now it's your turn.") → the Therefore band

**Was:** *Now it's your turn.* (a dare, small and skippable)

**Now:** a full-bleed `stone-900` band — the page's only dark moment, so the eye
cannot skip the argument's hinge. Three beats:

1. **Syllogism recap** — the three premises in mono with one-word verdicts
   (*measured / arithmetic / admitted*), echoing the Bartlett/Deming/Toyota
   mono card in `#evidence`.
2. **The ∴ glyph** — the mathematical "therefore" as the divider, on-brand for
   a theorem-backed site.
3. **The conclusion + action** —
   > If the premises hold, the only unknown left is **your numbers**.
   with an ember CTA repeating the hero's promise: *Measure Your Ceiling* → `#model`.

Design enacting argument: premises accumulate in light, the conclusion lands in
ink. This converts running the model from "try the widget" into intellectual
honesty.

### Model Your Org subhead

**Current:** *Structure determines fidelity and speed. Authority distribution is
your lever.*

**Proposed:** *You've seen the premises and the proof. This is the conclusion,
applied: your depth, your spans, your decision mix — your ceiling.*

---

## 6. Maintenance

- New scroll-page sections must name which premise/objection/conclusion they
  advance (in the PR description).
- When eval cycles change the model's claims (e.g. a premise gains or loses
  support), amend §3/§4 here **before** touching component copy.
- The objections list should grow only from *real* skeptic feedback (Discussions,
  user tests) — invented objections dilute the steelman.
