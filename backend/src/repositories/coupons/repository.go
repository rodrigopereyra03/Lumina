package coupons

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"ecommerce-ganador/backend/src/core/entities/coupons"

	"github.com/jackc/pgx/v5/pgxpool"
)

type CouponDAO struct {
	ID             string     `db:"id"`
	Code           string     `db:"code"`
	DiscountType   string     `db:"discount_type"`
	DiscountValue  float64    `db:"discount_value"`
	MinOrderAmount float64    `db:"min_order_amount"`
	ExpiresAt      *time.Time `db:"expires_at"`
	UsageLimit     int        `db:"usage_limit"`
	TimesUsed      int        `db:"times_used"`
	IsActive       bool       `db:"is_active"`
	CreatedAt      time.Time  `db:"created_at"`
	UpdatedAt      time.Time  `db:"updated_at"`
}

func (d CouponDAO) ToEntity() coupons.Coupon {
	return coupons.Coupon{
		ID:             d.ID,
		Code:           d.Code,
		DiscountType:   coupons.DiscountType(d.DiscountType),
		DiscountValue:  d.DiscountValue,
		MinOrderAmount: d.MinOrderAmount,
		ExpiresAt:      d.ExpiresAt,
		UsageLimit:     d.UsageLimit,
		TimesUsed:      d.TimesUsed,
		IsActive:       d.IsActive,
		CreatedAt:      d.CreatedAt,
		UpdatedAt:      d.UpdatedAt,
	}
}

type CouponsRepository struct {
	db     *pgxpool.Pool
	mu     sync.RWMutex
	memory map[string]CouponDAO
}

func NewCouponsRepository(db *pgxpool.Pool) *CouponsRepository {
	repo := &CouponsRepository{
		db:     db,
		memory: make(map[string]CouponDAO),
	}

	if db == nil {
		repo.seedInMemory()
	}

	return repo
}

func (r *CouponsRepository) seedInMemory() {
	r.memory["LUMINA10"] = CouponDAO{
		ID:             "cp-1",
		Code:           "LUMINA10",
		DiscountType:   "percentage",
		DiscountValue:  10.0,
		MinOrderAmount: 50.0,
		UsageLimit:     1000,
		TimesUsed:      0,
		IsActive:       true,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	r.memory["BIENVENIDO"] = CouponDAO{
		ID:             "cp-2",
		Code:           "BIENVENIDO",
		DiscountType:   "fixed",
		DiscountValue:  20.0,
		MinOrderAmount: 100.0,
		UsageLimit:     500,
		TimesUsed:      0,
		IsActive:       true,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
}

func (r *CouponsRepository) GetByCode(ctx context.Context, code string) (coupons.Coupon, error) {
	upperCode := strings.ToUpper(strings.TrimSpace(code))

	if r.db == nil {
		r.mu.RLock()
		defer r.mu.RUnlock()
		if c, ok := r.memory[upperCode]; ok {
			return c.ToEntity(), nil
		}
		return coupons.Coupon{}, fmt.Errorf("coupon not found")
	}

	query := `
		SELECT id, code, discount_type, discount_value, min_order_amount, expires_at, usage_limit, times_used, is_active, created_at, updated_at
		FROM coupons
		WHERE code = $1 AND is_active = true
	`
	var dao CouponDAO
	err := r.db.QueryRow(ctx, query, upperCode).Scan(
		&dao.ID, &dao.Code, &dao.DiscountType, &dao.DiscountValue, &dao.MinOrderAmount, &dao.ExpiresAt, &dao.UsageLimit, &dao.TimesUsed, &dao.IsActive, &dao.CreatedAt, &dao.UpdatedAt,
	)
	if err != nil {
		return coupons.Coupon{}, fmt.Errorf("coupon not found: %w", err)
	}

	return dao.ToEntity(), nil
}

func (r *CouponsRepository) IncrementUsage(ctx context.Context, code string) error {
	upperCode := strings.ToUpper(strings.TrimSpace(code))

	if r.db == nil {
		r.mu.Lock()
		defer r.mu.Unlock()
		if c, ok := r.memory[upperCode]; ok {
			c.TimesUsed++
			r.memory[upperCode] = c
		}
		return nil
	}

	query := `UPDATE coupons SET times_used = times_used + 1, updated_at = CURRENT_TIMESTAMP WHERE code = $1`
	_, err := r.db.Exec(ctx, query, upperCode)
	return err
}
