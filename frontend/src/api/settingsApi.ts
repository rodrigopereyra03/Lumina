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

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettingsDTO = {
  mp_active: true,
  mp_public_key: 'APP_USR-09e00df2-06bc-4d0e-b5de-13aaffd650d2',
  mp_access_token: 'APP_USR-1887517460534002-082719-20e9045bc921801c6df09603e8ed153f-3644485241',
  mp_sandbox: false,
  mp_installments: 6,
  transfer_active: true,
  transfer_cbu: '0000003100010000849201',
  transfer_alias: 'LUMINA.PAGOS.OFICIAL',
  transfer_bank: 'Banco Santander',
  transfer_holder: 'Lumina Retail S.A. (CUIT 30-71234567-9)',
  transfer_discount: 10,
  card_active: true,
}

const SETTINGS_STORAGE_KEY = 'lumina_payment_settings'

export const settingsApi = {
  getPaymentSettings: async (): Promise<PaymentSettingsDTO> => {
    // 1. Check local storage cache first
    const cached = localStorage.getItem(SETTINGS_STORAGE_KEY)
    let localData: PaymentSettingsDTO = cached ? JSON.parse(cached) : DEFAULT_PAYMENT_SETTINGS

    try {
      const res = await axiosInstance.get('/admin/payment-settings', { timeout: 2500 })
      const remote = res.data.content || res.data
      if (remote) {
        const merged = { ...localData, ...remote }
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged))
        return merged
      }
    } catch (e) {
      // Return cached/default settings gracefully
    }

    return localData
  },

  updatePaymentSettings: async (settings: PaymentSettingsDTO): Promise<PaymentSettingsDTO> => {
    // Save to local storage immediately
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))

    try {
      const res = await axiosInstance.put('/admin/payment-settings', settings, { timeout: 2500 })
      return res.data.content || res.data
    } catch (e) {
      // Persisted in localStorage
      return settings
    }
  },
}
