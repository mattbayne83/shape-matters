import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'lucide-react';
import { useCompanyStore, buildShareUrl } from '../../store/useCompanyStore';
import { calcDepthTax } from '../../lib/depthTax';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { calcTriangleGeometry, calcRestructuringImpact } from '../../lib/triangleGeometry';
import { calcDampedResponse } from '../../lib/dampedResponse';
import { metricColor } from '../../lib/fidelityColor';
import { orgSizeHint, fidelityHint, decisionCycleHint, culturalAgilityHint } from '../../lib/contextHints';
import { SliderInput } from './SliderInput';
import { MetricCard } from './MetricCard';
import { PillarDashboard } from './PillarDashboard';
import { REFERENCE_COMPANIES } from '../../data/referenceCompanies';

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
  const decisionCycle = useCompanyStore((s) => s.decisionCycle);
  const setDecisionCycle = useCompanyStore((s) => s.setDecisionCycle);
  const culturalAgility = useCompanyStore((s) => s.culturalAgility);
  const setCulturalAgility = useCompanyStore((s) => s.setCulturalAgility);
  const advancedInputsOpen = useCompanyStore((s) => s.advancedInputsOpen);
  const setAdvancedInputsOpen = useCompanyStore((s) => s.setAdvancedInputsOpen);

  const [hcSlider, setHcSlider] = useState(() => Math.round(headcountToSlider(headcount)));
  const [preset, setPreset] = useState('custom');
  const [copied, setCopied] = useState(false);
  const [moreMetricsOpen, setMoreMetricsOpen] = useState(false);

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
  const dampedResp = useMemo(
    () => calcDampedResponse(levels, headcount, culturalAgility),
    [levels, headcount, culturalAgility]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* ── HERO: Levels slider (always visible) ── */}
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

      {/* ── Grouped Input Cards (desktop: always visible, mobile: collapsible) ── */}
      <button
        onClick={() => setAdvancedInputsOpen(!advancedInputsOpen)}
        className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors cursor-pointer md:hidden"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${advancedInputsOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        Advanced inputs
      </button>

      <div className={`${advancedInputsOpen ? 'block' : 'hidden'} md:block`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* ═══ STRUCTURE CARD ═══ */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
            {/* Group Header */}
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-stone-100">
              <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #E05A1B, #F4A261)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M3 21h18" /><rect x="5" y="13" width="4" height="8" rx="0.5" /><rect x="10" y="8" width="4" height="13" rx="0.5" /><rect x="15" y="11" width="4" height="10" rx="0.5" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-stone-700">Structure</div>
                <div className="text-[10px] text-stone-400">How your org is built</div>
              </div>
            </div>

            {/* Company Preset */}
            <div className="mb-4">
              <label htmlFor="mo-preset" className="text-[11px] font-semibold text-stone-600 block mb-1.5">
                Start from a real company
              </label>
              <select
                id="mo-preset"
                value={preset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-ember/30 cursor-pointer"
              >
                <option value="custom">Custom</option>
                {REFERENCE_COMPANIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.levels} levels, {c.employees.toLocaleString()} employees
                  </option>
                ))}
              </select>
            </div>

            {/* Org Size */}
            <div className="mb-4">
              <SliderInput
                id="mo-headcount"
                label="Organization Size"
                value={hcSlider}
                displayValue={headcount.toLocaleString()}
                hint={orgSizeHint(headcount, m.avgSpan, m.managerRatio)}
                accent="ember"
                min={0}
                max={100}
                onChange={handleHeadcount}
                ariaValueText={`${headcount.toLocaleString()} employees`}
              />
            </div>

            {/* Fidelity */}
            <SliderInput
              id="mo-fidelity"
              label="Per-Layer Fidelity"
              value={fidelityRate}
              displayValue={`${fidelityRate}%`}
              hint={fidelityHint(fidelityRate)}
              accent="ember"
              min={50}
              max={98}
              onChange={setFidelityRate}
              ariaValueText={`${fidelityRate}% per-layer fidelity`}
            />
          </div>

          {/* ═══ DYNAMICS CARD ═══ */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
            {/* Group Header */}
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-stone-100">
              <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #A8967A, #c4b49a)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-stone-700">Dynamics</div>
                <div className="text-[10px] text-stone-400">How your org behaves</div>
              </div>
            </div>

            {/* Decision Cycle */}
            <div className="mb-4">
              <SliderInput
                id="mo-decision-cycle"
                label="Decision Cycle"
                value={decisionCycle}
                displayValue={`${decisionCycle}d`}
                hint={decisionCycleHint(decisionCycle, levels)}
                accent="warm-stone"
                min={1}
                max={14}
                step={0.5}
                onChange={setDecisionCycle}
                ariaValueText={`${decisionCycle} days per layer`}
              />
            </div>

            {/* Cultural Agility */}
            <div className="mb-4">
              <SliderInput
                id="mo-cultural-agility"
                label="Cultural Agility"
                value={culturalAgility}
                displayValue={String(culturalAgility)}
                hint={culturalAgilityHint(culturalAgility, dampedResp.settlingTimeWeeks)}
                accent="warm-stone"
                min={0}
                max={100}
                onChange={setCulturalAgility}
                ariaValueText={`Cultural agility ${culturalAgility} out of 100`}
              />
            </div>

            {/* Pillar connection callout */}
            <div className="p-3 bg-stone-50 rounded-lg border border-dashed border-stone-200 text-center">
              <div className="text-[10px] text-stone-400">
                These inputs feed the <span className="font-semibold text-stone-500">Propagation Lag</span> and <span className="font-semibold text-stone-500">Change Response</span> pillars below
              </div>
            </div>
          </div>
        </div>

        {/* ── Share Link (outside cards) ── */}
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-1.5 w-full text-xs text-stone-500 hover:text-stone-700 border border-stone-200 hover:border-stone-300 rounded-lg py-2 bg-white transition-colors cursor-pointer mt-3"
        >
          <Link className="w-3.5 h-3.5" />
          {copied ? 'Copied!' : 'Copy shareable link'}
        </button>
      </div>

      {/* ── Pillar Dashboard ── */}
      <PillarDashboard />

      {/* ── What-If / Restructuring Impact ── */}
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
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-3 pb-2">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
