/**
 * Shared sensitivity engine — used by BindingPillarCallout and LeverExchangeRates.
 *
 * Grounds both features in the same math:
 *   composite = (fidelity + lag + autonomy) / 3
 *
 * The composite definition matches the "Composite" column in Cycle 5 H3's Amazon
 * blended-model table and Cycle 6 H1's elasticity analysis (evals/journal/).
 *
 * All pillar scores are read through `calcBlendedScores` so the teamDecisionMix
 * lever is honored.
 */

import { calcOrgMetrics } from './orgMetrics';
import { calcThermalLag } from './thermalLag';
import { calcLagHealth, scoreBand } from './healthScores';
import { calcAutonomyScore } from './autonomy';

export type Lever = 'fidelityRate' | 'decisionCycle' | 'dci' | 'teamDecisionMix';
export type Pillar = 'fidelity' | 'lag' | 'autonomy';

export interface SensitivityState {
  levels: number;
  headcount: number;
  fidelityRate: number;
  decisionCycle: number;
  dci: number;
  teamDecisionMix: number;
}

export interface PillarScores {
  fidelity: number;
  lag: number;
  autonomy: number;
  composite: number;
}

export interface LeverSensitivity {
  lever: Lever;
  dComposite: number;        // composite delta per +1 unit of lever (positive = better)
  atCap: boolean;            // lever is pinned at its upper/lower bound
}

export interface BindingPillarResult {
  pillar: Pillar;             // the lowest-scoring pillar (arbitrary tiebreak when allTied)
  score: number;              // pillar's current score
  gapToNext: number;          // points below the 2nd-lowest pillar
  topLever: Lever;            // the highest-impact lever *across all four*
  topLeverImpact: number;     // composite-points per +1 unit of topLever
  multiplier: number;         // topLever impact / 2nd-best lever impact
  allTied: boolean;           // all three pillars within 2 points of each other
}

export interface ExchangeRate {
  from: Lever;
  to: Lever;
  ratio: number; // +1 unit of `from` ≡ `ratio` units of `to`
}

/** +1 step used for finite-difference derivatives. One unit = one slider tick. */
const EPSILON = 1;

/**
 * Lever bounds — mirror the actual UI slider ranges in InputStrip.tsx.
 * Keep these in sync with the sliders so `atCap` detection matches what the
 * user can actually push with their hands.
 */
const LEVER_BOUNDS: Record<Lever, { min: number; max: number }> = {
  fidelityRate: { min: 50, max: 98 },
  decisionCycle: { min: 1, max: 14 },
  dci: { min: 0, max: 100 },
  teamDecisionMix: { min: 0, max: 100 },
};


/**
 * Compute all pillar scores + composite at a given state as continuous values.
 *
 * Mirrors the blend math in `calcBlendedScores` but skips the display-level
 * `Math.round` calls — rounding quantizes finite-difference derivatives and
 * can zero out real lever effects. For sensitivity analysis we need raw floats.
 */
export function computeScores(state: SensitivityState): PillarScores {
  const { levels, headcount, fidelityRate, decisionCycle, dci, teamDecisionMix } = state;
  const p = teamDecisionMix / 100;

  // Monolithic path — raw continuous values
  const monoMetrics = calcOrgMetrics(levels, headcount, fidelityRate);
  const monoFidelity = monoMetrics.fidelityAtTopPct;
  const monoLagResult = calcThermalLag(levels, decisionCycle);
  const monoLag = calcLagHealth(monoLagResult.totalDelay).score;
  const monoAutonomy = calcAutonomyScore(dci, levels).score;

  if (p === 0) {
    return {
      fidelity: monoFidelity,
      lag: monoLag,
      autonomy: monoAutonomy,
      composite: (monoFidelity + monoLag + monoAutonomy) / 3,
    };
  }

  // Team path — capped depth, halved cycle time
  const teamLevels = Math.min(levels, 2);
  const teamCycle = decisionCycle * 0.5;
  const teamMetrics = calcOrgMetrics(teamLevels, headcount, fidelityRate);
  const teamFidelity = teamMetrics.fidelityAtTopPct;
  const teamLagResult = calcThermalLag(teamLevels, teamCycle);
  const teamLag = calcLagHealth(teamLagResult.totalDelay).score;
  const teamAutonomy = calcAutonomyScore(dci, teamLevels).score;

  const fidelity = p * teamFidelity + (1 - p) * monoFidelity;
  const lag = p * teamLag + (1 - p) * monoLag;
  const autonomy = p * teamAutonomy + (1 - p) * monoAutonomy;

  return {
    fidelity,
    lag,
    autonomy,
    composite: (fidelity + lag + autonomy) / 3,
  };
}

/**
 * Perturb one lever by +EPSILON and return the delta composite.
 * For decisionCycle the lever is inverted: we measure composite improvement
 * from *reducing* cycle time by EPSILON (so dComposite is always "positive = better").
 */
export function calcLeverSensitivity(
  state: SensitivityState,
  lever: Lever
): LeverSensitivity {
  const baseline = computeScores(state).composite;
  const bounds = LEVER_BOUNDS[lever];

  // For cost-style levers (decisionCycle), perturb downward to keep "positive = better"
  const direction = lever === 'decisionCycle' ? -1 : 1;
  const current = state[lever];
  const perturbed = current + direction * EPSILON;

  // Check if perturbation is out of bounds
  const atCap = perturbed < bounds.min || perturbed > bounds.max;
  if (atCap) {
    return { lever, dComposite: 0, atCap: true };
  }

  const next = computeScores({ ...state, [lever]: perturbed }).composite;
  return {
    lever,
    dComposite: next - baseline,
    atCap: false,
  };
}

/**
 * Compute sensitivities for all four levers. Deterministic ordering.
 */
export function calcAllLeverSensitivities(state: SensitivityState): LeverSensitivity[] {
  return (['fidelityRate', 'decisionCycle', 'dci', 'teamDecisionMix'] as Lever[])
    .map((lever) => calcLeverSensitivity(state, lever));
}

/**
 * Identify the lowest-scoring pillar and the highest-impact lever across the
 * full set. The "binding pillar" framing is useful when scores are spread, but
 * the `topLever` field is always populated — the UI can keep the callout
 * visible and adapt its copy depending on `allTied`.
 *
 * topLever is computed across ALL four levers (not just the primary lever for
 * the lowest pillar) so the recommendation stays useful when a pillar is
 * capped. Example: Amazon's autonomy is the lowest pillar, but DCI is a dead
 * slider (team-path saturates at 100), so topLever correctly points at
 * fidelityRate or teamDecisionMix instead.
 */
export function findBindingPillar(state: SensitivityState): BindingPillarResult {
  const scores = computeScores(state);
  const pillarList: Array<{ pillar: Pillar; score: number }> = [
    { pillar: 'fidelity' as Pillar, score: scores.fidelity },
    { pillar: 'lag' as Pillar, score: scores.lag },
    { pillar: 'autonomy' as Pillar, score: scores.autonomy },
  ].sort((a, b) => a.score - b.score);

  const lowest = pillarList[0];
  const secondLowest = pillarList[1];
  const gapToNext = secondLowest.score - lowest.score;
  // Cycle 9 H2+H4: the binary rule `band(min) === band(mean)` is a strict
  // refinement of any numerical gap threshold. Cycle 9 proved `band(min) ≤
  // band(mean)` as a theorem (AM-min + band monotonicity), confirmed by
  // 10,000-triple Monte Carlo (0 upflips). Cycle 9 H2 cross-validated 4-of-6
  // band flips against the live `calcBlendedScores` path — including Amazon
  // (gap=8.0), which falls below any reasonable `gap ≥ 10` threshold but IS
  // caught by the band-crossing rule. Use the theorem-backed rule here.
  const allTied = scoreBand(lowest.score) === scoreBand(scores.composite);

  // Rank all four levers by absolute composite impact, high to low
  const sensitivities = calcAllLeverSensitivities(state);
  const ranked = [...sensitivities]
    .sort((a, b) => Math.abs(b.dComposite) - Math.abs(a.dComposite));

  const top = ranked[0];
  const runnerUp = ranked[1];
  const topImpact = Math.abs(top.dComposite);
  const runnerUpImpact = Math.abs(runnerUp?.dComposite ?? 0);
  const multiplier = runnerUpImpact > 0 ? topImpact / runnerUpImpact : Infinity;

  return {
    pillar: lowest.pillar,
    score: lowest.score,
    gapToNext,
    topLever: top.lever,
    topLeverImpact: top.dComposite,
    multiplier,
    allTied,
  };
}

/**
 * Pairwise exchange rates: "+1 unit of `from` ≡ N units of `to`"
 *
 * Returns three interesting pairs:
 *  1. fidelityRate ↔ teamDecisionMix (Cycle 6 H3's headline: "1 fidelity ≡ 2.5 mix")
 *  2. fidelityRate ↔ dci
 *  3. decisionCycle ↔ teamDecisionMix (days saved vs. routing)
 *
 * Ratios with a denominator near zero (a capped or inert lever) return Infinity
 * and should be hidden by the UI.
 */
export function calcExchangeRates(state: SensitivityState): ExchangeRate[] {
  const sensitivities = calcAllLeverSensitivities(state);
  const byLever: Record<Lever, number> = {
    fidelityRate: 0,
    decisionCycle: 0,
    dci: 0,
    teamDecisionMix: 0,
  };
  sensitivities.forEach((s) => {
    byLever[s.lever] = Math.abs(s.dComposite);
  });

  const pairs: Array<[Lever, Lever]> = [
    ['fidelityRate', 'teamDecisionMix'],
    ['fidelityRate', 'dci'],
    ['decisionCycle', 'teamDecisionMix'],
  ];

  return pairs.map(([from, to]) => {
    const fromImpact = byLever[from];
    const toImpact = byLever[to];
    const ratio = toImpact > 0 ? fromImpact / toImpact : Infinity;
    return { from, to, ratio };
  });
}
