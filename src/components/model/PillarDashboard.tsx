import { useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanyStore } from '../../store/useCompanyStore';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { calcThermalLag } from '../../lib/thermalLag';
import { calcDampedResponse } from '../../lib/dampedResponse';

import { calcLagHealth, calcResponseHealth, healthBandColor } from '../../lib/healthScores';
import { PillarCard } from './PillarCard';
import type { PillarId } from './PillarCard';
import { SignalCascade } from './SignalCascade';
import { SensitivitySweep } from './SensitivitySweep';

import { PropagationDelay } from './PropagationDelay';
import { ChangeResponseTimeline } from './ChangeResponseTimeline';
import { ThreeFutures } from './ThreeFutures';
import { RadarChart } from './RadarChart';

const FADE = { duration: 0.3, ease: [0.22, 1, 0.36, 1] } as const;

export function PillarDashboard() {
  const levels = useCompanyStore((s) => s.levels);
  const headcount = useCompanyStore((s) => s.headcount);
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);
  const decisionCycle = useCompanyStore((s) => s.decisionCycle);
  const culturalAgility = useCompanyStore((s) => s.culturalAgility);
  const expandedPillar = useCompanyStore((s) => s.expandedPillar);
  const setExpandedPillar = useCompanyStore((s) => s.setExpandedPillar);

  const m = useMemo(() => calcOrgMetrics(levels, headcount, fidelityRate), [levels, headcount, fidelityRate]);
  const lag = useMemo(() => calcThermalLag(levels, decisionCycle), [levels, decisionCycle]);
  const response = useMemo(() => calcDampedResponse(levels, headcount, culturalAgility), [levels, headcount, culturalAgility]);
  const lagHealth = useMemo(() => calcLagHealth(lag.totalDelay), [lag.totalDelay]);
  const responseHealth = useMemo(() => calcResponseHealth(response.dampingRatio, response.regime), [response.dampingRatio, response.regime]);

  const fidelityScore = Math.round(m.fidelityAtTopPct);
  const fidelityHealthColor = healthBandColor(fidelityScore);

  const containerRef = useRef<HTMLDivElement>(null);

  const PILLAR_ACCENTS: Record<PillarId, string> = {
    fidelity: '#E05A1B',
    lag: '#A8967A',
    response: '#16A34A',
  };

  function togglePillar(id: PillarId) {
    setExpandedPillar(expandedPillar === id ? null : id);
  }

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[3fr_7fr] gap-3"
      ref={containerRef}
    >
      {/* ── Detail column: Radar OR expanded content ── */}
      <div className="order-last relative min-h-[400px] lg:min-h-0">
        <div
          className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden w-full h-full flex flex-col lg:absolute lg:inset-0 transition-all duration-300"
          style={expandedPillar ? {
            borderLeftWidth: 3,
            borderLeftColor: PILLAR_ACCENTS[expandedPillar],
          } : {}}
        >
          <AnimatePresence mode="wait">
          {!expandedPillar && (
            <motion.div
              key="radar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE}
              className="w-full h-full flex items-center justify-center p-4"
            >
              <RadarChart
                fidelity={fidelityScore}
                lagHealth={lagHealth.score}
                responseHealth={responseHealth.score}
              />
            </motion.div>
          )}

          {expandedPillar === 'fidelity' && (
            <motion.div
              key="fidelity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE}
              className="p-4 h-full flex flex-col"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 relative">
                {/* Divider Line (Desktop only) */}
                <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-px bg-stone-100" />
                
                <div className="flex flex-col items-center justify-center min-h-0 px-2 lg:pr-6">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-4 self-center shrink-0">
                    Signal Cascade
                  </div>
                  <div className="flex-1 min-h-0 w-full flex items-center justify-center">
                    <SignalCascade levels={levels} fidelityRate={fidelityRate} semantic />
                  </div>
                </div>
                <div className="min-h-0 flex flex-col items-center justify-center px-2 lg:pl-6">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-4 self-center shrink-0">
                    Sensitivity vs. Layer Rate
                  </div>
                  <SensitivitySweep
                    levels={levels}
                    headcount={headcount}
                    currentFidelityRate={fidelityRate}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {expandedPillar === 'lag' && (
            <motion.div
              key="lag"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE}
              className="p-4 h-full flex flex-col"
            >
              <PropagationDelay levels={levels} decisionCycle={decisionCycle} />
            </motion.div>
          )}

          {expandedPillar === 'response' && (
            <motion.div
              key="response"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE}
              className="p-4 h-full flex flex-col"
            >
               <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 flex-1 min-h-0 relative">
                 {/* Divider Line */}
                 <div className="hidden lg:block absolute left-[60%] top-2 bottom-2 w-px bg-stone-100" />

                 <div className="flex-1 min-h-0 flex flex-col justify-center">
                   <ChangeResponseTimeline
                     levels={levels}
                     headcount={headcount}
                     culturalAgility={culturalAgility}
                   />
                 </div>
                 <div className="flex-1 min-h-0 flex flex-col justify-center pl-0 lg:pl-6">
                   <ThreeFutures
                     dampingRatio={response.dampingRatio}
                     overshootPct={response.overshootPct}
                     settlingTimeWeeks={response.settlingTimeWeeks}
                     regime={response.regime}
                   />
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* ── Right column: 3 stacked pillar cards ── */}
      <div className="flex flex-col gap-2 order-first">
        <PillarCard
          id="fidelity"
          label="Signal Fidelity"
          value={`${fidelityScore}`}
          score={fidelityScore}
          sub={`${m.fidelityAtTopPct.toFixed(1)}% · ${levels - 1} relays`}
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
          score={lagHealth.score}
          sub={`${lag.totalDelay}d · ${lagHealth.label}`}
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
          score={responseHealth.score}
          sub={`ζ=${response.dampingRatio.toFixed(2)} · ${responseHealth.label}`}
          accentColor="#16A34A"
          healthColor={responseHealth.color}
          isExpanded={expandedPillar === 'response'}
          hasExpandedSibling={expandedPillar !== null && expandedPillar !== 'response'}
          onToggle={() => togglePillar('response')}
        />
      </div>
    </div>
  );
}
