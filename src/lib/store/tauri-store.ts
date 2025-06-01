import { create } from 'zustand';

interface OptimizedTauriStoreState {
  optimizedStores: Record<string, any>;
  setOptimizedStores: (val: Record<string, any>) => void;
}

export const useOptimizedTauriStore =
  create<OptimizedTauriStoreState>()((set) => ({
    optimizedStores: {},
    setOptimizedStores: (val: Record<string, any>) => {
      set(() => ({ optimizedStores: val }));
    },
  }));
