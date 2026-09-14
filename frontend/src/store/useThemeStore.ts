import { create } from 'zustand'

type ThemeMode = 'light' | 'dark'

interface ThemeState {
  theme: ThemeMode
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
}

const THEME_STORAGE_KEY = 'lumina_theme_mode'

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark'
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') {
    return saved
  }
  // Default to dark mode as requested by user
  return 'dark'
}

const applyThemeToDOM = (theme: ThemeMode) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
}

// Immediately apply initial theme
const initialTheme = getInitialTheme()
applyThemeToDOM(initialTheme)

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  toggleTheme: () =>
    set((state) => {
      const nextTheme: ThemeMode = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
      applyThemeToDOM(nextTheme)
      return { theme: nextTheme }
    }),
  setTheme: (theme: ThemeMode) => {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    applyThemeToDOM(theme)
    set({ theme })
  },
}))
