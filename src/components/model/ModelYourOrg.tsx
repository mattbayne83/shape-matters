import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'lucide-react';
import { useCompanyStore, buildShareUrl } from '../../store/useCompanyStore';
import { calcDepthTax } from '../../lib/depthTax';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { calcTriangleGeometry, calcRestructuringImpact } from '../../lib/triangleGeometry';
import { fidelityColor, metricColor } from '../../lib/fidelityColor';
import { MetricCard } from './MetricCard';
import { SignalCascade } from './SignalCascade';
import { FlippableMetricCard } from './FlippableMetricCard';
import { REFERENCE_COMPANIES } from '../../data/referenceCompanies';
import { SensitivitySweep } from './SensitivitySweep';

const LOG_MIN = Math.log(50);
const LOG_MAX = Math.log(500_000);

function sliderToHeadcount(pos: number): number {
  return Math.round(Math.exp(LOG_MIN + (pos / 100) * (LOG_MAX - LOG_MIN)));
}

function headcountToSlider(n: number): number {
  return ((Math.log(n) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100;
}



export function ModelYourOrg() {
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);
  const setFidelityRate = useCompanyStore((s) => s.setFidelityRate);
  const levels = useCompanyStore((s) => s.levels);
  const storeLevels = useCompanyStore((s) => s.setLevels);
  const headcount = useCompanyStore((s) => s.headcount);
  const storeHeadcount = useCompanyStore((s) => s.setHeadcount);
  const [hcSlider, setHcSlider] = useState(() => Math.round(headcountToSlider(headcount)));
  const [preset, setPreset] = useState('custom');
  const [copied, setCopied] = useState(false);

  // Sync slider position when headcount changes externally (URL hydration, persist rehydration)
  useEffect(() => {
    setHcSlider(Math.round(headcountToSlider(headcount)));
  }, [headcount]);

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(buildShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handlePresetChange = (id: string) => {
    setPreset(id);
    if (id === 'custom') return;
    const company = REFERENCE_COMPANIES.find((c) => c.id === id);
    if (!company) return;
    storeLevels(company.levels);
    const pos = Math.round(headcountToSlider(company.employees));
    setHcSlider(pos);
    storeHeadcount(sliderToHeadcount(pos));
  };

  const handleLevels = (v: number) => { setPreset('custom'); storeLevels(v); };
  const handleHeadcount = (v: number) => {
    setPreset('custom');
    setHcSlider(v);
    storeHeadcount(sliderToHeadcount(v));
  };
  const tax = useMemo(
    () => calcDepthTax(levels, headcount, fidelityRate),
    [levels, headcount, fidelityRate]
  );
  const m = useMemo(
    () => calcOrgMetrics(levels, headcount, fidelityRate),
    [levels, headcount, fidelityRate]
  );
  const geo = useMemo(
    () => calcTriangleGeometry(levels, headcount, fidelityRate),
    [levels, headcount, fidelityRate]
  );
  const restructure = useMemo(
    () => calcRestructuringImpact(levels, headcount, fidelityRate),
    [levels, headcount, fidelityRate]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[24rem_1fr] gap-4 lg:gap-x-12">
      {/* ── INPUTS (row 1 left, sticky within its grid cell) ── */}
      <div className="lg:sticky lg:top-8 lg:self-start bg-white rounded-xl p-6 border border-stone-200 shadow-sm flex flex-col gap-6">
        {/* Company Preset Dropdown */}
        <div>
          <label htmlFor="mo-preset" className="text-[11px] font-bold text-stone-700 uppercase block mb-1.5">
            Start from a Real Company
          </label>
          <select
            id="mo-preset"
            value={preset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-ember/30 cursor-pointer"
          >
            <option value="custom">Custom</option>
            {REFERENCE_COMPANIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.levels} levels, {c.employees.toLocaleString()} employees
              </option>
            ))}
          </select>
        </div>

        {/* Primary Slider: Levels */}
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-5">
          <div className="flex items-baseline justify-between mb-3 text-center md:text-left">
            <div>
              <label htmlFor="mo-levels" className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                Levels
              </label>
              <div className="text-xs text-stone-500 mt-1">Adjust depth of hierarchy</div>
            </div>
            <span className="text-2xl md:text-3xl font-black font-sans tabular-nums text-stone-900 bg-white px-3 py-1 rounded-md shadow-sm border border-stone-200">
              {levels}
            </span>
          </div>
          <input
            id="mo-levels"
            type="range"
            min={1}
            max={15}
            value={levels}
            onChange={(e) => handleLevels(+e.target.value)}
            aria-valuenow={levels}
            aria-valuemin={1}
            aria-valuemax={15}
            aria-valuetext={`${levels} levels`}
            className="w-full h-3 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-ember focus:outline-none focus:ring-2 focus:ring-ember/30"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <label htmlFor="mo-headcount" className="text-[11px] font-bold text-stone-700 uppercase">
              Organization Size
            </label>
            <span className="text-sm font-bold font-sans tabular-nums text-stone-900 border-b border-stone-200">
              {headcount.toLocaleString()}
            </span>
          </div>
          <input
            id="mo-headcount"
            type="range"
            min={0}
            max={100}
            value={hcSlider}
            onChange={(e) => handleHeadcount(+e.target.value)}
            aria-valuenow={hcSlider}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`${headcount.toLocaleString()} employees`}
            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-700"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <label htmlFor="mo-fidelity" className="text-[11px] font-bold text-stone-700 uppercase">
              Per-Layer Fidelity
            </label>
            <span className="text-sm font-bold font-sans tabular-nums text-stone-900 border-b border-stone-200">{fidelityRate}%</span>
          </div>
          <input
            id="mo-fidelity"
            type="range"
            min={50}
            max={98}
            value={fidelityRate}
            onChange={(e) => setFidelityRate(+e.target.value)}
            aria-valuenow={fidelityRate}
            aria-valuemin={50}
            aria-valuemax={98}
            aria-valuetext={`${fidelityRate}% per-layer fidelity`}
            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-700"
          />
          <div className="text-[9px] text-stone-400 mt-1">
            80-85% is a reasonable empirical midpoint based on Bartlett's research.
          </div>
        </div>

        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-1.5 w-full text-xs text-stone-500 hover:text-stone-700 border border-stone-200 hover:border-stone-300 rounded-lg py-2 transition-colors cursor-pointer"
        >
          <Link className="w-3.5 h-3.5" />
          {copied ? 'Copied!' : 'Copy shareable link'}
        </button>
      </div>

      {/* ── SENSITIVITY (row 2 left — same row as metrics, so grid aligns them) ── */}
      <SensitivitySweep levels={levels} headcount={headcount} currentFidelityRate={fidelityRate} />

      {/* ── HERO CARD (row 1 right) ── */}
      <div className="lg:col-start-2 lg:row-start-1 bg-white rounded-xl px-4 pt-4 pb-0 lg:px-6 lg:pt-6 lg:pb-0 border border-stone-200 shadow-sm flex flex-col justify-end relative overflow-hidden min-h-[320px]">
        {/* Metric moved to the top left */}
        <div className="absolute top-4 left-4 lg:top-6 lg:left-6 flex flex-col bg-stone-50 border border-stone-200 rounded-xl p-4 shadow-sm z-10 max-w-[200px]">
          <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1 flex items-center justify-between">
            Round-Trip Fidelity
          </div>
          <div className="flex items-baseline">
            <div
              className="text-4xl lg:text-5xl font-black font-mono tracking-tight transition-colors duration-300"
              style={{ color: fidelityColor(tax.roundTripFidelity, true) }}
            >
              {tax.roundTripFidelity.toFixed(1)}
            </div>
            <span
              className="text-3xl lg:text-4xl font-black font-mono transition-colors duration-300 ml-0.5"
              style={{ color: fidelityColor(tax.roundTripFidelity, true) }}>
              %
            </span>
          </div>
          <div className="text-[10px] text-stone-400 mt-1.5 leading-relaxed">
            Signal remaining after {levels - 1} relays up and {levels - 1} relays down ({(levels - 1) * 2} total).
          </div>
        </div>

        <div className="relative w-full h-full max-w-[480px] flex flex-col items-center justify-end mx-auto pb-4">
          <SignalCascade levels={levels} fidelityRate={fidelityRate} semantic />
        </div>
      </div>

      {/* ── METRICS GRID (row 2 right — same row as sensitivity) ── */}
      <div className="lg:col-start-2 lg:row-start-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
        <FlippableMetricCard
          label="Signal Fidelity"
          value={`${tax.signalFidelity.toFixed(1)}%`}
          sub="one-way to top"
          color={fidelityColor(tax.signalFidelity, true)}
          infoHref="#methodology-signal-fidelity"
          minOut={0}
          maxOut={100}
          currentOut={tax.signalFidelity}
          inverseBest={false}
          bestLabel="Preserved"
          worstLabel="Distorted"
        />
        <FlippableMetricCard
          label="Decision Quality"
          value={`${(tax.decisionQuality * 100).toFixed(1)}%`}
          sub="compound fidelity × latency"
          color={metricColor(tax.decisionQuality)}
          infoHref="#methodology-decision-quality"
          minOut={0}
          maxOut={100}
          currentOut={tax.decisionQuality * 100}
          inverseBest={false}
          bestLabel="High quality"
          worstLabel="Degraded"
        />
        <FlippableMetricCard
          label="Pivot Speed"
          value={geo.agilityScore.toFixed(2)}
          sub={geo.agilityScore > 0.5 ? 'Strong reach — directives land' : geo.agilityScore > 0.25 ? 'Moderate reach — signal fades' : 'Weak reach — directives lost'}
          color={metricColor(geo.agilityScore)}
          infoHref="#methodology-pivot-speed"
          minOut={0}
          maxOut={1}
          currentOut={geo.agilityScore}
          inverseBest={false}
          bestLabel="Agile"
          worstLabel="Rigid"
        />
        <FlippableMetricCard
          label="Decision Latency"
          value={tax.decisionLatency}
          unit=" days"
          sub={`${Math.round(tax.decisionsPerMonth).toLocaleString()} decisions/month`}
          color={metricColor(1 - Math.min((tax.decisionLatency - 3) / 42, 1))}
          infoHref="#methodology-decision-latency"
          minOut={0}
          maxOut={60}
          currentOut={tax.decisionLatency}
          inverseBest={true}
          bestLabel="Instant"
          worstLabel="Delayed"
        />
        <FlippableMetricCard
          label="Management Tax"
          value={`${m.managerRatio.toFixed(1)}%`}
          sub={m.managerRatio < 15 ? 'Lean — minimal overhead' : m.managerRatio < 30 ? 'Moderate levels of management' : 'Heavy — half the org manages'}
          color={metricColor(1 - Math.min(m.managerRatio / 50, 1))}
          infoHref="#methodology-management-tax"
          minOut={0}
          maxOut={50}
          currentOut={m.managerRatio}
          inverseBest={true}
          bestLabel="Lean"
          worstLabel="Top-heavy"
        />
        <FlippableMetricCard
          label="Drift Cost"
          value={`${(100 - tax.ninetyDayAccuracy).toFixed(1)}%`}
          sub="signal drifted over 90 days"
          color={metricColor(tax.ninetyDayAccuracy / 100)}
          infoHref="#methodology-drift-cost"
          minOut={0}
          maxOut={100}
          currentOut={100 - tax.ninetyDayAccuracy}
          inverseBest={true}
          bestLabel="Accurate"
          worstLabel="Drifted"
        />
      </div>

      {/* ── WHAT-IF + MORE METRICS (row 3 right) ── */}
      <div className="lg:col-start-2 lg:row-start-3 flex flex-col gap-4 min-w-0">
        {/* ── [F] Restructuring Impact — always visible ── */}
        {restructure && (
          <div className="bg-orange-50/80 backdrop-blur-md border-2 rounded-xl p-4 relative overflow-hidden animate-what-if-border transition-colors duration-700">
            {/* Moving Glow */}
            <div
              className="absolute -inset-[100%] animate-slide-glow pointer-events-none opacity-100"
              style={{
                background: 'radial-gradient(circle at center, rgba(224, 90, 27, 0.25) 0%, rgba(224, 90, 27, 0.1) 25%, transparent 50%)',
              }}
            />
            {/* Content Container (z-index ensures it sits above the background glow) */}
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
                  <div className="text-2xl font-black font-mono text-stone-900 drop-shadow-sm">
                    +{(restructure.agilityDelta * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-stone-400 font-medium">faster pivots</div>
                </div>
                <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-lg px-3 py-2.5 text-center">
                  <div className="text-[10px] text-stone-500 uppercase font-semibold mb-1">Inertia</div>
                  <div className="text-2xl font-black font-mono text-stone-900 drop-shadow-sm">
                    -{restructure.inertiaReduction.toFixed(0)}%
                  </div>
                  <div className="text-[10px] text-stone-400 font-medium">less rigidity</div>
                </div>
                <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-lg px-3 py-2.5 text-center">
                  <div className="text-[10px] text-stone-500 uppercase font-semibold mb-1">Mgmt Tax</div>
                  <div className="text-2xl font-black font-mono text-stone-900 drop-shadow-sm">
                    {restructure.managerRatioDelta < 0 ? '' : '+'}{restructure.managerRatioDelta.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-stone-400 font-medium">{restructure.managerRatioDelta < 0 ? 'percentage points · leaner' : 'percentage points · more overhead'}</div>
                </div>
                <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-lg px-3 py-2.5 text-center">
                  <div className="text-[10px] text-stone-500 uppercase font-semibold mb-1">Signal Fidelity</div>
                  <div className="text-2xl font-black font-mono text-stone-900 drop-shadow-sm">
                    +{restructure.fidelityGain.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-stone-400 font-medium">percentage points · better signal</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── [G] More Metrics Disclosure ── */}
        <details className="group">
          <summary className="cursor-pointer list-none flex items-center justify-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors py-2">
            <span>More metrics</span>
            <svg
              className="w-3 h-3 transition-transform group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-3">
            <MetricCard
              label="Span of Control"
              value={m.avgSpan.toFixed(1)}
              sub="avg reports per manager"
              accent={metricColor(Math.min((m.avgSpan - 2) / 10, 1))}
              infoHref="#methodology-span-of-control"
            />
            <MetricCard
              label="Shape Gap"
              value={`${(geo.totalShapeGap * 100).toFixed(1)}%`}
              sub="triangle vs. actual"
              accent={metricColor(1 - Math.min(geo.totalShapeGap / 0.3, 1))}
              infoHref="#methodology-shape-gap"
            />
            <MetricCard
              label="Throughput"
              value={Math.round(tax.decisionsPerMonth).toLocaleString()}
              unit="/month"
              sub="at this org size"
              accent="#57534e"
              infoHref="#methodology-throughput"
            />
            <MetricCard
              label="Flatness Index"
              value={m.flatnessIndex.toFixed(2)}
              sub="Higher = flatter"
              accent="#57534e"
              infoHref="#methodology-flatness-index"
            />
            <MetricCard
              label="Annual Comm Loss"
              value={`$${(m.annualCommLoss / 1000000).toFixed(1)}`}
              unit="M"
              sub="Ineffective comms cost"
              accent="#E05A1B"
              infoHref="#methodology-annual-comm-loss"
            />
          </div>
        </details>
      </div>
    </div>
  );
}
