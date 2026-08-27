package orders

import (
	"time"

	"ecommerce-ganador/backend/src/core/entities/orders"
)

type OrderItemDTO struct {
	ID        string  `json:"id"`
	ProductID string  `json:"product_id"`
	Title     string  `json:"title"`
	Variant   string  `json:"variant"`
	UnitPrice float64 `json:"unit_price"`
	Quantity  int     `json:"quantity"`
	Image     string  `json:"image"`
}

type OrderDTO struct {
	ID              string         `json:"id"`
	OrderNumber     string         `json:"order_number"`
	CustomerName    string         `json:"customer_name"`
	CustomerEmail   string         `json:"customer_email"`
	CustomerPhone   string         `json:"customer_phone"`
	ShippingAddress string         `json:"shipping_address"`
	Status          string         `json:"status"`
	Subtotal        float64        `json:"subtotal"`
	ShippingCost    float64        `json:"shipping_cost"`
	Total           float64        `json:"total"`
	Items           []OrderItemDTO `json:"items"`
	CreatedAt       time.Time      `json:"created_at"`
}

type CreateOrderResponse struct {
	Order OrderDTO `json:"order"`
}

type ListOrdersResponse struct {
	Orders []OrderDTO `json:"orders"`
	Total  int        `json:"total"`
}

func ToOrderDTO(o orders.Order) OrderDTO {
	items := make([]OrderItemDTO, len(o.Items))
	for i, it := range o.Items {
		items[i] = OrderItemDTO{
			ID:        it.ID,
			ProductID: it.ProductID,
			Title:     it.Title,
			Variant:   it.Variant,
			UnitPrice: it.UnitPrice,
			Quantity:  it.Quantity,
			Image:     it.Image,
		}
	}

	return OrderDTO{
		ID:              o.ID,
		OrderNumber:     o.OrderNumber,
		CustomerName:    o.CustomerName,
		CustomerEmail:   o.CustomerEmail,
		CustomerPhone:   o.CustomerPhone,
		ShippingAddress: o.ShippingAddress,
		Status:          string(o.Status),
		Subtotal:        o.Subtotal,
		ShippingCost:    o.ShippingCost,
		Total:           o.Total,
		Items:           items,
		CreatedAt:       o.CreatedAt,
	}
}

func ToOrderDTOs(ords []orders.Order) []OrderDTO {
	dtos := make([]OrderDTO, len(ords))
	for i, o := range ords {
		dtos[i] = ToOrderDTO(o)
	}
	return dtos
}
