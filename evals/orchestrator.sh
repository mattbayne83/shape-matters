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
claude -p "$(cat "$PROMPT_FILE")" --allowedTools "Bash,Read,Write,Glob,Grep,WebSearch,WebFetch"

# ── Post-cycle: verify output ────────────────────────────────────────
echo ""
if [ -f "$JOURNAL_FILE" ]; then
  LINES=$(wc -l < "$JOURNAL_FILE")
  echo "✓ Journal entry written: $JOURNAL_FILE ($LINES lines)"

  # Append key findings to insights.md
  echo "" >> "$EVALS_DIR/insights.md"
  echo "### Cycle $CYCLE — $TODAY" >> "$EVALS_DIR/insights.md"
  # Extract Key Findings section (between "## Key Findings" and next "##")
  awk '/^## Key Findings$/{found=1; next} /^## /{if(found) exit} found{print}' "$JOURNAL_FILE" >> "$EVALS_DIR/insights.md"

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
