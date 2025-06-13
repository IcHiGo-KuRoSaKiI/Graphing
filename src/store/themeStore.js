import { create } from 'zustand';

const useThemeStore = create((set) => ({
    theme: 'light',
    setTheme: (mode) => set({ theme: mode }),
    toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));

export default useThemeStore;

