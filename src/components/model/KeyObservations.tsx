import { useMemo } from 'react';
import type { Company } from '../../types';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { calcTriangleGeometry } from '../../lib/triangleGeometry';
import { SECTION_LABEL } from '../../lib/styles';

interface KeyObservationsProps {
  companies: Company[];
  fidelityRate: number;
}

export function KeyObservations({ companies, fidelityRate }: KeyObservationsProps) {
  const analysis = useMemo(() => {
    const metrics = companies.map((c) => ({
      ...c,
      metrics: calcOrgMetrics(c.levels, c.employees, fidelityRate),
      geo: calcTriangleGeometry(c.levels, c.employees, fidelityRate),
    }));
    const flattest = metrics.reduce((a, b) =>
      a.metrics.flatnessIndex > b.metrics.flatnessIndex ? a : b
    );
    const bestSignal = metrics.reduce((a, b) =>
      a.metrics.fidelityAtTopPct > b.metrics.fidelityAtTopPct ? a : b
    );
    const lowestManagerRatio = metrics.reduce((a, b) =>
      a.metrics.managerRatio < b.metrics.managerRatio ? a : b
    );
    // Filter to multi-level orgs for geometry comparisons
    const multiLevel = metrics.filter((m) => m.levels > 1);
    const mostAgile = multiLevel.length > 0
      ? multiLevel.reduce((a, b) => a.geo.agilityScore > b.geo.agilityScore ? a : b)
      : null;
    const mostDecentralized = multiLevel.length > 0
      ? multiLevel.reduce((a, b) => a.geo.decisionGravityRatio < b.geo.decisionGravityRatio ? a : b)
      : null;
    return { flattest, bestSignal, lowestManagerRatio, mostAgile, mostDecentralized };
  }, [companies, fidelityRate]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className={`${SECTION_LABEL} mb-3`}>
        Key Observations
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <div className="text-[11px] text-slate-500 mb-1">Flattest Structure</div>
          <div className="text-base font-extrabold" style={{ color: analysis.flattest.color }}>
            {analysis.flattest.name}
          </div>
          <div className="text-[11px] text-slate-500">
            Flatness: {analysis.flattest.metrics.flatnessIndex.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500 mb-1">Best Signal to Top</div>
          <div className="text-base font-extrabold" style={{ color: analysis.bestSignal.color }}>
            {analysis.bestSignal.name}
          </div>
          <div className="text-[11px] text-slate-500">
            {analysis.bestSignal.metrics.fidelityAtTopPct.toFixed(1)}% fidelity
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500 mb-1">Leanest Management</div>
          <div className="text-base font-extrabold" style={{ color: analysis.lowestManagerRatio.color }}>
            {analysis.lowestManagerRatio.name}
          </div>
          <div className="text-[11px] text-slate-500">
            {analysis.lowestManagerRatio.metrics.managerRatio.toFixed(1)}% managers
          </div>
        </div>
        {analysis.mostAgile && (
          <div>
            <div className="text-[11px] text-slate-500 mb-1">Highest Agility</div>
            <div className="text-base font-extrabold" style={{ color: analysis.mostAgile.color }}>
              {analysis.mostAgile.name}
            </div>
            <div className="text-[11px] text-slate-500">
              Score: {analysis.mostAgile.geo.agilityScore.toFixed(3)}
            </div>
          </div>
        )}
        {analysis.mostDecentralized && (
          <div>
            <div className="text-[11px] text-slate-500 mb-1">Most Decentralized</div>
            <div className="text-base font-extrabold" style={{ color: analysis.mostDecentralized.color }}>
              {analysis.mostDecentralized.name}
            </div>
            <div className="text-[11px] text-slate-500">
              Gravity: {analysis.mostDecentralized.geo.decisionGravityRatio.toFixed(3)}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-slate-500 leading-relaxed border-t border-slate-200 pt-3">
        <strong className="text-amber-600">Note:</strong> Organizational levels are often ambiguous —
        different counting methods produce different numbers. The model uses "levels from CEO to
        frontline IC" consistently across all companies.
      </div>
    </div>
  );
}
