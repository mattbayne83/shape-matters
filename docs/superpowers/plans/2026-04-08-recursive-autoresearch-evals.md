# Recursive Autoresearch Evals — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a CLI-based recursive research loop that runs org-shape's pure math models, generates/tests hypotheses about organizational structure, and accumulates findings in a scored research journal — with each cycle compounding on the last.

**Architecture:** Shell orchestrator (`orchestrator.sh`) assembles prompts from a system template + previous journal + accumulated insights, then calls `claude -p` for each cycle. Two TypeScript helper scripts (`run-models.ts`, `sweep.ts`) expose org-shape's pure functions as CLI tools. Human reviews each cycle's journal entry before triggering the next.

**Tech Stack:** Bash (orchestrator), TypeScript + tsx (helpers), Claude Code CLI (`claude -p`), jq (JSON processing), org-shape's existing pure functions (orgMetrics, thermalLag, triangleGeometry, depthTax, healthScores)

**Spec:** `docs/superpowers/specs/2026-04-08-recursive-autoresearch-evals-design.md`

---

## File Structure

```
evals/
  orchestrator.sh              # Main loop script (read config → assemble prompt → call claude → update state)
  config.json                  # Cycle counter, enrichment level, default model params
  prompts/
    system-prompt.md           # Research agent identity + rules + journal format template
    seed.md                    # Cycle 1 starting questions (hand-written)
  journal/                     # (empty dir, populated by cycles)
    .gitkeep
  insights.md                  # Running compressed findings (starts empty, grows per cycle)
  helpers/
    run-models.ts              # CLI wrapper: accepts {fn, args} JSON, returns model output as JSON
    sweep.ts                   # Parameter sweep: --fn, --vary, --fixed flags, outputs markdown table or JSON
```

---

### Task 1: Scaffold the evals directory

**Files:**
- Create: `evals/config.json`
- Create: `evals/journal/.gitkeep`
- Create: `evals/insights.md`

- [ ] **Step 1: Create the directory structure**

```bash
cd /Users/mattbayne/Documents/SoftwareProjects/org-shape
mkdir -p evals/prompts evals/journal evals/helpers
touch evals/journal/.gitkeep
```

- [ ] **Step 2: Create config.json**

Write `evals/config.json`:

```json
{
  "current_cycle": 1,
  "enrichment_level": "sandbox",
  "reference_companies": ["valve", "nucor", "google", "meta-2024", "haier", "amazon"],
  "model_params": {
    "default_fidelity_rate": 82,
    "default_decision_cycle": 3
  }
}
```

- [ ] **Step 3: Create empty insights.md**

Write `evals/insights.md`:

```markdown
# Accumulated Research Insights

> This file is the system's long-term memory. Updated after each cycle.
> If it exceeds 500 lines, it gets compressed (preserving confirmed/refuted findings).

---
```

- [ ] **Step 4: Verify structure**

Run: `find evals -type f | sort`

Expected:
```
evals/config.json
evals/insights.md
evals/journal/.gitkeep
```

- [ ] **Step 5: Commit**

```bash
git add evals/config.json evals/insights.md evals/journal/.gitkeep
git commit -m "feat(evals): scaffold recursive autoresearch directory structure"
```

---

### Task 2: Create the run-models helper

This is the core bridge — it lets the Claude Code session call org-shape's pure functions from the command line.

**Files:**
- Create: `evals/helpers/run-models.ts`

**Dependencies:** `tsx` is needed to run TypeScript directly. The project already has `typescript` and `vite`; we need `tsx` as a dev dependency.

- [ ] **Step 1: Install tsx**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm install -D tsx`

Expected: `tsx` added to devDependencies

- [ ] **Step 2: Write the run-models helper**

Write `evals/helpers/run-models.ts`:

```typescript
#!/usr/bin/env npx tsx

/**
 * CLI wrapper for org-shape's pure calculation functions.
 *
 * Usage:
 *   npx tsx evals/helpers/run-models.ts '{"fn":"calcOrgMetrics","args":{"levels":9,"employees":1560000,"fidelityRate":82}}'
 *
 * Supported functions:
 *   calcOrgMetrics(levels, employees, fidelityRate)
 *   calcDepthTax(levels, headcount, fidelityRate)
 *   calcTriangleGeometry(levels, employees, fidelityRate)
 *   calcRestructuringImpact(levels, employees, fidelityRate)
 *   calcThermalLag(levels, decisionCycle)
 *   calcLagHealth(totalDelay)
 *   healthBandColor(score)
 */

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
import { calcLagHealth, healthBandColor } from '../../src/lib/healthScores.js';

const FUNCTIONS: Record<string, (...args: unknown[]) => unknown> = {
  calcOrgMetrics: (a: unknown) => {
    const { levels, employees, fidelityRate } = a as {
      levels: number;
      employees: number;
      fidelityRate: number;
    };
    return calcOrgMetrics(levels, employees, fidelityRate);
  },
  calcDepthTax: (a: unknown) => {
    const { levels, headcount, fidelityRate } = a as {
      levels: number;
      headcount: number;
      fidelityRate: number;
    };
    return calcDepthTax(levels, headcount, fidelityRate);
  },
  calcTriangleGeometry: (a: unknown) => {
    const { levels, employees, fidelityRate } = a as {
      levels: number;
      employees: number;
      fidelityRate?: number;
    };
    return calcTriangleGeometry(levels, employees, fidelityRate);
  },
  calcRestructuringImpact: (a: unknown) => {
    const { levels, employees, fidelityRate } = a as {
      levels: number;
      employees: number;
      fidelityRate: number;
    };
    return calcRestructuringImpact(levels, employees, fidelityRate);
  },
  calcThermalLag: (a: unknown) => {
    const { levels, decisionCycle } = a as {
      levels: number;
      decisionCycle: number;
    };
    return calcThermalLag(levels, decisionCycle);
  },
  calcPropagationDelay: (a: unknown) => {
    const { levels, decisionCycle } = a as {
      levels: number;
      decisionCycle: number;
    };
    return calcPropagationDelay(levels, decisionCycle);
  },
  calcMarginalLayerCost: (a: unknown) => {
    const { levels, decisionCycle } = a as {
      levels: number;
      decisionCycle: number;
    };
    return calcMarginalLayerCost(levels, decisionCycle);
  },
  calcLagHealth: (a: unknown) => {
    const { totalDelay } = a as { totalDelay: number };
    return calcLagHealth(totalDelay);
  },
  healthBandColor: (a: unknown) => {
    const { score } = a as { score: number };
    return healthBandColor(score);
  },
};

function main(): void {
  const input = process.argv[2];

  if (!input || input === '--help') {
    console.log('Usage: npx tsx evals/helpers/run-models.ts \'{"fn":"calcOrgMetrics","args":{"levels":9,"employees":1560000,"fidelityRate":82}}\'');
    console.log(`\nAvailable functions: ${Object.keys(FUNCTIONS).join(', ')}`);
    process.exit(input ? 0 : 1);
  }

  let parsed: { fn: string; args: Record<string, unknown> };
  try {
    parsed = JSON.parse(input);
  } catch {
    console.error(`Error: Invalid JSON input`);
    process.exit(1);
  }

  const handler = FUNCTIONS[parsed.fn];
  if (!handler) {
    console.error(`Error: Unknown function "${parsed.fn}". Available: ${Object.keys(FUNCTIONS).join(', ')}`);
    process.exit(1);
  }

  const result = handler(parsed.args);
  console.log(JSON.stringify(result, null, 2));
}

main();
```

- [ ] **Step 3: Test with calcOrgMetrics (Amazon)**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsx evals/helpers/run-models.ts '{"fn":"calcOrgMetrics","args":{"levels":9,"employees":1556000,"fidelityRate":82}}'`

Expected: JSON output with `fidelityAtTopPct` around 20.4%, `roundTripFidelity` around 4.2%, `avgSpan` around 5.5

- [ ] **Step 4: Test with calcThermalLag (Google)**

Run: `npx tsx evals/helpers/run-models.ts '{"fn":"calcThermalLag","args":{"levels":8,"decisionCycle":3.5}}'`

Expected: JSON with `totalDelay` = 3.5 * 7 * 7 = 171.5, `marginalLayerCost` = 3.5 * 13 = 45.5

- [ ] **Step 5: Test with calcTriangleGeometry (Haier)**

Run: `npx tsx evals/helpers/run-models.ts '{"fn":"calcTriangleGeometry","args":{"levels":3,"employees":75000,"fidelityRate":82}}'`

Expected: JSON with `shapeClass` = "mesa", `agilityScore` close to 1.0

- [ ] **Step 6: Test error handling**

Run: `npx tsx evals/helpers/run-models.ts '{"fn":"nonexistent","args":{}}'`

Expected: `Error: Unknown function "nonexistent". Available: calcOrgMetrics, calcDepthTax, ...` with exit code 1

- [ ] **Step 7: Commit**

```bash
git add evals/helpers/run-models.ts package.json package-lock.json
git commit -m "feat(evals): add run-models CLI helper for org-shape pure functions"
```

---

### Task 3: Create the sweep helper

The sweep tool runs a model function across a range of parameter values, producing a table for hypothesis testing.

**Files:**
- Create: `evals/helpers/sweep.ts`

- [ ] **Step 1: Write the sweep helper**

Write `evals/helpers/sweep.ts`:

```typescript
#!/usr/bin/env npx tsx

/**
 * Parameter sweep runner for org-shape models.
 *
 * Usage:
 *   npx tsx evals/helpers/sweep.ts --fn calcThermalLag --vary levels=2:10 --fixed decisionCycle=3
 *   npx tsx evals/helpers/sweep.ts --fn calcOrgMetrics --vary levels=2:12 --fixed employees=100000 fidelityRate=82
 *   npx tsx evals/helpers/sweep.ts --fn calcOrgMetrics --vary levels=2:12 --fixed employees=100000 fidelityRate=82 --format json
 *
 * --vary: param=start:end (integer steps, inclusive)
 * --fixed: param=value (one or more, space-separated)
 * --format: "table" (default) or "json"
 */

import { calcOrgMetrics } from '../../src/lib/orgMetrics.js';
import { calcDepthTax } from '../../src/lib/depthTax.js';
import { calcTriangleGeometry } from '../../src/lib/triangleGeometry.js';
import { calcThermalLag } from '../../src/lib/thermalLag.js';
import { calcLagHealth } from '../../src/lib/healthScores.js';

type ModelFn = (args: Record<string, number>) => Record<string, unknown>;

const FUNCTIONS: Record<string, ModelFn> = {
  calcOrgMetrics: (a) => calcOrgMetrics(a.levels, a.employees, a.fidelityRate) as unknown as Record<string, unknown>,
  calcDepthTax: (a) => calcDepthTax(a.levels, a.headcount, a.fidelityRate) as unknown as Record<string, unknown>,
  calcTriangleGeometry: (a) => calcTriangleGeometry(a.levels, a.employees, a.fidelityRate) as unknown as Record<string, unknown>,
  calcThermalLag: (a) => calcThermalLag(a.levels, a.decisionCycle) as unknown as Record<string, unknown>,
  calcLagHealth: (a) => calcLagHealth(a.totalDelay) as unknown as Record<string, unknown>,
};

function parseArgs(argv: string[]): {
  fn: string;
  varyParam: string;
  varyStart: number;
  varyEnd: number;
  fixed: Record<string, number>;
  format: 'table' | 'json';
} {
  let fn = '';
  let varyParam = '';
  let varyStart = 0;
  let varyEnd = 0;
  const fixed: Record<string, number> = {};
  let format: 'table' | 'json' = 'table';

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === '--fn') {
      fn = argv[++i];
    } else if (arg === '--vary') {
      const parts = argv[++i].split('=');
      varyParam = parts[0];
      const range = parts[1].split(':');
      varyStart = Number(range[0]);
      varyEnd = Number(range[1]);
    } else if (arg === '--fixed') {
      i++;
      while (i < argv.length && !argv[i].startsWith('--')) {
        const parts = argv[i].split('=');
        fixed[parts[0]] = Number(parts[1]);
        i++;
      }
      continue; // don't increment i again
    } else if (arg === '--format') {
      format = argv[++i] as 'table' | 'json';
    }
    i++;
  }

  if (!fn || !varyParam) {
    console.error('Usage: npx tsx evals/helpers/sweep.ts --fn <function> --vary <param=start:end> --fixed <param=value ...> [--format table|json]');
    console.error(`Available functions: ${Object.keys(FUNCTIONS).join(', ')}`);
    process.exit(1);
  }

  return { fn, varyParam, varyStart, varyEnd, fixed, format };
}

function main(): void {
  const { fn, varyParam, varyStart, varyEnd, fixed, format } = parseArgs(process.argv.slice(2));

  const handler = FUNCTIONS[fn];
  if (!handler) {
    console.error(`Error: Unknown function "${fn}". Available: ${Object.keys(FUNCTIONS).join(', ')}`);
    process.exit(1);
  }

  const results: Record<string, unknown>[] = [];

  for (let v = varyStart; v <= varyEnd; v++) {
    const args = { ...fixed, [varyParam]: v };
    const result = handler(args);
    results.push({ [varyParam]: v, ...result });
  }

  if (format === 'json') {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  // Markdown table output
  if (results.length === 0) return;

  // Pick a subset of interesting columns (skip arrays/objects)
  const allKeys = Object.keys(results[0]).filter((k) => {
    const val = results[0][k];
    return typeof val === 'number' || typeof val === 'string' || typeof val === 'boolean';
  });

  // Header
  console.log(`| ${allKeys.join(' | ')} |`);
  console.log(`| ${allKeys.map(() => '---').join(' | ')} |`);

  // Rows
  for (const row of results) {
    const cells = allKeys.map((k) => {
      const val = row[k];
      if (typeof val === 'number') {
        return Number.isInteger(val) ? String(val) : val.toFixed(4);
      }
      return String(val);
    });
    console.log(`| ${cells.join(' | ')} |`);
  }
}

main();
```

- [ ] **Step 2: Test thermal lag sweep (levels 2-10)**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsx evals/helpers/sweep.ts --fn calcThermalLag --vary levels=2:10 --fixed decisionCycle=3`

Expected: Markdown table showing levels 2-10, with `totalDelay` growing quadratically (3, 12, 27, 48, 75, 108, 147, 192, 243)

- [ ] **Step 3: Test org metrics sweep (JSON format)**

Run: `npx tsx evals/helpers/sweep.ts --fn calcOrgMetrics --vary levels=2:6 --fixed employees=100000 fidelityRate=82 --format json`

Expected: JSON array of 5 objects, each with `fidelityAtTopPct` decreasing as levels increase

- [ ] **Step 4: Test error case**

Run: `npx tsx evals/helpers/sweep.ts --fn badFn --vary x=1:3`

Expected: Error message with available functions, exit code 1

- [ ] **Step 5: Commit**

```bash
git add evals/helpers/sweep.ts
git commit -m "feat(evals): add parameter sweep helper for model exploration"
```

---

### Task 4: Write the system prompt

The system prompt gives Claude its research identity, rules, and the journal entry template.

**Files:**
- Create: `evals/prompts/system-prompt.md`

- [ ] **Step 1: Write the system prompt**

Write `evals/prompts/system-prompt.md`:

````markdown
# Recursive Research Agent — org-shape

You are a recursive research agent studying how organizational depth impacts information fidelity, decision latency, and agility. You work within the org-shape project, which models these dynamics through three pillars:

1. **Signal Fidelity** — Bartlett compound decay: `r^(L-1)` where r=retention rate per layer
2. **Thermal Lag** — Quadratic propagation delay: `d × (L-1)²` where d=days per layer
3. **Torque/Agility** — CEO pivot efficiency: `(1/N) × Σ n_k × r^|origin-k|`

## Your Goal

**Compounding depth.** Each cycle must be measurably sharper than the last. If you catch yourself restating findings from a previous cycle without adding precision, evidence, or a new angle — stop and find a harder question.

## Available Tools

You can run org-shape's pure functions via CLI helpers in the `evals/helpers/` directory:

### Run a single model
```bash
npx tsx evals/helpers/run-models.ts '{"fn":"calcOrgMetrics","args":{"levels":9,"employees":1560000,"fidelityRate":82}}'
```

Available functions:
- `calcOrgMetrics(levels, employees, fidelityRate)` — span, flatness, fidelity, manager ratio, comm loss
- `calcDepthTax(levels, headcount, fidelityRate)` — signal fidelity, drift, decision quality/latency
- `calcTriangleGeometry(levels, employees, fidelityRate)` — shape, torque profile, agility score, inertia
- `calcRestructuringImpact(levels, employees, fidelityRate)` — deltas from removing one level
- `calcThermalLag(levels, decisionCycle)` — propagation delay, marginal cost, per-layer breakdown
- `calcLagHealth(totalDelay)` — 0-100 health score with label and color band
- `calcPropagationDelay(levels, decisionCycle)` — just the total delay number
- `calcMarginalLayerCost(levels, decisionCycle)` — just the marginal cost number
- `healthBandColor(score)` — hex color for a 0-100 score

### Run a parameter sweep
```bash
npx tsx evals/helpers/sweep.ts --fn calcThermalLag --vary levels=2:10 --fixed decisionCycle=3
npx tsx evals/helpers/sweep.ts --fn calcOrgMetrics --vary levels=2:12 --fixed employees=100000 fidelityRate=82 --format json
```

### Reference Companies
| Company | Levels | Employees | Fidelity | Cycle | Archetype |
|---------|--------|-----------|----------|-------|-----------|
| Valve | 1 | 350 | 82% | 1.5d | flat |
| Nucor | 4 | 32,700 | 82% | 2d | flat |
| Google | 8 | 183,323 | 82% | 3.5d | tech |
| Meta | 6 | 74,067 | 82% | 2.5d | flattened |
| Haier | 3 | 75,000 | 82% | 1d | experimental |
| Amazon | 9 | 1,556,000 | 82% | 3d | tech |

## Rules

1. **Test every hypothesis against model output before claiming it.** Show the numbers. Run the helper, paste the output, interpret it.
2. **Score each hypothesis** on three dimensions (1-5 each):
   - **Novelty**: 1=restates known fact, 3=recombines ideas, 5=genuinely new angle
   - **Specificity**: 1=directional only, 3=bounded estimate, 5=precise + testable
   - **Evidence**: 1=speculation, 3=model output supports, 5=model + external data confirm
3. **Don't repeat findings from previous cycles** — build on them. Reference prior cycle numbers.
4. **If a hypothesis can't be tested with available tools**, flag it as `needs-enrichment` and move on.
5. **End every cycle with 3-5 ranked seeds** (HIGH/MED/LOW) that are sharper than the ones you started with.
6. **Write your findings** to `evals/journal/cycle-NNN.md` using the format below.

## Enrichment Levels

Your current enrichment level is specified in the prompt. Respect it:
- **sandbox**: Only use model functions, parameter sweeps, and the 6 reference companies. No web search.
- **validated**: You may search the web to validate specific claims from previous cycles. No speculative browsing.
- **full**: Proactive web research, new company data, cross-domain analogies are all allowed.

## Journal Entry Format

Write each cycle's findings to `evals/journal/cycle-NNN.md` using this exact structure:

```markdown
# Cycle NNN — YYYY-MM-DD

## Seeds (from previous cycle + human steering)
- [priority] Research question

## Hypotheses Tested

### H1: [Hypothesis statement]
- **Claim**: Precise, testable statement
- **Test**: What was run (model functions, parameter sweeps, web search)
- **Evidence**: Numbers, outputs, citations
- **Scores**: Novelty X/5 | Specificity X/5 | Evidence X/5
- **Status**: confirmed / refuted / inconclusive / needs-enrichment
- **Implication**: What this means for the models or theory

## Key Findings
1. Most important discovery this cycle
2. What surprised
3. What challenges existing assumptions

## Model Observations
- Parameter sensitivities discovered
- Edge cases where models break down
- Proposed calibration adjustments

## Compounding Check
- **vs. previous cycle**: How is this cycle sharper?
- **Novel contribution**: What's genuinely new?

## Cycle Scorecard
| Metric | This Cycle | Previous | Δ |
|--------|-----------|----------|---|
| Avg Novelty | X.X | X.X | +X.X |
| Avg Specificity | X.X | X.X | +X.X |
| Avg Evidence | X.X | X.X | +X.X |
| Hypotheses tested | N | N | +N |
| Confirmed | N | N | +N |
| Refuted | N | N | +N |
| Queued for enrichment | N | N | +N |

## Seeds for Next Cycle
1. [HIGH] ...
2. [MED] ...
3. [LOW] ...
```
````

- [ ] **Step 2: Verify the file renders correctly**

Run: `wc -l evals/prompts/system-prompt.md`

Expected: ~110-120 lines

- [ ] **Step 3: Commit**

```bash
git add evals/prompts/system-prompt.md
git commit -m "feat(evals): add research agent system prompt with journal template"
```

---

### Task 5: Write the initial seed

The seed bootstraps cycle 1 with hand-written research questions.

**Files:**
- Create: `evals/prompts/seed.md`

- [ ] **Step 1: Write seed.md**

Write `evals/prompts/seed.md`:

```markdown
# Cycle 1 Seeds

These are the starting research questions. After cycle 1, seeds are generated by the research agent.

1. [HIGH] How sensitive is round-trip fidelity to the 82% retention assumption? Sweep fidelityRate from 70-95% for a 9-level org (Amazon) and identify the "cliff" where round-trip fidelity drops below 5%.

2. [HIGH] Does thermal lag's quadratic model overestimate delay for flat orgs (L≤4)? Compare quadratic vs linear fit for L=2..10 and find where the models diverge meaningfully.

3. [MED] At what org size does the pyramid→diamond shape transition occur? Sweep employees from 1K to 1M at L=7 and track the shapeClass and totalShapeGap.

4. [MED] Do the three pillars (fidelity, lag, agility) correlate or are they independent? Run all three models across the 6 reference companies and compute pairwise correlation.

5. [LOW] The torque model gives CEO pivot efficiency — but what about middle-management pivot efficiency? Compare torqueProfile values at different origin layers for Amazon vs Haier.
```

- [ ] **Step 2: Commit**

```bash
git add evals/prompts/seed.md
git commit -m "feat(evals): add cycle 1 research seeds"
```

---

### Task 6: Build the orchestrator

The orchestrator is the main entry point. It reads config, assembles the prompt, calls `claude -p`, and updates state.

**Files:**
- Create: `evals/orchestrator.sh`

- [ ] **Step 1: Write the orchestrator**

Write `evals/orchestrator.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────
EVALS_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$EVALS_DIR")"
CONFIG="$EVALS_DIR/config.json"

# Read current state from config
CYCLE=$(jq -r '.current_cycle' "$CONFIG")
ENRICHMENT=$(jq -r '.enrichment_level' "$CONFIG")
PADDED_CYCLE=$(printf "%03d" "$CYCLE")
JOURNAL_FILE="$EVALS_DIR/journal/cycle-${PADDED_CYCLE}.md"
TODAY=$(date +%Y-%m-%d)

echo "═══════════════════════════════════════════════════════════"
echo "  org-shape Autoresearch — Cycle $CYCLE"
echo "  Enrichment: $ENRICHMENT"
echo "  Date: $TODAY"
echo "═══════════════════════════════════════════════════════════"

# ── Guard: don't overwrite existing journal entry ────────────────────
if [ -f "$JOURNAL_FILE" ]; then
  echo ""
  echo "ERROR: $JOURNAL_FILE already exists."
  echo "Review it, then increment current_cycle in config.json to proceed."
  exit 1
fi

# ── Assemble the prompt ──────────────────────────────────────────────
PROMPT_FILE=$(mktemp)
trap 'rm -f "$PROMPT_FILE"' EXIT

# System prompt
cat "$EVALS_DIR/prompts/system-prompt.md" >> "$PROMPT_FILE"

# Enrichment level
echo "" >> "$PROMPT_FILE"
echo "---" >> "$PROMPT_FILE"
echo "**Current enrichment level: $ENRICHMENT**" >> "$PROMPT_FILE"
echo "**Current cycle: $CYCLE**" >> "$PROMPT_FILE"
echo "**Date: $TODAY**" >> "$PROMPT_FILE"
echo "**Journal output file: evals/journal/cycle-${PADDED_CYCLE}.md**" >> "$PROMPT_FILE"
echo "" >> "$PROMPT_FILE"

# Previous cycle's journal (if exists)
PREV_CYCLE=$((CYCLE - 1))
if [ "$PREV_CYCLE" -gt 0 ]; then
  PREV_PADDED=$(printf "%03d" "$PREV_CYCLE")
  PREV_FILE="$EVALS_DIR/journal/cycle-${PREV_PADDED}.md"
  if [ -f "$PREV_FILE" ]; then
    echo "---" >> "$PROMPT_FILE"
    echo "## Previous Cycle (Cycle $PREV_CYCLE)" >> "$PROMPT_FILE"
    echo "" >> "$PROMPT_FILE"
    cat "$PREV_FILE" >> "$PROMPT_FILE"
    echo "" >> "$PROMPT_FILE"
  fi
fi

# Accumulated insights
if [ -s "$EVALS_DIR/insights.md" ]; then
  echo "---" >> "$PROMPT_FILE"
  echo "## Accumulated Insights (All Prior Cycles)" >> "$PROMPT_FILE"
  echo "" >> "$PROMPT_FILE"
  cat "$EVALS_DIR/insights.md" >> "$PROMPT_FILE"
  echo "" >> "$PROMPT_FILE"
fi

# Seeds (for cycle 1: seed.md, for later cycles: extracted from previous journal)
if [ "$CYCLE" -eq 1 ]; then
  echo "---" >> "$PROMPT_FILE"
  echo "## Research Seeds" >> "$PROMPT_FILE"
  echo "" >> "$PROMPT_FILE"
  cat "$EVALS_DIR/prompts/seed.md" >> "$PROMPT_FILE"
  echo "" >> "$PROMPT_FILE"
fi

# Final instruction
cat >> "$PROMPT_FILE" << 'INSTRUCTION'

---

## Your Task

Run cycle research now. For each seed:
1. Formulate a precise hypothesis
2. Run the model helpers (use `npx tsx evals/helpers/run-models.ts` or `npx tsx evals/helpers/sweep.ts`) to test it
3. Record evidence with actual numbers from the model output
4. Score it (Novelty/Specificity/Evidence, each 1-5)
5. Determine status (confirmed/refuted/inconclusive/needs-enrichment)

Write the complete journal entry to the specified output file. Include the Compounding Check, Cycle Scorecard, and Seeds for Next Cycle sections.

Do NOT commit any files. Just write the journal entry.
INSTRUCTION

echo ""
echo "Prompt assembled ($(wc -l < "$PROMPT_FILE") lines)"
echo "Calling claude..."
echo ""

# ── Run Claude Code ──────────────────────────────────────────────────
cd "$PROJECT_DIR"
claude -p "$(cat "$PROMPT_FILE")" --allowedTools "Bash(readonly=false),Read,Write,Glob,Grep,WebSearch,WebFetch"

# ── Post-cycle: verify output ────────────────────────────────────────
echo ""
if [ -f "$JOURNAL_FILE" ]; then
  LINES=$(wc -l < "$JOURNAL_FILE")
  echo "✓ Journal entry written: $JOURNAL_FILE ($LINES lines)"

  # Append key findings to insights.md
  echo "" >> "$EVALS_DIR/insights.md"
  echo "### Cycle $CYCLE — $TODAY" >> "$EVALS_DIR/insights.md"
  # Extract Key Findings section (between "## Key Findings" and next "##")
  sed -n '/^## Key Findings$/,/^## /{/^## Key Findings$/d;/^## /d;p}' "$JOURNAL_FILE" >> "$EVALS_DIR/insights.md"

  # Increment cycle counter
  jq ".current_cycle = $((CYCLE + 1))" "$CONFIG" > "${CONFIG}.tmp" && mv "${CONFIG}.tmp" "$CONFIG"
  echo "✓ Config updated: next cycle = $((CYCLE + 1))"

  # Check insights.md size
  INSIGHT_LINES=$(wc -l < "$EVALS_DIR/insights.md")
  if [ "$INSIGHT_LINES" -gt 500 ]; then
    echo ""
    echo "⚠ insights.md is $INSIGHT_LINES lines (threshold: 500)"
    echo "  Consider running: claude -p 'Compress evals/insights.md to under 300 lines...'"
  fi

  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "  Cycle $CYCLE complete. Review the journal entry:"
  echo "  $JOURNAL_FILE"
  echo ""
  echo "  To steer the next cycle, edit evals/prompts/seed.md"
  echo "  To change enrichment: edit evals/config.json"
  echo "  To run next cycle: ./evals/orchestrator.sh"
  echo "═══════════════════════════════════════════════════════════"
else
  echo "✗ Journal entry NOT found at $JOURNAL_FILE"
  echo "  Claude may have written to a different path. Check evals/journal/"
  exit 1
fi
```

- [ ] **Step 2: Make it executable**

Run: `chmod +x /Users/mattbayne/Documents/SoftwareProjects/org-shape/evals/orchestrator.sh`

- [ ] **Step 3: Verify it parses correctly**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && bash -n evals/orchestrator.sh && echo "Syntax OK"`

Expected: `Syntax OK`

- [ ] **Step 4: Verify config reading works**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && jq -r '.current_cycle' evals/config.json`

Expected: `1`

- [ ] **Step 5: Commit**

```bash
git add evals/orchestrator.sh
git commit -m "feat(evals): add orchestrator shell script for research cycle execution"
```

---

### Task 7: Add npm convenience script

Add an `eval` script to `package.json` for easy invocation.

**Files:**
- Modify: `package.json` (scripts section)

- [ ] **Step 1: Add the eval script to package.json**

In `package.json`, add to the `"scripts"` block:

```json
"eval": "bash evals/orchestrator.sh",
"eval:models": "tsx evals/helpers/run-models.ts",
"eval:sweep": "tsx evals/helpers/sweep.ts"
```

- [ ] **Step 2: Verify the scripts work**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm run eval:models -- '{"fn":"calcLagHealth","args":{"totalDelay":50}}'`

Expected: JSON with `score` around 61, `label` "Aging"

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "feat(evals): add npm convenience scripts for eval helpers"
```

---

### Task 8: Dry-run cycle 1

Run the actual orchestrator for cycle 1 and verify the full loop works end-to-end.

**Files:**
- Produces: `evals/journal/cycle-001.md`
- Modifies: `evals/insights.md`, `evals/config.json`

- [ ] **Step 1: Run cycle 1**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && ./evals/orchestrator.sh`

This will take several minutes. Claude will:
- Read the system prompt + seeds
- Run the model helpers against the 5 seed questions
- Write `evals/journal/cycle-001.md`

- [ ] **Step 2: Verify journal entry exists and has correct structure**

Run: `head -30 evals/journal/cycle-001.md`

Expected: Starts with `# Cycle 001 —` followed by today's date. Contains `## Seeds`, `## Hypotheses Tested`, etc.

- [ ] **Step 3: Verify the scorecard section exists**

Run: `grep -A 10 "## Cycle Scorecard" evals/journal/cycle-001.md`

Expected: Markdown table with Novelty, Specificity, Evidence averages

- [ ] **Step 4: Verify insights.md was updated**

Run: `cat evals/insights.md`

Expected: Contains `### Cycle 1 —` section with key findings extracted from the journal

- [ ] **Step 5: Verify config was incremented**

Run: `jq '.current_cycle' evals/config.json`

Expected: `2`

- [ ] **Step 6: Review the journal entry for quality**

Read `evals/journal/cycle-001.md` in full. Check:
- Did it actually run the model helpers (should see concrete numbers)?
- Are hypotheses scored with Novelty/Specificity/Evidence?
- Are seeds for cycle 2 sharper than the cycle 1 seeds?
- Is the Compounding Check section present (may say "N/A — first cycle")?

- [ ] **Step 7: Commit the cycle 1 output**

```bash
git add evals/journal/cycle-001.md evals/insights.md evals/config.json
git commit -m "research(evals): cycle 001 — initial model exploration"
```

---

### Task 9: Verify cycle 2 readiness

Confirm the orchestrator correctly picks up cycle 2 state and includes cycle 1 context.

**Files:**
- No new files — validation only

- [ ] **Step 1: Check that orchestrator detects cycle 2**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && bash -c 'source <(head -20 evals/orchestrator.sh | tail -8) 2>/dev/null; echo "Next cycle: $(jq -r .current_cycle evals/config.json)"'`

Alternative (simpler): `jq -r '.current_cycle' evals/config.json`

Expected: `2`

- [ ] **Step 2: Verify cycle 1 journal will be included as context**

Run: `test -f evals/journal/cycle-001.md && echo "Cycle 1 journal exists — will be included in cycle 2 prompt" || echo "MISSING"`

Expected: `Cycle 1 journal exists — will be included in cycle 2 prompt`

- [ ] **Step 3: Verify guard against re-running cycle 1**

Reset config temporarily to test the guard:

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && jq '.current_cycle = 1' evals/config.json > /tmp/test-config.json && CYCLE=1; PADDED=$(printf "%03d" $CYCLE); test -f "evals/journal/cycle-${PADDED}.md" && echo "GUARD WORKS: would block re-run of cycle $CYCLE" || echo "No guard needed"`

Expected: `GUARD WORKS: would block re-run of cycle 1`

- [ ] **Step 4: Confirm no uncommitted changes**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && git status --short evals/`

Expected: Clean (no modified files)
