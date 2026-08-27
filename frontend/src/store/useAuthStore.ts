import { create } from 'zustand'

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  role: string
  created_at: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  // Try to load user from localStorage if it exists
  const storedUser = localStorage.getItem('auth_user')
  const user = storedUser ? JSON.parse(storedUser) : null

  return {
    user,
    accessToken: null, // Don't persist JWT access token in localStorage for security (XSS protection)
    isAuthenticated: !!user,
    setAuth: (user, token) => {
      localStorage.setItem('auth_user', JSON.stringify(user))
      set({ user, accessToken: token, isAuthenticated: true })
    },
    setAccessToken: (token) => {
      set({ accessToken: token })
    },
    clearAuth: () => {
      localStorage.removeItem('auth_user')
      set({ user: null, accessToken: null, isAuthenticated: false })
    }
  }
})
