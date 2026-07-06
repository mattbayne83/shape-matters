import { SECTION_LABEL } from '../../lib/styles';
import { FadeIn } from '../ui/FadeIn';

// Steelmanned objections from docs/ARGUMENT.md §4 — concession first, reframe
// second. Grow this list only from real skeptic feedback, not invented doubts.
const OBJECTIONS = [
  {
    id: 'amazon',
    objection: 'Amazon is nine layers deep — and it’s winning.',
    answer: (
      <>
        True — <strong>by routing around its own depth</strong>. Roughly 70% of Amazon’s
        decision volume resolves at two-pizza-team level instead of traversing nine layers.
        And the model still catches the residual cost: Amazon scores Fresh on the composite
        while its fidelity pillar sits in Aging — the canonical false-Fresh case the
        binding-pillar rule exists to expose. Amazon built machinery to pay less of the
        depth tax. <strong>It still pays it.</strong>
      </>
    ),
  },
  {
    id: 'walmart',
    objection: 'Deep hierarchy works. Look at Walmart.',
    answer: (
      <>
        Agreed. The command archetype — Walmart, USPS, Welch-era GE — is an operational
        descriptor, not a pejorative: centralized merchandising across 4,600 stores is a
        strategy, and it works at Walmart’s mission. The argument was never
        “flat good, deep bad.” It’s: <strong>know which pillar binds you, and
        pay the depth tax knowingly</strong>. The failure mode isn’t being deep — it’s
        being deep while believing your information is clean.
      </>
    ),
  },
  {
    id: 'flat',
    objection: 'Flat orgs are chaos. Zappos tried this.',
    answer: (
      <>
        Flat isn’t the prescription — <strong>measurement is</strong>. This model’s own
        research refuted naive flattening: team autonomy is a commitment lever, not a tradeoff
        lever. The binding question isn’t “how flat can we go?” — it’s
        “how much of our decision volume can we feasibly commit to team-level
        resolution?” Buurtzorg, Morning Star, and Berkshire Hathaway are three different
        shapes of that answer. None of them is “delete the org chart.”
      </>
    ),
  },
];

export function ObjectionsSection() {
  return (
    <section id="objections" className="py-16 md:py-24 px-6 md:px-12">
      <FadeIn className="max-w-5xl mx-auto">
        <div className={`${SECTION_LABEL} mb-3`}>The Objections</div>
        <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight mb-2">
          “But What About…”
        </h2>
        <p className="text-sm text-stone-500 mb-8 max-w-2xl">
          Three objections deserve a straight answer — and each answer is already in the model.
        </p>

        <div className="space-y-4">
          {OBJECTIONS.map(({ id, objection, answer }) => (
            <div key={id} className="bg-stone-50 border border-stone-200 rounded-xl p-5 md:p-6">
              <h3 className="text-lg md:text-xl font-bold font-serif text-stone-900 mb-3">
                “{objection}”
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed max-w-3xl">{answer}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
