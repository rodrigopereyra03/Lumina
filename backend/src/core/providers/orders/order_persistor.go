package orders

import (
	"context"

	"ecommerce-ganador/backend/src/core/entities/orders"
)

type OrdersPersistor interface {
	Create(ctx context.Context, order orders.Order) (orders.Order, error)
	GetByID(ctx context.Context, id string) (orders.Order, error)
	List(ctx context.Context, userID *string, status *string) ([]orders.Order, error)
	UpdateStatus(ctx context.Context, id string, status orders.Status) error
}
