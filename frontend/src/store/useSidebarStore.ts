import { create } from 'zustand'

interface SidebarState {
  isCollapsed: boolean
  toggleSidebar: () => void
  setCollapsed: (collapsed: boolean) => void
}

const SIDEBAR_STORAGE_KEY = 'lumina_sidebar_collapsed'

const getInitialCollapsed = (): boolean => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: getInitialCollapsed(),
  toggleSidebar: () =>
    set((state) => {
      const next = !state.isCollapsed
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      return { isCollapsed: next }
    }),
  setCollapsed: (collapsed: boolean) => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed))
    set({ isCollapsed: collapsed })
  },
}))
