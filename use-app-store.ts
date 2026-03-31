import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface AppState {
  hrMode: boolean;
  setHrMode: (mode: boolean) => void;
  language: 'English' | 'Tamil';
  setLanguage: (lang: 'English' | 'Tamil') => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  pendingMessage: string | null;
  setPendingMessage: (msg: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hrMode: false,
      setHrMode: (mode) => set({ hrMode: mode }),
      language: 'English',
      setLanguage: (lang) => set({ language: lang }),
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      isSidebarOpen: false,
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      pendingMessage: null,
      setPendingMessage: (msg) => set({ pendingMessage: msg }),
    }),
    {
      name: 'sansa-app-storage',
      partialize: (state) => ({
        hrMode: state.hrMode,
        language: state.language,
        theme: state.theme,
      }),
    }
  )
);
