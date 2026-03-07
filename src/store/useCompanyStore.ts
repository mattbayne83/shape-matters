import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompanyState {
  fidelityRate: number;
}

interface CompanyActions {
  setFidelityRate: (rate: number) => void;
}

export const useCompanyStore = create<CompanyState & CompanyActions>()(
  persist(
    (set) => ({
      fidelityRate: 82,
      setFidelityRate: (rate) => set({ fidelityRate: rate }),
    }),
    { name: 'org-shape-storage' }
  )
);
