package orders

import (
	"time"
)

type Status string

const (
	StatusPaid       Status = "Pagado"
	StatusProcessing Status = "En Proceso"
	StatusShipped    Status = "Enviado"
	StatusDelivered  Status = "Entregado"
	StatusCancelled  Status = "Cancelado"
)

type OrderItem struct {
	ID        string
	OrderID   string
	ProductID string
	Title     string
	Variant   string
	UnitPrice float64
	Quantity  int
	Image     string
	CreatedAt time.Time
}

type Order struct {
	ID              string
	UserID          *string
	OrderNumber     string
	CustomerName    string
	CustomerEmail   string
	CustomerPhone   string
	ShippingAddress string
	Status          Status
	Subtotal        float64
	ShippingCost    float64
	Total           float64
	Items           []OrderItem
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       *time.Time
}
