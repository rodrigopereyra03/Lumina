import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to inject Access Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken || localStorage.getItem('auth_token') || 'token_admin_session'
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle errors gracefully without kicking the user out
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error)
  }
)
