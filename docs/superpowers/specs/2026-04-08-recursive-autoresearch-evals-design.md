# Recursive Autoresearch Evals — Design Spec

**Date**: 2026-04-08
**Status**: Approved
**Approach**: Single-Loop Orchestrator (Approach A)

## Purpose

Build a recursive research system for org-shape that calibrates existing models, generates novel hypotheses, and expands the theoretical framework — with each cycle compounding on the last. Inspired by Karpathy's autoresearch methodology.

## Success Criteria

**Compounding depth**: cycle N's hypotheses are measurably sharper and more nuanced than cycle N-1's. The research journal shows visible intellectual progress, not circular rehashing.

## Architecture

### Directory Structure

```
org-shape/
  evals/
    orchestrator.sh              # Main loop — assembles prompt, calls claude, manages state
    config.json                  # Cycle counter, enrichment level, model parameters
    prompts/
      system-prompt.md           # Persistent research agent identity
      seed.md                    # Cycle 1 starting questions (hand-written)
    journal/
      cycle-001.md               # Each cycle's findings
      cycle-002.md
      ...
    insights.md                  # Running compressed summary — memory across cycles
    helpers/
      run-models.ts              # Node script exposing org-shape pure functions to CLI
      sweep.ts                   # Parameter sweep runner (varies levels/headcount/fidelity)
```

### Single Cycle Flow

```
orchestrator.sh
  │
  ├── 1. Read config.json (cycle number, enrichment level)
  ├── 2. Read previous journal entry (cycle N-1) + insights.md
  ├── 3. Assemble prompt: system-prompt + context + seeds
  ├── 4. Call: claude -p "$(cat assembled-prompt.md)"
  │       └── Claude Code session:
  │           ├── Reads org-shape/src/lib/*.ts (model source)
  │           ├── Runs helpers/run-models.ts or helpers/sweep.ts
  │           ├── Generates & tests hypotheses against model output
  │           ├── (Cycle 3+) Web search for validation
  │           └── Writes journal/cycle-NNN.md
  ├── 5. Update insights.md (append key findings, compress if >500 lines)
  ├── 6. Increment cycle counter in config.json
  └── 7. STOP — human reviews journal entry, adds optional steering to seed
```

Human checkpoint at step 7 is mandatory — this is where you steer, prune dead ends, or inject new angles. Prevents circular rehashing.

## Journal Entry Format

Each cycle produces a structured markdown file:

```markdown
# Cycle NNN — YYYY-MM-DD

## Seeds (from previous cycle + human steering)
- Ranked list of research questions entering this cycle

## Hypotheses Tested

### H1: [Hypothesis statement]
- **Claim**: Precise, testable statement
- **Test**: What was run (model functions, parameter sweeps, web search)
- **Evidence**: Numbers, outputs, citations
- **Scores**: Novelty X/5 | Specificity X/5 | Evidence X/5
- **Status**: confirmed / refuted / inconclusive / needs-enrichment
- **Implication**: What this means for the models or theory

### H2: ...

## Key Findings
1. Most important discovery this cycle
2. What surprised us
3. What challenges existing assumptions

## Model Observations
- Parameter sensitivities discovered
- Edge cases where models break down
- Proposed calibration adjustments

## Compounding Check
- **vs. previous cycle**: How is this cycle sharper?
- **Novel contribution**: What's genuinely new here?

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

## Scoring Rubric

Each hypothesis is scored on three dimensions (1-5):

| Dimension | 1 | 3 | 5 |
|-----------|---|---|---|
| **Novelty** | Restates known fact | Recombines known ideas in new way | Genuinely new angle or discovery |
| **Specificity** | Directional only ("X increases Y") | Bounded ("X increases Y by ~20%") | Precise + testable ("for L>6, quadratic delay exceeds linear by >15 days when d=3") |
| **Evidence** | Pure speculation | Model output supports | Model + external data confirm |

The **Δ column** in the cycle scorecard is the primary compounding signal. Trending up = system is learning. Plateau or regression = time for human steering.

## Enrichment Schedule

Controlled by `enrichment_level` in `config.json`:

| Cycles | Level | Tools Available |
|--------|-------|----------------|
| 1-2 | `sandbox` | org-shape pure functions, parameter sweeps, 6 reference companies only |
| 3-4 | `validated` | + Web search for specific claims from cycles 1-2 |
| 5+ | `full` | + Proactive web research, new company data, cross-domain analogies |

The enrichment level is manually advanced by the human reviewer — it doesn't auto-escalate. This ensures you're satisfied with the model-first findings before opening the floodgates.

## System Prompt

Stored at `evals/prompts/system-prompt.md`:

> You are a recursive research agent studying organizational structure through the lens of the org-shape project. Your goal is compounding depth — each cycle should be measurably sharper than the last.
>
> You have access to:
> - org-shape's pure TypeScript functions (Bartlett fidelity decay, thermal lag propagation, torque-based agility)
> - 6 reference companies (Valve, Nucor, Google, Amazon, Meta, Haier)
> - Parameter sweep tools (`evals/helpers/sweep.ts`)
> - [Cycle 3+] Web search for empirical validation
>
> Rules:
> 1. Test every hypothesis against model output before claiming it. Show the numbers.
> 2. Score each hypothesis: Novelty (1-5), Specificity (1-5), Evidence (1-5).
> 3. Don't repeat findings from previous cycles — build on them.
> 4. If a hypothesis can't be tested with available tools, flag it for enrichment and move on.
> 5. End every cycle with 3-5 ranked seeds that are sharper than the ones you started with.
> 6. Write your findings to `evals/journal/cycle-NNN.md` using the journal format.

## Config Schema

`evals/config.json`:
```json
{
  "current_cycle": 1,
  "enrichment_level": "sandbox",
  "reference_companies": ["valve", "nucor", "google", "amazon", "meta-2024", "haier"],
  "model_params": {
    "default_fidelity_rate": 82,
    "default_decision_cycle": 3
  }
}
```

## Helper Scripts

### `run-models.ts`
Thin CLI wrapper around org-shape's pure functions. Accepts JSON input, returns JSON output:
```bash
npx tsx evals/helpers/run-models.ts '{"fn":"calcOrgMetrics","args":{"levels":9,"employees":1560000,"fidelityRate":82}}'
```

### `sweep.ts`
Parameter sweep runner. Varies one or more parameters across a range:
```bash
npx tsx evals/helpers/sweep.ts --fn calcThermalLag --vary levels=2:10 --fixed decisionCycle=3
```
Outputs a markdown table or JSON array of results.

## Context Accumulation (insights.md)

The `insights.md` file is the system's long-term memory. After each cycle, the orchestrator appends a 3-5 line summary of key findings. If it exceeds 500 lines, the orchestrator calls `claude -p` with a compression prompt: "Compress this research journal to under 300 lines, preserving the most important findings and discarding anything superseded by later entries. Keep all confirmed/refuted hypothesis summaries and their scores."

This file is included in every cycle's prompt, giving the research agent accumulated context without re-reading every journal entry.

### Cycle 1 Seed Guidance

The `seed.md` file bootstraps the first cycle. Good seeds are:
- Questions about parameter sensitivity ("How sensitive is round-trip fidelity to the 82% retention assumption?")
- Edge case exploration ("What happens to the torque model when span of control approaches 1?")
- Cross-pillar interactions ("Does thermal lag correlate with fidelity loss, or are they truly independent?")
- Model boundary testing ("At what org size does the pyramid→diamond shape transition occur?")

Write 3-5 seeds ranked HIGH/MED/LOW. The system generates its own seeds from cycle 2 onward.

## Execution

```bash
# Run one cycle
cd org-shape && ./evals/orchestrator.sh

# Review the output
cat evals/journal/cycle-001.md

# Add steering notes (optional)
echo "- Focus cycle 2 on torque model edge cases for diamond-shaped orgs" >> evals/prompts/seed.md

# Run next cycle
./evals/orchestrator.sh
```

## Evolution Path

If compounding depth emerges and the system proves valuable:
1. **Phase modularity** (Approach B): Split into calibrate/hypothesize/validate/synthesize scripts for targeted re-runs
2. **Pillar parallelism** (Approach C): Run fidelity, thermal lag, and torque research threads concurrently
3. **Automated compounding metrics**: Plot Novelty/Specificity/Evidence trends across cycles
4. **Theory integration**: Promote confirmed findings into the actual theory docs (THEORY_BRIEF.md, PHYSICS_MODELS.md)

These are future options, not current scope.
