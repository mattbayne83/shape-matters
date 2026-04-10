import { calcOrgMetrics } from '../../src/lib/orgMetrics.js';
import { calcDepthTax } from '../../src/lib/depthTax.js';
import {
  calcTriangleGeometry,
  calcRestructuringImpact,
} from '../../src/lib/triangleGeometry.js';
import {
  calcThermalLag,
  calcPropagationDelay,
  calcMarginalLayerCost,
} from '../../src/lib/thermalLag.js';
import { calcLagHealth, healthBandColor, scoreBand } from '../../src/lib/healthScores.js';
import { calcAutonomyScore } from '../../src/lib/autonomy.js';
import { calcBlendedScores } from '../../src/lib/blendedModel.js';

const FUNCTIONS = {
  calcOrgMetrics: ({ levels, employees, fidelityRate }: { levels: number; employees: number; fidelityRate: number }) =>
    calcOrgMetrics(levels, employees, fidelityRate),

  calcDepthTax: ({ levels, headcount, fidelityRate }: { levels: number; headcount: number; fidelityRate: number }) =>
    calcDepthTax(levels, headcount, fidelityRate),

  calcTriangleGeometry: ({ levels, employees, fidelityRate }: { levels: number; employees: number; fidelityRate?: number }) =>
    calcTriangleGeometry(levels, employees, fidelityRate),

  calcRestructuringImpact: ({ levels, employees, fidelityRate }: { levels: number; employees: number; fidelityRate: number }) =>
    calcRestructuringImpact(levels, employees, fidelityRate),

  calcThermalLag: ({ levels, decisionCycle }: { levels: number; decisionCycle: number }) =>
    calcThermalLag(levels, decisionCycle),

  calcPropagationDelay: ({ levels, decisionCycle }: { levels: number; decisionCycle: number }) =>
    calcPropagationDelay(levels, decisionCycle),

  calcMarginalLayerCost: ({ levels, decisionCycle }: { levels: number; decisionCycle: number }) =>
    calcMarginalLayerCost(levels, decisionCycle),

  calcLagHealth: ({ totalDelay }: { totalDelay: number }) =>
    calcLagHealth(totalDelay),

  healthBandColor: ({ score }: { score: number }) =>
    healthBandColor(score),

  scoreBand: ({ score }: { score: number }) =>
    scoreBand(score),

  calcAutonomyScore: ({ dci, levels }: { dci: number; levels: number }) =>
    calcAutonomyScore(dci, levels),

  calcBlendedScores: ({
    levels,
    headcount,
    fidelityRate,
    decisionCycle,
    dci,
    teamDecisionMix,
    scenarioWeights,
  }: {
    levels: number;
    headcount: number;
    fidelityRate: number;
    decisionCycle: number;
    dci: number;
    teamDecisionMix: number;
    // Optional Cycle 12 H3 strategy-mode weights. When passed with
    // `fidelity >= 0.5` AND `levels >= L_STAR_STRATEGY`, the mono path's F
    // and A saturate to 100 before blending. Example CLI shape:
    //   npx tsx evals/helpers/run-models.ts '{"fn":"calcBlendedScores","args":{"levels":9,"headcount":1556000,"fidelityRate":82,"decisionCycle":3,"dci":72,"teamDecisionMix":0,"scenarioWeights":{"fidelity":0.55,"lag":0.10,"autonomy":0.35}}}'
    scenarioWeights?: { fidelity: number; lag: number; autonomy: number };
  }) =>
    calcBlendedScores({
      levels,
      headcount,
      fidelityRate,
      decisionCycle,
      dci,
      teamDecisionMix,
      scenarioWeights,
    }),
} as const;

const AVAILABLE_FUNCTIONS = Object.keys(FUNCTIONS).join(', ');

const USAGE = `
Usage:
  npx tsx evals/helpers/run-models.ts '<JSON>'

JSON format:
  { "fn": "<functionName>", "args": { ... } }

Available functions:
  calcOrgMetrics(levels, employees, fidelityRate)
  calcDepthTax(levels, headcount, fidelityRate)
  calcTriangleGeometry(levels, employees, fidelityRate?)
  calcRestructuringImpact(levels, employees, fidelityRate)
  calcThermalLag(levels, decisionCycle)
  calcPropagationDelay(levels, decisionCycle)
  calcMarginalLayerCost(levels, decisionCycle)
  calcLagHealth(totalDelay)
  healthBandColor(score)
  scoreBand(score)
  calcAutonomyScore(dci, levels)
  calcBlendedScores(levels, headcount, fidelityRate, decisionCycle, dci, teamDecisionMix, scenarioWeights?)

Notes:
  - fidelityRate is a percentage (e.g. 82, not 0.82)
  - All functions are synchronous and return plain objects or primitives

Example:
  npx tsx evals/helpers/run-models.ts '{"fn":"calcOrgMetrics","args":{"levels":9,"employees":1560000,"fidelityRate":82}}'
`.trim();

const arg = process.argv[2];

if (arg === '--help') {
  console.log(USAGE);
  process.exit(0);
}

if (!arg) {
  console.error('Error: No arguments provided.\n');
  console.error(USAGE);
  process.exit(1);
}

let parsed: { fn: string; args: Record<string, unknown> };
try {
  parsed = JSON.parse(arg);
} catch {
  console.error('Error: Invalid JSON input.');
  process.exit(1);
}

const { fn, args } = parsed;

if (!(fn in FUNCTIONS)) {
  console.error(`Error: Unknown function "${fn}".`);
  console.error(`Available functions: ${AVAILABLE_FUNCTIONS}`);
  process.exit(1);
}

const handler = FUNCTIONS[fn as keyof typeof FUNCTIONS];
const result = handler(args as never);
console.log(JSON.stringify(result, null, 2));
