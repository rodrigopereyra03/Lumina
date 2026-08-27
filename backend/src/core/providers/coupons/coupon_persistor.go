package coupons

import (
	"context"

	"ecommerce-ganador/backend/src/core/entities/coupons"
)

type CouponsPersistor interface {
	GetByCode(ctx context.Context, code string) (coupons.Coupon, error)
	IncrementUsage(ctx context.Context, code string) error
}
