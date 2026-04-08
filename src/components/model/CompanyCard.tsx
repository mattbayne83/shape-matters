import { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import type { Company } from '../../types';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { fidelityColor } from '../../lib/fidelityColor';
import { SECTION_LABEL } from '../../lib/styles';
import { LayerDiagram } from './LayerDiagram';

interface CompanyCardProps {
  company: Company;
  fidelityRate: number;
}

export function CompanyCard({ company, fidelityRate }: CompanyCardProps) {
  const m = useMemo(
    () => calcOrgMetrics(company.levels, company.employees, fidelityRate),
    [company.levels, company.employees, fidelityRate]
  );
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 flex-1 min-w-[220px] hover:shadow-lg hover:shadow-stone-200/50 hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-1">
        <div className="text-sm font-bold text-stone-900">
          {company.name}
        </div>
        <span className="text-[10px] text-stone-500">{company.era}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>
          <div className="text-[10px] text-stone-500 uppercase">Levels</div>
          <div className="text-xl font-bold text-stone-900 font-mono tabular-nums">{company.levels}</div>
        </div>
        <div>
          <div className="text-[10px] text-stone-500 uppercase">Employees</div>
          <div className="text-xl font-bold text-stone-900 font-mono tabular-nums">
            {company.employees >= 1000000
              ? `${(company.employees / 1000000).toFixed(1)}M`
              : company.employees >= 1000
                ? `${(company.employees / 1000).toFixed(1)}k`
                : company.employees}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-stone-500 uppercase">Avg Span</div>
          <div className="text-xl font-bold text-stone-900 font-mono tabular-nums">{m.avgSpan.toFixed(1)}</div>
        </div>
        <div>
          <div className="text-[10px] text-stone-500 uppercase">Flatness</div>
          <div className="text-xl font-bold font-mono tabular-nums text-stone-900">
            {m.flatnessIndex.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200 pt-3 mb-3">
        <div className={`${SECTION_LABEL} mb-2`}>
          Fidelity
        </div>
        <div className="flex items-baseline justify-between mb-1">
          <div className="text-[10px] text-stone-500">Up (IC → CEO)</div>
          <div
            className="text-lg font-bold font-mono tabular-nums"
            style={{ color: fidelityColor(m.fidelityAtTopPct) }}
          >
            {m.fidelityAtTopPct.toFixed(1)}%
          </div>
        </div>
        <LayerDiagram levels={company.levels} fidelityRate={fidelityRate} compact />
        <div className="flex items-baseline justify-between mt-1">
          <div className="text-[10px] text-stone-500">Round-trip ({m.roundTripLayers} relays)</div>
          <div
            className="text-sm font-bold font-mono"
            style={{ color: fidelityColor(m.roundTripFidelity) }}
          >
            {m.roundTripFidelity.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200 pt-3">
        <div className={`${SECTION_LABEL} mb-2`}>
          Structure
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[10px] text-stone-500">Manager Ratio</div>
            <div className="text-lg font-bold text-stone-900 font-mono tabular-nums">
              {m.managerRatio.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-stone-500">ICs (Doers)</div>
            <div className="text-lg font-bold text-stone-600 font-mono tabular-nums">
              {m.icCount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {company.narrative && (
        <div className="text-xs text-stone-700 font-medium mt-3 leading-relaxed">
          {company.narrative}
        </div>
      )}

      <div className="text-[10px] text-stone-500 mt-2 italic">{company.notes}</div>

      {company.source && (
        <div className="mt-2 pt-2 border-t border-stone-100 flex items-center gap-1">
          {company.sourceUrl ? (
            <a
              href={company.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-0.5"
            >
              {company.source}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ) : (
            <span className="text-[10px] text-stone-500">{company.source}</span>
          )}
        </div>
      )}
    </div>
  );
}
