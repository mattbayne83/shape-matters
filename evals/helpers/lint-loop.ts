#!/usr/bin/env tsx
/**
 * Research-loop drift guard.
 *
 * Catches the class of bug that caused Cycles 7→10 to operate on stale context:
 *   1. system-prompt.md references a company count or archetype string that
 *      doesn't match the live `src/data/referenceCompanies.ts`
 *   2. seeds in the last N journal files that have appeared unresolved in
 *      3+ consecutive cycles — these are rabbit-hole indicators
 *
 * Exits 1 on any failure. Run via `npm run eval:lint`.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EVALS_DIR = join(__dirname, '..');
const PROJECT_DIR = join(EVALS_DIR, '..');

const SYSTEM_PROMPT = join(EVALS_DIR, 'prompts', 'system-prompt.md');
const SEED_FILE = join(EVALS_DIR, 'prompts', 'seed.md');
const JOURNAL_DIR = join(EVALS_DIR, 'journal');
const REF_COMPANIES = join(PROJECT_DIR, 'src', 'data', 'referenceCompanies.ts');
const TYPES = join(PROJECT_DIR, 'src', 'types', 'index.ts');

interface Issue {
  level: 'error' | 'warn';
  rule: string;
  message: string;
}

const issues: Issue[] = [];

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

// ── Rule 1: company count parity ───────────────────────────────────────
function liveCompanyCount(): number {
  const src = read(REF_COMPANIES);
  // Count top-level entries in REFERENCE_COMPANIES array (lines starting with `  {`)
  return (src.match(/^ {2}\{/gm) || []).length;
}

function checkCompanyCount() {
  const live = liveCompanyCount();
  const prompt = read(SYSTEM_PROMPT);
  // The prompt should not hardcode a specific number that disagrees with live.
  // Look for phrases like "N reference companies" or "N companies across".
  const hardcoded = prompt.match(/(\d+)\s+reference companies/i);
  if (hardcoded) {
    const claimed = parseInt(hardcoded[1], 10);
    if (claimed !== live) {
      issues.push({
        level: 'error',
        rule: 'company-count',
        message: `system-prompt.md claims ${claimed} reference companies; live count is ${live}. Update the prompt or remove the hardcoded number.`,
      });
    }
  }
}

// ── Rule 2: archetype parity ───────────────────────────────────────────
function liveArchetypes(): string[] {
  const src = read(TYPES);
  const match = src.match(/export type Archetype =([\s\S]*?);/);
  if (!match) return [];
  return Array.from(match[1].matchAll(/'([a-z-]+)'/g)).map((m) => m[1]);
}

function checkArchetypes() {
  const live = new Set(liveArchetypes());
  const prompt = read(SYSTEM_PROMPT);
  // Extract any archetype-looking tokens inside backticks or quotes
  // that appear near the word "archetype"
  const archetypeSection = prompt.match(/archetypes?[^.]*/gi) || [];
  for (const section of archetypeSection) {
    const tokens = Array.from(section.matchAll(/`([a-z-]+)`/g)).map((m) => m[1]);
    for (const tok of tokens) {
      // Only flag if it LOOKS like an archetype (lowercase-hyphen, not 'sandbox' etc)
      // and is not in the live set. Whitelist legitimate non-archetype tokens.
      const whitelist = new Set([
        'sandbox',
        'validated',
        'full',
        'case-study',
        'qualitative-estimate',
        'wms-sector',
        'src',
        'lib',
        'refine',
        'explore',
      ]);
      if (whitelist.has(tok)) continue;
      if (!live.has(tok)) {
        issues.push({
          level: 'warn',
          rule: 'archetype-drift',
          message: `system-prompt.md references \`${tok}\` near an archetype discussion; not in live Archetype union (${[...live].join(', ')}).`,
        });
      }
    }
  }
}

// ── Rule 3: pillar naming parity ───────────────────────────────────────
function checkPillarNames() {
  const prompt = read(SYSTEM_PROMPT);
  // Live pillar names (per src/lib/ and CLAUDE.md)
  const expected = ['Fidelity', 'Latency', 'Autonomy'];
  for (const name of expected) {
    if (!prompt.includes(name)) {
      issues.push({
        level: 'error',
        rule: 'pillar-naming',
        message: `system-prompt.md does not mention the "${name}" pillar. Expected all three: ${expected.join(', ')}.`,
      });
    }
  }
  // Flag the old "Torque/Agility" framing if it reappears
  if (/torque.*agility|agility.*torque/i.test(prompt)) {
    issues.push({
      level: 'warn',
      rule: 'pillar-naming',
      message: `system-prompt.md mentions "Torque/Agility" — that's the pre-DCI framing. Current pillar is Autonomy.`,
    });
  }
}

// ── Rule 4: seed staleness audit ──────────────────────────────────────
function checkSeedStaleness() {
  if (!existsSync(JOURNAL_DIR)) return;
  const journals = readdirSync(JOURNAL_DIR)
    .filter((f: string) => /^cycle-\d{3}\.md$/.test(f))
    .sort();
  if (journals.length < 3) return;

  // Extract seed lines from the last 3 cycles
  const lastN = journals.slice(-3);
  const seedsPerCycle: string[][] = lastN.map((f: string) => {
    const content = read(join(JOURNAL_DIR, f));
    const match = content.match(/## Seeds for Next Cycle([\s\S]*?)(?:^## |$)/m);
    if (!match) return [];
    // Grab bulleted items
    return (match[1].match(/^[-*\d.]+\s+.+/gm) || []).map((s: string) =>
      s.replace(/^[-*\d.]+\s+/, '').slice(0, 80).toLowerCase(),
    );
  });

  // Find seeds that appear in ALL N cycles (by fuzzy prefix match)
  if (seedsPerCycle.every((arr) => arr.length > 0)) {
    const first = seedsPerCycle[0];
    for (const candidate of first) {
      const appears = seedsPerCycle.every((arr) =>
        arr.some((s) => similarity(s, candidate) > 0.6),
      );
      if (appears) {
        issues.push({
          level: 'warn',
          rule: 'seed-staleness',
          message: `Seed appears unresolved in last ${lastN.length} cycles: "${candidate}". Rabbit-hole indicator — promote, escalate, or abandon.`,
        });
      }
    }
  }
}

function similarity(a: string, b: string): number {
  const wordsA = new Set(a.split(/\s+/).filter((w) => w.length > 3));
  const wordsB = new Set(b.split(/\s+/).filter((w) => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let overlap = 0;
  for (const w of wordsA) if (wordsB.has(w)) overlap++;
  return overlap / Math.max(wordsA.size, wordsB.size);
}

// ── Rule 5: seed.md sanity ────────────────────────────────────────────
function checkSeedFile() {
  if (!existsSync(SEED_FILE)) {
    issues.push({
      level: 'error',
      rule: 'seed-file-missing',
      message: `evals/prompts/seed.md is missing. The orchestrator reads this on every cycle.`,
    });
    return;
  }
  const content = read(SEED_FILE);
  if (!/Explore lane/i.test(content) || !/Refine lane/i.test(content)) {
    issues.push({
      level: 'warn',
      rule: 'seed-lanes',
      message: `seed.md should define both Explore and Refine lanes. One or both headers missing.`,
    });
  }
}

// ── Run ───────────────────────────────────────────────────────────────
checkCompanyCount();
checkArchetypes();
checkPillarNames();
checkSeedStaleness();
checkSeedFile();

const errors = issues.filter((i) => i.level === 'error');
const warns = issues.filter((i) => i.level === 'warn');

if (issues.length === 0) {
  console.log('✓ evals lint: clean');
  process.exit(0);
}

for (const i of errors) console.error(`✘ [${i.rule}] ${i.message}`);
for (const i of warns) console.warn(`⚠ [${i.rule}] ${i.message}`);

console.error(`\n${errors.length} error(s), ${warns.length} warning(s)`);
process.exit(errors.length > 0 ? 1 : 0);
