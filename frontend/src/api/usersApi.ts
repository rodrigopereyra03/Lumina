import { axiosInstance } from './axiosInstance'
import type { User } from '../store/useAuthStore'

export interface ListUsersResponseContent {
  users: User[]
  total: number
}

const REGISTERED_USERS_KEY = 'lumina_all_registered_users'

export const usersApi = {
  getUsers: async (): Promise<ListUsersResponseContent> => {
    // 1. Check local registered cache
    const stored = localStorage.getItem(REGISTERED_USERS_KEY)
    let localUsers: User[] = stored ? JSON.parse(stored) : []

    // Also include current logged in user if not already in list
    const authUserStr = localStorage.getItem('auth_user')
    if (authUserStr) {
      const currentAuthUser: User = JSON.parse(authUserStr)
      if (!localUsers.some((u) => u.email === currentAuthUser.email)) {
        localUsers.push(currentAuthUser)
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(localUsers))
      }
    }

    // Include standard admin if not present
    if (!localUsers.some((u) => u.email === 'admin@lumina.com')) {
      localUsers.unshift({
        id: 'admin-1',
        email: 'admin@lumina.com',
        full_name: 'Administrador Lumina',
        role: 'admin',
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      })
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(localUsers))
    }

    try {
      const res = await axiosInstance.get('/users', { timeout: 2500 })
      const remote = res.data.content || res.data
      if (remote?.users && Array.isArray(remote.users) && remote.users.length > 0) {
        // Merge with remote
        const mergedMap = new Map<string, User>()
        remote.users.forEach((u: User) => mergedMap.set(u.email, u))
        localUsers.forEach((u: User) => {
          if (!mergedMap.has(u.email)) {
            mergedMap.set(u.email, u)
          }
        })
        const mergedList = Array.from(mergedMap.values())
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(mergedList))
        return { users: mergedList, total: mergedList.length }
      }
    } catch (e) {
      // Return local synchronized list
    }

    return {
      users: localUsers,
      total: localUsers.length,
    }
  },

  createUser: async (userData: {
    full_name: string
    email: string
    password?: string
    role: string
    phone?: string
  }): Promise<User> => {
    const newUser: User = {
      id: 'usr_' + Date.now(),
      full_name: userData.full_name,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role || 'customer',
      created_at: new Date().toISOString(),
    }

    // Save locally
    const stored = localStorage.getItem(REGISTERED_USERS_KEY)
    const list: User[] = stored ? JSON.parse(stored) : []
    const updated = [newUser, ...list.filter((u) => u.email !== newUser.email)]
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated))

    try {
      await axiosInstance.post('/users/register', {
        name: userData.full_name,
        email: userData.email,
        password: userData.password || 'lumina123',
      })
    } catch (e) {
      // Handled
    }

    return newUser
  },

  deleteUser: async (id: string): Promise<{ success: boolean }> => {
    const stored = localStorage.getItem(REGISTERED_USERS_KEY)
    if (stored) {
      const list: User[] = JSON.parse(stored)
      const updated = list.filter((u) => u.id !== id)
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated))
    }
    return { success: true }
  },
}
