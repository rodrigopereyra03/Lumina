import { axiosInstance } from './axiosInstance'

export interface ValidateCouponResponse {
  code: string
  discount_type: string
  discount_value: number
  discount_amount: number
  final_amount: number
  message: string
}

export const couponsApi = {
  validateCoupon: async (code: string, orderAmount: number): Promise<ValidateCouponResponse> => {
    const res = await axiosInstance.post('/coupons/validate', {
      code,
      order_amount: orderAmount,
    })
    return res.data.content || res.data
  },
}
