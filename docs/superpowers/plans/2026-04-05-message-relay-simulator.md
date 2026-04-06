# Message Relay Simulator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive `#simulate` section where users watch a message degrade through org levels via distortion and reframing with incentive annotations.

**Architecture:** New section between #problem and #proof. Left column: scenario picker + custom input. Right column: animated cascade of RelayCards showing progressive message distortion. Ties into existing Zustand `levels`/`fidelityRate` state. Rule-based engine handles custom messages; hand-authored data handles sample scenarios.

**Tech Stack:** React 19, TypeScript, Zustand 5, Tailwind CSS 4, Framer Motion (existing FadeIn pattern), Vitest

**Design Spec:** `docs/superpowers/specs/2026-04-05-message-relay-simulator-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/types/index.ts` | Modify | Add `Scenario`, `RelayLevel`, `ScenarioCategory` types |
| `src/data/scenarios.ts` | Create | 5 hand-authored scenarios with 8 relay levels each |
| `src/lib/signalRelay.ts` | Create | Rule-based transformation engine for custom messages |
| `src/lib/__tests__/signalRelay.test.ts` | Create | Unit tests for transformation rules + truncation |
| `src/store/useCompanyStore.ts` | Modify | Add `activeScenarioId`, `customMessage`, `simulationActive` (non-persisted) |
| `src/components/model/ScenarioPicker.tsx` | Create | Category pills + scenario selection |
| `src/components/model/MessageInput.tsx` | Create | Text area for custom/loaded message |
| `src/components/model/RelayCard.tsx` | Create | Single level card with diff highlights + incentive |
| `src/components/model/RelayCascade.tsx` | Create | Orchestrates staggered RelayCard animation |
| `src/components/model/SignalVerdictCard.tsx` | Create | Bottom summary card with fidelity % |
| `src/components/model/SimulateSection.tsx` | Create | Section wrapper: two-column grid layout |
| `src/components/layout/SectionNav.tsx` | Modify | Add `simulate` entry between `problem` and `proof` |
| `src/pages/ScrollPage.tsx` | Modify | Add `#simulate` section between #problem and #proof |

---

### Task 1: Types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add scenario types to the types file**

Open `src/types/index.ts` and append after the existing `TriangleGeometry` interface (after line 108):

```ts
// ── Relay Simulator ─────────────────────────────────────────────────
export type ScenarioCategory = 'safety' | 'strategy' | 'customer' | 'innovation' | 'operations';

export interface RelayLevel {
  role: string;
  message: string;
  incentive: string;
  lostDetails: string[];
  addedFraming: string[];
}

export interface Scenario {
  id: string;
  title: string;
  category: ScenarioCategory;
  originalMessage: string;
  levels: RelayLevel[];
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): add Scenario, RelayLevel, ScenarioCategory types"
```

---

### Task 2: Signal Relay Engine (TDD)

**Files:**
- Create: `src/lib/signalRelay.ts`
- Create: `src/lib/__tests__/signalRelay.test.ts`

- [ ] **Step 1: Write failing tests for the transformation engine**

Create `src/lib/__tests__/signalRelay.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { applyRelayTransforms, truncateRelayLevels } from '../signalRelay';
import type { RelayLevel } from '../../types';

describe('applyRelayTransforms', () => {
  describe('number stripping (L1-L2)', () => {
    it('replaces dollar amounts with "significant amount"', () => {
      const result = applyRelayTransforms('We lost $2.3M in revenue', 1);
      expect(result).not.toContain('$2.3M');
      expect(result).toContain('significant amount');
    });

    it('replaces measurements with vague quantifiers', () => {
      const result = applyRelayTransforms('Pressure at 180 PSI exceeded limit', 1);
      expect(result).not.toContain('180');
    });

    it('replaces percentages with qualitative terms', () => {
      const result = applyRelayTransforms('Throughput dropped 42% this week', 1);
      expect(result).not.toContain('42%');
    });
  });

  describe('name/location genericizing (L1-L2)', () => {
    it('replaces capitalized proper nouns with generic terms', () => {
      const result = applyRelayTransforms('Sarah discovered the issue on Line 12', 2);
      expect(result).not.toContain('Sarah');
      expect(result).not.toContain('Line 12');
    });
  });

  describe('urgency softening (L3-L5)', () => {
    it('softens "critical" to "potential"', () => {
      const result = applyRelayTransforms('This is a critical failure', 3);
      expect(result).not.toContain('critical');
      expect(result.toLowerCase()).toContain('potential');
    });

    it('softens "immediately" to "when possible"', () => {
      const result = applyRelayTransforms('We need to act immediately', 3);
      expect(result).not.toContain('immediately');
      expect(result).toContain('when possible');
    });
  });

  describe('passive voice injection (L3-L5)', () => {
    it('replaces "I discovered" with passive form', () => {
      const result = applyRelayTransforms('I discovered a leak in the system', 4);
      expect(result).not.toContain('I discovered');
      expect(result.toLowerCase()).toContain('it was noted');
    });
  });

  describe('ownership dilution (L6+)', () => {
    it('replaces individual names with collective attribution', () => {
      const result = applyRelayTransforms('The team identified a risk', 6);
      expect(result).not.toContain('team identified');
    });
  });

  describe('action → observation (L6+)', () => {
    it('converts "we should" recommendations to status reports', () => {
      const result = applyRelayTransforms('We should switch vendors immediately', 7);
      expect(result).not.toContain('should');
    });
  });

  describe('cumulative application', () => {
    it('applies more rules at higher levels', () => {
      const msg = 'Sarah found a critical failure at Line 12, pressure at 180 PSI. We should fix it immediately.';
      const l2 = applyRelayTransforms(msg, 2);
      const l5 = applyRelayTransforms(msg, 5);
      const l7 = applyRelayTransforms(msg, 7);

      // Higher levels should produce shorter/vaguer messages
      expect(l5.length).toBeLessThanOrEqual(l2.length);
      expect(l7.length).toBeLessThanOrEqual(l5.length);
    });

    it('returns original for level 0', () => {
      const msg = 'Exact original message';
      expect(applyRelayTransforms(msg, 0)).toBe(msg);
    });
  });

  describe('edge cases', () => {
    it('handles empty string', () => {
      expect(applyRelayTransforms('', 5)).toBe('');
    });

    it('handles message with no transformable content', () => {
      const msg = 'Things are going well today';
      const result = applyRelayTransforms(msg, 2);
      // Should still return something (even if unchanged)
      expect(result).toBeTruthy();
    });
  });
});

describe('truncateRelayLevels', () => {
  // Create 8 mock relay levels
  const levels: RelayLevel[] = Array.from({ length: 8 }, (_, i) => ({
    role: `Role ${i}`,
    message: `Message at level ${i}`,
    incentive: `Incentive ${i}`,
    lostDetails: [`detail-${i}`],
    addedFraming: [`framing-${i}`],
  }));

  it('returns all 8 levels when slider is 9 (8 relays = 9 org levels)', () => {
    const result = truncateRelayLevels(levels, 9);
    expect(result).toHaveLength(8);
  });

  it('returns first N-1 levels for slider value N < 9', () => {
    const result = truncateRelayLevels(levels, 4);
    // 4 org levels = 3 relay hops, so first 3 levels
    expect(result).toHaveLength(3);
    expect(result[0].role).toBe('Role 0');
    expect(result[1].role).toBe('Role 1');
    expect(result[2].role).toBe('Role 2');
  });

  it('returns 1 level for slider value 2 (minimum relay)', () => {
    const result = truncateRelayLevels(levels, 2);
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe('Role 0');
  });

  it('returns empty array for slider value 1 (flat org, no relays)', () => {
    const result = truncateRelayLevels(levels, 1);
    expect(result).toHaveLength(0);
  });

  it('caps at source array length', () => {
    const result = truncateRelayLevels(levels, 15);
    expect(result).toHaveLength(8);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run src/lib/__tests__/signalRelay.test.ts`
Expected: FAIL — module `../signalRelay` not found

- [ ] **Step 3: Write the signal relay engine**

Create `src/lib/signalRelay.ts`:

```ts
import type { RelayLevel } from '../types';

// ── Replacement dictionaries ────────────────────────────────────────

const NUMBER_PATTERNS: [RegExp, string][] = [
  [/\$[\d,.]+[MBKmk]?\b/g, 'a significant amount'],
  [/\d+(\.\d+)?%/g, 'a notable percentage'],
  [/\d{2,}[\s]?PSI\b/gi, 'elevated pressure'],
  [/\d{2,}[\s]?(units?|pieces?|items?)\b/gi, 'several $1'],
  [/\b\d{3,}(,\d{3})*\b/g, 'a large number'],
  [/\b\d{1,2}\b(?!\s*(am|pm|st|nd|rd|th|level|L\d))/g, 'some'],
];

const LOCATION_PATTERNS: [RegExp, string][] = [
  [/\b(Line|Section|Unit|Building|Terminal|Gate|Bay)\s+[A-Z0-9-]+\b/gi, 'one of our $1s'],
  [/\b[A-Z][a-z]+\s+(Corp|Inc|LLC|Ltd|Co)\b/g, 'a client'],
  [/\b[A-Z][a-z]+\s+[A-Z][a-z]+(?=\s+(said|found|reported|discovered|flagged|noted))/g, 'someone'],
  [/\b[A-Z][a-z]{2,}(?=\s+(said|found|reported|discovered|flagged|noted))/g, 'someone'],
];

const URGENCY_REPLACEMENTS: [RegExp, string][] = [
  [/\bcritical\s+failure\b/gi, 'potential issue'],
  [/\bcritical\b/gi, 'potential'],
  [/\burgent(ly)?\b/gi, 'noteworthy'],
  [/\bimmediately\b/gi, 'when possible'],
  [/\bas soon as possible\b/gi, 'at an appropriate time'],
  [/\bemergency\b/gi, 'situation'],
  [/\bthreatening to\b/gi, 'considering'],
  [/\bdemanding\b/gi, 'requesting'],
  [/\bfailed\b/gi, 'experienced issues'],
  [/\bbroken\b/gi, 'not functioning as expected'],
];

const PASSIVE_REPLACEMENTS: [RegExp, string][] = [
  [/\bI discovered\b/gi, 'It was noted'],
  [/\bI found\b/gi, 'It was found'],
  [/\bI noticed\b/gi, 'It was observed'],
  [/\bwe need to\b/gi, 'it may be worth considering'],
  [/\bwe must\b/gi, 'it is suggested that we'],
  [/\bI recommend\b/gi, 'One option would be to'],
  [/\bwe can\b/gi, 'there may be an opportunity to'],
];

const OWNERSHIP_REPLACEMENTS: [RegExp, string][] = [
  [/\bthe team identified\b/gi, "it's been flagged"],
  [/\bthe team found\b/gi, "it's been noted"],
  [/\bthe team reported\b/gi, "it's been reported"],
  [/\bwe identified\b/gi, "it's been flagged"],
  [/\bsomeone found\b/gi, "it's been noted"],
  [/\bsomeone reported\b/gi, "it's been reported"],
  [/\bsomeone discovered\b/gi, "it's been noted"],
  [/\bour team\b/gi, 'the organization'],
];

const ACTION_REPLACEMENTS: [RegExp, string][] = [
  [/\bwe should\s+(\w+)/gi, '$1ing options are being evaluated'],
  [/\bwe need to\s+(\w+)/gi, '$1ing is under review'],
  [/\bwe recommend\s+(\w+)ing\b/gi, '$1ing is being considered'],
  [/\bpropose[ds]?\s+(to\s+)?(\w+)/gi, '$2ing possibilities are being explored'],
  [/\bfix\s+(this|that|it|the)\b/gi, 'address $1 matter'],
  [/\bswitch\s+(to|from)\b/gi, 'evaluate alternatives $1'],
];

// ── Engine ──────────────────────────────────────────────────────────

function applyPatterns(text: string, patterns: [RegExp, string][]): string {
  let result = text;
  for (const [regex, replacement] of patterns) {
    result = result.replace(regex, replacement);
  }
  return result;
}

/**
 * Apply progressive relay transformations to a message.
 * Level 0 = original (no transforms). Higher levels = more distortion.
 *
 * L1-L2: number stripping + name/location genericizing
 * L3-L5: + urgency softening + passive voice
 * L6+:   + ownership dilution + action→observation
 */
export function applyRelayTransforms(message: string, level: number): string {
  if (level <= 0 || !message) return message;

  let result = message;

  // L1-L2: Numbers + Names
  if (level >= 1) {
    result = applyPatterns(result, NUMBER_PATTERNS);
    result = applyPatterns(result, LOCATION_PATTERNS);
  }

  // L3-L5: Urgency + Passive
  if (level >= 3) {
    result = applyPatterns(result, URGENCY_REPLACEMENTS);
    result = applyPatterns(result, PASSIVE_REPLACEMENTS);
  }

  // L6+: Ownership + Action→Observation
  if (level >= 6) {
    result = applyPatterns(result, OWNERSHIP_REPLACEMENTS);
    result = applyPatterns(result, ACTION_REPLACEMENTS);
  }

  // Clean up double spaces from removals
  return result.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Truncate a scenario's 8 authored relay levels based on the org's level count.
 * N org levels = N-1 relay hops. Returns the first min(N-1, source.length) levels.
 */
export function truncateRelayLevels(source: RelayLevel[], orgLevels: number): RelayLevel[] {
  const relayCount = Math.max(0, orgLevels - 1);
  return source.slice(0, Math.min(relayCount, source.length));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run src/lib/__tests__/signalRelay.test.ts`
Expected: all tests PASS. If specific regex patterns don't match test expectations, adjust patterns until green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/signalRelay.ts src/lib/__tests__/signalRelay.test.ts
git commit -m "feat(lib): add signal relay transformation engine with tests"
```

---

### Task 3: Scenario Data

**Files:**
- Create: `src/data/scenarios.ts`

- [ ] **Step 1: Add test for scenario data integrity**

Append to `src/lib/__tests__/signalRelay.test.ts`:

```ts
import { SCENARIOS } from '../../data/scenarios';

describe('scenario data integrity', () => {
  it('has exactly 5 scenarios', () => {
    expect(SCENARIOS).toHaveLength(5);
  });

  it('covers all 5 categories', () => {
    const categories = new Set(SCENARIOS.map((s) => s.category));
    expect(categories).toEqual(new Set(['safety', 'strategy', 'customer', 'innovation', 'operations']));
  });

  it('each scenario has exactly 8 relay levels', () => {
    for (const scenario of SCENARIOS) {
      expect(scenario.levels).toHaveLength(8);
    }
  });

  it('each relay level has all required fields', () => {
    for (const scenario of SCENARIOS) {
      for (const level of scenario.levels) {
        expect(level.role).toBeTruthy();
        expect(level.message).toBeTruthy();
        expect(level.incentive).toBeTruthy();
        expect(Array.isArray(level.lostDetails)).toBe(true);
        expect(Array.isArray(level.addedFraming)).toBe(true);
      }
    }
  });

  it('messages get shorter or equal at each successive level', () => {
    for (const scenario of SCENARIOS) {
      for (let i = 1; i < scenario.levels.length; i++) {
        expect(scenario.levels[i].message.length).toBeLessThanOrEqual(
          scenario.levels[i - 1].message.length * 1.3 // Allow slight expansion for reframing
        );
      }
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run src/lib/__tests__/signalRelay.test.ts`
Expected: FAIL — `../../data/scenarios` not found

- [ ] **Step 3: Create the scenarios data file**

Create `src/data/scenarios.ts`:

```ts
import type { Scenario } from '../types';

export const SCENARIOS: Scenario[] = [
  // ── Safety Incident ───────────────────────────────────────────────
  {
    id: 'safety-incident',
    title: 'Safety Incident Report',
    category: 'safety',
    originalMessage:
      'At 2:47 PM today, valve V-2847 on Line 12, Section B failed at 180 PSI — 40 PSI above rated capacity. I shut it down manually. Two operators were within 15 feet. We need to replace the valve and inspect all V-28 series units on this line immediately. The supplier, Meridian Controls, shipped a defective batch last quarter.',
    levels: [
      {
        role: 'Shift Supervisor',
        message:
          'A valve on Line 12 over-pressured to 180 PSI this afternoon. The technician shut it down. Two people were nearby but no injuries. We need to replace it and check similar valves. May be a supplier quality issue with Meridian Controls.',
        incentive: 'Preserved most details but dropped the exact valve ID and time — not relevant to their daily summary format',
        lostDetails: ['valve ID V-2847', 'exact time 2:47 PM', 'Section B', '15-foot proximity detail'],
        addedFraming: ['no injuries'],
      },
      {
        role: 'Area Manager',
        message:
          'We had a valve over-pressure event on Line 12 today. No injuries. The valve has been isolated. We may need to inspect similar units across the line. There could be a supplier quality issue.',
        incentive: 'Reframed as a contained "event" rather than a failure — avoids triggering the formal incident escalation process',
        lostDetails: ['PSI reading', 'operator proximity', 'specific supplier name', 'defective batch detail'],
        addedFraming: ['event', 'has been isolated', 'could be'],
      },
      {
        role: 'Plant Manager',
        message:
          'There was an equipment event on one of our lines today. No personnel impact. The team is assessing whether similar equipment needs inspection. A supplier review may be warranted.',
        incentive: 'Generalized to "equipment event" to avoid flagging the line in the regional safety dashboard',
        lostDetails: ['Line 12', 'valve type', 'over-pressure specifics'],
        addedFraming: ['equipment event', 'no personnel impact', 'may be warranted'],
      },
      {
        role: 'Regional Operations Director',
        message:
          'The plant reported a contained equipment matter today. No safety impact. The local team is reviewing their maintenance procedures and supplier relationships.',
        incentive: 'Softened to "contained matter" — doesn\'t want this on the VP\'s radar as a safety incident',
        lostDetails: ['inspection need', 'specific line', 'urgency'],
        addedFraming: ['contained', 'matter', 'reviewing procedures'],
      },
      {
        role: 'VP of Operations',
        message:
          'Operations reported a minor equipment issue at one of our facilities. No injuries or downtime. The regional team is handling it through standard maintenance protocols.',
        incentive: 'Positioned as routine maintenance to avoid executive alarm and potential board notification',
        lostDetails: ['which plant', 'supplier issue', 'inspection scope'],
        addedFraming: ['minor', 'standard protocols', 'handling it'],
      },
      {
        role: 'SVP of Operations',
        message:
          'A routine maintenance item was identified at one of our facilities. Standard procedures are being followed. No operational impact.',
        incentive: 'Reduced to a single sentence suitable for the weekly executive summary — no action needed from this level',
        lostDetails: ['equipment type', 'any sense of urgency', 'team involvement'],
        addedFraming: ['routine', 'standard procedures', 'no operational impact'],
      },
      {
        role: 'Chief Operating Officer',
        message:
          'Facilities maintenance is proceeding normally. No issues requiring executive attention at this time.',
        incentive: 'COO filters for items requiring their action — this doesn\'t qualify, so it gets a clean bill of health',
        lostDetails: ['that any incident occurred', 'facility name', 'equipment', 'supplier'],
        addedFraming: ['proceeding normally', 'no issues requiring attention'],
      },
      {
        role: 'CEO (Board Report)',
        message:
          'Operations: performing within normal parameters. No safety incidents to report.',
        incentive: 'Board reports are curated for material items — a contained valve issue doesn\'t meet the threshold',
        lostDetails: ['everything — the incident has been completely absorbed'],
        addedFraming: ['within normal parameters', 'no incidents to report'],
      },
    ],
  },

  // ── Customer Escalation ───────────────────────────────────────────
  {
    id: 'customer-escalation',
    title: 'Customer Escalation',
    category: 'customer',
    originalMessage:
      'Apex Industries — our 3rd largest account at $4.2M ARR — called today. Their CTO, David Chen, says our API integration has been failing 30% of requests for 2 weeks. They\'ve already started evaluating CompetitorX. David wants a fix commitment by Friday or they\'re starting the migration. I need engineering priority immediately.',
    levels: [
      {
        role: 'Support Team Lead',
        message:
          'Apex Industries, a major account worth over $4M ARR, is experiencing API failures affecting 30% of requests. Their CTO has given us until Friday for a fix or they\'ll evaluate alternatives. We need engineering to prioritize this.',
        incentive: 'Preserved urgency and key details but dropped the competitor name — focuses on what the team can control',
        lostDetails: ['CTO name David Chen', 'CompetitorX name', '2-week duration'],
        addedFraming: ['evaluate alternatives'],
      },
      {
        role: 'Customer Success Manager',
        message:
          'A top-tier account is reporting significant API reliability issues. They\'ve set a Friday deadline for resolution. There\'s churn risk if we don\'t respond quickly. Requesting engineering prioritization.',
        incentive: 'Abstracted to "top-tier account" — the CS manager handles many accounts and frames this as one of several priorities',
        lostDetails: ['Apex Industries name', '$4.2M ARR', '30% failure rate', 'active competitor evaluation'],
        addedFraming: ['significant', 'churn risk', 'respond quickly'],
      },
      {
        role: 'Director of Customer Success',
        message:
          'We have a retention risk with one of our larger accounts due to integration reliability concerns. The account team is working to address it this week. May need some engineering bandwidth.',
        incentive: 'Reframed as a "retention risk" being managed — doesn\'t want to appear unable to handle their portfolio',
        lostDetails: ['Friday deadline', 'severity of failures', 'competitor evaluation', 'customer ultimatum'],
        addedFraming: ['retention risk', 'working to address', 'some bandwidth'],
      },
      {
        role: 'VP of Customer Experience',
        message:
          'Customer success is managing a few at-risk accounts this quarter, including one with some integration concerns. The team has it in hand.',
        incentive: 'Bundled with other at-risk accounts to normalize it — one account doesn\'t warrant VP-level alarm',
        lostDetails: ['single account severity', 'timeline', 'ARR at stake', 'engineering need'],
        addedFraming: ['a few at-risk accounts', 'has it in hand'],
      },
      {
        role: 'Chief Revenue Officer',
        message:
          'Customer health metrics are stable overall. The CS team is proactively working a few accounts flagged for attention. No material churn risk at this time.',
        incentive: 'CRO presents portfolio health to the CEO — one account doesn\'t change the narrative',
        lostDetails: ['all specifics', 'urgency', 'any single account detail'],
        addedFraming: ['stable overall', 'proactively working', 'no material churn risk'],
      },
      {
        role: 'SVP / Chief Customer Officer',
        message:
          'Customer retention programs are performing well. We\'re seeing healthy engagement across our enterprise accounts.',
        incentive: 'At this altitude, individual account issues are invisible — only trends matter',
        lostDetails: ['that any account is at risk', 'integration problems', 'deadlines'],
        addedFraming: ['performing well', 'healthy engagement'],
      },
      {
        role: 'Chief Operating Officer',
        message:
          'Customer operations are running smoothly. Retention metrics are on track for the quarter.',
        incentive: 'COO synthesizes across functions — customer health gets a single line in the operations summary',
        lostDetails: ['everything customer-specific'],
        addedFraming: ['running smoothly', 'on track'],
      },
      {
        role: 'CEO (Board Report)',
        message:
          'Revenue: customer retention remains strong. No significant churn events.',
        incentive: 'Board reports focus on material changes — a single at-risk account doesn\'t cross the reporting threshold',
        lostDetails: ['all trace of the original escalation'],
        addedFraming: ['remains strong', 'no significant events'],
      },
    ],
  },

  // ── Innovation Proposal ───────────────────────────────────────────
  {
    id: 'innovation-proposal',
    title: 'Innovation Proposal',
    category: 'innovation',
    originalMessage:
      'I\'ve built a working prototype that replaces our batch ETL pipeline with real-time streaming. Tests show 94% latency reduction — from 45 minutes to under 3 minutes. It would save us approximately $380K/year in compute costs and eliminate the 6 AM data freshness complaints from the analytics team. I can have it production-ready in 3 weeks with one additional engineer.',
    levels: [
      {
        role: 'Tech Lead',
        message:
          'One of the engineers has prototyped a streaming replacement for our batch ETL. Early tests show significant latency improvements — sub-3-minute processing versus 45 minutes. Estimated $380K annual savings. Needs about 3 weeks and one additional engineer to productionize.',
        incentive: 'Tech lead validates the technical claim but attributes it to "one of the engineers" — team credit, not individual',
        lostDetails: ['94% specific reduction', 'working prototype emphasis'],
        addedFraming: ['early tests', 'estimated', 'about'],
      },
      {
        role: 'Engineering Manager',
        message:
          'The team has been exploring streaming alternatives to our batch pipeline. Initial results are promising — much faster processing times and potential cost savings in the hundreds of thousands. Would need to allocate some sprint capacity to evaluate further.',
        incentive: 'Manager hedges the savings and reframes as "exploration" — doesn\'t want to commit to numbers they\'ll be held to',
        lostDetails: ['exact latency numbers', '$380K figure', '3-week timeline', 'prototype exists'],
        addedFraming: ['exploring', 'initial', 'promising', 'potential', 'evaluate further'],
      },
      {
        role: 'Director of Engineering',
        message:
          'Engineering is looking into modernizing some of our data infrastructure. There may be opportunities for performance improvements and cost optimization. Still in early evaluation.',
        incentive: 'Director generalizes to "modernizing infrastructure" — fits better in their quarterly roadmap narrative',
        lostDetails: ['streaming specifics', 'any numbers', 'timeline', 'analytics team complaints'],
        addedFraming: ['modernizing', 'may be opportunities', 'early evaluation'],
      },
      {
        role: 'VP of Engineering',
        message:
          'The engineering team is evaluating some infrastructure optimization opportunities as part of our ongoing technical excellence initiatives.',
        incentive: 'VP wraps it in strategic language — "technical excellence initiatives" sounds better in leadership meetings',
        lostDetails: ['what the optimization is', 'cost savings', 'performance gains', 'that a prototype exists'],
        addedFraming: ['ongoing technical excellence initiatives'],
      },
      {
        role: 'SVP of Technology',
        message:
          'Technology teams continue to identify efficiency improvements across our platform. Normal course of business.',
        incentive: 'SVP normalizes innovation as routine — every team claims efficiency improvements every quarter',
        lostDetails: ['specific project', 'any urgency or opportunity'],
        addedFraming: ['continue to', 'normal course of business'],
      },
      {
        role: 'Chief Technology Officer',
        message:
          'Technology operations are stable. Teams are executing against the current roadmap with some incremental optimization work in flight.',
        incentive: 'CTO reports stability and roadmap execution to the CEO — a single engineer\'s prototype doesn\'t change the narrative',
        lostDetails: ['all trace of the innovation'],
        addedFraming: ['stable', 'executing against roadmap', 'incremental'],
      },
      {
        role: 'Chief Operating Officer',
        message:
          'Technology: stable operations, roadmap on track. No resource requests at this time.',
        incentive: 'COO distills each function to a single line — technology gets "stable, on track"',
        lostDetails: ['everything'],
        addedFraming: ['no resource requests'],
      },
      {
        role: 'CEO (Board Report)',
        message:
          'Technology: executing on plan. Infrastructure performing within expectations.',
        incentive: 'Board sees technology as a cost center delivering on commitments — innovation from below is invisible',
        lostDetails: ['a $380K savings opportunity with a working prototype'],
        addedFraming: ['executing on plan', 'within expectations'],
      },
    ],
  },

  // ── Strategic Risk ────────────────────────────────────────────────
  {
    id: 'strategic-risk',
    title: 'Strategic Risk Alert',
    category: 'strategy',
    originalMessage:
      'CompetitorY just announced a free tier targeting our mid-market segment. They\'ve hired 40 enterprise sales reps in Q1 and their pricing undercuts us by 35%. Based on their job postings and patent filings, they\'re building features that directly replicate our top 3 differentiators. We have a 6-month window before they reach feature parity. I recommend we accelerate our enterprise roadmap and consider a defensive pricing adjustment.',
    levels: [
      {
        role: 'Market Intelligence Analyst Lead',
        message:
          'CompetitorY launched a free tier for mid-market. They\'ve expanded sales (40+ new enterprise reps) and their pricing is 35% below ours. Patent filings suggest they\'re replicating our key differentiators. Estimated 6-month window to feature parity. Recommending accelerated enterprise roadmap and pricing review.',
        incentive: 'Lead validated the data and preserved the recommendation — their job is to surface exactly this kind of threat',
        lostDetails: ['Q1 timing specificity', 'top 3 differentiators detail'],
        addedFraming: ['40+', 'suggesting', 'estimated'],
      },
      {
        role: 'Director of Strategy',
        message:
          'A key competitor is becoming more aggressive in mid-market — new free tier, expanded sales team, competitive pricing. Intelligence suggests they\'re investing in feature parity. Recommend we review our enterprise roadmap timeline and pricing strategy.',
        incentive: 'Director abstracts to strategic framing — "more aggressive" is easier to present than specific data points',
        lostDetails: ['35% undercut', '40 reps', '6-month window', 'patent filing details'],
        addedFraming: ['more aggressive', 'investing in', 'review'],
      },
      {
        role: 'VP of Strategy',
        message:
          'Competitive dynamics are shifting in mid-market. We\'re seeing increased activity from a key player. Strategy team is monitoring and will present options at the next planning cycle.',
        incentive: 'VP defers action to "next planning cycle" — presenting urgent competitive threats makes the strategy team look reactive',
        lostDetails: ['competitor name', 'free tier', 'pricing data', 'timeline urgency', 'recommendation'],
        addedFraming: ['shifting', 'monitoring', 'next planning cycle'],
      },
      {
        role: 'Chief Strategy Officer',
        message:
          'The competitive landscape continues to evolve in our key segments. The strategy team is tracking developments and will incorporate findings into our annual planning process.',
        incentive: 'CSO frames everything through the annual planning lens — urgent course corrections imply the current strategy was wrong',
        lostDetails: ['specific competitor', 'mid-market threat', '6-month window', 'all recommendations'],
        addedFraming: ['continues to evolve', 'tracking', 'annual planning process'],
      },
      {
        role: 'SVP / Chief Commercial Officer',
        message:
          'Market position remains solid across segments. Strategy is incorporating latest competitive intelligence into forward planning.',
        incentive: 'CCO projects confidence — admitting competitive vulnerability could spook the sales org',
        lostDetails: ['any sense of threat', 'specific segment at risk', 'timeline'],
        addedFraming: ['remains solid', 'forward planning'],
      },
      {
        role: 'Chief Operating Officer',
        message:
          'Commercial operations are healthy. Strategy team continues standard competitive monitoring.',
        incentive: 'COO summarizes for CEO — commercial gets "healthy" unless there\'s a revenue miss',
        lostDetails: ['everything competitive'],
        addedFraming: ['healthy', 'standard monitoring'],
      },
      {
        role: 'President',
        message:
          'Market position is strong. No competitive threats requiring immediate strategic adjustment.',
        incentive: 'President filters for board-level items — only existential threats would surface here',
        lostDetails: ['all original intelligence'],
        addedFraming: ['strong', 'no threats requiring adjustment'],
      },
      {
        role: 'CEO (Board Report)',
        message:
          'Market: competitive position remains favorable. Strategy execution on track.',
        incentive: 'Board hears "favorable position" while a competitor is 6 months from feature parity with a 35% price advantage',
        lostDetails: ['the entire competitive threat'],
        addedFraming: ['favorable', 'on track'],
      },
    ],
  },

  // ── Operational Bottleneck ────────────────────────────────────────
  {
    id: 'operational-bottleneck',
    title: 'Operational Bottleneck',
    category: 'operations',
    originalMessage:
      'Our packing line throughput dropped from 1,200 units/hour to 780 units/hour — a 35% decline since we switched to the new conveyor firmware last Tuesday. The root cause is a timing mismatch between the vision system and the diverter gates. I\'ve identified the exact firmware parameter (gate_delay_ms = 340, should be 220) and can fix it in 2 hours. Every hour of delay costs us $8,400 in lost output.',
    levels: [
      {
        role: 'Shift Supervisor',
        message:
          'Packing line throughput has dropped about 35% since the firmware update last week — down to around 780 units/hour from 1,200. The operator identified a timing parameter causing the issue and says it\'s a 2-hour fix. We\'re losing significant output every hour this continues.',
        incentive: 'Preserved the urgency and solution but rounded the numbers — exact firmware parameters aren\'t relevant at this level',
        lostDetails: ['gate_delay_ms parameter', 'exact cost per hour', 'vision system detail'],
        addedFraming: ['about', 'around', 'significant output'],
      },
      {
        role: 'Production Manager',
        message:
          'Packing line performance has been below target since last week\'s firmware update. The team has diagnosed the issue — it\'s a configuration problem with a known fix. Requesting authorization to implement the correction.',
        incentive: 'Manager frames as "below target" requiring authorization — can\'t implement changes without approval in their process',
        lostDetails: ['35% decline', 'specific throughput numbers', '2-hour fix timeline', 'hourly cost'],
        addedFraming: ['below target', 'configuration problem', 'requesting authorization'],
      },
      {
        role: 'Director of Manufacturing',
        message:
          'The packing area is experiencing some throughput challenges related to a recent system update. The production team is working on a resolution. May impact weekly output targets.',
        incentive: 'Director softens "35% drop" to "some challenges" — avoids appearing to have approved a bad firmware update',
        lostDetails: ['root cause identified', 'fix is ready', 'cost per hour', 'specific decline'],
        addedFraming: ['some challenges', 'working on', 'may impact'],
      },
      {
        role: 'VP of Manufacturing',
        message:
          'Manufacturing is managing some optimization work following a recent system upgrade. The team is making adjustments to restore full throughput. Minimal operational impact expected.',
        incentive: 'VP reframes a failed update as "optimization work" — the word "problem" doesn\'t appear in VP-level updates',
        lostDetails: ['severity of throughput loss', 'ready fix', 'cost accumulating'],
        addedFraming: ['optimization work', 'upgrade', 'adjustments', 'minimal impact expected'],
      },
      {
        role: 'SVP of Operations',
        message:
          'Manufacturing operations are running with minor post-upgrade tuning underway. Normal commissioning process. Output targets remain achievable.',
        incentive: 'SVP normalizes as routine post-upgrade activity — every system change has a "tuning" phase',
        lostDetails: ['that output is 35% below normal', 'that a fix exists but hasn\'t been applied'],
        addedFraming: ['minor tuning', 'normal commissioning', 'targets remain achievable'],
      },
      {
        role: 'Chief Operating Officer',
        message:
          'Manufacturing is completing a planned system upgrade. Operations are transitioning smoothly. No production concerns.',
        incentive: 'COO filters for items needing their intervention — a "planned upgrade" doesn\'t qualify',
        lostDetails: ['all trace of the problem', 'cost impact', 'throughput decline'],
        addedFraming: ['planned', 'transitioning smoothly', 'no concerns'],
      },
      {
        role: 'Chief Supply Chain Officer',
        message:
          'Supply chain and manufacturing operations are performing within planned parameters. System modernization initiatives progressing on schedule.',
        incentive: 'CSCO reports at portfolio level — individual line performance is several layers below their view',
        lostDetails: ['everything specific to the incident'],
        addedFraming: ['within planned parameters', 'progressing on schedule'],
      },
      {
        role: 'CEO (Board Report)',
        message:
          'Operations: production systems performing as expected. Modernization investments on track.',
        incentive: 'Board sees "performing as expected" while $8,400/hour bleeds from an unfixed 2-hour configuration error',
        lostDetails: ['a ready fix blocked by organizational process while costs accumulate'],
        addedFraming: ['performing as expected', 'investments on track'],
      },
    ],
  },
];
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run src/lib/__tests__/signalRelay.test.ts`
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/scenarios.ts src/lib/__tests__/signalRelay.test.ts
git commit -m "feat(data): add 5 hand-authored relay scenarios with integrity tests"
```

---

### Task 4: Zustand Store Extension

**Files:**
- Modify: `src/store/useCompanyStore.ts`

- [ ] **Step 1: Add simulation state to the store**

Open `src/store/useCompanyStore.ts`. Add the new fields to the interface and implementation. The new fields are NOT persisted (the store currently has no `partialize` — all fields persist. We need to add `partialize` to exclude the new fields).

Replace the full file content with:

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompanyState {
  fidelityRate: number;
  levels: number;
  headcount: number;
  // Simulation state (not persisted)
  activeScenarioId: string | null;
  customMessage: string;
  simulationActive: boolean;
}

interface CompanyActions {
  setFidelityRate: (rate: number) => void;
  setLevels: (levels: number) => void;
  setHeadcount: (headcount: number) => void;
  setActiveScenarioId: (id: string | null) => void;
  setCustomMessage: (msg: string) => void;
  setSimulationActive: (active: boolean) => void;
}

/** Apply ?l=&h=&f= URL params to the store. Returns true if any params were found. */
function applyUrlParams(): boolean {
  const params = new URLSearchParams(window.location.search);
  const l = params.get('l');
  const h = params.get('h');
  const f = params.get('f');
  if (!l && !h && !f) return false;

  const state = useCompanyStore.getState();
  if (l) {
    const levels = Math.max(1, Math.min(15, Math.round(Number(l))));
    if (!isNaN(levels)) state.setLevels(levels);
  }
  if (h) {
    const headcount = Math.max(50, Math.min(500000, Math.round(Number(h))));
    if (!isNaN(headcount)) state.setHeadcount(headcount);
  }
  if (f) {
    const fidelity = Math.max(50, Math.min(98, Math.round(Number(f))));
    if (!isNaN(fidelity)) state.setFidelityRate(fidelity);
  }
  return true;
}

export const useCompanyStore = create<CompanyState & CompanyActions>()(
  persist(
    (set) => ({
      fidelityRate: 82,
      levels: 6,
      headcount: 5000,
      activeScenarioId: null,
      customMessage: '',
      simulationActive: false,
      setFidelityRate: (rate) => set({ fidelityRate: rate }),
      setLevels: (levels) => set({ levels }),
      setHeadcount: (headcount) => set({ headcount }),
      setActiveScenarioId: (id) => set({ activeScenarioId: id }),
      setCustomMessage: (msg) => set({ customMessage: msg }),
      setSimulationActive: (active) => set({ simulationActive: active }),
    }),
    {
      name: 'org-shape-storage',
      // Only persist the core org inputs — simulation state resets on reload
      partialize: (state) => ({
        fidelityRate: state.fidelityRate,
        levels: state.levels,
        headcount: state.headcount,
      }),
      // URL params must override persisted state. persist rehydrates async
      // (microtask), so we re-apply URL params after rehydration completes.
      onRehydrateStorage: () => () => { applyUrlParams(); },
    }
  )
);

// Also apply immediately at module load for the first-visit case
// (no persisted state → no rehydration override to worry about).
applyUrlParams();

/** Build a shareable URL from current store state. */
export function buildShareUrl(): string {
  const { levels, headcount, fidelityRate } = useCompanyStore.getState();
  const url = new URL(window.location.href);
  url.search = `?l=${levels}&h=${headcount}&f=${fidelityRate}`;
  url.hash = 'model';
  return url.toString();
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Run full test suite**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run`
Expected: all tests PASS (existing 101 + new signal relay tests)

- [ ] **Step 4: Commit**

```bash
git add src/store/useCompanyStore.ts
git commit -m "feat(store): add simulation state fields with partialize exclusion"
```

---

### Task 5: RelayCard Component

**Files:**
- Create: `src/components/model/RelayCard.tsx`

- [ ] **Step 1: Create the RelayCard component**

Create `src/components/model/RelayCard.tsx`:

```tsx
import { motion } from 'framer-motion';
import type { RelayLevel } from '../../types';

interface RelayCardProps {
  level: RelayLevel;
  index: number;
  isCustom?: boolean;
}

export function RelayCard({ level, index, isCustom }: RelayCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.21, 0.47, 0.32, 0.98],
        delay: index * 0.4,
      }}
      className="border border-stone-200 rounded-xl p-4 bg-white"
    >
      {/* Level badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
          L{index + 1}
        </span>
        <span className="text-xs font-semibold text-stone-700">{level.role}</span>
      </div>

      {/* Distorted message */}
      <p className="text-sm text-stone-800 leading-relaxed mb-2">
        {level.message}
      </p>

      {/* Lost details + added framing tags */}
      {!isCustom && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {level.lostDetails.map((d) => (
            <span
              key={d}
              className="text-[10px] text-stone-400 line-through"
            >
              {d}
            </span>
          ))}
          {level.addedFraming.map((f) => (
            <span
              key={f}
              className="text-[10px] text-ember font-medium"
            >
              +{f}
            </span>
          ))}
        </div>
      )}

      {/* Incentive annotation */}
      <p className="text-[11px] italic text-stone-400 leading-snug">
        {level.incentive}
      </p>
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/model/RelayCard.tsx
git commit -m "feat(ui): add RelayCard component with level badge, diff tags, incentive annotation"
```

---

### Task 6: RelayCascade Component

**Files:**
- Create: `src/components/model/RelayCascade.tsx`

- [ ] **Step 1: Create the RelayCascade component**

Create `src/components/model/RelayCascade.tsx`:

```tsx
import { motion } from 'framer-motion';
import { useCompanyStore } from '../../store/useCompanyStore';
import { calcOrgMetrics } from '../../lib/orgMetrics';
import { truncateRelayLevels, applyRelayTransforms } from '../../lib/signalRelay';
import { SCENARIOS } from '../../data/scenarios';
import { RelayCard } from './RelayCard';
import { SignalVerdictCard } from './SignalVerdictCard';
import type { RelayLevel } from '../../types';

export function RelayCascade() {
  const levels = useCompanyStore((s) => s.levels);
  const fidelityRate = useCompanyStore((s) => s.fidelityRate);
  const headcount = useCompanyStore((s) => s.headcount);
  const activeScenarioId = useCompanyStore((s) => s.activeScenarioId);
  const customMessage = useCompanyStore((s) => s.customMessage);

  const scenario = SCENARIOS.find((s) => s.id === activeScenarioId);
  const message = scenario?.originalMessage ?? customMessage;

  if (!message.trim()) return null;

  // Build relay levels — hand-authored for scenarios, engine-generated for custom
  let relayLevels: RelayLevel[];
  let isCustom = false;

  if (scenario) {
    relayLevels = truncateRelayLevels(scenario.levels, levels);
  } else {
    isCustom = true;
    const roleNames = [
      'Direct Supervisor', 'Department Manager', 'Senior Manager',
      'Director', 'VP', 'Senior VP', 'C-Suite Executive', 'CEO',
    ];
    const relayCount = Math.max(0, levels - 1);
    relayLevels = Array.from({ length: Math.min(relayCount, 8) }, (_, i) => ({
      role: roleNames[i],
      message: applyRelayTransforms(message, i + 1),
      incentive: CUSTOM_INCENTIVES[Math.min(i, CUSTOM_INCENTIVES.length - 1)],
      lostDetails: [],
      addedFraming: [],
    }));
  }

  const metrics = calcOrgMetrics(levels, headcount, fidelityRate);

  return (
    <div className="space-y-3">
      {/* Original signal card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="border-2 border-ember/40 rounded-xl p-4 bg-ember/5"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold font-mono text-ember bg-ember/10 px-1.5 py-0.5 rounded">
            ORIGIN
          </span>
          <span className="text-xs font-semibold text-stone-700">Original Signal</span>
        </div>
        <p className="text-sm text-stone-800 leading-relaxed">{message}</p>
      </motion.div>

      {/* Relay cards */}
      {relayLevels.map((level, i) => (
        <RelayCard key={i} level={level} index={i} isCustom={isCustom} />
      ))}

      {/* Verdict */}
      {relayLevels.length > 0 && (
        <SignalVerdictCard
          fidelityPct={metrics.fidelityAtTopPct}
          relayCount={relayLevels.length}
          delayIndex={relayLevels.length}
          finalMessage={relayLevels[relayLevels.length - 1].message}
        />
      )}
    </div>
  );
}

const CUSTOM_INCENTIVES = [
  'Summarized for brevity — specific details deemed unnecessary for this level',
  'Generalized to fit the standard reporting format at this level',
  'Softened urgency to avoid triggering escalation protocols',
  'Reframed to match the narrative expected in leadership updates',
  'Abstracted to portfolio-level language — individual items lose specificity',
  'Filtered for executive relevance — only material items surface',
  'Compressed into a single status line for the operations summary',
  'Reduced to a sentiment indicator — the original signal is unrecoverable',
];
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: error — `SignalVerdictCard` not found yet. That's expected, we'll create it in the next task.

- [ ] **Step 3: Commit (after Task 7 creates SignalVerdictCard)**

Defer commit to end of Task 7.

---

### Task 7: SignalVerdictCard Component

**Files:**
- Create: `src/components/model/SignalVerdictCard.tsx`

- [ ] **Step 1: Create the SignalVerdictCard component**

Create `src/components/model/SignalVerdictCard.tsx`:

```tsx
import { motion } from 'framer-motion';
import { fidelityColor } from '../../lib/fidelityColor';

interface SignalVerdictCardProps {
  fidelityPct: number;
  relayCount: number;
  delayIndex: number;
  finalMessage: string;
}

function verdictLabel(pct: number): string {
  if (pct >= 80) return 'Strong signal — leadership sees most of the picture';
  if (pct >= 60) return 'Moderate decay — key details are blurred';
  if (pct >= 40) return 'Significant loss — the message has been reshaped';
  if (pct >= 20) return 'Severe decay — only the sentiment survived';
  return 'Near-total loss — the original signal is unrecoverable';
}

export function SignalVerdictCard({ fidelityPct, relayCount, delayIndex, finalMessage }: SignalVerdictCardProps) {
  const color = fidelityColor(fidelityPct, true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.21, 0.47, 0.32, 0.98],
        delay: delayIndex * 0.4 + 0.2,
      }}
      className="border-2 rounded-xl p-4"
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded text-white"
          style={{ backgroundColor: color }}
        >
          TOP
        </span>
        <span className="text-xs font-semibold text-stone-700">What Arrived at the Top</span>
      </div>

      <p className="text-sm text-stone-800 leading-relaxed mb-3 italic">
        "{finalMessage}"
      </p>

      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold font-mono" style={{ color }}>
          {fidelityPct.toFixed(0)}%
        </span>
        <span className="text-xs text-stone-500">
          signal fidelity after {relayCount} relay{relayCount !== 1 ? 's' : ''}
        </span>
      </div>
      <p className="text-[11px] text-stone-400 mt-1">{verdictLabel(fidelityPct)}</p>
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit RelayCascade + SignalVerdictCard**

```bash
git add src/components/model/RelayCascade.tsx src/components/model/SignalVerdictCard.tsx
git commit -m "feat(ui): add RelayCascade and SignalVerdictCard components"
```

---

### Task 8: ScenarioPicker + MessageInput Components

**Files:**
- Create: `src/components/model/ScenarioPicker.tsx`
- Create: `src/components/model/MessageInput.tsx`

- [ ] **Step 1: Create ScenarioPicker**

Create `src/components/model/ScenarioPicker.tsx`:

```tsx
import { useCompanyStore } from '../../store/useCompanyStore';
import { SCENARIOS } from '../../data/scenarios';
import type { ScenarioCategory } from '../../types';

const CATEGORY_LABELS: Record<ScenarioCategory, string> = {
  safety: 'Safety',
  strategy: 'Strategy',
  customer: 'Customer',
  innovation: 'Innovation',
  operations: 'Operations',
};

const CATEGORIES: ScenarioCategory[] = ['safety', 'customer', 'innovation', 'strategy', 'operations'];

export function ScenarioPicker() {
  const activeScenarioId = useCompanyStore((s) => s.activeScenarioId);
  const setActiveScenarioId = useCompanyStore((s) => s.setActiveScenarioId);
  const setCustomMessage = useCompanyStore((s) => s.setCustomMessage);

  function handleSelect(id: string) {
    if (activeScenarioId === id) {
      // Deselect
      setActiveScenarioId(null);
      setCustomMessage('');
      return;
    }
    const scenario = SCENARIOS.find((s) => s.id === id);
    if (!scenario) return;
    setActiveScenarioId(id);
    setCustomMessage(scenario.originalMessage);
  }

  return (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
        Choose a scenario
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => {
          const scenario = SCENARIOS.find((s) => s.category === cat)!;
          const isActive = activeScenarioId === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => handleSelect(scenario.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                isActive
                  ? 'bg-ember text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          );
        })}
      </div>
      {activeScenarioId && (
        <div className="text-xs text-stone-500 mt-1">
          {SCENARIOS.find((s) => s.id === activeScenarioId)?.title}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create MessageInput**

Create `src/components/model/MessageInput.tsx`:

```tsx
import { useCompanyStore } from '../../store/useCompanyStore';

export function MessageInput() {
  const customMessage = useCompanyStore((s) => s.customMessage);
  const setCustomMessage = useCompanyStore((s) => s.setCustomMessage);
  const activeScenarioId = useCompanyStore((s) => s.activeScenarioId);
  const setActiveScenarioId = useCompanyStore((s) => s.setActiveScenarioId);

  function handleChange(value: string) {
    // If user edits text, switch to custom mode
    if (activeScenarioId) {
      setActiveScenarioId(null);
    }
    setCustomMessage(value);
  }

  return (
    <div className="space-y-1.5">
      <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
        {activeScenarioId ? 'Scenario message' : 'Or type your own'}
      </div>
      <textarea
        value={customMessage}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Type a message that someone at the bottom of your org would send up the chain..."
        rows={5}
        className="w-full text-sm text-stone-800 bg-white border border-stone-200 rounded-lg p-3 resize-none placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-ember/30 focus:border-ember/40"
      />
      {!activeScenarioId && customMessage.trim() && (
        <p className="text-[10px] text-stone-400 italic">
          Custom messages use simplified transformation rules
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/model/ScenarioPicker.tsx src/components/model/MessageInput.tsx
git commit -m "feat(ui): add ScenarioPicker and MessageInput components"
```

---

### Task 9: SimulateSection + Integration

**Files:**
- Create: `src/components/model/SimulateSection.tsx`
- Modify: `src/components/layout/SectionNav.tsx`
- Modify: `src/pages/ScrollPage.tsx`

- [ ] **Step 1: Create SimulateSection**

Create `src/components/model/SimulateSection.tsx`:

```tsx
import { useCompanyStore } from '../../store/useCompanyStore';
import { SECTION_LABEL } from '../../lib/styles';
import { FadeIn } from '../ui/FadeIn';
import { ScenarioPicker } from './ScenarioPicker';
import { MessageInput } from './MessageInput';
import { RelayCascade } from './RelayCascade';

export function SimulateSection() {
  const levels = useCompanyStore((s) => s.levels);
  const setLevels = useCompanyStore((s) => s.setLevels);

  return (
    <section id="simulate" className="py-16 md:py-24 px-6 md:px-12">
      <FadeIn className="max-w-5xl mx-auto">
        <div className={`${SECTION_LABEL} mb-3`}>The Telephone Effect</div>
        <h2 className="text-3xl md:text-5xl font-bold font-serif text-stone-900 tracking-tight mb-2">
          Watch Your Message Decay
        </h2>
        <p className="text-sm text-stone-500 mb-8 max-w-2xl">
          Pick a scenario or type your own message. Then watch it pass through each management
          layer — distorted, softened, and reframed at every step.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[20rem_1fr] gap-8 items-start">
          {/* Left column — sticky on desktop */}
          <div className="lg:sticky lg:top-20 space-y-5">
            <ScenarioPicker />
            <MessageInput />

            {/* Levels slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Org Levels
                </div>
                <span className="text-sm font-bold font-mono text-stone-800">{levels}</span>
              </div>
              <input
                type="range"
                min={2}
                max={12}
                value={levels}
                onChange={(e) => setLevels(Number(e.target.value))}
                className="w-full accent-ember"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>2 (flat)</span>
                <span>12 (deep)</span>
              </div>
            </div>
          </div>

          {/* Right column — cascade */}
          <div>
            <RelayCascade />
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
```

- [ ] **Step 2: Add simulate to SectionNav**

Open `src/components/layout/SectionNav.tsx`. Replace the `SECTIONS` array (lines 4-11):

```ts
const SECTIONS = [
  { id: 'problem', label: 'Problem' },
  { id: 'simulate', label: 'Simulate' },
  { id: 'proof', label: 'Proof' },
  { id: 'shape', label: 'Shape' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'model', label: 'Model' },
  { id: 'methodology', label: 'Methodology' },
];
```

- [ ] **Step 3: Add SimulateSection to ScrollPage**

Open `src/pages/ScrollPage.tsx`. Add the import at the top (after the HeroSection import, line 9):

```ts
import { SimulateSection } from '../components/model/SimulateSection';
```

Then add the section between #problem and #proof. Insert after the closing `</section>` of #problem (after line 110) and before the `{/* ─── THE PROOF */}` comment (line 112):

```tsx
      {/* ─── THE TELEPHONE EFFECT ─── */}
      <SimulateSection />
```

- [ ] **Step 4: Verify build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Run full test suite**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run`
Expected: all tests PASS

- [ ] **Step 6: Run linter**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx eslint . --max-warnings 0`
Expected: no errors. If there are lint issues, fix them.

- [ ] **Step 7: Commit**

```bash
git add src/components/model/SimulateSection.tsx src/components/layout/SectionNav.tsx src/pages/ScrollPage.tsx
git commit -m "feat: add #simulate section — Message Relay Simulator integrated into scroll layout"
```

---

### Task 10: Visual Polish & Verification

**Files:**
- Potentially modify any component from Tasks 5-9

- [ ] **Step 1: Run the dev server and verify visually**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm run dev`

Open http://localhost:5173 in the browser. Check:
1. `#simulate` section appears between Problem and Proof
2. SectionNav shows "Simulate" pill between "Problem" and "Proof"
3. Clicking a scenario pill loads the message and triggers the cascade
4. Changing the levels slider adjusts the number of relay cards
5. Typing a custom message (after clearing scenario) generates engine-based relay cards
6. Verdict card shows fidelity % from existing `calcOrgMetrics`
7. Mobile: stacks vertically, no horizontal overflow

- [ ] **Step 2: Run full verification suite**

Run all three in sequence:
```bash
cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx tsc --noEmit && npx eslint . --max-warnings 0 && npx vitest run
```
Expected: all checks PASS

- [ ] **Step 3: Fix any issues found**

If any visual or functional issues are found, fix them and re-run verification.

- [ ] **Step 4: Final commit (if any fixes)**

```bash
git add -A
git commit -m "fix: visual polish and post-integration fixes for relay simulator"
```
