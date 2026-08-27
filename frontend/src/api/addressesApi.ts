import { axiosInstance } from './axiosInstance'

export interface AddressDTO {
  id: string
  user_id: string
  title: string
  recipient_name: string
  recipient_phone?: string
  street_address: string
  city: string
  state: string
  postal_code: string
  is_default: boolean
}

export interface CreateAddressPayload {
  title: string
  recipient_name: string
  recipient_phone?: string
  street_address: string
  city: string
  state: string
  postal_code: string
  is_default?: boolean
}

export const addressesApi = {
  getAddresses: async (): Promise<{ addresses: AddressDTO[] }> => {
    const res = await axiosInstance.get('/users/addresses')
    return res.data.content || res.data
  },

  createAddress: async (payload: CreateAddressPayload): Promise<AddressDTO> => {
    const res = await axiosInstance.post('/users/addresses', payload)
    return res.data.content || res.data
  },
}
