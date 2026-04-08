import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompanyState {
  fidelityRate: number;
  levels: number;
  headcount: number;
  activeScenarioId: string | null;
  decisionCycle: number;       // days/layer (1-14, default 3)
  expandedPillar: 'fidelity' | 'lag' | 'response' | null;  // null = dashboard view
  advancedInputsOpen: boolean;
}

interface CompanyActions {
  setFidelityRate: (rate: number) => void;
  setLevels: (levels: number) => void;
  setHeadcount: (headcount: number) => void;
  setActiveScenarioId: (id: string | null) => void;
  setDecisionCycle: (d: number) => void;
  setExpandedPillar: (p: 'fidelity' | 'lag' | 'response' | null) => void;
  setAdvancedInputsOpen: (open: boolean) => void;
}

/** Apply ?l=&h=&f=&d= URL params to the store. Returns true if any params were found. */
function applyUrlParams(): boolean {
  const params = new URLSearchParams(window.location.search);
  const l = params.get('l');
  const h = params.get('h');
  const f = params.get('f');
  const d = params.get('d');
  if (!l && !h && !f && !d) return false;

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
  if (d) {
    const cycle = Math.max(1, Math.min(14, Number(d)));
    if (!isNaN(cycle)) state.setDecisionCycle(cycle);
  }
  return true;
}

export const useCompanyStore = create<CompanyState & CompanyActions>()(
  persist(
    (set) => ({
      fidelityRate: 82,
      levels: 6,
      headcount: 5000,
      activeScenarioId: 'innovation-proposal',
      decisionCycle: 3,
      expandedPillar: null,
      advancedInputsOpen: false,
      setFidelityRate: (rate) => set({ fidelityRate: rate }),
      setLevels: (levels) => set({ levels }),
      setHeadcount: (headcount) => set({ headcount }),
      setActiveScenarioId: (id) => set({ activeScenarioId: id }),
      setDecisionCycle: (d) => set({ decisionCycle: d }),
      setExpandedPillar: (p) => set({ expandedPillar: p }),
      setAdvancedInputsOpen: (open) => set({ advancedInputsOpen: open }),
    }),
    {
      name: 'org-shape-storage',
      // URL params must override persisted state. persist rehydrates async
      // (microtask), so we re-apply URL params after rehydration completes.
      onRehydrateStorage: () => () => { applyUrlParams(); },
      // Only persist data fields; UI state resets on reload
      partialize: (state) => ({
        fidelityRate: state.fidelityRate,
        levels: state.levels,
        headcount: state.headcount,
        decisionCycle: state.decisionCycle,
        // Excluded: activeScenarioId, expandedPillar, advancedInputsOpen
      }),
    }
  )
);

// Also apply immediately at module load for the first-visit case
// (no persisted state → no rehydration override to worry about).
applyUrlParams();

/** Build a shareable URL from current store state. */
export function buildShareUrl(): string {
  const { levels, headcount, fidelityRate, decisionCycle } =
    useCompanyStore.getState();
  const url = new URL(window.location.href);
  url.search = `?l=${levels}&h=${headcount}&f=${fidelityRate}&d=${decisionCycle}`;
  url.hash = 'model';
  return url.toString();
}
