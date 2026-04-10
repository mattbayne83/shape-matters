import { useMemo } from 'react';
import { useCompanyStore } from '../../store/useCompanyStore';
import { calcExchangeRates, type Lever } from '../../lib/sensitivity';

const LEVER_SHORT: Record<Lever, string> = {
  fidelityRate: 'Signal Clarity',
  decisionCycle: 'Decision Speed',
  dci: 'Decision Rights',
  teamDecisionMix: 'Team Autonomy',
};

const LEVER_UNIT: Record<Lever, string> = {
  fidelityRate: 'pt',
  decisionCycle: 'day',
  dci: 'pt',
  teamDecisionMix: 'pt',
};

/** Format a ratio sanely — hide when a lever is effectively inert (ratio=0 or ∞). */
function formatRatio(ratio: number): string | null {
  if (!isFinite(ratio) || ratio === 0) return null;
  if (ratio >= 100 || ratio < 0.01) return null;
  if (ratio >= 10) return ratio.toFixed(0);
  return ratio.toFixed(1);
}

/**
 * Lever Exchange Rates panel — a compact row of pairwise substitution ratios
 * computed from the current state's composite-health sensitivities.
 *
 * Reads like: "+1 Signal Clarity ≡ +2.5 Team Autonomy"
 *
 * Meant to sit above or inside the What-If panel. Users can see which lever is
 * the highest-leverage investment at their current settings.
 */
export function LeverExchangeRates() {
  const levels = useCompanyStore((s) => s.levels);
  const headcount = useCompanyStore((s) => s.headcount);
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);
  const decisionCycle = useCompanyStore((s) => s.decisionCycle);
  const dci = useCompanyStore((s) => s.dci);
  const teamDecisionMix = useCompanyStore((s) => s.teamDecisionMix);

  const rates = useMemo(
    () => calcExchangeRates({ levels, headcount, fidelityRate, decisionCycle, dci, teamDecisionMix }),
    [levels, headcount, fidelityRate, decisionCycle, dci, teamDecisionMix]
  );

  const visible = rates
    .map((r) => ({ ...r, formatted: formatRatio(r.ratio) }))
    .filter((r): r is typeof r & { formatted: string } => r.formatted !== null);

  if (visible.length === 0) return null;

  // Any rate involving Team Autonomy (teamDecisionMix) is a commitment lever, not
  // a tradeoff — Cycle 7 H3 proved the team path strictly dominates, so higher is
  // always better. Show the caveat only when at least one rate references it.
  const hasTeamAutonomy = visible.some((r) => r.from === 'teamDecisionMix' || r.to === 'teamDecisionMix');

  return (
    <div className="bg-white border border-stone-200 rounded-xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm">
      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
        Lever Exchange Rates
      </div>
      <div className="text-[11px] text-stone-500 mb-2.5 leading-snug">
        Equivalent composite-health improvements at your current settings.
      </div>
      <div className="flex flex-col gap-1.5">
        {visible.map((rate) => {
          const fromVerb = rate.from === 'decisionCycle' ? '−1' : '+1';
          const fromUnit = LEVER_UNIT[rate.from];
          const toUnit = LEVER_UNIT[rate.to];
          return (
            <div
              key={`${rate.from}-${rate.to}`}
              className="flex items-center gap-2 text-xs text-stone-700"
            >
              <span className="font-mono tabular-nums font-semibold text-stone-900 shrink-0">
                {fromVerb} {fromUnit}
              </span>
              <span className="text-stone-600 truncate">{LEVER_SHORT[rate.from]}</span>
              <span className="text-stone-400 px-1">≡</span>
              <span className="font-mono tabular-nums font-semibold text-ember shrink-0">
                +{rate.formatted} {toUnit}
              </span>
              <span className="text-stone-600 truncate">{LEVER_SHORT[rate.to]}</span>
            </div>
          );
        })}
      </div>
      {hasTeamAutonomy && (
        <div className="mt-2.5 pt-2 border-t border-stone-100 text-[10px] text-stone-500 leading-snug">
          Note: <span className="font-semibold text-stone-700">Team Autonomy</span> is a commitment lever,
          not a tradeoff — the model says higher is always better. The real-world limit is governance feasibility.
        </div>
      )}
    </div>
  );
}
