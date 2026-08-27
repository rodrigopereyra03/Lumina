package notifications

import (
	"context"

	"ecommerce-ganador/backend/src/core/entities/orders"
	"ecommerce-ganador/backend/src/core/entities/payments"
)

type EmailProvider interface {
	SendWelcomeEmail(ctx context.Context, to string, name string) error
	SendOrderCreatedEmail(ctx context.Context, to string, order orders.Order) error
	SendPaymentApprovedEmail(ctx context.Context, to string, order orders.Order, payment payments.Payment) error
	SendShipmentDispatchedEmail(ctx context.Context, to string, order orders.Order, trackingCode string, courier string) error
}
