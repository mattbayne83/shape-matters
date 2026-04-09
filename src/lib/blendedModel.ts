import { calcOrgMetrics } from './orgMetrics';
import { calcThermalLag } from './thermalLag';
import { calcLagHealth } from './healthScores';
import { calcAutonomyScore } from './autonomy';
import type { BlendedScores } from '../types';

interface BlendedParams {
  levels: number;
  headcount: number;
  fidelityRate: number;
  decisionCycle: number;
  dci: number;
  teamDecisionMix: number; // 0-100
}

export function calcBlendedScores(params: BlendedParams): BlendedScores {
  const { levels, headcount, fidelityRate, decisionCycle, dci, teamDecisionMix } = params;
  const p = teamDecisionMix / 100;

  // Monolithic (full hierarchy) scores
  const monoMetrics = calcOrgMetrics(levels, headcount, fidelityRate);
  const monoFidelity = Math.round(monoMetrics.fidelityAtTopPct);
  const monoLagResult = calcThermalLag(levels, decisionCycle);
  const monoLag = calcLagHealth(monoLagResult.totalDelay).score;
  const monoAutonomy = calcAutonomyScore(dci, levels).score;

  if (p === 0) {
    return {
      fidelity: monoFidelity,
      lag: monoLag,
      autonomy: monoAutonomy,
      isBlended: false,
      monoFidelity,
      monoLag,
      monoAutonomy,
    };
  }

  // Team path: capped depth, halved decision cycle
  const teamLevels = Math.min(levels, 2);
  const teamCycle = decisionCycle * 0.5;

  const teamMetrics = calcOrgMetrics(teamLevels, headcount, fidelityRate);
  const teamFidelity = Math.round(teamMetrics.fidelityAtTopPct);
  const teamLagResult = calcThermalLag(teamLevels, teamCycle);
  const teamLag = calcLagHealth(teamLagResult.totalDelay).score;
  const teamAutonomy = calcAutonomyScore(dci, teamLevels).score;

  // Blend: p × team + (1-p) × mono
  const fidelity = Math.round(p * teamFidelity + (1 - p) * monoFidelity);
  const lag = Math.round(p * teamLag + (1 - p) * monoLag);
  const autonomy = Math.round(p * teamAutonomy + (1 - p) * monoAutonomy);

  return { fidelity, lag, autonomy, isBlended: true, monoFidelity, monoLag, monoAutonomy };
}
