package payments

import (
	"time"
)

type PaymentStatus string

const (
	PaymentStatusPending  PaymentStatus = "pending"
	PaymentStatusApproved PaymentStatus = "approved"
	PaymentStatusRejected PaymentStatus = "rejected"
	PaymentStatusRefunded PaymentStatus = "refunded"
)

type Payment struct {
	ID               string
	OrderID          string
	PaymentMethod    string // 'mercadopago', 'card', 'transfer'
	GatewayName      string
	GatewayPaymentID string
	Amount           float64
	Status           PaymentStatus
	Metadata         map[string]any
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
