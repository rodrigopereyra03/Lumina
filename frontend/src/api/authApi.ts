import { axiosInstance } from './axiosInstance'
import type { User } from '../store/useAuthStore'

export interface LoginResponseContent {
  user: User
  access_token: string
}

export interface RegisterResponseContent {
  user: User
  access_token: string
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponseContent> => {
    const res = await axiosInstance.post('/auth/login', { email, password })
    return res.data.content || res.data
  },

  register: async (fullName: string, email: string, password: string, phone?: string): Promise<RegisterResponseContent> => {
    const res = await axiosInstance.post('/auth/register', {
      full_name: fullName,
      email,
      password,
      phone,
    })
    return res.data.content || res.data
  },

  getProfile: async (): Promise<User> => {
    const res = await axiosInstance.get('/users/profile')
    return res.data.content || res.data
  },
}
