import type { OrgMetrics } from '../types';

export function calcOrgMetrics(
  levels: number,
  employees: number,
  fidelityRate: number
): OrgMetrics {
  const avgSpan = Math.pow(employees, 1 / levels);
  const flatnessIndex = avgSpan / levels;
  const fidelityAtTopPct = Math.pow(fidelityRate / 100, levels - 1) * 100;
  const roundTripLayers = (levels - 1) * 2;
  const roundTripFidelity = Math.pow(fidelityRate / 100, roundTripLayers) * 100;

  const managersEstimate = Array.from({ length: levels - 1 }, (_, i) =>
    Math.round(employees / Math.pow(avgSpan, i + 1))
  ).reduce((a, b) => a + b, 0);

  const managerRatio = (managersEstimate / employees) * 100;
  const icCount = employees - managersEstimate;

  // Axios HQ reported ~$10k/employee loss on average.
  // We model this as a function of the organization's signal degradation.
  // The deeper the org, the more of that $10,140 gets wasted.
  const signalLossPct = 1 - (roundTripFidelity / 100);
  const annualCommLoss = employees * 10140 * signalLossPct;

  return {
    avgSpan,
    flatnessIndex,
    fidelityAtTopPct,
    roundTripFidelity,
    roundTripLayers,
    managersEstimate,
    managerRatio,
    icCount,
    annualCommLoss,
    levels,
    employees,
  };
}
