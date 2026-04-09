import { calcOrgMetrics } from '../../src/lib/orgMetrics.js';
import { calcDepthTax } from '../../src/lib/depthTax.js';
import { calcTriangleGeometry } from '../../src/lib/triangleGeometry.js';
import { calcThermalLag } from '../../src/lib/thermalLag.js';
import { calcLagHealth } from '../../src/lib/healthScores.js';

type Args = Record<string, number>;

const FUNCTIONS: Record<string, (args: Args) => Record<string, unknown>> = {
  calcOrgMetrics: ({ levels, employees, fidelityRate }: Args) =>
    calcOrgMetrics(levels, employees, fidelityRate) as unknown as Record<string, unknown>,

  calcDepthTax: ({ levels, headcount, fidelityRate }: Args) =>
    calcDepthTax(levels, headcount, fidelityRate) as unknown as Record<string, unknown>,

  calcTriangleGeometry: ({ levels, employees, fidelityRate }: Args) =>
    calcTriangleGeometry(levels, employees, fidelityRate) as unknown as Record<string, unknown>,

  calcThermalLag: ({ levels, decisionCycle }: Args) =>
    calcThermalLag(levels, decisionCycle) as unknown as Record<string, unknown>,

  calcLagHealth: ({ totalDelay }: Args) =>
    calcLagHealth(totalDelay) as unknown as Record<string, unknown>,
};

const AVAILABLE_FNS = Object.keys(FUNCTIONS).join(', ');

const USAGE = `
Usage:
  npx tsx evals/helpers/sweep.ts --fn <name> --vary <param=start:end> [--fixed <param=value ...>] [--format <table|json>]

Available functions:
  calcOrgMetrics(levels, employees, fidelityRate)
  calcDepthTax(levels, headcount, fidelityRate)
  calcTriangleGeometry(levels, employees, fidelityRate)
  calcThermalLag(levels, decisionCycle)
  calcLagHealth(totalDelay)

Examples:
  npx tsx evals/helpers/sweep.ts --fn calcThermalLag --vary levels=2:10 --fixed decisionCycle=3
  npx tsx evals/helpers/sweep.ts --fn calcOrgMetrics --vary levels=2:6 --fixed employees=100000 fidelityRate=82 --format json
`.trim();

function parseArgs(argv: string[]): {
  fn: string | null;
  vary: string | null;
  fixed: Args;
  format: 'table' | 'json';
} {
  const result = { fn: null as string | null, vary: null as string | null, fixed: {} as Args, format: 'table' as 'table' | 'json' };

  let i = 0;
  while (i < argv.length) {
    const token = argv[i];

    if (token === '--fn') {
      result.fn = argv[++i] ?? null;
      i++;
    } else if (token === '--vary') {
      result.vary = argv[++i] ?? null;
      i++;
    } else if (token === '--format') {
      const fmt = argv[++i];
      result.format = fmt === 'json' ? 'json' : 'table';
      i++;
    } else if (token === '--fixed') {
      i++;
      while (i < argv.length && !argv[i].startsWith('--')) {
        const kv = argv[i];
        const eqIdx = kv.indexOf('=');
        if (eqIdx !== -1) {
          const key = kv.slice(0, eqIdx);
          const val = Number(kv.slice(eqIdx + 1));
          result.fixed[key] = val;
        }
        i++;
      }
    } else {
      i++;
    }
  }

  return result;
}

function isScalar(value: unknown): boolean {
  return typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean';
}

function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(4);
  }
  return String(value);
}

function renderTable(rows: Array<Record<string, unknown>>, varyParam: string): void {
  if (rows.length === 0) return;

  // Collect only scalar columns; put varyParam first
  const allKeys = new Set<string>();
  for (const row of rows) {
    for (const [k, v] of Object.entries(row)) {
      if (isScalar(v)) allKeys.add(k);
    }
  }

  const columns = [varyParam, ...Array.from(allKeys).filter(k => k !== varyParam)];

  const header = `| ${columns.join(' | ')} |`;
  const separator = `| ${columns.map(() => '---').join(' | ')} |`;
  const dataRows = rows.map(row => `| ${columns.map(c => formatValue(row[c])).join(' | ')} |`);

  console.log([header, separator, ...dataRows].join('\n'));
}

// --- main ---

const argv = process.argv.slice(2);
const { fn, vary, fixed, format } = parseArgs(argv);

if (!fn || !vary) {
  console.error('Error: --fn and --vary are required.\n');
  console.error(USAGE);
  process.exit(1);
}

if (!(fn in FUNCTIONS)) {
  console.error(`Error: Unknown function "${fn}".`);
  console.error(`Available functions: ${AVAILABLE_FNS}`);
  process.exit(1);
}

// Parse --vary param=start:end
const varyMatch = vary.match(/^(\w+)=(\d+):(\d+)$/);
if (!varyMatch) {
  console.error(`Error: --vary must be in the format param=start:end (e.g. levels=2:10)`);
  process.exit(1);
}

const [, varyParam, startStr, endStr] = varyMatch;
const start = parseInt(startStr, 10);
const end = parseInt(endStr, 10);

if (start > end) {
  console.error(`Error: sweep start (${start}) must be <= end (${end})`);
  process.exit(1);
}

const handler = FUNCTIONS[fn];
const rows: Array<Record<string, unknown>> = [];

for (let v = start; v <= end; v++) {
  const args = { ...fixed, [varyParam]: v };
  const result = handler(args);

  // Flatten scalar fields from the result; prefix varyParam column with the sweep value
  const row: Record<string, unknown> = { [varyParam]: v };
  for (const [k, val] of Object.entries(result)) {
    if (isScalar(val)) row[k] = val;
  }
  rows.push(row);
}

if (format === 'json') {
  console.log(JSON.stringify(rows, null, 2));
} else {
  renderTable(rows, varyParam);
}
