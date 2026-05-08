import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  homeBg: string;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setHomeBg: (bg: string) => void;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
  localStorage.setItem('theme', theme);
}

function getInitialTheme(): Theme {
  const saved = localStorage.getItem('theme') as Theme | null;
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialHomeBg(): string {
  return localStorage.getItem('homeBg') || '';
}

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  isDark: initialTheme === 'dark',
  homeBg: getInitialHomeBg(),

  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      applyTheme(next);
      return { theme: next, isDark: next === 'dark' };
    });
  },

  setTheme: (theme: Theme) => {
    applyTheme(theme);
    set({ theme, isDark: theme === 'dark' });
  },

  setHomeBg: (bg: string) => {
    localStorage.setItem('homeBg', bg);
    set({ homeBg: bg });
  },
}));
