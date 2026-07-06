import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { GeometricHero } from '../ui/GeometricHero';
import { FadeIn } from '../ui/FadeIn';
import { useCompanyStore } from '../../store/useCompanyStore';
import { REFERENCE_COMPANIES } from '../../data/referenceCompanies';
import { calcOrgMetrics } from '../../lib/orgMetrics';

export function HeroSection() {
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);

  // Look up by id rather than position — the dataset now includes historical
  // snapshots (e.g. Ford pre-Mulally, L=11) that are deeper than Amazon but
  // aren't current-era comparison points. Hero compares flattest current org
  // to the deepest current-era tech giant.
  const flat = REFERENCE_COMPANIES.find((c) => c.id === 'valve')!;
  const deep = REFERENCE_COMPANIES.find((c) => c.id === 'amazon')!;

  const flatM = useMemo(
    () => calcOrgMetrics(flat.levels, flat.employees, fidelityRate),
    [flat.levels, flat.employees, fidelityRate]
  );
  const deepM = useMemo(
    () => calcOrgMetrics(deep.levels, deep.employees, fidelityRate),
    [deep.levels, deep.employees, fidelityRate]
  );

  return (
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

        <p className="text-base md:text-lg text-stone-500 max-w-2xl mx-auto mb-4 leading-relaxed font-medium">
          Your org chart is an information system. Most were never engineered as one.
        </p>
        <p className="text-2xl md:text-3xl font-serif text-stone-900 max-w-3xl mx-auto mb-10 leading-snug tracking-tight">
          <span className="font-bold">Shape, not talent,</span> sets the ceiling on what your
          leaders can know and how fast they can act.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="#model"
            className="px-8 py-3.5 bg-ember text-white font-medium rounded-lg hover:bg-ember-deep hover:shadow-xl hover:shadow-ember/20 active:scale-95 transition-all text-sm w-full sm:w-auto"
          >
            Measure Your Ceiling
          </a>
          <a
            href="#simulate"
            className="px-8 py-3.5 bg-white text-stone-700 font-medium border border-stone-300 rounded-lg hover:bg-stone-50 hover:border-stone-400 hover:text-stone-900 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
          >
            Read the Argument
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {/* Card 1: Fidelity */}
          <div className="group flex flex-col justify-between text-left py-5 px-5 bg-stone-50 border border-stone-200 rounded-xl hover:shadow-lg hover:shadow-stone-200/50 hover:bg-white transition-all duration-300 cursor-default h-[200px]">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-stone-400 mb-3">
                Fidelity · What Survives
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-3xl md:text-4xl font-bold font-mono tracking-tight tabular-nums text-stone-900">
                  {flatM.fidelityAtTopPct.toFixed(0)}%
                </div>
                <div className="text-[10px] text-stone-300 font-bold uppercase tracking-wider">vs</div>
                <div className="text-3xl md:text-4xl font-bold font-mono tracking-tight tabular-nums" style={{ color: '#B84515' }}>
                  {deepM.fidelityAtTopPct.toFixed(1)}%
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-stone-500 mb-3">
                <span>{flat.name} · {flat.levels} deep</span>
                <span>{deep.name} · {deep.levels} deep</span>
              </div>
            </div>
            <div>
              <div className="h-1.5 rounded-full opacity-30 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, #1C1917, #B84515)' }} />
              <div className="text-[10px] text-stone-500 mt-2.5 max-h-0 overflow-hidden group-hover:max-h-10 transition-all duration-300 leading-relaxed">
                Each relay retains {fidelityRate}% — loss compounds across every layer
              </div>
            </div>
          </div>

          {/* Card 2: Decision Speed */}
          <div className="group flex flex-col justify-between text-left py-5 px-5 bg-stone-50 border border-stone-200 rounded-xl hover:shadow-lg hover:shadow-stone-200/50 hover:bg-white transition-all duration-300 cursor-default h-[200px]">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-stone-400 mb-3">
                Decision Speed · How Fast It Moves
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-3xl md:text-4xl font-bold font-mono tracking-tight tabular-nums text-stone-900">
                  {flatM.roundTripLayers}
                </div>
                <div className="text-[10px] text-stone-300 font-bold uppercase tracking-wider">vs</div>
                <div className="text-3xl md:text-4xl font-bold font-mono tracking-tight tabular-nums" style={{ color: '#B84515' }}>
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
          <div className="group flex flex-col justify-between text-left py-5 px-5 bg-stone-50 border border-stone-200 rounded-xl hover:shadow-lg hover:shadow-stone-200/50 hover:bg-white transition-all duration-300 cursor-default h-[200px]">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-stone-400 mb-3">
                Flatness Index · The Shape Behind Both
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-3xl md:text-4xl font-bold font-mono tracking-tight tabular-nums text-stone-900">
                  {flatM.flatnessIndex.toFixed(1)}
                </div>
                <div className="text-[10px] text-stone-300 font-bold uppercase tracking-wider">vs</div>
                <div className="text-3xl md:text-4xl font-bold font-mono tracking-tight tabular-nums" style={{ color: '#B84515' }}>
                  {deepM.flatnessIndex.toFixed(2)}
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-stone-500 mb-3">
                <span>{flat.name} · {flat.levels} deep</span>
                <span>{deep.name} · {deep.levels} deep</span>
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
  );
}
