import create from 'zustand';

interface ThemeState {
    isDark: boolean;
    toggleTheme: () => void;
    initializeDarkTheme: () => void;
}

export const useDarkThemeMode = create<ThemeState>((set) => ({
    isDark: false,
    toggleTheme: () => set((state) => {
        const newTheme = !state.isDark;
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        document.body.classList.toggle('dark', newTheme);
        return { isDark: newTheme };
    }),
    initializeDarkTheme: () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            set({ isDark: true });
            document.body.classList.add('dark');
        }
    },
}));
