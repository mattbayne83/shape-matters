import { motion } from 'framer-motion';
import { useCompanyStore } from '../../store/useCompanyStore';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { truncateRelayLevels, applyRelayTransforms } from '../../lib/signalRelay';
import { SCENARIOS } from '../../data/scenarios';
import { RelayCard } from './RelayCard';
import { SignalVerdictCard } from './SignalVerdictCard';
import type { RelayLevel } from '../../types';

export function RelayCascade() {
  const levels = useCompanyStore((s) => s.levels);
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);
  const headcount = useCompanyStore((s) => s.headcount);
  const activeScenarioId = useCompanyStore((s) => s.activeScenarioId);
  const customMessage = useCompanyStore((s) => s.customMessage);

  const scenario = SCENARIOS.find((s) => s.id === activeScenarioId);
  const message = scenario?.originalMessage ?? customMessage;

  if (!message.trim()) return null;

  // Build relay levels — hand-authored for scenarios, engine-generated for custom
  let relayLevels: RelayLevel[];
  let isCustom = false;

  if (scenario) {
    relayLevels = truncateRelayLevels(scenario.levels, levels);
  } else {
    isCustom = true;
    const roleNames = [
      'Direct Supervisor', 'Department Manager', 'Senior Manager',
      'Director', 'VP', 'Senior VP', 'C-Suite Executive', 'CEO',
    ];
    const relayCount = Math.max(0, levels - 1);
    relayLevels = Array.from({ length: Math.min(relayCount, 8) }, (_, i) => ({
      role: roleNames[i],
      message: applyRelayTransforms(message, i + 1),
      incentive: CUSTOM_INCENTIVES[Math.min(i, CUSTOM_INCENTIVES.length - 1)],
      lostDetails: [],
      addedFraming: [],
    }));
  }

  const metrics = calcOrgMetrics(levels, headcount, fidelityRate);

  return (
    <div className="space-y-3">
      {/* Original signal card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="border-2 border-ember/40 rounded-xl p-4 bg-ember/5"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold font-mono text-ember bg-ember/10 px-1.5 py-0.5 rounded">
            ORIGIN
          </span>
          <span className="text-xs font-semibold text-stone-700">Original Signal</span>
        </div>
        <p className="text-sm text-stone-800 leading-relaxed">{message}</p>
      </motion.div>

      {/* Relay cards */}
      {relayLevels.map((level, i) => (
        <RelayCard key={i} level={level} index={i} isCustom={isCustom} />
      ))}

      {/* Verdict */}
      {relayLevels.length > 0 && (
        <SignalVerdictCard
          fidelityPct={metrics.fidelityAtTopPct}
          relayCount={relayLevels.length}
          delayIndex={relayLevels.length}
          finalMessage={relayLevels[relayLevels.length - 1].message}
        />
      )}
    </div>
  );
}

const CUSTOM_INCENTIVES = [
  'Summarized for brevity — specific details deemed unnecessary for this level',
  'Generalized to fit the standard reporting format at this level',
  'Softened urgency to avoid triggering escalation protocols',
  'Reframed to match the narrative expected in leadership updates',
  'Abstracted to portfolio-level language — individual items lose specificity',
  'Filtered for executive relevance — only material items surface',
  'Compressed into a single status line for the operations summary',
  'Reduced to a sentiment indicator — the original signal is unrecoverable',
];
