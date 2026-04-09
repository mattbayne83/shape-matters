# InputStrip Workbench Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure InputStrip into a three-tier "org designer workbench" layout — collapsed context bar (structure), lever sliders (4-column grid), and benchmark presets — with change-highlight animation on company preset clicks.

**Architecture:** Single-file restructure of `InputStrip.tsx`. The `CompactSlider` internal component is reused as-is. Structure sliders (Depth, Headcount) move into a collapsible context bar; lever sliders (Fidelity, Cycle Time, Authority, Team Routing) fill a 4-column grid as the primary interaction. The `advancedInputsOpen` store field is repurposed to control context bar expand/collapse. A `@keyframes lever-pulse` animation in `index.css` provides the change-highlight effect.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Zustand 5, Lucide React

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/model/InputStrip.tsx` | Rewrite | Three-tier layout, context bar, lever grid, pulse animation logic |
| `src/index.css` | Add keyframes | `@keyframes lever-pulse` animation |
| `src/store/useCompanyStore.ts` | Rename field | `advancedInputsOpen` → `contextExpanded` (semantic clarity) |

No new files. No changes to `CompactSlider` (internal to InputStrip), `PillarDashboard`, `PillarCard`, calculation functions, or types.

---

### Task 1: Add `lever-pulse` Keyframes to CSS

**Files:**
- Modify: `src/index.css` (after the existing `@keyframes nudge` block, ~line 274)

- [ ] **Step 1: Add the keyframes**

Add immediately after the `@keyframes nudge` block (before `@layer utilities`):

```css
@keyframes lever-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(224, 90, 27, 0.25);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(224, 90, 27, 0.12);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(224, 90, 27, 0);
  }
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npm run build 2>&1 | tail -5`
Expected: Build succeeds, no errors.

---

### Task 2: Rename Store Field `advancedInputsOpen` → `contextExpanded`

**Files:**
- Modify: `src/store/useCompanyStore.ts`
- Modify: `src/components/model/InputStrip.tsx` (references only)

- [ ] **Step 1: Rename in store interface and defaults**

In `src/store/useCompanyStore.ts`, rename all occurrences:
- `CompanyState.advancedInputsOpen` → `contextExpanded`
- `CompanyActions.setAdvancedInputsOpen` → `setContextExpanded`
- Default value: `contextExpanded: false`
- Setter: `setContextExpanded: (open) => set({ contextExpanded: open })`
- Partialize comment: update to `// Excluded: activeScenarioId, expandedPillar, contextExpanded`

There are 4 occurrences in the file: interface field (line 13), interface action (line 25), default (line 78), setter (line 87), partialize comment (line 102).

- [ ] **Step 2: Update references in InputStrip.tsx**

In `src/components/model/InputStrip.tsx`, update the two store selectors (current lines 133-134):

Change:
```typescript
const advancedOpen = useCompanyStore((s) => s.advancedInputsOpen);
const setAdvancedOpen = useCompanyStore((s) => s.setAdvancedInputsOpen);
```
To:
```typescript
const contextExpanded = useCompanyStore((s) => s.contextExpanded);
const setContextExpanded = useCompanyStore((s) => s.setContextExpanded);
```

Also search for any other files that reference `advancedInputsOpen` — it should only be in these two files. Run:
```bash
cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && grep -r "advancedInputsOpen" src/ --include="*.ts" --include="*.tsx" -l
```

- [ ] **Step 3: Verify build compiles**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds. The UI won't look different yet — same functionality, just renamed.

---

### Task 3: Rewrite InputStrip — Three-Tier Layout

**Files:**
- Modify: `src/components/model/InputStrip.tsx` (complete JSX restructure)

This is the main task. Replace the entire `return (...)` block in `InputStrip()` with the three-tier layout. Keep all the existing state variables, handlers, and helper functions unchanged.

- [ ] **Step 1: Add `changedLevers` state for animation tracking**

Add after the existing `const [copied, setCopied] = useState(false);` line:

```typescript
const [changedLevers, setChangedLevers] = useState<Set<string>>(new Set());
```

- [ ] **Step 2: Update `handlePresetChange` to track changed levers**

Replace the existing `handlePresetChange` function with:

```typescript
const handlePresetChange = (id: string) => {
  setPreset(id);
  if (id === 'custom') return;
  const company = REFERENCE_COMPANIES.find((c) => c.id === id);
  if (!company) return;

  // Snapshot current lever values BEFORE applying preset
  const prev = {
    fidelityRate: useCompanyStore.getState().fidelityRate,
    decisionCycle: useCompanyStore.getState().decisionCycle,
    dci: useCompanyStore.getState().dci,
    teamDecisionMix: useCompanyStore.getState().teamDecisionMix,
  };

  // Apply all values
  storeLevels(company.levels);
  const pos = Math.round(headcountToSlider(company.employees));
  setHcSlider(pos);
  storeHeadcount(sliderToHeadcount(pos));
  if (company.decisionCycle != null) setDecisionCycle(company.decisionCycle);
  if (company.dci != null) setDci(company.dci);
  if (company.teamDecisionMix != null) setTeamDecisionMix(company.teamDecisionMix);

  // Determine which levers changed
  const changed = new Set<string>();
  if (company.fidelityRate !== undefined && company.fidelityRate !== prev.fidelityRate) changed.add('fidelity');
  if (company.decisionCycle != null && company.decisionCycle !== prev.decisionCycle) changed.add('cycle');
  if (company.dci != null && company.dci !== prev.dci) changed.add('authority');
  if (company.teamDecisionMix != null && company.teamDecisionMix !== prev.teamDecisionMix) changed.add('team-mix');

  // For reference companies, fidelityRate isn't a Company field — 
  // it stays at the user's current value. So only flag the other three.
  // But if the fidelity store value actually changed, include it.
  const postFidelity = useCompanyStore.getState().fidelityRate;
  if (postFidelity !== prev.fidelityRate) changed.add('fidelity');

  if (changed.size > 0) {
    setChangedLevers(changed);
    setTimeout(() => setChangedLevers(new Set()), 1500);
  }
};
```

- [ ] **Step 3: Replace the entire return JSX with three-tier layout**

Replace everything from `return (` to the closing `);` with:

```tsx
const leverPulseClass = (leverId: string) =>
  changedLevers.has(leverId) ? 'animate-[lever-pulse_1.5s_ease-out]' : '';

return (
  <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
    {/* ── Tier 1: Context Bar ── */}
    <div className="bg-stone-50 border-b border-stone-200">
      {/* Collapsed summary */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Your Org</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wide text-stone-500">Depth</span>
          <span className="text-sm font-extrabold font-mono tabular-nums text-stone-900">{levels}</span>
        </div>
        <div className="w-px h-3.5 bg-stone-300" />
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wide text-stone-500">Headcount</span>
          <span className="text-sm font-extrabold font-mono tabular-nums text-stone-900">{formatHeadcount(headcount)}</span>
        </div>
        <button
          onClick={() => setContextExpanded(!contextExpanded)}
          className="ml-auto flex items-center gap-1 text-[10px] text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
        >
          Edit
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${contextExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded structure sliders */}
      {contextExpanded && (
        <div className="grid grid-cols-2 gap-x-6 px-4 pb-3 pt-1">
          <CompactSlider id="is-levels" label="Depth" value={levels} displayValue={String(levels)} min={1} max={15} accent="warm-stone" onChange={handleLevels} range={['Flat', 'Deep']} />
          <CompactSlider id="is-size" label="Headcount" value={hcSlider} displayValue={formatHeadcount(headcount)} min={0} max={100} accent="warm-stone" onChange={handleHeadcount} range={['50', '500K']} />
        </div>
      )}
    </div>

    {/* ── Tier 2: Lever Sliders ── */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-4 p-4">
      <div className={`rounded-lg ${leverPulseClass('fidelity')}`}>
        <CompactSlider id="is-fidelity" label="Fidelity/Layer" value={fidelityRate} displayValue={`${fidelityRate}%`} min={50} max={98} accent="ember" onChange={(v) => { setPreset('custom'); setFidelityRate(v); }} ticks={[{ value: 70, label: 'Low trust' }, { value: 82, label: 'Typical' }, { value: 93, label: 'High trust' }]} />
      </div>
      <div className={`rounded-lg ${leverPulseClass('cycle')}`}>
        <CompactSlider id="is-cycle" label="Cycle Time" value={decisionCycle} displayValue={`${Math.round(decisionCycle)}d`} min={1} max={14} step={0.5} accent="ember" onChange={(v) => { setPreset('custom'); setDecisionCycle(v); }} hint={cycleHint(decisionCycle)} ticks={[{ value: 2, label: 'Startup' }, { value: 4, label: 'Tech' }, { value: 7, label: 'Enterprise' }]} />
      </div>
      <div className={`rounded-lg ${leverPulseClass('authority')}`}>
        <CompactSlider id="is-dci" label="Authority" value={dci} displayValue={`${dci}%`} min={0} max={100} accent="ember" onChange={(v) => { setPreset('custom'); setDci(v); }} hint={dciHint(dci)} ticks={[{ value: 20, label: 'CEO-led' }, { value: 50, label: 'Balanced' }, { value: 80, label: 'IC-led' }]} />
      </div>
      <div className={`rounded-lg ${leverPulseClass('team-mix')}`}>
        <CompactSlider id="is-team-mix" label="Team Routing" value={teamDecisionMix} displayValue={`${teamDecisionMix}%`} min={0} max={100} accent="ember" onChange={(v) => { setPreset('custom'); setTeamDecisionMix(v); }} hint={teamMixHint(teamDecisionMix)} ticks={[{ value: 0, label: 'Hierarchical' }, { value: 50, label: 'Hybrid' }, { value: 100, label: 'Team-first' }]} />
      </div>
    </div>

    {/* ── Tier 3: Benchmarks + Share ── */}
    <div className="flex items-center gap-1.5 px-4 py-2 border-t border-stone-100">
      <span className="text-[10px] font-bold uppercase tracking-wide text-stone-400 mr-1">Compare</span>
      {REFERENCE_COMPANIES.map((c) => (
        <button
          key={c.id}
          onClick={() => handlePresetChange(c.id)}
          className={`
            text-[10px] font-medium px-2.5 py-0.5 rounded-full border cursor-pointer
            transition-all duration-200
            ${preset === c.id
              ? 'bg-stone-800 text-white border-stone-800 shadow-sm'
              : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700'}
          `}
        >
          {c.name}
        </button>
      ))}

      <div className="flex-1" />

      <button
        onClick={handleCopyLink}
        className={`
          flex items-center gap-1 text-[10px] font-medium px-2.5 py-0.5 rounded-full border cursor-pointer
          transition-all duration-200
          ${copied
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700'}
        `}
        title="Copy shareable link"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3" />
            Copied
          </>
        ) : (
          <>
            <Share2 className="w-3 h-3" />
            Share
          </>
        )}
      </button>
    </div>
  </div>
);
```

- [ ] **Step 4: Clean up unused imports**

Remove `ChevronDown` if no longer needed — actually it IS still used in the context bar "Edit" button. Keep it.

Remove the `teamMixHint` import check — it IS still used. Keep it.

Fidelity slider no longer directly calls `setFidelityRate` — it now goes through `setPreset('custom')` first. Verify the `onChange` wrapper is correct.

- [ ] **Step 5: Verify build and visual**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds.

Open http://localhost:5175/shape-matters/#model and verify:
- Context bar shows "Your Org · Depth 9 · Headcount 8.7K · Edit"
- Clicking "Edit" expands to show Depth + Headcount sliders (warm-stone accent)
- 4 lever sliders in a grid below (all ember accent)
- Company preset pills at the bottom
- Clicking a preset: context bar updates, changed lever sliders pulse ember for 1.5s

---

### Task 4: Verify Full Test Suite + Lint

**Files:** None modified — verification only.

- [ ] **Step 1: Run full test suite**

Run: `cd /Users/mattbayne/Documents/SoftwareProjects/org-shape && npx vitest run`
Expected: All 200 tests pass (no calculation logic changed).

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Run build**

Run: `npm run build 2>&1 | tail -5`
Expected: Clean build, no TypeScript errors.

---

### Task 5: Update Documentation

**Files:**
- Modify: `CLAUDE.md` — update InputStrip description
- Modify: `CHANGELOG.md` — add entry under [Unreleased]

- [ ] **Step 1: Update CLAUDE.md InputStrip description**

Find the `InputStrip` line in the Key Components section and replace with:

```
- `InputStrip` — Three-tier layout. Tier 1: collapsible context bar (stone bg) with Depth + Headcount summary, "Edit" expands inline sliders (warm-stone accent). Tier 2: 4-column CSS grid of lever sliders (Fidelity, Cycle Time, Authority, Team Routing) all with ember accent — always visible, primary interaction. Tier 3: company preset pills ("Compare") + Share button. Clicking a preset highlights changed levers with a 1.5s ember pulse animation (`@keyframes lever-pulse` in index.css). Custom slider CSS in `index.css` (`.custom-slider`): track fill gradient, 14px thumbs with white border + shadow, hover scale, focus ring.
```

- [ ] **Step 2: Update CLAUDE.md store section**

Replace `advancedInputsOpen` with `contextExpanded` in the store description. Update the description to note it controls the context bar expand/collapse (was Team Routing disclosure).

- [ ] **Step 3: Add CHANGELOG entry**

Add to the `[Unreleased]` section under `### Changed`:

```
- **InputStrip redesigned** as three-tier "org designer workbench": collapsed context bar (structure) → 4-column lever grid → benchmark presets. All lever sliders now use ember accent. Company presets highlight changed sliders with a 1.5s pulse animation. `advancedInputsOpen` renamed to `contextExpanded`.
```

- [ ] **Step 4: Update CLAUDE.md gotchas**

Add gotcha: `- **InputStrip is three tiers** — Tier 1: context bar (stone bg, collapsible Depth/Headcount), Tier 2: 4-col lever grid (ember, always visible), Tier 3: compare pills + share. Context bar expand controlled by \`contextExpanded\` store field (not persisted).`

Remove old gotcha about "InputStrip is two rows" if it still exists.
