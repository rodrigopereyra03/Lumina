package payments

import (
	"context"
	"fmt"
	"time"

	"ecommerce-ganador/backend/src/core/entities/orders"
	"ecommerce-ganador/backend/src/core/entities/payments"
	notifProviders "ecommerce-ganador/backend/src/core/providers/notifications"
	orderProviders "ecommerce-ganador/backend/src/core/providers/orders"
	paymentProviders "ecommerce-ganador/backend/src/core/providers/payments"
)

type ProcessPaymentInput struct {
	OrderID       string
	PaymentMethod string // 'mercadopago', 'card', 'transfer'
	Amount        float64
	Token         string
	Installments  int
}

type ProcessPaymentOutput struct {
	Payment payments.Payment
	Success bool
}

type ProcessPayment interface {
	Execute(ctx context.Context, input ProcessPaymentInput) (ProcessPaymentOutput, error)
}

type ProcessPaymentImpl struct {
	paymentRepo   paymentProviders.PaymentsPersistor
	orderRepo     orderProviders.OrdersPersistor
	emailProvider notifProviders.EmailProvider
}

func NewProcessPaymentImpl(
	paymentRepo paymentProviders.PaymentsPersistor,
	orderRepo orderProviders.OrdersPersistor,
	emailProvider notifProviders.EmailProvider,
) ProcessPaymentImpl {
	return ProcessPaymentImpl{
		paymentRepo:   paymentRepo,
		orderRepo:     orderRepo,
		emailProvider: emailProvider,
	}
}

func (uc ProcessPaymentImpl) Execute(ctx context.Context, input ProcessPaymentInput) (ProcessPaymentOutput, error) {
	if input.Amount <= 0 || input.OrderID == "" {
		return ProcessPaymentOutput{}, ErrInvalidPaymentData
	}

	order, err := uc.orderRepo.GetByID(ctx, input.OrderID)
	if err != nil {
		return ProcessPaymentOutput{}, fmt.Errorf("order not found: %w", err)
	}

	// Simulation of Gateway Authorization (Mercado Pago / Card Gateway)
	paymentID := fmt.Sprintf("PAY-%d", time.Now().UnixNano()/1e6)
	newPayment := payments.Payment{
		OrderID:          order.ID,
		PaymentMethod:    input.PaymentMethod,
		GatewayName:      "Mercado Pago / Gateway Direct",
		GatewayPaymentID: paymentID,
		Amount:           input.Amount,
		Status:           payments.PaymentStatusApproved,
		Metadata: map[string]any{
			"installments": input.Installments,
			"processed_at": time.Now().Format(time.RFC3339),
		},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	created, err := uc.paymentRepo.Create(ctx, newPayment)
	if err != nil {
		return ProcessPaymentOutput{}, err
	}

	// Update order status to Paid
	_ = uc.orderRepo.UpdateStatus(ctx, order.ID, orders.StatusPaid)

	// Trigger async payment approved email
	if uc.emailProvider != nil && order.CustomerEmail != "" {
		_ = uc.emailProvider.SendPaymentApprovedEmail(ctx, order.CustomerEmail, order, created)
	}

	return ProcessPaymentOutput{
		Payment: created,
		Success: true,
	}, nil
}
