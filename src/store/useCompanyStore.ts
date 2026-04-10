import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompanyState {
  fidelityRate: number;
  levels: number;
  headcount: number;
  activeScenarioId: string | null;
  decisionCycle: number;       // days/layer (1-14, default 3)
  dci: number;
  teamDecisionMix: number;  // 0-100, default 0 (monolithic)
  expandedPillar: 'fidelity' | 'lag' | 'autonomy' | null;  // null = dashboard view
  contextExpanded: boolean;
}

interface CompanyActions {
  setFidelityRate: (rate: number) => void;
  setLevels: (levels: number) => void;
  setHeadcount: (headcount: number) => void;
  setActiveScenarioId: (id: string | null) => void;
  setDecisionCycle: (d: number) => void;
  setDci: (dci: number) => void;
  setTeamDecisionMix: (mix: number) => void;
  setExpandedPillar: (p: 'fidelity' | 'lag' | 'autonomy' | null) => void;
  setContextExpanded: (open: boolean) => void;
}

/** Apply ?l=&h=&f=&d= URL params to the store. Returns true if any params were found. */
function applyUrlParams(): boolean {
  const params = new URLSearchParams(window.location.search);
  const l = params.get('l');
  const h = params.get('h');
  const f = params.get('f');
  const d = params.get('d');
  const ci = params.get('ci');
  const tm = params.get('tm');
  if (!l && !h && !f && !d && !ci && !tm) return false;

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
  if (ci) {
    const dci = Math.max(0, Math.min(100, Math.round(Number(ci))));
    if (!isNaN(dci)) state.setDci(dci);
  }
  if (tm) {
    const mix = Math.max(0, Math.min(100, Math.round(Number(tm))));
    if (!isNaN(mix)) state.setTeamDecisionMix(mix);
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
      dci: 50,
      teamDecisionMix: 50,  // Midpoint blend — matches Cycle 5 H3: real orgs route ~50-70% of decisions locally, monolithic (0) is a worst-case bound
      expandedPillar: null,
      contextExpanded: false,
      setFidelityRate: (rate) => set({ fidelityRate: rate }),
      setLevels: (levels) => set({ levels }),
      setHeadcount: (headcount) => set({ headcount }),
      setActiveScenarioId: (id) => set({ activeScenarioId: id }),
      setDecisionCycle: (d) => set({ decisionCycle: d }),
      setDci: (dci) => set({ dci }),
      setTeamDecisionMix: (teamDecisionMix) => set({ teamDecisionMix }),
      setExpandedPillar: (p) => set({ expandedPillar: p }),
      setContextExpanded: (open) => set({ contextExpanded: open }),
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
        dci: state.dci,
        teamDecisionMix: state.teamDecisionMix,
        // Excluded: activeScenarioId, expandedPillar, contextExpanded
      }),
    }
  )
);

// Also apply immediately at module load for the first-visit case
// (no persisted state → no rehydration override to worry about).
applyUrlParams();

/** Build a shareable URL from current store state. */
export function buildShareUrl(): string {
  const { levels, headcount, fidelityRate, decisionCycle, dci, teamDecisionMix } =
    useCompanyStore.getState();
  const url = new URL(window.location.href);
  url.search = `?l=${levels}&h=${headcount}&f=${fidelityRate}&d=${decisionCycle}&ci=${dci}${teamDecisionMix > 0 ? `&tm=${teamDecisionMix}` : ''}`;
  url.hash = 'model';
  return url.toString();
}
