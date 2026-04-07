import { useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanyStore } from '../../store/useCompanyStore';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { calcDepthTax } from '../../lib/depthTax';
import { calcTriangleGeometry } from '../../lib/triangleGeometry';
import { calcThermalLag } from '../../lib/thermalLag';
import { calcDampedResponse } from '../../lib/dampedResponse';
import { fidelityColor, metricColor } from '../../lib/fidelityColor';
import { calcLagHealth, calcResponseHealth, healthBandColor } from '../../lib/healthScores';
import { PillarCard } from './PillarCard';
import type { PillarId } from './PillarCard';
import { SignalCascade } from './SignalCascade';
import { SensitivitySweep } from './SensitivitySweep';
import { FlippableMetricCard } from './FlippableMetricCard';
import { PropagationDelay } from './PropagationDelay';
import { ChangeResponseTimeline } from './ChangeResponseTimeline';
import { ThreeFutures } from './ThreeFutures';
import { RadarChart } from './RadarChart';

export function PillarDashboard() {
  const levels = useCompanyStore((s) => s.levels);
  const headcount = useCompanyStore((s) => s.headcount);
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);
  const decisionCycle = useCompanyStore((s) => s.decisionCycle);
  const culturalAgility = useCompanyStore((s) => s.culturalAgility);
  const expandedPillar = useCompanyStore((s) => s.expandedPillar);
  const setExpandedPillar = useCompanyStore((s) => s.setExpandedPillar);
  const setAdvancedInputsOpen = useCompanyStore((s) => s.setAdvancedInputsOpen);

  const m = useMemo(
    () => calcOrgMetrics(levels, headcount, fidelityRate),
    [levels, headcount, fidelityRate],
  );

  const tax = useMemo(
    () => calcDepthTax(levels, headcount, fidelityRate),
    [levels, headcount, fidelityRate],
  );

  const geo = useMemo(
    () => calcTriangleGeometry(levels, headcount, fidelityRate),
    [levels, headcount, fidelityRate],
  );

  const lag = useMemo(
    () => calcThermalLag(levels, decisionCycle),
    [levels, decisionCycle],
  );

  const response = useMemo(
    () => calcDampedResponse(levels, headcount, culturalAgility),
    [levels, headcount, culturalAgility],
  );

  const lagHealth = useMemo(
    () => calcLagHealth(lag.totalDelay),
    [lag.totalDelay],
  );

  const responseHealth = useMemo(
    () => calcResponseHealth(response.dampingRatio, response.regime),
    [response.dampingRatio, response.regime],
  );

  const fidelityScore = Math.round(m.fidelityAtTopPct);
  const fidelityHealthColor = healthBandColor(fidelityScore);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expandedPillar && containerRef.current) {
      // Allow DOM to settle before scrolling
      setTimeout(() => {
        const top = containerRef.current?.getBoundingClientRect().top;
        if (top !== undefined) {
          const offset = window.pageYOffset + top - 64; // nav height (48px) + 16px breathing room
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [expandedPillar]);

  function togglePillar(id: PillarId) {
    if (expandedPillar === id) {
      setExpandedPillar(null);
    } else {
      setExpandedPillar(id);
      setAdvancedInputsOpen(true);
    }
  }

  return (
    <div className="flex flex-col gap-6" ref={containerRef}>
      {/* ── Radar summary ── */}
      <RadarChart
        fidelity={fidelityScore}
        lagHealth={lagHealth.score}
        responseHealth={responseHealth.score}
      />

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <PillarCard
          id="fidelity"
          label="Signal Fidelity"
          value={`${fidelityScore}`}
          sub={`${m.fidelityAtTopPct.toFixed(1)}% signal preserved across ${levels - 1} relays`}
          accentColor="#E05A1B"
          healthColor={fidelityHealthColor}
          isExpanded={expandedPillar === 'fidelity'}
          hasExpandedSibling={expandedPillar !== null && expandedPillar !== 'fidelity'}
          onToggle={() => togglePillar('fidelity')}
        />
        <PillarCard
          id="lag"
          label="Propagation Lag"
          value={`${lagHealth.score}`}
          sub={`${lag.totalDelay}d CEO → front line · ${lagHealth.label}`}
          accentColor="#A8967A"
          healthColor={lagHealth.color}
          isExpanded={expandedPillar === 'lag'}
          hasExpandedSibling={expandedPillar !== null && expandedPillar !== 'lag'}
          onToggle={() => togglePillar('lag')}
        />
        <PillarCard
          id="response"
          label="Change Response"
          value={`${responseHealth.score}`}
          sub={`ζ = ${response.dampingRatio.toFixed(2)} · ${response.regimeLabel} · ${responseHealth.label}`}
          accentColor="#16A34A"
          healthColor={responseHealth.color}
          isExpanded={expandedPillar === 'response'}
          hasExpandedSibling={expandedPillar !== null && expandedPillar !== 'response'}
          onToggle={() => togglePillar('response')}
        />
      </div>

      {/* ── Expanded content ── */}
      <AnimatePresence mode="wait">
        {expandedPillar === 'fidelity' && (
          <motion.div
            key="fidelity"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-5 pt-2 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex flex-col items-center">
                  <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-3 self-start">
                    Signal Cascade
                  </div>
                  <SignalCascade levels={levels} fidelityRate={fidelityRate} semantic />
                </div>
                <SensitivitySweep
                  levels={levels}
                  headcount={headcount}
                  currentFidelityRate={fidelityRate}
                />
              </div>

              {/* 6 FlippableMetricCards — exact props from ModelYourOrg */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
            </div>
          </motion.div>
        )}

        {expandedPillar === 'lag' && (
          <motion.div
            key="lag"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-6">
              <PropagationDelay levels={levels} decisionCycle={decisionCycle} />
            </div>
          </motion.div>
        )}

        {expandedPillar === 'response' && (
          <motion.div
            key="response"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-5 pt-2 pb-6">
              <ChangeResponseTimeline
                levels={levels}
                headcount={headcount}
                culturalAgility={culturalAgility}
              />
              <ThreeFutures
                dampingRatio={response.dampingRatio}
                overshootPct={response.overshootPct}
                settlingTimeWeeks={response.settlingTimeWeeks}
                regime={response.regime}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
