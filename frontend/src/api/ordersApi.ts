import { axiosInstance } from './axiosInstance'

export interface BackendOrderItemDTO {
  id?: string
  product_id?: string
  title: string
  variant?: string
  unit_price: number
  quantity: number
  image?: string
}

export interface BackendOrderDTO {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address: string
  status: string
  subtotal: number
  shipping_cost: number
  total: number
  items?: BackendOrderItemDTO[]
  created_at: string
}

export interface CreateOrderPayload {
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address: string
  items: {
    product_id?: string
    title: string
    variant?: string
    unit_price: number
    quantity: number
    image?: string
  }[]
}

export const ordersApi = {
  createOrder: async (payload: CreateOrderPayload): Promise<{ order: BackendOrderDTO }> => {
    const res = await axiosInstance.post('/orders', payload)
    return res.data.content || res.data
  },

  getOrders: async (status?: string): Promise<{ orders: BackendOrderDTO[]; total: number }> => {
    const url = status && status !== 'Todas' && status !== 'All' ? `/orders?status=${status}` : '/orders'
    const res = await axiosInstance.get(url)
    return res.data.content || res.data
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<{ message: string; status: string }> => {
    const res = await axiosInstance.patch(`/orders/${orderId}/status`, { status })
    return res.data.content || res.data
  },
}
