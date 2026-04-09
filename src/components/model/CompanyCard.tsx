import { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import type { Company } from '../../types';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { calcThermalLag } from '../../lib/thermalLag';
import { calcLagHealth, healthBandColor } from '../../lib/healthScores';
import { calcAutonomyScore } from '../../lib/autonomy';
import { fidelityColor } from '../../lib/fidelityColor';
import { MiniEQ } from './MiniEQ';

const formatEmployees = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`
  : String(n);

interface CompanyCardProps {
  company: Company;
  fidelityRate: number;
}

export function CompanyCard({ company, fidelityRate }: CompanyCardProps) {
  const m = useMemo(
    () => calcOrgMetrics(company.levels, company.employees, fidelityRate),
    [company.levels, company.employees, fidelityRate],
  );

  const fidelityScore = Math.round(m.fidelityAtTopPct);

  const lagScore = useMemo(() => {
    const delay = calcThermalLag(company.levels, company.decisionCycle ?? 3).totalDelay;
    return calcLagHealth(delay).score;
  }, [company.levels, company.decisionCycle]);

  const autonomyScore = useMemo(
    () => calcAutonomyScore(company.dci ?? 50, company.levels).score,
    [company.dci, company.levels],
  );

  const pillars = [
    { label: 'Fidelity', score: fidelityScore },
    { label: 'Latency', score: lagScore },
    { label: 'Autonomy', score: autonomyScore },
  ];

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 hover:shadow-lg hover:shadow-stone-200/50 hover:-translate-y-1 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="text-sm font-bold text-stone-900">{company.name}</div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            {company.levels} {company.levels === 1 ? 'level' : 'levels'} · {formatEmployees(company.employees)} employees · {company.industry}
          </div>
        </div>
        <span className="text-[10px] text-stone-400 shrink-0">{company.era}</span>
      </div>

      {/* Pillar strip */}
      <div className="flex gap-1.5 my-3">
        {pillars.map((p) => (
          <div
            key={p.label}
            className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-1.5 py-2"
          >
            <div className="text-[8px] font-bold uppercase tracking-wide text-stone-400 text-center mb-1.5">
              {p.label}
            </div>
            <div className="flex items-center justify-center gap-2">
              <span
                className="text-2xl font-extrabold font-mono tabular-nums leading-none"
                style={{ color: healthBandColor(p.score) }}
              >
                {p.score}
              </span>
              <MiniEQ score={p.score} />
            </div>
          </div>
        ))}
      </div>

      {/* Punchline stat */}
      <div className="flex items-baseline justify-between px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg mb-3">
        <span className="text-[10px] text-stone-500">Round-trip fidelity</span>
        <span
          className="text-sm font-bold font-mono tabular-nums"
          style={{ color: fidelityColor(m.roundTripFidelity) }}
        >
          {m.roundTripFidelity.toFixed(1)}%
        </span>
      </div>

      {/* Narrative */}
      {company.narrative && (
        <p className="text-[11px] text-stone-600 leading-relaxed mb-2">
          {company.narrative}
        </p>
      )}

      {/* Source */}
      {company.source && (
        <div className="pt-2 border-t border-stone-100">
          {company.sourceUrl ? (
            <a
              href={company.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-0.5"
            >
              {company.source}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ) : (
            <span className="text-[10px] text-stone-400">{company.source}</span>
          )}
        </div>
      )}
    </div>
  );
}
