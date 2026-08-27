package coupons

import (
	"time"
)

type DiscountType string

const (
	DiscountTypePercentage DiscountType = "percentage"
	DiscountTypeFixed      DiscountType = "fixed"
)

type Coupon struct {
	ID             string
	Code           string
	DiscountType   DiscountType
	DiscountValue  float64
	MinOrderAmount float64
	ExpiresAt      *time.Time
	UsageLimit     int
	TimesUsed      int
	IsActive       bool
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

func (c Coupon) IsValid(orderAmount float64) bool {
	if !c.IsActive {
		return false
	}
	if c.ExpiresAt != nil && time.Now().After(*c.ExpiresAt) {
		return false
	}
	if c.UsageLimit > 0 && c.TimesUsed >= c.UsageLimit {
		return false
	}
	if orderAmount < c.MinOrderAmount {
		return false
	}
	return true
}

func (c Coupon) CalculateDiscount(orderAmount float64) float64 {
	if c.DiscountType == DiscountTypePercentage {
		return (orderAmount * c.DiscountValue) / 100.0
	}
	if c.DiscountValue > orderAmount {
		return orderAmount
	}
	return c.DiscountValue
}
