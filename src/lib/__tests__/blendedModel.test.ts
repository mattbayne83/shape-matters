import { describe, it, expect } from 'vitest';
import { calcBlendedScores, L_STAR_STRATEGY } from '../blendedModel';
import { calcOrgMetrics } from '../orgMetrics';
import { calcThermalLag } from '../thermalLag';
import { calcLagHealth } from '../healthScores';
import { calcAutonomyScore } from '../autonomy';
import { REFERENCE_COMPANIES } from '../../data/referenceCompanies';

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

// ── Cycle 10 H1b: CEO-flat Strategy bonus ─────────────────────────────
//
// The original 6 reference companies from Cycle 10's journal. Each gets
// swept across teamDecisionMix ∈ [0, 100] step 10 and we check the argmax
// under two scenario weight profiles:
//   - Operational (F=0.30, L=0.35, A=0.35) → optimum should stay at mix=100
//   - Strategy    (F=0.55, L=0.10, A=0.35) → optimum should flip to mix=0
//     under the CEO-flat saturation (Cycle 10 H1b Table, kF=∞, kA=∞).
interface RefCompany {
  id: string;
  levels: number;
  headcount: number;
  fidelityRate: number;
  decisionCycle: number;
  dci: number;
}

const CYCLE_10_COMPANIES: RefCompany[] = [
  { id: 'valve',  levels: 1, headcount: 350,     fidelityRate: 82, decisionCycle: 1.5, dci: 92 },
  { id: 'nucor',  levels: 4, headcount: 32700,   fidelityRate: 82, decisionCycle: 2,   dci: 82 },
  { id: 'google', levels: 8, headcount: 183323,  fidelityRate: 82, decisionCycle: 3.5, dci: 58 },
  { id: 'meta',   levels: 6, headcount: 74067,   fidelityRate: 82, decisionCycle: 2.5, dci: 35 }, // Cycle 12 H10 recalibration (was 28)
  { id: 'haier',  levels: 3, headcount: 75000,   fidelityRate: 82, decisionCycle: 1,   dci: 88 },
  { id: 'amazon', levels: 9, headcount: 1556000, fidelityRate: 82, decisionCycle: 3,   dci: 72 },
];

const OPERATIONAL_WEIGHTS = { fidelity: 0.30, lag: 0.35, autonomy: 0.35 };
const STRATEGY_WEIGHTS    = { fidelity: 0.55, lag: 0.10, autonomy: 0.35 };

function weightedComposite(
  scores: { fidelity: number; lag: number; autonomy: number },
  w: { fidelity: number; lag: number; autonomy: number }
): number {
  return w.fidelity * scores.fidelity + w.lag * scores.lag + w.autonomy * scores.autonomy;
}

function sweepOptimalMix(
  company: RefCompany,
  weights: { fidelity: number; lag: number; autonomy: number },
  scenarioWeights?: { fidelity: number; lag: number; autonomy: number },
): { mix: number; score: number } {
  let best = { mix: 0, score: -Infinity };
  for (let mix = 0; mix <= 100; mix += 10) {
    const r = calcBlendedScores({
      levels: company.levels,
      headcount: company.headcount,
      fidelityRate: company.fidelityRate,
      decisionCycle: company.decisionCycle,
      dci: company.dci,
      teamDecisionMix: mix,
      scenarioWeights,
    });
    const score = weightedComposite(r, weights);
    if (score > best.score) best = { mix, score };
  }
  return best;
}

describe('scenarioWeights — CEO-flat Strategy bonus (Cycle 10 H1b)', () => {
  // ── Backward compatibility ────────────────────────────────────────
  describe('backward compat: no scenarioWeights matches pre-Cycle 10 behavior', () => {
    const fixtures = [
      { levels: 6, headcount: 5000, fidelityRate: 82, decisionCycle: 3, dci: 50, teamDecisionMix: 50 },
      { levels: 9, headcount: 1556000, fidelityRate: 82, decisionCycle: 3, dci: 72, teamDecisionMix: 70 },
      { levels: 3, headcount: 75000, fidelityRate: 82, decisionCycle: 1, dci: 88, teamDecisionMix: 80 },
    ];

    for (const fx of fixtures) {
      it(`L=${fx.levels} dci=${fx.dci} mix=${fx.teamDecisionMix} has scenarioMode='operational' and no bonus`, () => {
        const r = calcBlendedScores(fx);
        expect(r.scenarioMode).toBe('operational');

        // Recompute expected raw mono scores — the bonus should NOT be applied.
        const monoMetrics = calcOrgMetrics(fx.levels, fx.headcount, fx.fidelityRate);
        const expectedMonoF = Math.round(monoMetrics.fidelityAtTopPct);
        const expectedMonoA = calcAutonomyScore(fx.dci, fx.levels).score;
        expect(r.monoFidelity).toBe(expectedMonoF);
        expect(r.monoAutonomy).toBe(expectedMonoA);
      });
    }

    it('omitting scenarioWeights returns identical output to explicit operational weights below threshold', () => {
      const base = { levels: 8, headcount: 183323, fidelityRate: 82, decisionCycle: 3.5, dci: 58, teamDecisionMix: 50 };
      const a = calcBlendedScores(base);
      const b = calcBlendedScores({ ...base, scenarioWeights: OPERATIONAL_WEIGHTS });
      expect(a.fidelity).toBe(b.fidelity);
      expect(a.lag).toBe(b.lag);
      expect(a.autonomy).toBe(b.autonomy);
      expect(a.monoFidelity).toBe(b.monoFidelity);
      expect(a.monoAutonomy).toBe(b.monoAutonomy);
    });
  });

  // ── Operational scenario: team path stays dominant ────────────────
  it('Operational scenario: optimum stays at mix=100 for all 6 reference companies', () => {
    for (const c of CYCLE_10_COMPANIES) {
      const op = sweepOptimalMix(c, OPERATIONAL_WEIGHTS, OPERATIONAL_WEIGHTS);
      // Valve (L=1) is a degenerate case: teamLevels = min(1,2) = 1, so mono and
      // team paths are identical and every mix scores equally. argmax returns
      // the first max encountered in the sweep (mix=0) by strict `>` comparison.
      if (c.id === 'valve') {
        expect(op.mix).toBe(0);
      } else {
        expect(op.mix).toBe(100);
      }
    }
  });

  // ── Strategy scenario under the Cycle 12 H3 structural gate ──
  //
  // Split from the original Cycle 10 "all 6 flip" assertion. Under the H3
  // structural gate, only companies with `levels ≥ L_STAR_STRATEGY` (5) get
  // the CEO-flat saturation. Of the legacy Cycle 10 sextet:
  //   - Valve  (L=1) — gate blocks; also degenerate (teamLevels === monoLevels)
  //   - Haier  (L=3) — gate blocks; optimum stays at team-path (mix=100)
  //   - Nucor  (L=4) — gate blocks; optimum stays at team-path (mix=100)
  //   - Meta   (L=6) — gate fires; optimum flips to mix=0
  //   - Google (L=8) — gate fires; optimum flips to mix=0
  //   - Amazon (L=9) — gate fires; optimum flips to mix=0
  it('Strategy scenario + H3 gate: L ≥ L_STAR_STRATEGY companies flip to mix=0', () => {
    const deep = CYCLE_10_COMPANIES.filter((c) => c.levels >= L_STAR_STRATEGY);
    expect(deep.map((c) => c.id)).toEqual(['google', 'meta', 'amazon']);
    for (const c of deep) {
      const st = sweepOptimalMix(c, STRATEGY_WEIGHTS, STRATEGY_WEIGHTS);
      expect(st.mix, `${c.id} should flip to mix=0 under Strategy`).toBe(0);
    }
  });

  it('Strategy scenario + H3 gate: L < L_STAR_STRATEGY companies do NOT flip', () => {
    const shallow = CYCLE_10_COMPANIES.filter((c) => c.levels < L_STAR_STRATEGY);
    expect(shallow.map((c) => c.id)).toEqual(['valve', 'nucor', 'haier']);
    for (const c of shallow) {
      const st = sweepOptimalMix(c, STRATEGY_WEIGHTS, STRATEGY_WEIGHTS);
      // Valve is degenerate (teamLevels === monoLevels === 1 when L=1), so its
      // sweep argmax lands at the first max (mix=0). Non-degenerate shallow
      // orgs (Nucor L=4, Haier L=3) should stay at team-path optimum mix=100.
      if (c.id === 'valve') {
        expect(st.mix).toBe(0);
      } else {
        expect(st.mix, `${c.id} should stay at mix=100 under gated Strategy`).toBe(100);
      }
    }
  });

  it('Strategy scenario: scenarioMode = "strategy-applied" for L ≥ L_STAR_STRATEGY and mono F/A are saturated', () => {
    const amazon = CYCLE_10_COMPANIES[5];
    const r = calcBlendedScores({
      levels: amazon.levels,
      headcount: amazon.headcount,
      fidelityRate: amazon.fidelityRate,
      decisionCycle: amazon.decisionCycle,
      dci: amazon.dci,
      teamDecisionMix: 0,
      scenarioWeights: STRATEGY_WEIGHTS,
    });
    expect(r.scenarioMode).toBe('strategy-applied');
    expect(r.monoFidelity).toBe(100);
    expect(r.monoAutonomy).toBe(100);
    // Lag is NOT bonused — the CEO doesn't dodge propagation delay.
    const expectedMonoLag = calcLagHealth(calcThermalLag(amazon.levels, amazon.decisionCycle).totalDelay).score;
    expect(r.monoLag).toBe(expectedMonoLag);
  });

  it('Strategy scenario: scenarioMode = "strategy-gated" for L < L_STAR_STRATEGY and mono F/A are NOT saturated', () => {
    const haier = CYCLE_10_COMPANIES[4]; // L=3
    const r = calcBlendedScores({
      levels: haier.levels,
      headcount: haier.headcount,
      fidelityRate: haier.fidelityRate,
      decisionCycle: haier.decisionCycle,
      dci: haier.dci,
      teamDecisionMix: 0,
      scenarioWeights: STRATEGY_WEIGHTS,
    });
    expect(r.scenarioMode).toBe('strategy-gated');
    // Raw mono scores — no CEO-flat saturation.
    const expectedMonoF = Math.round(calcOrgMetrics(haier.levels, haier.headcount, haier.fidelityRate).fidelityAtTopPct);
    const expectedMonoA = calcAutonomyScore(haier.dci, haier.levels).score;
    expect(r.monoFidelity).toBe(expectedMonoF);
    expect(r.monoAutonomy).toBe(expectedMonoA);
  });

  // ── scenarioMode flag + threshold edge ────────────────────────────
  it('scenarioMode is "operational" when fidelity < 0.5', () => {
    const r = calcBlendedScores({
      ...BASE_PARAMS,
      teamDecisionMix: 50,
      scenarioWeights: { fidelity: 0.49, lag: 0.11, autonomy: 0.40 },
    });
    expect(r.scenarioMode).toBe('operational');
  });

  it('scenarioMode is "strategy-applied" at the exact 0.5 threshold and L >= gate (>= not >)', () => {
    // BASE_PARAMS has levels=6 ≥ L_STAR_STRATEGY=5, so the gate fires.
    const r = calcBlendedScores({
      ...BASE_PARAMS,
      teamDecisionMix: 50,
      scenarioWeights: { fidelity: 0.5, lag: 0.15, autonomy: 0.35 },
    });
    expect(r.scenarioMode).toBe('strategy-applied');
    expect(r.monoFidelity).toBe(100);
    expect(r.monoAutonomy).toBe(100);
  });

  // ── Depth-monotone flip cascade under a partial joint F+A bonus ──
  //
  // The public API only exposes the saturation form (monoF ← 100, monoA ← 100).
  // Under full saturation every company flips simultaneously to mix=0, so we
  // can't observe the ordering. To verify the depth-monotone cascade
  // Haier → Nucor → Meta → Google → Amazon from Cycle 10 H1b (journal table
  // near the `(kF, kA)` sweep), we inline the joint multiplicative bonus
  // form `monoF ← min(100, monoF × kF)`, `monoA ← min(100, monoA × kA)` with
  // `kF = kA = k` and watch the order in which each company's optimum drops
  // from 100.
  //
  // Inlined math mirrors `calcBlendedScores` minus the rounding to keep the
  // derivatives smooth (Cycle 10 journal observation).
  function scoreWithJointBonus(
    c: RefCompany,
    mix: number,
    k: number,
  ): number {
    const p = mix / 100;
    const monoFRaw = calcOrgMetrics(c.levels, c.headcount, c.fidelityRate).fidelityAtTopPct;
    const monoL = calcLagHealth(calcThermalLag(c.levels, c.decisionCycle).totalDelay).score;
    const monoARaw = calcAutonomyScore(c.dci, c.levels).score;
    const monoF = Math.min(100, monoFRaw * k);
    const monoA = Math.min(100, monoARaw * k);

    const teamLevels = Math.min(c.levels, 2);
    const teamCycle = c.decisionCycle * 0.5;
    const teamF = calcOrgMetrics(teamLevels, c.headcount, c.fidelityRate).fidelityAtTopPct;
    const teamL = calcLagHealth(calcThermalLag(teamLevels, teamCycle).totalDelay).score;
    const teamA = calcAutonomyScore(c.dci, teamLevels).score;

    const F = p * teamF + (1 - p) * monoF;
    const L = p * teamL + (1 - p) * monoL;
    const A = p * teamA + (1 - p) * monoA;
    return weightedComposite({ fidelity: F, lag: L, autonomy: A }, STRATEGY_WEIGHTS);
  }

  function optimalMixJointBonus(c: RefCompany, k: number): number {
    let best = { mix: 100, score: -Infinity };
    for (let mix = 0; mix <= 100; mix += 10) {
      const s = scoreWithJointBonus(c, mix, k);
      if (s > best.score) best = { mix, score: s };
    }
    return best.mix;
  }

  // ── Cycle 12 H3: 15-company invariant ─────────────────────────────
  //
  // The full reference set (after the Cycle 12 H10 Meta DCI recalibration)
  // must obey the H3 structural gate under strategy weights:
  //
  //   Shallow (L < L_STAR_STRATEGY = 5) — bonus gated, optimum = operational:
  //     valve (L=1), nucor (L=4), haier (L=3),
  //     morning-star (L=1), buurtzorg (L=2), berkshire-hathaway (L=4)
  //   Deep (L ≥ 5) — bonus applied, optimum = mix=0:
  //     google (L=8), meta-2024 (L=6), amazon (L=9), ge-welch (L=10),
  //     ibm-pre-gerstner (L=11), walmart (L=8), usps (L=10), us-va-vha (L=10),
  //     ford-pre-mulally (L=11)
  //
  // That's 6 shallow + 9 deep = 15 total — matches the live REFERENCE_COMPANIES
  // roster. Any drift in the roster will fail the length assertion first.
  describe('H3 structural gate — 15-company invariant (Cycle 12)', () => {
    it('REFERENCE_COMPANIES contains exactly 15 companies', () => {
      expect(REFERENCE_COMPANIES).toHaveLength(15);
    });

    it('every reference company obeys the gate under strategy weights', () => {
      for (const c of REFERENCE_COMPANIES) {
        const fixture: RefCompany = {
          id: c.id,
          levels: c.levels,
          headcount: c.employees,
          fidelityRate: 82, // reference companies don't carry per-org rates
          decisionCycle: c.decisionCycle ?? 3,
          dci: c.dci ?? 50,
        };
        const st = sweepOptimalMix(fixture, STRATEGY_WEIGHTS, STRATEGY_WEIGHTS);

        if (fixture.levels >= L_STAR_STRATEGY) {
          // Gate fires → bonus applied → strategy optimum flips to mix=0
          expect(st.mix, `${c.id} (L=${fixture.levels}) should flip to mix=0 under strategy`).toBe(0);

          // Spot-check the mechanism at mix=0: scenarioMode should report
          // "strategy-applied" and mono F/A should be saturated to 100.
          const r0 = calcBlendedScores({
            ...fixture,
            teamDecisionMix: 0,
            scenarioWeights: STRATEGY_WEIGHTS,
          });
          expect(r0.scenarioMode).toBe('strategy-applied');
          expect(r0.monoFidelity).toBe(100);
          expect(r0.monoAutonomy).toBe(100);
        } else {
          // Gate blocks → bonus NOT applied → optimum follows operational logic.
          //   - L=1 (valve, morning-star): degenerate. Mono and team paths are
          //     numerically identical so the sweep's strict `>` argmax lands
          //     at mix=0.
          //   - L=2 (buurtzorg): near-degenerate. With `fidelityRate=82` and
          //     d=1, mono and team differ only by ~0.5 lag-health after
          //     `Math.round`, producing a tie band from mix=50 upward. First
          //     max wins → mix=50. The structural invariant is that the bonus
          //     does not flip it to 0; we assert mix > 0 rather than == 100.
          //   - L≥3 (nucor, haier, berkshire-hathaway): team-path dominates
          //     cleanly → mix=100.
          if (fixture.levels === 1) {
            expect(st.mix).toBe(0);
          } else if (fixture.levels === 2) {
            expect(st.mix, `${c.id} (L=2) should not flip to mix=0 under gated strategy`).toBeGreaterThan(0);
          } else {
            expect(st.mix, `${c.id} (L=${fixture.levels}) should stay at mix=100 under gated strategy`).toBe(100);
          }

          // Spot-check the gate tag: scenarioMode should be "strategy-gated"
          // and mono F/A should NOT be saturated.
          const r0 = calcBlendedScores({
            ...fixture,
            teamDecisionMix: 0,
            scenarioWeights: STRATEGY_WEIGHTS,
          });
          expect(r0.scenarioMode).toBe('strategy-gated');
          const rawMonoF = Math.round(
            calcOrgMetrics(fixture.levels, fixture.headcount, fixture.fidelityRate).fidelityAtTopPct,
          );
          const rawMonoA = calcAutonomyScore(fixture.dci, fixture.levels).score;
          expect(r0.monoFidelity).toBe(rawMonoF);
          expect(r0.monoAutonomy).toBe(rawMonoA);
        }
      }
    });
  });

  it('partial-bonus cascade: companies flip from mix=100 in order Haier → Nucor → Meta → Google → Amazon', () => {
    // For each non-Valve company, find the smallest joint bonus strength k
    // (step 0.05) at which optimum first drops below 100. Then assert the
    // ordering matches the Cycle 10 H1b depth-monotone cascade. Valve is
    // excluded (L=1, degenerate: mono == team, optimum is always tied).
    const flipK = new Map<string, number>();
    const candidates = CYCLE_10_COMPANIES.filter((c) => c.id !== 'valve');
    for (const c of candidates) {
      for (let k = 1.0; k <= 10.0 + 1e-9; k += 0.05) {
        if (optimalMixJointBonus(c, k) < 100) {
          flipK.set(c.id, k);
          break;
        }
      }
    }

    // Every company must flip within the search range under the joint bonus.
    for (const c of candidates) {
      expect(flipK.has(c.id), `${c.id} should flip under a bounded joint F+A bonus`).toBe(true);
    }

    // Depth-monotone cascade per Cycle 10 H1b: Haier (L=3) flips first,
    // Amazon (L=9) flips last. Ordering between Meta and Google can tie at
    // the coarse step used here, so we assert a non-strict chain.
    expect(flipK.get('haier')!).toBeLessThanOrEqual(flipK.get('nucor')!);
    expect(flipK.get('nucor')!).toBeLessThanOrEqual(flipK.get('meta')!);
    expect(flipK.get('meta')!).toBeLessThanOrEqual(flipK.get('google')!);
    expect(flipK.get('google')!).toBeLessThanOrEqual(flipK.get('amazon')!);
    // And strictly: Haier before Amazon.
    expect(flipK.get('haier')!).toBeLessThan(flipK.get('amazon')!);
  });
});
