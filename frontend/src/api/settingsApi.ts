import { axiosInstance } from './axiosInstance'

export interface PaymentSettingsDTO {
  mp_active: boolean
  mp_public_key: string
  mp_access_token: string
  mp_sandbox: boolean
  mp_installments: number
  transfer_active: boolean
  transfer_cbu: string
  transfer_alias: string
  transfer_bank: string
  transfer_holder: string
  transfer_discount: number
  card_active: boolean
}

export const settingsApi = {
  getPaymentSettings: async (): Promise<PaymentSettingsDTO> => {
    const res = await axiosInstance.get('/admin/payment-settings')
    return res.data.content || res.data
  },

  updatePaymentSettings: async (settings: PaymentSettingsDTO): Promise<PaymentSettingsDTO> => {
    const res = await axiosInstance.put('/admin/payment-settings', settings)
    return res.data.content || res.data
  },
}
