import { axiosInstance } from './axiosInstance'

export interface CreateMPPreferenceItem {
  title: string
  quantity: number
  unit_price: number
  currency_id?: string
  description?: string
  picture_url?: string
}

export interface CreateMPPreferencePayer {
  name?: string
  surname?: string
  email: string
  phone?: string
  address?: string
}

export interface CreateMPPreferencePayload {
  order_id: string
  items: CreateMPPreferenceItem[]
  payer: CreateMPPreferencePayer
  back_url?: string
}

export interface MPPreferenceResponse {
  preference_id: string
  init_point: string
  sandbox_init_point: string
  public_key: string
}

export const mercadoPagoApi = {
  createPreference: async (payload: CreateMPPreferencePayload): Promise<MPPreferenceResponse> => {
    const res = await axiosInstance.post<{ content: MPPreferenceResponse }>(
      '/payments/mercadopago/preference',
      payload
    )
    return res.data.content
  },
}
