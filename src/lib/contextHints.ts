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

export function decisionCycleHint(decisionCycle: number, levels: number): string {
  const totalDays = Math.round(decisionCycle * (levels - 1));
  let label: string;
  if (decisionCycle <= 2) label = 'Startup-fast';
  else if (decisionCycle <= 5) label = 'Moderate';
  else if (decisionCycle <= 10) label = 'Bureaucratic';
  else label = 'Glacial';
  return `${label} — ${totalDays}d CEO → front line`;
}

export function culturalAgilityHint(
  culturalAgility: number,
  settlingWeeks: number,
): string {
  const weeks = Math.round(settlingWeeks);
  let label: string;
  if (culturalAgility <= 20) label = 'Rigid';
  else if (culturalAgility <= 40) label = 'Resistant';
  else if (culturalAgility <= 60) label = 'Moderate';
  else if (culturalAgility <= 80) label = 'Adaptive';
  else label = 'Highly agile';
  return `${label} — settling time ~${weeks}wk`;
}
