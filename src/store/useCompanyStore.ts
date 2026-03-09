import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompanyState {
  fidelityRate: number;
  levels: number;
  headcount: number;
}

interface CompanyActions {
  setFidelityRate: (rate: number) => void;
  setLevels: (levels: number) => void;
  setHeadcount: (headcount: number) => void;
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
      setFidelityRate: (rate) => set({ fidelityRate: rate }),
      setLevels: (levels) => set({ levels }),
      setHeadcount: (headcount) => set({ headcount }),
    }),
    {
      name: 'org-shape-storage',
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
