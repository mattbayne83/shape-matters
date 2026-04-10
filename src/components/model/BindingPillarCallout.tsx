import { useMemo } from 'react';
import { useCompanyStore } from '../../store/useCompanyStore';
import { findBindingPillar, type Pillar, type Lever } from '../../lib/sensitivity';

const PILLAR_LABELS: Record<Pillar, string> = {
  fidelity: 'Fidelity',
  lag: 'Latency',
  autonomy: 'Autonomy',
};

const LEVER_LABELS: Record<Lever, string> = {
  fidelityRate: 'Signal Clarity',
  decisionCycle: 'Decision Speed',
  dci: 'Decision Rights',
  teamDecisionMix: 'Team Autonomy',
};

const PILLAR_ACCENT: Record<Pillar, string> = {
  fidelity: '#E05A1B',
  lag: '#E05A1B',
  autonomy: '#A8967A',
};

/** Format the ×N multiplier copy. Clamps extreme values sensibly. */
function multiplierCopy(multiplier: number): string {
  if (!isFinite(multiplier) || multiplier >= 20) {
    return 'by far the highest-impact lever at your current settings';
  }
  if (multiplier >= 1.5) {
    return `~${multiplier.toFixed(1)}× the composite impact of any other lever`;
  }
  return 'the highest-impact lever at your current settings';
}

/**
 * Diagnostic callout — always visible.
 *
 * Two modes:
 * - **Bottlenecked** (pillars spread by >2 points): names the weakest pillar and
 *   the highest-impact lever, framing it as a bottleneck to fix.
 * - **Balanced** (pillars within 2 points): acknowledges the balance and still
 *   points at the highest-impact lever for the next marginal move.
 *
 * Either way the copy ends with a prescriptive lever suggestion, so the user
 * never has to wonder where to push next.
 */
export function BindingPillarCallout() {
  const levels = useCompanyStore((s) => s.levels);
  const headcount = useCompanyStore((s) => s.headcount);
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);
  const decisionCycle = useCompanyStore((s) => s.decisionCycle);
  const dci = useCompanyStore((s) => s.dci);
  const teamDecisionMix = useCompanyStore((s) => s.teamDecisionMix);

  const binding = useMemo(
    () => findBindingPillar({ levels, headcount, fidelityRate, decisionCycle, dci, teamDecisionMix }),
    [levels, headcount, fidelityRate, decisionCycle, dci, teamDecisionMix]
  );

  const accent = binding.allTied ? '#A8967A' : PILLAR_ACCENT[binding.pillar];
  const pillarLabel = PILLAR_LABELS[binding.pillar];
  const leverLabel = LEVER_LABELS[binding.topLever];

  return (
    <div
      className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm"
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
      role="note"
      aria-label="Binding pillar diagnostic"
    >
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">
          {binding.allTied ? 'Balanced' : 'Binding Pillar'}
        </div>
        <div className="text-sm text-stone-900 leading-snug">
          {binding.allTied ? (
            <>
              All three pillars are balanced near{' '}
              <span className="font-mono tabular-nums font-semibold">
                {Math.round(binding.score)}
              </span>
              . Moving <span className="font-semibold">{leverLabel}</span> gives the biggest marginal gain from here.
            </>
          ) : (
            <>
              Your lowest pillar is{' '}
              <span className="font-semibold" style={{ color: accent }}>
                {pillarLabel}
              </span>{' '}
              at <span className="font-mono tabular-nums font-semibold">{Math.round(binding.score)}</span>.
              Moving <span className="font-semibold">{leverLabel}</span> has {multiplierCopy(binding.multiplier)}.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
