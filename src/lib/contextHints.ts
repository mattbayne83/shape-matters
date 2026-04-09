/**
 * Pure functions returning dynamic context hints for each slider.
 * Each hint mixes a factual comparison with a derived data point.
 */

export function orgSizeHint(
  headcount: number,
  avgSpan: number,
  managerRatio?: number,
): string {
  const spanRounded = Math.round(avgSpan);
  if (headcount < 100) return 'Startup — everyone knows everyone';
  if (headcount < 500) return `Small — ~1 manager per ${spanRounded} people`;
  if (headcount <= 5_000) return `Mid-size — ~1 manager per ${spanRounded} people`;
  const pct = Math.round(managerRatio ?? 0);
  if (headcount <= 50_000) return `Large — ${pct}% management overhead`;
  return `Mega-corp — ${pct}% management overhead`;
}

export function fidelityHint(fidelityRate: number): string {
  const loss = 100 - fidelityRate;
  if (fidelityRate < 65) return `Low — ${loss}% signal lost per hop`;
  if (fidelityRate < 80) return `Below average — ${loss}% signal lost per hop`;
  if (fidelityRate <= 85) return `Typical — ${loss}% signal lost per hop`;
  if (fidelityRate <= 92) return `High — only ${loss}% lost per hop`;
  return 'Exceptional — near-lossless relay';
}

export function teamMixHint(mix: number): string {
  if (mix === 0) return 'Fully hierarchical';
  if (mix <= 20) return 'Mostly escalated';
  if (mix <= 40) return 'Centralized';
  if (mix <= 60) return 'Hybrid';
  if (mix <= 80) return 'Team-first';
  return 'Fully autonomous';
}

export function decisionCycleHint(decisionCycle: number, levels: number): string {
  if (levels <= 1) return 'Flat — no relay layers';
  const totalDays = Math.round(decisionCycle * (levels - 1));
  let label: string;
  if (decisionCycle <= 2) label = 'Startup-fast';
  else if (decisionCycle <= 5) label = 'Moderate';
  else if (decisionCycle <= 10) label = 'Bureaucratic';
  else label = 'Glacial';
  return `${label} — ${totalDays}d CEO → front line`;
}
