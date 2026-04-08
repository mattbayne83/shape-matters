import { useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanyStore } from '../../store/useCompanyStore';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { calcThermalLag } from '../../lib/thermalLag';
import { calcTriangleGeometry } from '../../lib/triangleGeometry';

import { calcLagHealth, healthBandColor } from '../../lib/healthScores';
import { PillarCard } from './PillarCard';
import type { PillarId } from './PillarCard';
import { SignalCascade } from './SignalCascade';
import { RoundTripFidelity } from './RoundTripFidelity';

import { DotTimeline } from './DotTimeline';
import { TorqueProfile } from './TorqueProfile';
import { RadarChart } from './RadarChart';

const FADE = { duration: 0.3, ease: [0.22, 1, 0.36, 1] } as const;

export function PillarDashboard() {
  const levels = useCompanyStore((s) => s.levels);
  const headcount = useCompanyStore((s) => s.headcount);
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);
  const decisionCycle = useCompanyStore((s) => s.decisionCycle);
  const expandedPillar = useCompanyStore((s) => s.expandedPillar);
  const setExpandedPillar = useCompanyStore((s) => s.setExpandedPillar);

  const m = useMemo(() => calcOrgMetrics(levels, headcount, fidelityRate), [levels, headcount, fidelityRate]);
  const geo = useMemo(() => calcTriangleGeometry(levels, headcount, fidelityRate), [levels, headcount, fidelityRate]);
  const lag = useMemo(() => calcThermalLag(levels, decisionCycle), [levels, decisionCycle]);
  const lagHealth = useMemo(() => calcLagHealth(lag.totalDelay), [lag.totalDelay]);

  const fidelityScore = Math.round(m.fidelityAtTopPct);
  const fidelityHealthColor = healthBandColor(fidelityScore);
  const agilityScore = Math.round(geo.agilityScore * 100);
  const agilityHealthColor = healthBandColor(agilityScore);

  const containerRef = useRef<HTMLDivElement>(null);

  const PILLAR_ACCENTS: Record<PillarId, string> = {
    fidelity: '#E05A1B',
    lag: '#E05A1B',
    response: '#E05A1B',
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
                responseHealth={agilityScore}
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
              className="p-4 h-full flex flex-col overflow-hidden"
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
                  <RoundTripFidelity
                    levels={levels}
                    fidelityRate={fidelityRate}
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
              className="p-4 h-full flex flex-col overflow-hidden"
            >
              <DotTimeline levels={levels} decisionCycle={decisionCycle} />
            </motion.div>
          )}

          {expandedPillar === 'response' && (
            <motion.div
              key="response"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE}
              className="p-4 h-full flex flex-col overflow-hidden"
            >
               <div className="flex-1 min-h-0 flex flex-col justify-center">
                 <TorqueProfile
                   levels={levels}
                   torqueProfile={geo.torqueProfile}
                   agilityScore={geo.agilityScore}
                 />
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
          label="Fidelity"
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
          label="Latency"
          value={`${lagHealth.score}`}
          score={lagHealth.score}
          sub={`${lag.totalDelay}d · ${lagHealth.label}`}
          accentColor="#E05A1B"
          healthColor={lagHealth.color}
          isExpanded={expandedPillar === 'lag'}
          hasExpandedSibling={expandedPillar !== null && expandedPillar !== 'lag'}
          onToggle={() => togglePillar('lag')}
        />
        <PillarCard
          id="response"
          label="Agility"
          value={`${agilityScore}`}
          score={agilityScore}
          sub={`${(geo.agilityScore * 100).toFixed(1)}% of signal reaches front line`}
          accentColor="#E05A1B"
          healthColor={agilityHealthColor}
          isExpanded={expandedPillar === 'response'}
          hasExpandedSibling={expandedPillar !== null && expandedPillar !== 'response'}
          onToggle={() => togglePillar('response')}
        />
      </div>
    </div>
  );
}
