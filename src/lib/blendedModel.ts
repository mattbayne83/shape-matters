import { calcOrgMetrics, SHANNON_BASE_SNR } from './orgMetrics';
import { calcThermalLag } from './thermalLag';
import { calcLagHealth } from './healthScores';
import { calcAutonomyScore } from './autonomy';
import type { BlendedScores } from '../types';

export interface ScenarioWeights {
  /** Composite weight on signal fidelity. Expected to sum to 1 across pillars (not enforced). */
  fidelity: number;
  /** Composite weight on decision latency health. */
  lag: number;
  /** Composite weight on autonomy. */
  autonomy: number;
}

export interface BlendedParams {
  levels: number;
  headcount: number;
  fidelityRate: number;
  decisionCycle: number;
  dci: number;
  teamDecisionMix: number; // 0-100
  /**
   * Optional CEO-flat Strategy model scenario weights. When the weights
   * indicate a strategy scenario (`fidelity >= STRATEGY_FIDELITY_THRESHOLD`)
   * AND the org is deep enough to hit the Shannon channel ceiling
   * (`levels >= L_STAR_STRATEGY`), the mono path's F and A are saturated to
   * 100 before blending — the minimum viable mechanism that breaks team-path
   * strategic dominance on both saturation pillars. `lag` is unaffected (the
   * CEO doesn't dodge propagation delay).
   *
   * Below `L_STAR_STRATEGY` the gate declines to apply the bonus even under
   * strategy weights (scenarioMode reports `'strategy-gated'`) — the channel
   * can still carry strategy messages at those depths without the CEO-flat
   * shortcut. Omitting `scenarioWeights` preserves pre-Cycle 10 Operational
   * behavior. Weights should sum to 1; not enforced.
   */
  scenarioWeights?: ScenarioWeights;
}

/** Strategy-mode scenario-weights threshold. `>=` so 0.5 exactly triggers. */
export const STRATEGY_FIDELITY_THRESHOLD = 0.5;

/**
 * Cycle 12 H3 scenario-typed SNR multiplier for strategy messages.
 *
 * Strategy-complexity messages carry more information per hop than operational
 * messages, so the effective channel SNR is *lower*: less headroom for noise,
 * faster per-hop decay. The 0.4 multiplier comes from the Cycle 12 H3 scenario
 * ladder (safety=2.0, customer=1.2, operations=1.0, innovation=0.6,
 * strategy=0.4) — see `evals/journal/cycle-012.md`.
 */
const STRATEGY_SNR_MULTIPLIER = 0.4;

/**
 * Expired-band threshold for end-to-end fidelity. 20% matches
 * `healthScores.ts` and Cycle 12 H3's Expired-band definition. Below this
 * retention, the channel has effectively collapsed.
 */
const EXPIRED_THRESHOLD = 0.20;

/**
 * Cycle 12 H3 structural gate: the shallowest depth at which the strategy
 * channel fails to carry a message above the Expired band.
 *
 * Derivation (Shannon Gaussian channel):
 *   SNR_strategy       = SHANNON_BASE_SNR × STRATEGY_SNR_MULTIPLIER
 *   r_strategy         = SNR / (1 + SNR)
 *   L*_strategy(float) = 1 + log(EXPIRED_THRESHOLD) / log(r_strategy)
 *   L_STAR_STRATEGY    = ceil(L*_strategy(float))   ≈ ceil(4.68) = 5
 *
 * The CEO-flat bonus fires only when `levels ≥ L_STAR_STRATEGY`. At shallower
 * depths the channel still carries strategy messages above the Expired floor,
 * so the bonus would be unjustified — and empirically would flip companies
 * like Haier (L=3) and Nucor (L=4) that are qualitatively decentralized and
 * should NOT be routed around via a CEO-flat saturation.
 *
 * Computed at module load from `SHANNON_BASE_SNR` so the constant chain stays
 * visible: change the Bartlett baseline or the strategy multiplier and
 * `L_STAR_STRATEGY` updates mechanically. See Cycle 12 H3 in
 * `evals/journal/cycle-012.md`.
 */
const STRATEGY_SNR = SHANNON_BASE_SNR * STRATEGY_SNR_MULTIPLIER;
const STRATEGY_R = STRATEGY_SNR / (1 + STRATEGY_SNR);
export const L_STAR_STRATEGY = Math.ceil(
  1 + Math.log(EXPIRED_THRESHOLD) / Math.log(STRATEGY_R),
);

export function calcBlendedScores(params: BlendedParams): BlendedScores {
  const {
    levels,
    headcount,
    fidelityRate,
    decisionCycle,
    dci,
    teamDecisionMix,
    scenarioWeights,
  } = params;
  const p = teamDecisionMix / 100;

  // Monolithic (full hierarchy) scores
  const monoMetrics = calcOrgMetrics(levels, headcount, fidelityRate);
  let monoFidelity = Math.round(monoMetrics.fidelityAtTopPct);
  const monoLagResult = calcThermalLag(levels, decisionCycle);
  const monoLag = calcLagHealth(monoLagResult.totalDelay).score;
  let monoAutonomy = calcAutonomyScore(dci, levels).score;

  // Cycle 12 H3 structural gate (replaces the Cycle 10 H1b unconditional
  // saturation). When the scenario is fidelity-weighted (Strategy), saturate
  // both mono F and mono A to 100 — BUT only when the org is at or past the
  // Shannon channel ceiling `L_STAR_STRATEGY`. At shallower depths the
  // channel still carries strategy messages above the Expired band, so the
  // CEO-flat shortcut is unjustified and would wrongly flip qualitatively
  // decentralized shallow orgs (Haier L=3, Nucor L=4) to mix=0 under strategy
  // weighting. See `evals/journal/cycle-012.md` H3.
  const strategyRequested =
    !!scenarioWeights &&
    scenarioWeights.fidelity >= STRATEGY_FIDELITY_THRESHOLD;
  let scenarioMode: BlendedScores['scenarioMode'] = 'operational';
  if (strategyRequested) {
    if (levels >= L_STAR_STRATEGY) {
      scenarioMode = 'strategy-applied';
      monoFidelity = 100;
      monoAutonomy = 100;
    } else {
      scenarioMode = 'strategy-gated';
    }
  }

  if (p === 0) {
    return {
      fidelity: monoFidelity,
      lag: monoLag,
      autonomy: monoAutonomy,
      isBlended: false,
      monoFidelity,
      monoLag,
      monoAutonomy,
      scenarioMode,
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

  return {
    fidelity,
    lag,
    autonomy,
    isBlended: true,
    monoFidelity,
    monoLag,
    monoAutonomy,
    scenarioMode,
  };
}
