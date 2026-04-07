import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanyStore } from '../../store/useCompanyStore';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { calcDepthTax } from '../../lib/depthTax';
import { calcTriangleGeometry, calcRestructuringImpact } from '../../lib/triangleGeometry';
import { fidelityColor, metricColor } from '../../lib/fidelityColor';
import { InputStrip } from './InputStrip';
import { MetricCard } from './MetricCard';
import { FlippableMetricCard } from './FlippableMetricCard';
import { PillarDashboard } from './PillarDashboard';

export function ModelYourOrg() {
  const levels = useCompanyStore((s) => s.levels);
  const headcount = useCompanyStore((s) => s.headcount);
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);
  const [moreMetricsOpen, setMoreMetricsOpen] = useState(false);

  const tax = useMemo(() => calcDepthTax(levels, headcount, fidelityRate), [levels, headcount, fidelityRate]);
  const m = useMemo(() => calcOrgMetrics(levels, headcount, fidelityRate), [levels, headcount, fidelityRate]);
  const geo = useMemo(() => calcTriangleGeometry(levels, headcount, fidelityRate), [levels, headcount, fidelityRate]);
  const restructure = useMemo(() => calcRestructuringImpact(levels, headcount, fidelityRate), [levels, headcount, fidelityRate]);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Input Strip ── */}
      <InputStrip />

      {/* ── Pillar Dashboard (70/30 radar + cards) ── */}
      <PillarDashboard />

      {/* ── What-If / Restructuring Impact ── */}
      {restructure && (
        <div className="bg-orange-50/80 backdrop-blur-md border-2 rounded-xl p-4 relative overflow-hidden animate-what-if-border transition-colors duration-700">
          <div
            className="absolute -inset-[100%] animate-slide-glow pointer-events-none opacity-100"
            style={{
              background: 'radial-gradient(circle at center, rgba(224, 90, 27, 0.25) 0%, rgba(224, 90, 27, 0.1) 25%, transparent 50%)',
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wide bg-stone-100/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-stone-200/50">What if</span>
              <span className="text-[11px] text-stone-600 font-medium">
                You removed a level ({restructure.currentLevels} → {restructure.proposedLevels}) with the same {headcount.toLocaleString()} employees
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-lg px-3 py-2.5 text-center">
                <div className="text-[10px] text-stone-500 uppercase font-semibold mb-1">Pivot Speed</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900 drop-shadow-sm">
                  +{(restructure.agilityDelta * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-stone-400 font-medium">faster pivots</div>
              </div>
              <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-lg px-3 py-2.5 text-center">
                <div className="text-[10px] text-stone-500 uppercase font-semibold mb-1">Inertia</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900 drop-shadow-sm">
                  -{restructure.inertiaReduction.toFixed(0)}%
                </div>
                <div className="text-[10px] text-stone-400 font-medium">less rigidity</div>
              </div>
              <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-lg px-3 py-2.5 text-center">
                <div className="text-[10px] text-stone-500 uppercase font-semibold mb-1">Mgmt Tax</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900 drop-shadow-sm">
                  {restructure.managerRatioDelta < 0 ? '' : '+'}{restructure.managerRatioDelta.toFixed(1)}
                </div>
                <div className="text-[10px] text-stone-400 font-medium">{restructure.managerRatioDelta < 0 ? 'percentage points · leaner' : 'percentage points · more overhead'}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-lg px-3 py-2.5 text-center">
                <div className="text-[10px] text-stone-500 uppercase font-semibold mb-1">Signal Fidelity</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-stone-900 drop-shadow-sm">
                  +{restructure.fidelityGain.toFixed(1)}
                </div>
                <div className="text-[10px] text-stone-400 font-medium">percentage points · better signal</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── More Metrics Disclosure ── */}
      <div>
        <button
          onClick={() => setMoreMetricsOpen(!moreMetricsOpen)}
          className="w-full cursor-pointer flex items-center justify-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors py-2"
        >
          <span>More metrics</span>
          <svg
            className={`w-3 h-3 transition-transform duration-300 ${moreMetricsOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {moreMetricsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-4 pt-3 pb-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  <FlippableMetricCard
                    label="Signal Fidelity"
                    value={`${tax.signalFidelity.toFixed(1)}%`}
                    sub="one-way to top"
                    color={fidelityColor(tax.signalFidelity, true)}
                    infoHref="#methodology-signal-fidelity"
                    minOut={0} maxOut={100} currentOut={tax.signalFidelity}
                    inverseBest={false} bestLabel="Preserved" worstLabel="Distorted"
                  />
                  <FlippableMetricCard
                    label="Decision Quality"
                    value={`${(tax.decisionQuality * 100).toFixed(1)}%`}
                    sub="compound fidelity × latency"
                    color={metricColor(tax.decisionQuality)}
                    infoHref="#methodology-decision-quality"
                    minOut={0} maxOut={100} currentOut={tax.decisionQuality * 100}
                    inverseBest={false} bestLabel="High quality" worstLabel="Degraded"
                  />
                  <FlippableMetricCard
                    label="Pivot Speed"
                    value={geo.agilityScore.toFixed(2)}
                    sub={geo.agilityScore > 0.5 ? 'Strong reach — directives land' : geo.agilityScore > 0.25 ? 'Moderate reach — signal fades' : 'Weak reach — directives lost'}
                    color={metricColor(geo.agilityScore)}
                    infoHref="#methodology-pivot-speed"
                    minOut={0} maxOut={1} currentOut={geo.agilityScore}
                    inverseBest={false} bestLabel="Agile" worstLabel="Rigid"
                  />
                  <FlippableMetricCard
                    label="Decision Latency"
                    value={tax.decisionLatency}
                    unit=" days"
                    sub={`${Math.round(tax.decisionsPerMonth).toLocaleString()} decisions/month`}
                    color={metricColor(1 - Math.min((tax.decisionLatency - 3) / 42, 1))}
                    infoHref="#methodology-decision-latency"
                    minOut={0} maxOut={60} currentOut={tax.decisionLatency}
                    inverseBest={true} bestLabel="Instant" worstLabel="Delayed"
                  />
                  <FlippableMetricCard
                    label="Management Tax"
                    value={`${m.managerRatio.toFixed(1)}%`}
                    sub={m.managerRatio < 15 ? 'Lean — minimal overhead' : m.managerRatio < 30 ? 'Moderate levels of management' : 'Heavy — half the org manages'}
                    color={metricColor(1 - Math.min(m.managerRatio / 50, 1))}
                    infoHref="#methodology-management-tax"
                    minOut={0} maxOut={50} currentOut={m.managerRatio}
                    inverseBest={true} bestLabel="Lean" worstLabel="Top-heavy"
                  />
                  <FlippableMetricCard
                    label="Drift Cost"
                    value={`${(100 - tax.ninetyDayAccuracy).toFixed(1)}%`}
                    sub="signal drifted over 90 days"
                    color={metricColor(tax.ninetyDayAccuracy / 100)}
                    infoHref="#methodology-drift-cost"
                    minOut={0} maxOut={100} currentOut={100 - tax.ninetyDayAccuracy}
                    inverseBest={true} bestLabel="Accurate" worstLabel="Drifted"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <MetricCard label="Span of Control" value={m.avgSpan.toFixed(1)} sub="avg reports per manager" accent={metricColor(Math.min((m.avgSpan - 2) / 10, 1))} infoHref="#methodology-span-of-control" />
                  <MetricCard label="Shape Gap" value={`${(geo.totalShapeGap * 100).toFixed(1)}%`} sub="triangle vs. actual" accent={metricColor(1 - Math.min(geo.totalShapeGap / 0.3, 1))} infoHref="#methodology-shape-gap" />
                  <MetricCard label="Throughput" value={Math.round(tax.decisionsPerMonth).toLocaleString()} unit="/month" sub="at this org size" accent="#57534e" infoHref="#methodology-throughput" />
                  <MetricCard label="Flatness Index" value={m.flatnessIndex.toFixed(2)} sub="Higher = flatter" accent="#57534e" infoHref="#methodology-flatness-index" />
                  <MetricCard label="Annual Comm Loss" value={`$${(m.annualCommLoss / 1000000).toFixed(1)}`} unit="M" sub="Ineffective comms cost" accent="#E05A1B" infoHref="#methodology-annual-comm-loss" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
