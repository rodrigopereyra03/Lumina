package payments

import (
	"context"

	"ecommerce-ganador/backend/src/core/entities/payments"
)

type PaymentsPersistor interface {
	Create(ctx context.Context, payment payments.Payment) (payments.Payment, error)
	GetByID(ctx context.Context, id string) (payments.Payment, error)
	ListByOrderID(ctx context.Context, orderID string) ([]payments.Payment, error)
}
