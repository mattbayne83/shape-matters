import { useMemo } from 'react';
import { Github, ArrowRight, MessageCircle, Plus } from 'lucide-react';
import { InteractiveFidelityDemo } from '../components/model/InteractiveFidelityDemo';
import { GembaComparison } from '../components/model/GembaComparison';
import { ComparisonView } from '../components/model/ComparisonView';
import { ModelYourOrg } from '../components/model/ModelYourOrg';
import { ShapeSection } from '../components/model/ShapeSection';
import { MethodologySection } from '../components/model/MethodologySection';
import { GeometricHero } from '../components/ui/GeometricHero';
import { useCompanyStore } from '../store/useCompanyStore';
import { REFERENCE_COMPANIES } from '../data/referenceCompanies';
import { calcOrgMetrics } from '../lib/orgMetrics';
import { SECTION_LABEL } from '../lib/styles';
import { FadeIn } from '../components/ui/FadeIn';

export function ScrollPage() {
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);

  const flat = REFERENCE_COMPANIES[0]; // Valve, 1 level
  const deep = REFERENCE_COMPANIES[REFERENCE_COMPANIES.length - 1]; // Amazon, 9 levels

  const flatM = useMemo(
    () => calcOrgMetrics(flat.levels, flat.employees, fidelityRate),
    [flat.levels, flat.employees, fidelityRate]
  );
  const deepM = useMemo(
    () => calcOrgMetrics(deep.levels, deep.employees, fidelityRate),
    [deep.levels, deep.employees, fidelityRate]
  );

  return (
    <div className="min-h-screen bg-white">
      {/* ─── HERO ─── */}
      <section className="py-16 md:py-24 px-6 md:px-12 overflow-hidden relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-stone-100 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none" />

        <FadeIn className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-sm uppercase tracking-widest text-stone-400 font-bold mb-8">
            The Shape of Effectiveness
          </h2>

          <div className="mb-6 relative">
            <GeometricHero />
          </div>

          <p className="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Every management layer is a lossy relay. This tool models how organizational depth
            degrades information fidelity, inflates communication costs, and impacts the decisions
            that shape culture and performance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="#model"
              className="px-8 py-3.5 bg-ember text-white font-medium rounded-lg hover:bg-ember-deep hover:shadow-xl hover:shadow-ember/20 active:scale-95 transition-all text-sm w-full sm:w-auto"
            >
              Model Your Org
            </a>
            <a
              href="#problem"
              className="px-8 py-3.5 bg-white text-stone-700 font-medium border border-stone-300 rounded-lg hover:bg-stone-50 hover:border-stone-400 hover:text-stone-900 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
            >
              Read the Theory
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {/* Card 1: Signal Fidelity */}
            <div className="group flex flex-col justify-between text-left py-5 px-5 bg-stone-50 border border-stone-200 rounded-xl hover:shadow-lg hover:shadow-stone-200/50 hover:bg-white transition-all duration-300 cursor-default h-[180px]">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-stone-400 mb-3">
                  Signal Fidelity
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter text-stone-900">
                    {flatM.fidelityAtTopPct.toFixed(0)}%
                  </div>
                  <div className="text-[10px] text-stone-300 font-bold uppercase tracking-wider">vs</div>
                  <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter" style={{ color: '#B84515' }}>
                    {deepM.fidelityAtTopPct.toFixed(1)}%
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-stone-500 mb-3">
                  <span>{flat.name} · {flat.levels} level</span>
                  <span>{deep.name} · {deep.levels} levels</span>
                </div>
              </div>
              <div>
                <div className="h-1.5 rounded-full opacity-30 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, #1C1917, #B84515)' }} />
                <div className="text-[10px] text-stone-500 mt-2.5 max-h-0 overflow-hidden group-hover:max-h-10 transition-all duration-300 leading-relaxed">
                  Each relay retains {fidelityRate}% — loss compounds across every level
                </div>
              </div>
            </div>

            {/* Card 2: Decision Speed */}
            <div className="group flex flex-col justify-between text-left py-5 px-5 bg-stone-50 border border-stone-200 rounded-xl hover:shadow-lg hover:shadow-stone-200/50 hover:bg-white transition-all duration-300 cursor-default h-[180px]">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-stone-400 mb-3">
                  Decision Speed
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter text-stone-900">
                    {flatM.roundTripLayers}
                  </div>
                  <div className="text-[10px] text-stone-300 font-bold uppercase tracking-wider">vs</div>
                  <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter" style={{ color: '#B84515' }}>
                    {deepM.roundTripLayers}
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-stone-500 mb-3">
                  <span>{flat.name} · 0 hops</span>
                  <span>{deep.name} · {deepM.roundTripLayers} hops</span>
                </div>
              </div>
              <div>
                {/* Relay dot chain */}
                <div className="flex items-center gap-1 h-1.5">
                  {Array.from({ length: deep.levels }, (_, i) => {
                    const t = i / (deep.levels - 1);
                    const r = Math.round(28 + t * (184 - 28));
                    const g = Math.round(25 + t * (69 - 25));
                    const b = Math.round(23 + t * (21 - 23));
                    return (
                      <div
                        key={i}
                        className="h-1.5 flex-1 rounded-full opacity-30 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          backgroundColor: `rgb(${r}, ${g}, ${b})`,
                          transitionDelay: `${i * 40}ms`,
                        }}
                      />
                    );
                  })}
                </div>
                <div className="text-[10px] text-stone-500 mt-2.5 max-h-0 overflow-hidden group-hover:max-h-10 transition-all duration-300 leading-relaxed">
                  Round-trip relay hops — every hop adds latency and distortion
                </div>
              </div>
            </div>

            {/* Card 3: Flatness Index */}
            <div className="group flex flex-col justify-between text-left py-5 px-5 bg-stone-50 border border-stone-200 rounded-xl hover:shadow-lg hover:shadow-stone-200/50 hover:bg-white transition-all duration-300 cursor-default h-[180px]">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-stone-400 mb-3">
                  Flatness Index
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter text-stone-900">
                    {flatM.flatnessIndex.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-stone-300 font-bold uppercase tracking-wider">vs</div>
                  <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter" style={{ color: '#B84515' }}>
                    {deepM.flatnessIndex.toFixed(2)}
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-stone-500 mb-3">
                  <span>{flat.name} · {flat.levels} level</span>
                  <span>{deep.name} · {deep.levels} levels</span>
                </div>
              </div>
              <div>
                {/* Two shape silhouettes */}
                <div className="flex items-end justify-between h-5 opacity-30 group-hover:opacity-100 transition-opacity duration-300">
                  <svg viewBox="0 0 40 20" className="h-5 w-12">
                    <polygon points="2,18 20,4 38,18" fill="none" stroke="#1C1917" strokeWidth="1.5" />
                  </svg>
                  <svg viewBox="0 0 20 30" className="h-5 w-6">
                    <polygon points="2,28 10,2 18,28" fill="none" stroke="#B84515" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="text-[10px] text-stone-500 mt-2.5 max-h-0 overflow-hidden group-hover:max-h-10 transition-all duration-300 leading-relaxed">
                  Higher is flatter — span of control divided by depth
                </div>
              </div>
            </div>
          </div>

        </FadeIn>
      </section>

      {/* ─── THE PROBLEM (merged Problem + Math) ─── */}
      <section id="problem" className="py-16 md:py-24 px-6 md:px-12 bg-stone-50">
        <FadeIn className="max-w-5xl mx-auto">
          <div className={`${SECTION_LABEL} mb-3`}>The Problem</div>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight mb-6">
            Relays Destroy Signal
          </h2>
          <div className="text-sm text-stone-700 leading-relaxed space-y-4 mb-8">
            <p>
              In 1932, Frederic Bartlett published <em>Remembering</em>, a landmark study that
              revealed how information degrades when passed sequentially between people. He asked
              participants to read a short story — <em>The War of the Ghosts</em> — and reproduce it
              from memory. The reproduced version was then passed to another participant, who read
              and reproduced it in turn. This continued through a chain of 6-10 participants.
            </p>
            <p>
              The results were striking: content shrank 40-50% by the 4th participant. Unfamiliar
              elements were replaced — canoes became boats, hunting seals became fishing. But the
              most important finding was the <em>contrast</em>: when the same person retold the story
              over weeks, it stabilized. It was the <strong>handoff between people</strong> — the
              relay — that destroyed signal.
            </p>
            <p>
              If each management layer retains roughly 80-85% of the information it receives, we
              can model cumulative fidelity loss mathematically. At 82% per-layer retention, a
              9-level organization retains only <strong>17% of the original signal</strong> by the
              time information reaches the CEO. Leaders in deep hierarchies are making strategic
              decisions based on <em>systematically degraded</em> information.
            </p>
          </div>

          <InteractiveFidelityDemo />
        </FadeIn>
      </section>

      {/* ─── THE PROOF (Company data — moved up from section 6) ─── */}
      <section id="proof" className="py-16 md:py-24 px-6 md:px-12">
        <FadeIn className="max-w-5xl mx-auto">
          <div className={`${SECTION_LABEL} mb-3`}>The Proof</div>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight mb-2">
            Real Companies, Real Structures
          </h2>
          <p className="text-sm text-stone-500 mb-8 max-w-2xl">
            Here's what compound signal decay looks like across 6 real companies — from Valve's
            zero-relay flat structure to Amazon's 9-level hierarchy.
          </p>
          <ComparisonView />
        </FadeIn>
      </section>

      {/* ─── THE SHAPE (streamlined geometry) ─── */}
      <ShapeSection />

      {/* ─── THE EVIDENCE ─── */}
      <section id="evidence" className="py-16 md:py-24 px-6 md:px-12">
        <FadeIn className="max-w-5xl mx-auto">
          <div className={`${SECTION_LABEL} mb-3`}>The Evidence</div>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight mb-6">
            Three Disciplines, One Conclusion
          </h2>

          <div className="text-sm text-stone-700 leading-relaxed space-y-4 mb-8">
            <p>
              Toyota's leaders understood — decades before organizational theory formalized it —
              that reports traveling up a hierarchy cannot substitute for direct observation. The
              Gemba Walk is, in engineering terms, a{' '}
              <strong>bypass circuit around the lossy relay chain</strong>. Instead of waiting for
              information to percolate up through layers of management, leaders physically go to
              where value is created and observe directly.
            </p>
            <p>
              <strong>The meta-insight:</strong> if hierarchical communication were lossless, the
              Gemba Walk would be unnecessary. Its very existence is an admission that tall
              structures degrade information.
            </p>
          </div>

          <div className="mb-8">
            <GembaComparison />
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
            <div className="text-sm font-extrabold text-stone-900 mb-1">
              Deming's Quality Framework & the Gemba Walk
            </div>
            <div className="text-[11px] text-stone-500 mb-4">
              Supporting evidence from W. Edwards Deming (1982) and the Toyota Production System
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="bg-white rounded-lg p-3.5 border border-stone-200">
                <div className="text-[11px] font-bold text-stone-900 uppercase mb-2.5">
                  Deming's Points That Map to Shape Theory
                </div>
                <div className="text-xs text-stone-700 leading-relaxed space-y-1.5">
                  <div>
                    <span className="text-stone-900 font-bold">Point 8:</span>{' '}
                    <strong>Drive out fear</strong> — Fear increases at each hierarchical layer.
                    Subordinates filter information upward to avoid blame.
                  </div>
                  <div>
                    <span className="text-stone-900 font-bold">Point 9:</span>{' '}
                    <strong>Break down barriers</strong> — Hierarchical silos force lateral
                    communication to route vertically, multiplying relay hops.
                  </div>
                  <div>
                    <span className="text-stone-900 font-bold">Point 11:</span>{' '}
                    <strong>Eliminate management by numbers</strong> — Aggregated KPIs climbing a
                    tall hierarchy are lossy summaries.
                  </div>
                  <div>
                    <span className="text-stone-900 font-bold">Point 12:</span>{' '}
                    <strong>Remove barriers to pride</strong> — Deep hierarchies distance
                    decision-makers from the people who understand the work.
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3.5 border border-stone-200">
                <div className="text-[11px] font-bold text-stone-900 uppercase mb-2.5">
                  The Gemba Walk as Bypass Circuit
                </div>
                <div className="text-xs text-stone-700 leading-relaxed space-y-1.5">
                  <div>
                    <span className="text-stone-900 font-bold">Go See</span> — Direct observation
                    bypasses every relay. Fidelity = 100%.
                  </div>
                  <div>
                    <span className="text-stone-900 font-bold">Ask Why</span> — First-person
                    inquiry avoids the editorial filtering each layer adds.
                  </div>
                  <div>
                    <span className="text-stone-900 font-bold">Show Respect</span> — Eliminates
                    fear (Deming Point 8) that causes subordinates to distort upward communication.
                  </div>
                  <div className="mt-2.5 p-2 bg-stone-100 rounded text-[11px] text-stone-700">
                    <strong className="text-stone-900">Key insight:</strong> In a flat org, the
                    Gemba Walk is short or unnecessary — leadership is already close to the work.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3.5 border border-stone-200">
              <div className="text-[11px] font-bold text-stone-900 uppercase mb-2.5">
                Unified Model — Bartlett + Deming + Shape Theory
              </div>
              <div className="font-mono text-xs text-stone-800 leading-loose space-y-0.5">
                <div>
                  <span className="text-stone-400">Bartlett (1932): </span>Information degrades per
                  serial relay →{' '}
                  <span className="text-stone-900 font-bold">fidelity loss is structural</span>
                </div>
                <div>
                  <span className="text-stone-400">Deming (1982):{'  '}</span>Every layer adds
                  variation + fear →{' '}
                  <span className="text-stone-900 font-bold">quality degrades with hierarchy depth</span>
                </div>
                <div>
                  <span className="text-stone-400">Toyota (1950s): </span>Gemba Walk invented to
                  bypass hierarchy →{' '}
                  <span className="text-stone-900 font-bold">hierarchy acknowledged as problem</span>
                </div>
                <div>
                  <span className="text-stone-400">Shape Theory:{'   '}</span>Flatness Index
                  predicts fidelity + productivity →{' '}
                  <span className="text-stone-900 font-bold">testable hypothesis</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ─── MODEL YOUR ORG (merged Calculator + Depth Tax) ─── */}
      <section id="model" className="py-16 md:py-24 px-6 md:px-12 bg-stone-50">
        <FadeIn className="max-w-5xl mx-auto">
          <div className={`${SECTION_LABEL} mb-3`}>Model Your Org</div>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight mb-2">
            See Your Organization's Shape
          </h2>
          <p className="text-sm text-stone-500 mb-8">
            Adjust levels, headcount, and fidelity rate to see how depth affects signal quality,
            decision speed, and organizational agility.
          </p>
          <ModelYourOrg />
        </FadeIn>
      </section>

      {/* ─── METHODOLOGY ─── */}
      <section id="methodology" className="py-16 md:py-24 px-6 md:px-12">
        <FadeIn className="max-w-5xl mx-auto">
          <div className={`${SECTION_LABEL} mb-3`}>Methodology</div>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight mb-2">
            How We Calculate
          </h2>
          <p className="text-sm text-stone-500 mb-8">
            Data sources, formula derivations, assumptions, and limitations
          </p>
          <MethodologySection />
        </FadeIn>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-stone-200 py-10 px-6 md:px-12 relative z-10 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-sm text-stone-500 mb-3">
            <strong className="text-stone-700">Shape Matters</strong> is an open-source research tool
            exploring how organizational depth degrades information fidelity. Built on Bartlett's
            serial reproduction research (1932), Deming's quality framework, and Toyota's Gemba Walk
            methodology.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-stone-400">
            <span>MIT License</span>
            <span>·</span>
            <a
              href="https://github.com/mattbayne83/shape-matters"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-stone-700 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
            <span>·</span>
            <a
              href="https://github.com/mattbayne83/shape-matters/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-stone-700 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Discussions
            </a>
            <span>·</span>
            <a
              href="https://github.com/mattbayne83/shape-matters/issues/new?template=company-suggestion.yml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-stone-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Suggest a Company
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
