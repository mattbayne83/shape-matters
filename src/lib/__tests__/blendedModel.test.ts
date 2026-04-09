import { describe, it, expect } from 'vitest';
import { calcBlendedScores } from '../blendedModel';
import { calcOrgMetrics } from '../orgMetrics';
import { calcThermalLag } from '../thermalLag';
import { calcLagHealth } from '../healthScores';
import { calcAutonomyScore } from '../autonomy';

const BASE_PARAMS = {
  levels: 6,
  headcount: 5000,
  fidelityRate: 82,
  decisionCycle: 3,
  dci: 50,
};

describe('calcBlendedScores', () => {
  it('mix=0 returns monolithic scores with isBlended=false', () => {
    const result = calcBlendedScores({ ...BASE_PARAMS, teamDecisionMix: 0 });

    const monoMetrics = calcOrgMetrics(6, 5000, 82);
    const monoLagResult = calcThermalLag(6, 3);

    expect(result.isBlended).toBe(false);
    expect(result.fidelity).toBe(Math.round(monoMetrics.fidelityAtTopPct));
    expect(result.lag).toBe(calcLagHealth(monoLagResult.totalDelay).score);
    expect(result.autonomy).toBe(calcAutonomyScore(50, 6).score);

    // mono fields match blended fields when mix=0
    expect(result.monoFidelity).toBe(result.fidelity);
    expect(result.monoLag).toBe(result.lag);
    expect(result.monoAutonomy).toBe(result.autonomy);
  });

  it('mix=100 returns pure team-path scores', () => {
    const result = calcBlendedScores({ ...BASE_PARAMS, teamDecisionMix: 100 });

    const teamLevels = Math.min(6, 2);
    const teamCycle = 3 * 0.5;

    const teamMetrics = calcOrgMetrics(teamLevels, 5000, 82);
    const teamLagResult = calcThermalLag(teamLevels, teamCycle);

    expect(result.isBlended).toBe(true);
    expect(result.fidelity).toBe(Math.round(teamMetrics.fidelityAtTopPct));
    expect(result.lag).toBe(calcLagHealth(teamLagResult.totalDelay).score);
    expect(result.autonomy).toBe(calcAutonomyScore(50, teamLevels).score);
  });

  it('mix=70 with Amazon params: lag health significantly higher than monolithic', () => {
    const amazonParams = {
      levels: 9,
      headcount: 1556000,
      fidelityRate: 82,
      decisionCycle: 3,
      dci: 72,
      teamDecisionMix: 70,
    };
    const result = calcBlendedScores(amazonParams);

    // Monolithic lag for L=9, d=3: delay = 3 * 8^2 = 192 days → health ≈ 15
    // Team lag for L=2, d=1.5: delay = 1.5 * 1^2 = 1.5 days → health ≈ 99
    // Blended at 70%: ~0.7*99 + 0.3*15 ≈ 74
    expect(result.lag).toBeGreaterThan(result.monoLag + 20);
    expect(result.lag).toBeGreaterThan(50); // significantly better than monolithic ~15
    expect(result.monoLag).toBeLessThan(25);
  });

  it('L=1 org: blended scores equal monolithic regardless of mix', () => {
    const params = {
      levels: 1,
      headcount: 10,
      fidelityRate: 90,
      decisionCycle: 2,
      dci: 80,
      teamDecisionMix: 70,
    };
    const result = calcBlendedScores(params);
    const resultZero = calcBlendedScores({ ...params, teamDecisionMix: 0 });

    // L_team = min(1, 2) = 1, same as L=1 mono
    // Fidelity: r^(0) = 100 for both paths
    // Autonomy: levels=1 → depthDiscount=1 for both
    // Only lag differs because teamCycle = d*0.5
    // But at L=1, delay = d*(1-1)^2 = 0 for both → lag health = 100 for both
    expect(result.fidelity).toBe(resultZero.fidelity);
    expect(result.lag).toBe(resultZero.lag);
    expect(result.autonomy).toBe(resultZero.autonomy);
  });

  it('L=2 org: team path matches mono on fidelity and autonomy, differs only on lag cycle', () => {
    const params = {
      levels: 2,
      headcount: 100,
      fidelityRate: 85,
      decisionCycle: 4,
      dci: 60,
      teamDecisionMix: 50,
    };
    const result = calcBlendedScores(params);

    // L_team = min(2,2) = 2, same as L=2 mono
    // Fidelity: same for both paths (same levels, same rate)
    // Autonomy: same for both paths (same levels, same DCI)
    const monoFidelity = Math.round(calcOrgMetrics(2, 100, 85).fidelityAtTopPct);
    expect(result.fidelity).toBe(monoFidelity);

    const monoAutonomy = calcAutonomyScore(60, 2).score;
    expect(result.autonomy).toBe(monoAutonomy);

    // Lag differs because team uses d*0.5
    // Mono delay: 4 * 1 = 4, team delay: 2 * 1 = 2
    // Mono health: 100*e^(-4/100) ≈ 96, team health: 100*e^(-2/100) ≈ 98
    // Blended at 50%: (96+98)/2 ≈ 97
    expect(result.lag).toBeGreaterThanOrEqual(result.monoLag);
  });

  it('all scores stay in 0-100 range', () => {
    const extremes = [
      { levels: 1, headcount: 1, fidelityRate: 100, decisionCycle: 0, dci: 100, teamDecisionMix: 100 },
      { levels: 15, headcount: 10000000, fidelityRate: 50, decisionCycle: 30, dci: 0, teamDecisionMix: 50 },
      { levels: 3, headcount: 50, fidelityRate: 99, decisionCycle: 1, dci: 100, teamDecisionMix: 100 },
    ];

    for (const params of extremes) {
      const result = calcBlendedScores(params);
      expect(result.fidelity).toBeGreaterThanOrEqual(0);
      expect(result.fidelity).toBeLessThanOrEqual(100);
      expect(result.lag).toBeGreaterThanOrEqual(0);
      expect(result.lag).toBeLessThanOrEqual(100);
      expect(result.autonomy).toBeGreaterThanOrEqual(0);
      expect(result.autonomy).toBeLessThanOrEqual(100);
    }
  });

  it('mono fields always contain unblended values', () => {
    const mixes = [0, 30, 50, 70, 100];
    const monoMetrics = calcOrgMetrics(BASE_PARAMS.levels, BASE_PARAMS.headcount, BASE_PARAMS.fidelityRate);
    const monoLagResult = calcThermalLag(BASE_PARAMS.levels, BASE_PARAMS.decisionCycle);
    const expectedMonoFidelity = Math.round(monoMetrics.fidelityAtTopPct);
    const expectedMonoLag = calcLagHealth(monoLagResult.totalDelay).score;
    const expectedMonoAutonomy = calcAutonomyScore(BASE_PARAMS.dci, BASE_PARAMS.levels).score;

    for (const mix of mixes) {
      const result = calcBlendedScores({ ...BASE_PARAMS, teamDecisionMix: mix });
      expect(result.monoFidelity).toBe(expectedMonoFidelity);
      expect(result.monoLag).toBe(expectedMonoLag);
      expect(result.monoAutonomy).toBe(expectedMonoAutonomy);
    }
  });

  it('increasing mix monotonically improves lag health for deep orgs', () => {
    const deepParams = { levels: 9, headcount: 100000, fidelityRate: 82, decisionCycle: 5, dci: 50 };
    let prevLag = -1;
    for (const mix of [0, 25, 50, 75, 100]) {
      const result = calcBlendedScores({ ...deepParams, teamDecisionMix: mix });
      expect(result.lag).toBeGreaterThanOrEqual(prevLag);
      prevLag = result.lag;
    }
  });
});
