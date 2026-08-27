package coupons

import "errors"

var (
	ErrCouponNotFound = errors.New("coupon not found")
	ErrCouponExpired  = errors.New("coupon has expired or is inactive")
	ErrCouponMinOrder = errors.New("order amount does not meet minimum requirement for coupon")
)
