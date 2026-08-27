import { axiosInstance } from './axiosInstance'

export interface ProcessPaymentPayload {
  order_id: string
  payment_method: string // 'mercadopago', 'card', 'transfer'
  amount: number
  token?: string
  installments?: number
}

export interface ProcessPaymentResponse {
  payment_id: string
  order_id: string
  status: string
  amount: number
  message: string
}

export const paymentsApi = {
  processPayment: async (payload: ProcessPaymentPayload): Promise<ProcessPaymentResponse> => {
    const res = await axiosInstance.post('/payments/process', payload)
    return res.data.content || res.data
  },
}
