package coupons

import (
	couponUsecases "ecommerce-ganador/backend/src/core/usecases/coupons"
)

type ValidateCouponRequest struct {
	Code        string  `json:"code" binding:"required"`
	OrderAmount float64 `json:"order_amount" binding:"required,gt=0"`
}

func (r ValidateCouponRequest) ToInput() couponUsecases.ValidateCouponInput {
	return couponUsecases.ValidateCouponInput{
		Code:        r.Code,
		OrderAmount: r.OrderAmount,
	}
}

type ValidateCouponResponse struct {
	Code           string  `json:"code"`
	DiscountType   string  `json:"discount_type"`
	DiscountValue  float64 `json:"discount_value"`
	DiscountAmount float64 `json:"discount_amount"`
	FinalAmount    float64 `json:"final_amount"`
	Message        string  `json:"message"`
}
