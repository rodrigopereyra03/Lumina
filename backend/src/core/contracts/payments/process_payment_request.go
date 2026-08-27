package payments

import (
	paymentUsecases "ecommerce-ganador/backend/src/core/usecases/payments"
)

type ProcessPaymentRequest struct {
	OrderID       string  `json:"order_id" binding:"required"`
	PaymentMethod string  `json:"payment_method" binding:"required"` // 'mercadopago', 'card', 'transfer'
	Amount        float64 `json:"amount" binding:"required,gt=0"`
	Token         string  `json:"token"`
	Installments  int     `json:"installments"`
}

func (r ProcessPaymentRequest) ToInput() paymentUsecases.ProcessPaymentInput {
	installments := r.Installments
	if installments <= 0 {
		installments = 1
	}
	return paymentUsecases.ProcessPaymentInput{
		OrderID:       r.OrderID,
		PaymentMethod: r.PaymentMethod,
		Amount:        r.Amount,
		Token:         r.Token,
		Installments:  installments,
	}
}

type ProcessPaymentResponse struct {
	PaymentID string  `json:"payment_id"`
	OrderID   string  `json:"order_id"`
	Status    string  `json:"status"`
	Amount    float64 `json:"amount"`
	Message   string  `json:"message"`
}
