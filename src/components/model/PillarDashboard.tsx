import { useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanyStore } from '../../store/useCompanyStore';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { calcThermalLag } from '../../lib/thermalLag';

import { calcLagHealth, healthBandColor } from '../../lib/healthScores';
import { PillarCard } from './PillarCard';
import type { PillarId } from './PillarCard';
import { SignalCascade } from './SignalCascade';
import { RoundTripFidelity } from './RoundTripFidelity';

import { DotTimeline } from './DotTimeline';
import { AuthoritySpectrum } from './AuthoritySpectrum';
import { RadarChart } from './RadarChart';
import { calcAutonomyScore } from '../../lib/autonomy';
import { calcBlendedScores } from '../../lib/blendedModel';

const FADE = { duration: 0.3, ease: [0.22, 1, 0.36, 1] } as const;

export function PillarDashboard() {
  const levels = useCompanyStore((s) => s.levels);
  const headcount = useCompanyStore((s) => s.headcount);
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);
  const decisionCycle = useCompanyStore((s) => s.decisionCycle);
  const dci = useCompanyStore((s) => s.dci);
  const teamDecisionMix = useCompanyStore((s) => s.teamDecisionMix);
  const expandedPillar = useCompanyStore((s) => s.expandedPillar);
  const setExpandedPillar = useCompanyStore((s) => s.setExpandedPillar);

  const m = useMemo(() => calcOrgMetrics(levels, headcount, fidelityRate), [levels, headcount, fidelityRate]);
  const lag = useMemo(() => calcThermalLag(levels, decisionCycle), [levels, decisionCycle]);
  const lagHealth = useMemo(() => calcLagHealth(lag.totalDelay), [lag.totalDelay]);

  const fidelityScore = Math.round(m.fidelityAtTopPct);
  const autonomy = useMemo(() => calcAutonomyScore(dci, levels), [dci, levels]);

  // Blended model: when teamDecisionMix > 0, compute blended scores
  const blended = useMemo(() => calcBlendedScores({
    levels, headcount, fidelityRate, decisionCycle, dci, teamDecisionMix,
  }), [levels, headcount, fidelityRate, decisionCycle, dci, teamDecisionMix]);

  // Use blended scores when active, monolithic otherwise
  const displayFidelity = blended.isBlended ? blended.fidelity : fidelityScore;
  const displayLag = blended.isBlended ? blended.lag : lagHealth.score;
  const displayAutonomy = blended.isBlended ? blended.autonomy : autonomy.score;

  const fidelityHealthColor = healthBandColor(displayFidelity);
  const autonomyHealthColor = healthBandColor(displayAutonomy);
  const lagDisplayHealth = blended.isBlended ? { score: displayLag, label: lagHealth.label, color: healthBandColor(displayLag) } : lagHealth;

  const containerRef = useRef<HTMLDivElement>(null);

  const PILLAR_ACCENTS: Record<PillarId, string> = {
    fidelity: '#E05A1B',
    lag: '#E05A1B',
    autonomy: '#A8967A',
  };

  function togglePillar(id: PillarId) {
    setExpandedPillar(expandedPillar === id ? null : id);
  }

  // On mobile, scroll the detail panel into view when a pillar expands
  const detailRef = useRef<HTMLDivElement>(null);
  const prevExpanded = useRef(expandedPillar);
  useEffect(() => {
    if (expandedPillar && expandedPillar !== prevExpanded.current && detailRef.current) {
      const isLg = window.matchMedia('(min-width: 1024px)').matches;
      if (!isLg) {
        detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    prevExpanded.current = expandedPillar;
  }, [expandedPillar]);

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[3fr_7fr] gap-3"
      ref={containerRef}
    >
      {/* ── Detail column: Radar OR expanded content ── */}
      <div className="order-first lg:order-last relative min-h-[280px] lg:min-h-0" ref={detailRef}>
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
              <RadarChart fidelity={displayFidelity} lagHealth={displayLag} autonomyHealth={displayAutonomy} />
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
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center mb-3 shrink-0">
                Signal Fidelity
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 relative">
                {/* Divider Line (Desktop only) */}
                <div className="hidden lg:block absolute left-1/2 top-0 bottom-4 w-px bg-stone-100" />

                <div className="flex flex-col items-center justify-center min-h-0 px-2 lg:pr-6">
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
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center mb-3 shrink-0">
                Propagation Delay
              </div>
              <DotTimeline levels={levels} decisionCycle={decisionCycle} />
            </motion.div>
          )}

          {expandedPillar === 'autonomy' && (
            <motion.div
              key="autonomy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE}
              className="p-4 h-full flex flex-col overflow-hidden"
            >
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center mb-3 shrink-0">
                Autonomy Spectrum
              </div>
              <AuthoritySpectrum dci={dci} levels={levels} displayScore={displayAutonomy} />
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* ── Right column: 3 stacked pillar cards ── */}
      <div className="flex flex-col gap-2 order-last lg:order-first">
        <PillarCard
          id="fidelity"
          label="Fidelity"
          value={`${displayFidelity}`}
          score={displayFidelity}
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
          value={`${displayLag}`}
          score={displayLag}
          sub={`${lag.totalDelay}d · ${lagDisplayHealth.label}`}
          accentColor="#E05A1B"
          healthColor={lagDisplayHealth.color}

          isExpanded={expandedPillar === 'lag'}
          hasExpandedSibling={expandedPillar !== null && expandedPillar !== 'lag'}
          onToggle={() => togglePillar('lag')}
        />
        <PillarCard
          id="autonomy"
          label="Autonomy"
          value={`${displayAutonomy}`}
          score={displayAutonomy}
          sub={`DCI ${dci}% · ${autonomy.label}`}
          accentColor="#A8967A"
          healthColor={autonomyHealthColor}

          isExpanded={expandedPillar === 'autonomy'}
          hasExpandedSibling={expandedPillar !== null && expandedPillar !== 'autonomy'}
          onToggle={() => togglePillar('autonomy')}
        />
      </div>
    </div>
  );
}
