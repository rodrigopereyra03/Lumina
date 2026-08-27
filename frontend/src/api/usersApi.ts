import { axiosInstance } from './axiosInstance'
import type { User } from '../store/useAuthStore'

export interface ListUsersResponseContent {
  users: User[]
  total: number
}

export const usersApi = {
  getUsers: async (): Promise<ListUsersResponseContent> => {
    const res = await axiosInstance.get('/users')
    return res.data.content || res.data
  },
}
