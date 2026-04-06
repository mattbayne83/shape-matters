import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCompanyStore } from '../../store/useCompanyStore';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { truncateRelayLevels } from '../../lib/signalRelay';
import { SCENARIOS } from '../../data/scenarios';
import { RelayCard } from './RelayCard';
import { SignalVerdictCard } from './SignalVerdictCard';

export function RelayCascade() {
  const levels = useCompanyStore((s) => s.levels);
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);
  const headcount = useCompanyStore((s) => s.headcount);
  const activeScenarioId = useCompanyStore((s) => s.activeScenarioId);
  const [expanded, setExpanded] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === activeScenarioId);
  if (!scenario) return null;

  const relayLevels = truncateRelayLevels(scenario.levels, levels);
  const metrics = calcOrgMetrics(levels, headcount, fidelityRate);

  const fidelityAtLevel = (index: number) =>
    Math.pow(fidelityRate / 100, index + 1) * 100;

  // Middle layers = everything except the first relay
  const middleLevels = relayLevels.length > 1 ? relayLevels.slice(1) : [];
  const firstLevel = relayLevels[0];

  return (
    <div className="space-y-3">
      {/* Original signal card */}
      <div className="border-2 border-ember/40 rounded-xl p-4 bg-ember/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold font-mono text-ember bg-ember/10 px-1.5 py-0.5 rounded">
            ORIGIN
          </span>
          <span className="text-xs font-semibold text-stone-700">Original Signal</span>
          <span className="text-[10px] font-mono text-ember ml-auto">100%</span>
        </div>
        <p className="text-sm text-stone-800 leading-relaxed">{scenario.originalMessage}</p>
      </div>

      {/* First relay card — always visible */}
      {firstLevel && (
        <RelayCard
          level={firstLevel}
          index={0}
          fidelityPct={fidelityAtLevel(0)}
        />
      )}

      {/* Expandable middle layers */}
      {middleLevels.length > 0 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-stone-300 rounded-xl text-xs text-stone-400 hover:text-stone-600 hover:border-stone-400 transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          Show {middleLevels.length} more layer{middleLevels.length !== 1 ? 's' : ''}
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      )}
      {expanded && middleLevels.map((level, i) => (
        <RelayCard
          key={i + 1}
          level={level}
          index={i + 1}
          fidelityPct={fidelityAtLevel(i + 1)}
        />
      ))}
      {expanded && middleLevels.length > 0 && (
        <button
          onClick={() => setExpanded(false)}
          className="w-full flex items-center justify-center gap-2 py-1.5 text-[10px] text-stone-400 hover:text-stone-600 transition-colors"
        >
          <ChevronDown className="w-3 h-3 rotate-180" />
          Collapse
        </button>
      )}

      {/* Verdict — always visible */}
      {relayLevels.length > 0 && (
        <SignalVerdictCard
          fidelityPct={metrics.fidelityAtTopPct}
          relayCount={relayLevels.length}
          finalMessage={relayLevels[relayLevels.length - 1].message}
        />
      )}
    </div>
  );
}
