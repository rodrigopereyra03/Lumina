package coupons

import (
	"context"

	"ecommerce-ganador/backend/src/core/entities/coupons"
	couponProviders "ecommerce-ganador/backend/src/core/providers/coupons"
)

type ValidateCouponInput struct {
	Code        string
	OrderAmount float64
}

type ValidateCouponOutput struct {
	Coupon         coupons.Coupon
	DiscountAmount float64
	FinalAmount    float64
}

type ValidateCoupon interface {
	Execute(ctx context.Context, input ValidateCouponInput) (ValidateCouponOutput, error)
}

type ValidateCouponImpl struct {
	persistor couponProviders.CouponsPersistor
}

func NewValidateCouponImpl(persistor couponProviders.CouponsPersistor) ValidateCouponImpl {
	return ValidateCouponImpl{persistor: persistor}
}

func (uc ValidateCouponImpl) Execute(ctx context.Context, input ValidateCouponInput) (ValidateCouponOutput, error) {
	coupon, err := uc.persistor.GetByCode(ctx, input.Code)
	if err != nil {
		return ValidateCouponOutput{}, ErrCouponNotFound
	}

	if !coupon.IsValid(input.OrderAmount) {
		return ValidateCouponOutput{}, ErrCouponExpired
	}

	discount := coupon.CalculateDiscount(input.OrderAmount)
	final := input.OrderAmount - discount
	if final < 0 {
		final = 0
	}

	return ValidateCouponOutput{
		Coupon:         coupon,
		DiscountAmount: discount,
		FinalAmount:    final,
	}, nil
}
