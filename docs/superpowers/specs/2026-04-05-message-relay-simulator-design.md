# Message Relay Simulator — Design Spec

**Date:** 2026-04-05
**Section:** `#simulate` (new, between #problem and #proof)
**Summary:** Interactive feature where users watch a message degrade through org levels via distortion and reframing, with incentive annotations explaining *why* each layer changes the signal.

---

## 1. Core Concept

A "telephone effect" simulator. The user selects a sample scenario (or types a custom message), and it cascades down through their org's management levels. Each level doesn't just lose detail — it actively distorts and reframes the message based on that level's incentives. The cascade animates top-down, one level at a time.

This grounds the signal decay theory in visceral, recognizable workplace situations.

## 2. Data Model

### Scenario

```ts
// src/data/scenarios.ts

interface Scenario {
  id: string
  title: string                    // "Safety Incident Report"
  category: ScenarioCategory       // "safety" | "strategy" | "customer" | "innovation" | "operations"
  originalMessage: string          // Full, specific ground-truth message
  levels: RelayLevel[]             // Pre-authored transformations (8 levels, truncated by slider)
}

interface RelayLevel {
  role: string                     // "Shift Supervisor", "Plant Manager", "VP Operations"
  message: string                  // The distorted version at this level
  incentive: string                // Why: "Softened urgency to avoid triggering formal escalation"
  lostDetails: string[]            // Specific items dropped: ["PSI reading", "section number"]
  addedFraming: string[]           // Things injected: ["being monitored", "under review"]
}

type ScenarioCategory = "safety" | "strategy" | "customer" | "innovation" | "operations"
```

### Truncation Strategy

Each scenario is authored for 8 relay levels (deep org). When the user's `levels` slider is set to N (where N < 8), display levels at indices `[0, ..., N-2]` — that is, the first N-1 authored levels. The final RelayCard always shows the scenario's last authored level (index 7) as the "what arrived at the top" content feeding the verdict card. This means a 4-level org shows relays 0, 1, 2 + the final verdict — fewer intermediate distortions, more signal preserved, which is the whole point.

## 3. Sample Scenarios (5)

### 3.1 Safety Incident (safety)
- **Original:** A field technician reports a specific valve failure with PSI readings, location codes, and exact timeline.
- **Final (8 levels):** "A maintenance item is being addressed."
- **Distortion pattern:** Urgency softening, number dropping, passive voice injection.

### 3.2 Customer Escalation (customer)
- **Original:** A support rep flags a top-10 client threatening to leave over a specific broken integration.
- **Final (8 levels):** "Some customer feedback has been noted."
- **Distortion pattern:** Stakes minimization, name dropping, reframing complaint as "feedback."

### 3.3 Innovation Proposal (innovation)
- **Original:** An engineer proposes a specific technical improvement with projected savings and timeline.
- **Final (8 levels):** "The team is exploring some efficiency ideas."
- **Distortion pattern:** Specifics stripped, ownership diluted, certainty replaced with hedging.

### 3.4 Strategic Risk (strategy)
- **Original:** A market analyst flags a competitor's specific move with data points and recommended response.
- **Final (8 levels):** "We're monitoring competitive dynamics."
- **Distortion pattern:** Urgency flattened, data removed, action item becomes passive observation.

### 3.5 Operational Bottleneck (operations)
- **Original:** A shift lead reports a specific throughput problem with exact numbers, root cause, and proposed fix.
- **Final (8 levels):** "Throughput is being reviewed."
- **Distortion pattern:** Root cause lost, proposed fix dropped, problem abstracted.

## 4. Rule-Based Engine (Custom Messages)

**File:** `src/lib/signalRelay.ts`

When users type their own message, a deterministic rule-based engine applies progressive transformations. No NLP library — regex pattern matching + replacement dictionaries.

### Transformation Rules (applied cumulatively by level)

| Level Range | Rules Applied |
|-------------|---------------|
| L1–L2 | 1. Number stripping, 2. Name/location genericizing |
| L3–L5 | + 3. Urgency softening, + 4. Passive voice injection |
| L6+ | + 5. Ownership dilution, + 6. Action → observation |

### Rule Details

1. **Number stripping** — Replace specific numbers with vague quantifiers ("180 PSI" → "high pressure", "$2.3M" → "significant amount")
2. **Name/location genericizing** — Replace proper nouns with role/category references ("Line 12, Section B" → "one of our lines", "Acme Corp" → "a client")
3. **Urgency softening** — Replace urgent language with hedged equivalents ("critical failure" → "potential issue", "immediately" → "when possible")
4. **Passive voice injection** — Reframe active statements into passive ("I discovered" → "it was noted", "we need to" → "it may be worth considering")
5. **Ownership dilution** — Remove individual attribution ("Sarah found" → "the team identified" → "it's been flagged")
6. **Action → observation** — Convert recommendations into status reports ("we should switch vendors" → "vendor options are being evaluated")

A small disclaimer is shown for custom messages: "Custom messages use simplified transformation rules."

## 5. UI Layout

### Desktop: Two-Column CSS Grid

Matches the existing `ModelYourOrg` pattern (sticky left, scrollable right).

**Left column (sticky):**
- Category pill buttons (Safety, Strategy, Customer, Innovation, Operations)
- Selecting a category shows its scenario; selecting a pill loads `originalMessage` into the text area
- Text area for custom input (or pre-loaded scenario message)
- "Run" button triggers cascade (auto-trigger on scenario select)
- Existing `levels` slider from Zustand — dynamically controls relay card count

**Right column (scrollable):**
- **"Original Signal"** card — full message, ember accent border, full opacity
- **RelayCard** per org level (staggered ~400ms delay):
  - Level role badge (e.g. "L3 — Plant Manager")
  - Reframed message with inline diff highlights: ~~strikethrough~~ for lost specifics, ember-colored text for injected framing
  - Italicized incentive annotation (e.g. *"Generalized to fit quarterly report format"*)
- **"What Arrived at the Top"** verdict card — fidelity % (from `calcOrgMetrics`), one-line verdict

### Mobile
Stacks vertically. Scenario picker on top, cascade below. No sticky behavior.

## 6. Animation

- Each `RelayCard` fades in + slides up, reusing the existing `FadeIn` component pattern
- Stagger delay tied to level index (~400ms per level)
- `simulationActive` boolean in store prevents re-triggering mid-cascade
- Message text within each card: brief typewriter-style reveal to emphasize the rewriting

## 7. Component Tree

```
SimulateSection.tsx         — Section wrapper, heading, intro prose
├── ScenarioPicker.tsx      — Category pills + scenario selection
├── MessageInput.tsx        — Text area for custom or loaded message
├── RelayCascade.tsx        — Orchestrates staggered animation
│   └── RelayCard.tsx       — Single level: diff highlights + incentive annotation
└── SignalVerdictCard.tsx   — Bottom summary with fidelity % from existing calc
```

**6 new components**, 1 new data file (`scenarios.ts`), 1 new lib file (`signalRelay.ts`) with tests.

## 8. State Management

### New Zustand fields (added to `useCompanyStore`)

```ts
activeScenarioId: string | null   // Selected sample scenario (null = custom)
customMessage: string             // User's typed message
simulationActive: boolean         // Whether cascade is currently animating
```

**Not persisted** — excluded from `partialize` (same pattern as `selectedTaskId`). Simulation resets on reload.

Existing `levels` and `fidelityRate` drive the cascade directly. No state duplication.

### URL Params
No new URL params. Existing `?l=&h=&f=` already control the org shape.

## 9. Section Navigation

`SectionNav.tsx` updated with new anchor. Scroll order becomes:

1. `#problem` — Bartlett story, fidelity demo, decay curve
2. `#simulate` — Message Relay Simulator **(NEW)**
3. `#proof` — 6 company comparison
4. `#shape` — Shape theory
5. `#evidence` — Gemba Walk, Deming
6. `#model` — Interactive calculator

## 10. Testing

- `src/lib/__tests__/signalRelay.test.ts` — Unit tests for each transformation rule, cumulative application, edge cases (empty input, no numbers, etc.)
- Scenario data validation — ensure all 5 scenarios have valid `levels` arrays with 8 entries each
- Truncation logic — verify middle-removal preserves first and last relay for all slider values

## 11. Dependencies

**Zero new dependencies.** Animation reuses `FadeIn` pattern. Diff highlights are CSS (strikethrough + ember color classes from design system). Fidelity calculation reuses `calcOrgMetrics`.

## 12. Design System Compliance

- All colors use stone neutrals + ember accent (no slate, no new palette)
- Typography: Source Serif 4 headings, Inter body, DM Mono for data/badges
- Spacing: 48-96px section padding, 680px max prose width
- RelayCard styling follows existing card patterns (stone borders, rounded corners)
