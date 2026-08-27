package payments

import (
	"context"
	"time"

	"ecommerce-ganador/backend/src/core/entities/orders"
	"ecommerce-ganador/backend/src/core/entities/payments"
	notifProviders "ecommerce-ganador/backend/src/core/providers/notifications"
	orderProviders "ecommerce-ganador/backend/src/core/providers/orders"
	paymentProviders "ecommerce-ganador/backend/src/core/providers/payments"
)

type MPWebhookInput struct {
	Action string `json:"action"`
	Type   string `json:"type"`
	Data   struct {
		ID string `json:"id"`
	} `json:"data"`
}

type HandleMPWebhook interface {
	Execute(ctx context.Context, input MPWebhookInput) error
}

type HandleMPWebhookImpl struct {
	orderRepo     orderProviders.OrdersPersistor
	paymentRepo   paymentProviders.PaymentsPersistor
	emailProvider notifProviders.EmailProvider
}

func NewHandleMPWebhookImpl(
	orderRepo orderProviders.OrdersPersistor,
	paymentRepo paymentProviders.PaymentsPersistor,
	emailProvider notifProviders.EmailProvider,
) HandleMPWebhookImpl {
	return HandleMPWebhookImpl{
		orderRepo:     orderRepo,
		paymentRepo:   paymentRepo,
		emailProvider: emailProvider,
	}
}

func (uc HandleMPWebhookImpl) Execute(ctx context.Context, input MPWebhookInput) error {
	if input.Type != "payment" && input.Action != "payment.created" && input.Action != "payment.updated" {
		return nil
	}

	paymentID := input.Data.ID
	if paymentID == "" {
		return nil
	}

	// In real environment, you would query Mercado Pago API /v1/payments/{paymentID} to get the order
	// Here we register/confirm the payment and update the order
	newPayment := payments.Payment{
		OrderID:          paymentID,
		PaymentMethod:    "mercadopago",
		GatewayName:      "Mercado Pago Checkout Pro",
		GatewayPaymentID: paymentID,
		Status:           payments.PaymentStatusApproved,
		Metadata: map[string]any{
			"source":     "webhook",
			"updated_at": time.Now().Format(time.RFC3339),
		},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, _ = uc.paymentRepo.Create(ctx, newPayment)
	_ = uc.orderRepo.UpdateStatus(ctx, paymentID, orders.StatusPaid)

	return nil
}
