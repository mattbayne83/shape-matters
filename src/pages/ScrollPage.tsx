import { useMemo } from 'react';
import { Github, ArrowRight, MessageCircle, Plus } from 'lucide-react';
import { InteractiveFidelityDemo } from '../components/model/InteractiveFidelityDemo';
import { GembaComparison } from '../components/model/GembaComparison';
import { ComparisonView } from '../components/model/ComparisonView';
import { ModelYourOrg } from '../components/model/ModelYourOrg';
import { ShapeSection } from '../components/model/ShapeSection';
import { Prose } from '../components/ui/Prose';
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-slate-100 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none" />

        <FadeIn className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-8">
            The Shape of Effectiveness
          </h2>

          <div className="mb-6 relative">
            <GeometricHero />
          </div>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Every management layer is a lossy relay. This tool models how organizational depth
            degrades information fidelity, inflates communication costs, and impacts the decisions
            that shape culture and performance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="#model"
              className="px-8 py-3.5 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 active:scale-95 transition-all text-sm w-full sm:w-auto"
            >
              Model Your Org
            </a>
            <a
              href="#problem"
              className="px-8 py-3.5 bg-white text-slate-700 font-bold border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
            >
              Read the Theory
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {/* Card 1: Signal Fidelity */}
            <div className="group text-left py-5 px-5 bg-slate-50 border border-slate-200 rounded-xl hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 hover:bg-white transition-all duration-300 cursor-default">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-3">
                Signal Fidelity
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter text-slate-900">
                  {flatM.fidelityAtTopPct.toFixed(0)}%
                </div>
                <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">vs</div>
                <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter" style={{ color: '#9B4D42' }}>
                  {deepM.fidelityAtTopPct.toFixed(1)}%
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mb-3">
                <span>{flat.name} · {flat.levels} level</span>
                <span>{deep.name} · {deep.levels} levels</span>
              </div>
              <div className="h-1.5 rounded-full opacity-30 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, #0f172a, #9B4D42)' }} />
              <div className="text-[10px] text-slate-500 mt-2.5 max-h-0 overflow-hidden group-hover:max-h-10 transition-all duration-300 leading-relaxed">
                Each relay retains {fidelityRate}% — loss compounds across every level
              </div>
            </div>

            {/* Card 2: Decision Speed */}
            <div className="group text-left py-5 px-5 bg-slate-50 border border-slate-200 rounded-xl hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 hover:bg-white transition-all duration-300 cursor-default">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-3">
                Decision Speed
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter text-slate-900">
                  {flatM.roundTripLayers}
                </div>
                <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">vs</div>
                <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter" style={{ color: '#9B4D42' }}>
                  {deepM.roundTripLayers}
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mb-3">
                <span>{flat.name} · 0 hops</span>
                <span>{deep.name} · {deepM.roundTripLayers} hops</span>
              </div>
              {/* Relay dot chain */}
              <div className="flex items-center gap-1 h-1.5">
                {Array.from({ length: deep.levels }, (_, i) => {
                  const t = i / (deep.levels - 1);
                  const r = Math.round(15 + t * (155 - 15));
                  const g = Math.round(23 + t * (77 - 23));
                  const b = Math.round(42 + t * (66 - 42));
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
              <div className="text-[10px] text-slate-500 mt-2.5 max-h-0 overflow-hidden group-hover:max-h-10 transition-all duration-300 leading-relaxed">
                Round-trip relay hops — every hop adds latency and distortion
              </div>
            </div>

            {/* Card 3: Flatness Index */}
            <div className="group text-left py-5 px-5 bg-slate-50 border border-slate-200 rounded-xl hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 hover:bg-white transition-all duration-300 cursor-default">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-3">
                Flatness Index
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter text-slate-900">
                  {flatM.flatnessIndex.toFixed(1)}
                </div>
                <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">vs</div>
                <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter" style={{ color: '#9B4D42' }}>
                  {deepM.flatnessIndex.toFixed(2)}
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mb-3">
                <span>{flat.name} · {flat.levels} level</span>
                <span>{deep.name} · {deep.levels} levels</span>
              </div>
              {/* Two shape silhouettes */}
              <div className="flex items-end justify-between h-5 opacity-30 group-hover:opacity-100 transition-opacity duration-300">
                <svg viewBox="0 0 40 20" className="h-5 w-12">
                  <polygon points="2,18 20,4 38,18" fill="none" stroke="#0f172a" strokeWidth="1.5" />
                </svg>
                <svg viewBox="0 0 20 30" className="h-5 w-6">
                  <polygon points="2,28 10,2 18,28" fill="none" stroke="#9B4D42" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="text-[10px] text-slate-500 mt-2.5 max-h-0 overflow-hidden group-hover:max-h-10 transition-all duration-300 leading-relaxed">
                Higher is flatter — span of control divided by depth
              </div>
            </div>
          </div>

        </FadeIn>
      </section>

      {/* ─── THE PROBLEM (merged Problem + Math) ─── */}
      <section id="problem" className="py-16 md:py-24 px-6 md:px-12 bg-slate-50">
        <FadeIn className="max-w-5xl mx-auto">
          <div className={`${SECTION_LABEL} mb-3`}>The Problem</div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">
            Relays Destroy Signal
          </h2>
          <div className="text-sm text-slate-700 leading-relaxed space-y-4 mb-8">
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
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
            Real Companies, Real Structures
          </h2>
          <p className="text-sm text-slate-500 mb-8 max-w-2xl">
            Here's what compound signal decay looks like across 6 real companies — from Valve's
            zero-relay flat structure to Amazon's 9-level hierarchy.
          </p>
          <ComparisonView />
        </FadeIn>
      </section>

      {/* ─── THE SHAPE (streamlined geometry) ─── */}
      <ShapeSection fidelityRate={fidelityRate} />

      {/* ─── THE EVIDENCE ─── */}
      <section id="evidence" className="py-16 md:py-24 px-6 md:px-12">
        <FadeIn className="max-w-5xl mx-auto">
          <div className={`${SECTION_LABEL} mb-3`}>The Evidence</div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">
            Three Disciplines, One Conclusion
          </h2>

          <div className="text-sm text-slate-700 leading-relaxed space-y-4 mb-8">
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

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="text-sm font-extrabold text-slate-900 mb-1">
              Deming's Quality Framework & the Gemba Walk
            </div>
            <div className="text-[11px] text-slate-500 mb-4">
              Supporting evidence from W. Edwards Deming (1982) and the Toyota Production System
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="bg-white rounded-lg p-3.5 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-900 uppercase mb-2.5">
                  Deming's Points That Map to Shape Theory
                </div>
                <div className="text-xs text-slate-700 leading-relaxed space-y-1.5">
                  <div>
                    <span className="text-slate-900 font-bold">Point 8:</span>{' '}
                    <strong>Drive out fear</strong> — Fear increases at each hierarchical layer.
                    Subordinates filter information upward to avoid blame.
                  </div>
                  <div>
                    <span className="text-slate-900 font-bold">Point 9:</span>{' '}
                    <strong>Break down barriers</strong> — Hierarchical silos force lateral
                    communication to route vertically, multiplying relay hops.
                  </div>
                  <div>
                    <span className="text-slate-900 font-bold">Point 11:</span>{' '}
                    <strong>Eliminate management by numbers</strong> — Aggregated KPIs climbing a
                    tall hierarchy are lossy summaries.
                  </div>
                  <div>
                    <span className="text-slate-900 font-bold">Point 12:</span>{' '}
                    <strong>Remove barriers to pride</strong> — Deep hierarchies distance
                    decision-makers from the people who understand the work.
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3.5 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-900 uppercase mb-2.5">
                  The Gemba Walk as Bypass Circuit
                </div>
                <div className="text-xs text-slate-700 leading-relaxed space-y-1.5">
                  <div>
                    <span className="text-slate-900 font-bold">Go See</span> — Direct observation
                    bypasses every relay. Fidelity = 100%.
                  </div>
                  <div>
                    <span className="text-slate-900 font-bold">Ask Why</span> — First-person
                    inquiry avoids the editorial filtering each layer adds.
                  </div>
                  <div>
                    <span className="text-slate-900 font-bold">Show Respect</span> — Eliminates
                    fear (Deming Point 8) that causes subordinates to distort upward communication.
                  </div>
                  <div className="mt-2.5 p-2 bg-slate-100 rounded text-[11px] text-slate-700">
                    <strong className="text-slate-900">Key insight:</strong> In a flat org, the
                    Gemba Walk is short or unnecessary — leadership is already close to the work.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3.5 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-900 uppercase mb-2.5">
                Unified Model — Bartlett + Deming + Shape Theory
              </div>
              <div className="font-mono text-xs text-slate-800 leading-loose space-y-0.5">
                <div>
                  <span className="text-slate-400">Bartlett (1932): </span>Information degrades per
                  serial relay →{' '}
                  <span className="text-slate-900 font-bold">fidelity loss is structural</span>
                </div>
                <div>
                  <span className="text-slate-400">Deming (1982):{'  '}</span>Every layer adds
                  variation + fear →{' '}
                  <span className="text-slate-900 font-bold">quality degrades with hierarchy depth</span>
                </div>
                <div>
                  <span className="text-slate-400">Toyota (1950s): </span>Gemba Walk invented to
                  bypass hierarchy →{' '}
                  <span className="text-slate-900 font-bold">hierarchy acknowledged as problem</span>
                </div>
                <div>
                  <span className="text-slate-400">Shape Theory:{'   '}</span>Flatness Index
                  predicts fidelity + productivity →{' '}
                  <span className="text-slate-900 font-bold">testable hypothesis</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ─── MODEL YOUR ORG (merged Calculator + Depth Tax) ─── */}
      <section id="model" className="py-16 md:py-24 px-6 md:px-12 bg-slate-50">
        <FadeIn className="max-w-5xl mx-auto">
          <div className={`${SECTION_LABEL} mb-3`}>Model Your Org</div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
            See Your Organization's Shape
          </h2>
          <p className="text-sm text-slate-500 mb-8 max-w-2xl">
            Adjust levels, headcount, and fidelity rate to see how depth affects signal quality,
            decision speed, and organizational agility.
          </p>
          <ModelYourOrg />
        </FadeIn>
      </section>

      {/* ─── METHODOLOGY ─── */}
      <section id="methodology" className="py-16 md:py-24 px-6 md:px-12 bg-slate-50">
        <FadeIn className="max-w-5xl mx-auto">
          <details className="group">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-4 group-open:rounded-b-none group-open:border-b-0">
                <div>
                  <div className={`${SECTION_LABEL} mb-1`}>Methodology</div>
                  <div className="text-sm text-slate-500">
                    Data sources, formula derivations, assumptions, and limitations
                  </div>
                </div>
                <div className="text-slate-400 text-xs font-semibold group-open:hidden">
                  Show ▾
                </div>
                <div className="text-slate-400 text-xs font-semibold hidden group-open:block">
                  Hide ▴
                </div>
              </div>
            </summary>
            <div className="bg-white border border-slate-200 border-t-0 rounded-b-xl px-5 pb-5">
              <Prose>
                <h3>Core Formulas</h3>
                <p>
                  The model uses a small set of formulas derived from information theory and
                  organizational research to quantify the structural properties of hierarchies.
                </p>
              </Prose>

              <div className="my-6 bg-white border border-slate-200 rounded-xl p-5">
                <div className="font-mono text-sm text-slate-800 leading-loose space-y-1">
                  <div>
                    <span className="text-slate-400">Signal Fidelity (up){'   '}</span> = r
                    <sup>(L-1)</sup>{' '}
                    <span className="text-slate-400 text-xs">
                      where r = per-layer retention, L = levels
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Round-trip Fidelity{'    '}</span> = r
                    <sup>2(L-1)</sup>
                  </div>
                  <div>
                    <span className="text-slate-400">Avg Span of Control{'   '}</span> = N
                    <sup>1/L</sup>{' '}
                    <span className="text-slate-400 text-xs">where N = total employees</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Flatness Index{'         '}</span> = Span / L{' '}
                    <span className="text-slate-400 text-xs">— higher is flatter</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Decision Latency{'       '}</span> = 2(L-1) x
                    t<sub>relay</sub>
                  </div>
                  <div>
                    <span className="text-slate-400">Manager Estimate{'       '}</span> = Sum(N /
                    Span<sup>k</sup>){' '}
                    <span className="text-slate-400 text-xs">for k = 1..L-1</span>
                  </div>
                </div>
              </div>

              <Prose>
                <h3>Triangle Geometry Formulas</h3>
                <p>
                  The triangle geometry model maps organizational properties to geometric analogs,
                  revealing structural constraints and hidden costs.
                </p>
              </Prose>

              <div className="my-6 bg-white border border-slate-200 rounded-xl p-5">
                <div className="font-mono text-sm text-slate-800 leading-loose space-y-1">
                  <div>
                    <span className="text-slate-400">Area (constraint){'      '}</span> = ½ × base × height{' '}
                    <span className="text-slate-400 text-xs">where base = avg span, height = levels</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Slope Angle{'            '}</span> = arctan(2L / span){' '}
                    <span className="text-slate-400 text-xs">in degrees — steep = narrow span</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Slant Height{'           '}</span> = sqrt(L<sup>2</sup> + (span/2)<sup>2</sup>){' '}
                    <span className="text-slate-400 text-xs">longest communication path</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Shape Gap{'              '}</span> = Sum|w<sub>ideal</sub> - w<sub>actual</sub>| / 2N{' '}
                    <span className="text-slate-400 text-xs">normalized 0-1</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Decision Gravity{'       '}</span> = Sum(k·n<sub>k</sub>) / (L·N){' '}
                    <span className="text-slate-400 text-xs">centroid ratio, lower = decentralized</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Moment of Inertia{'      '}</span> = Sum(n<sub>k</sub>·(k - centroid)<sup>2</sup>){' '}
                    <span className="text-slate-400 text-xs">organizational rigidity proxy</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Pivot Speed (Torque){'   '}</span> = (1/N) × Sum(n<sub>k</sub> × r<sup>|L-1-k|</sup>){' '}
                    <span className="text-slate-400 text-xs">CEO's fidelity-weighted reach across all layers</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Layer Inertia{'          '}</span> = n<sub>k</sub> × (k - centroid)<sup>2</sup>{' '}
                    <span className="text-slate-400 text-xs">per-layer rigidity contribution</span>
                  </div>
                </div>
              </div>

              <Prose>
                <h3>Shape Classification</h3>
                <p>
                  Organizations are classified into four shape archetypes based on their slope angle and shape gap:
                </p>
              </Prose>

              <div className="my-6 bg-white border border-slate-200 rounded-xl p-5">
                <div className="font-mono text-sm text-slate-800 leading-loose space-y-1">
                  <div>
                    <span className="text-slate-400">Mesa{'                   '}</span> slope &lt; 30° or levels ≤ 2{' '}
                    <span className="text-slate-400 text-xs">— flat and wide, minimal hierarchy</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Pyramid{'                '}</span> slope 30-55°, gap &lt; 8%{' '}
                    <span className="text-slate-400 text-xs">— balanced, closest to idealized triangle</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Diamond{'                '}</span> gap &gt; 8%, slope &gt; 40°{' '}
                    <span className="text-slate-400 text-xs">— bloated middle layers, hidden costs</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Obelisk{'                '}</span> slope &gt; 55°{' '}
                    <span className="text-slate-400 text-xs">— steep and deep, narrow span of control</span>
                  </div>
                </div>
              </div>

              <Prose>
                <h3>Key Assumptions</h3>
                <ul>
                  <li>
                    <strong>Per-layer fidelity rate (default 82%)</strong> — Based on serial
                    reproduction research. Empirical estimates from Bartlett (1932) and replications
                    (Roediger et al., 2014) suggest 70-90% per relay depending on message complexity.
                    The rate is user-adjustable.
                  </li>
                  <li>
                    <strong>Uniform span assumption</strong> — The model uses N<sup>1/L</sup> to
                    estimate average span of control, assuming a roughly uniform distribution. Real
                    organizations have variable spans across levels.
                  </li>
                  <li>
                    <strong>Communication loss ($10,140/employee/year)</strong> — From Axios HQ 2025
                    State of Internal Communications report.
                  </li>
                  <li>
                    <strong>Triangle model assumes symmetric narrowing</strong> — Equal span at all
                    layers. Real organizations have variable spans. The Shape Gap metric quantifies
                    structural deviation from this idealized linear hierarchy.
                  </li>
                </ul>

                <h3>Data Sources</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Used For</th>
                      <th>Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Bartlett, F.C.</td>
                      <td>Serial reproduction theory, fidelity degradation model</td>
                      <td>1932</td>
                    </tr>
                    <tr>
                      <td>Roediger et al.</td>
                      <td>Modern replication of serial reproduction effects</td>
                      <td>2014</td>
                    </tr>
                    <tr>
                      <td>Deming, W.E.</td>
                      <td>Quality framework, variation theory, 14 points</td>
                      <td>1982</td>
                    </tr>
                    <tr>
                      <td>Ohno, Taiichi</td>
                      <td>Toyota Production System, Gemba Walk methodology</td>
                      <td>1950s-1988</td>
                    </tr>
                    <tr>
                      <td>Axios HQ</td>
                      <td>Annual communication loss estimate ($10,140/employee)</td>
                      <td>2025</td>
                    </tr>
                    <tr>
                      <td>SEC 10-K filings</td>
                      <td>Company employee counts and organizational data</td>
                      <td>2024</td>
                    </tr>
                    <tr>
                      <td>Microsoft Research</td>
                      <td>Organizational communication network studies</td>
                      <td>2024</td>
                    </tr>
                  </tbody>
                </table>

                <h3>Limitations</h3>
                <ul>
                  <li>
                    <strong>Organizational levels are often ambiguous</strong> — Different counting
                    methods produce different numbers. The model uses "levels from CEO to frontline IC."
                  </li>
                  <li>
                    <strong>The model assumes serial communication</strong> — Real organizations use
                    parallel, skip-level, and informal channels that may partially compensate for
                    hierarchical fidelity loss.
                  </li>
                </ul>
              </Prose>
            </div>
          </details>
        </FadeIn>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-200 py-10 px-6 md:px-12 relative z-10 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-sm text-slate-500 mb-3">
            <strong className="text-slate-700">Shape Matters</strong> is an open-source research tool
            exploring how organizational depth degrades information fidelity. Built on Bartlett's
            serial reproduction research (1932), Deming's quality framework, and Toyota's Gemba Walk
            methodology.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <span>MIT License</span>
            <span>·</span>
            <a
              href="https://github.com/mattbayne/shape-matters"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-slate-600 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
            <span>·</span>
            <a
              href="https://github.com/mattbayne/shape-matters/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-slate-600 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Discussions
            </a>
            <span>·</span>
            <a
              href="https://github.com/mattbayne/shape-matters/issues/new?template=company-suggestion.yml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-slate-600 transition-colors"
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
