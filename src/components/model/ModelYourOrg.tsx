import { useMemo, useState } from 'react';
import { useCompanyStore } from '../../store/useCompanyStore';
import { calcDepthTax } from '../../lib/depthTax';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { calcTriangleGeometry } from '../../lib/triangleGeometry';
import { fidelityColor } from '../../lib/fidelityColor';
import { SECTION_LABEL } from '../../lib/styles';
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
  const [levels, setLevels] = useState(6);
  const [hcSlider, setHcSlider] = useState(() => Math.round(headcountToSlider(5000)));
  const [preset, setPreset] = useState('custom');

  const handlePresetChange = (id: string) => {
    setPreset(id);
    if (id === 'custom') return;
    const company = REFERENCE_COMPANIES.find((c) => c.id === id);
    if (!company) return;
    setLevels(company.levels);
    setHcSlider(Math.round(headcountToSlider(company.employees)));
  };

  const handleLevels = (v: number) => { setPreset('custom'); setLevels(v); };
  const handleHeadcount = (v: number) => { setPreset('custom'); setHcSlider(v); };

  const headcount = useMemo(() => sliderToHeadcount(hcSlider), [hcSlider]);
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

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
      {/* ── LEFT COLUMN: INPUTS ── */}
      <div className="w-full lg:w-1/3 lg:max-w-sm shrink-0">
        <div className="sticky top-8 flex flex-col gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6">
            {/* Company Preset Dropdown */}
            <div>
              <label htmlFor="mo-preset" className="text-[11px] font-bold text-slate-700 uppercase block mb-1.5">
                Start from a Real Company
              </label>
              <select
                id="mo-preset"
                value={preset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                <option value="custom">Custom</option>
                {REFERENCE_COMPANIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.levels} levels, {c.employees.toLocaleString()} employees
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Slider: Org Levels */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <div className="flex items-baseline justify-between mb-3 text-center md:text-left">
                <div>
                  <label htmlFor="mo-levels" className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Org Levels
                  </label>
                  <div className="text-xs text-slate-500 mt-1">Adjust depth of hierarchy</div>
                </div>
                <span className="text-2xl md:text-3xl font-black font-sans tabular-nums text-slate-900 bg-white px-3 py-1 rounded-md shadow-sm border border-slate-200">
                  {levels}
                </span>
              </div>
              <input
                id="mo-levels"
                type="range"
                min={2}
                max={15}
                value={levels}
                onChange={(e) => handleLevels(+e.target.value)}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label htmlFor="mo-headcount" className="text-[11px] font-bold text-slate-700 uppercase">
                  Organization Size
                </label>
                <span className="text-sm font-bold font-sans tabular-nums text-slate-900 border-b border-slate-200">
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
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label htmlFor="mo-fidelity" className="text-[11px] font-bold text-slate-700 uppercase">
                  Per-Layer Fidelity Rate
                </label>
                <span className="text-sm font-bold font-sans tabular-nums text-slate-900 border-b border-slate-200">{fidelityRate}%</span>
              </div>
              <input
                id="mo-fidelity"
                type="range"
                min={50}
                max={98}
                value={fidelityRate}
                onChange={(e) => setFidelityRate(+e.target.value)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
              />
              <div className="text-[9px] text-slate-400 mt-1">
                80-85% is a reasonable empirical midpoint based on Bartlett's research.
              </div>
            </div>
          </div>
          <SensitivitySweep levels={levels} headcount={headcount} currentFidelityRate={fidelityRate} />
        </div>
      </div>

      {/* ── RIGHT COLUMN: OUTPUTS ── */}
      <div className="w-full lg:w-2/3 flex flex-col min-w-0">
        <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className={`${SECTION_LABEL} mb-2 justify-center md:justify-start`}>Round-Trip Fidelity</div>
            <div
              className="text-5xl md:text-6xl lg:text-7xl font-black font-mono leading-none tracking-tighter transition-colors duration-300"
              style={{ color: fidelityColor(tax.roundTripFidelity, true) }}
            >
              {tax.roundTripFidelity.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 mt-3 md:max-w-[200px] leading-relaxed">
              Signal remaining after {levels - 1} layers up and {levels - 1} layers down ({(levels - 1) * 2} relay hops).
            </div>
          </div>
          <div className="w-full max-w-[200px] md:max-w-[240px] shrink-0">
            <SignalCascade levels={levels} fidelityRate={fidelityRate} semantic />
          </div>
        </div>

        {/* ── [E] Key Metrics Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
          <FlippableMetricCard
            label="Signal Fidelity"
            value={`${tax.signalFidelity.toFixed(1)}%`}
            sub="one-way to top"
            color={fidelityColor(tax.signalFidelity, true)}
            minOut={0}
            maxOut={100}
            currentOut={tax.signalFidelity}
            inverseBest={false}
            bestLabel="Preserved"
            worstLabel="Distorted"
          />
          <FlippableMetricCard
            label="Decision Latency"
            value={tax.decisionLatency}
            unit=" days"
            sub={`Quality: ${(tax.decisionQuality * 100).toFixed(0)}%`}
            color="#dc2626"
            minOut={0}
            maxOut={60}
            currentOut={tax.decisionLatency}
            inverseBest={true}
            bestLabel="Instant"
            worstLabel="Delayed"
          />
          <FlippableMetricCard
            label="Pivot Speed"
            value={geo.agilityScore.toFixed(2)}
            sub={geo.agilityScore > 0.5 ? 'Strong reach — directives land' : geo.agilityScore > 0.25 ? 'Moderate reach — signal fades' : 'Weak reach — directives lost'}
            color={geo.agilityScore > 0.5 ? '#16a34a' : geo.agilityScore > 0.25 ? '#d97706' : '#dc2626'}
            minOut={0}
            maxOut={1}
            currentOut={geo.agilityScore}
            inverseBest={false}
            bestLabel="Agile"
            worstLabel="Rigid"
          />
          <FlippableMetricCard
            label="Span of Control"
            value={m.avgSpan.toFixed(1)}
            sub="avg reports per manager"
            color="#16a34a"
            minOut={1}
            maxOut={15}
            currentOut={m.avgSpan}
            inverseBest={false}
            bestLabel="Flat / Wide"
            worstLabel="Deep / Micro"
          />
          <FlippableMetricCard
            label="Shape Gap"
            value={`${(geo.totalShapeGap * 100).toFixed(1)}%`}
            sub="triangle vs. actual"
            color={geo.totalShapeGap > 0.15 ? '#dc2626' : geo.totalShapeGap > 0.05 ? '#d97706' : '#16a34a'}
            minOut={0}
            maxOut={0.4}
            currentOut={geo.totalShapeGap}
            inverseBest={true}
            bestLabel="Uniform"
            worstLabel="Distorted"
          />
        </div>

        {/* ── [F] More Metrics Disclosure ── */}
        <details className="group">
          <summary className="cursor-pointer list-none flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors py-2">
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3">
            <MetricCard
              label="Drift Cost"
              value={`${tax.ninetyDayAccuracy.toFixed(1)}%`}
              sub="90-day accuracy"
              accent="#d97706"
            />
            <MetricCard
              label="Decision Quality"
              value={`${(tax.decisionQuality * 100).toFixed(1)}%`}
              sub="compound fidelity × latency"
              accent="#dc2626"
            />
            <MetricCard
              label="Throughput"
              value={Math.round(tax.decisionsPerMonth).toLocaleString()}
              unit="/month"
              sub="at this org size"
              accent="#0891b2"
            />
            <MetricCard
              label="Flatness Index"
              value={m.flatnessIndex.toFixed(2)}
              sub="Higher = flatter"
              accent="#2563eb"
            />
            <MetricCard
              label="Annual Comm Loss"
              value={`$${(m.annualCommLoss / 1000000).toFixed(1)}`}
              unit="M"
              sub="Ineffective comms cost"
              accent="#dc2626"
            />
            <MetricCard
              label="Shape Class"
              value={geo.shapeClassLabel.split(' — ')[0]}
              sub={geo.shapeClassLabel.split(' — ')[1] ?? ''}
              accent="#7c3aed"
            />
          </div>
        </details>
      </div>
    </div>
  );
}
