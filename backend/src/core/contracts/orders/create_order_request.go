package orders

import (
	orderUsecases "ecommerce-ganador/backend/src/core/usecases/orders"
)

type OrderItemRequest struct {
	ProductID string  `json:"product_id"`
	Title     string  `json:"title" binding:"required"`
	Variant   string  `json:"variant"`
	UnitPrice float64 `json:"unit_price" binding:"required,gt=0"`
	Quantity  int     `json:"quantity" binding:"required,gt=0"`
	Image     string  `json:"image"`
}

type CreateOrderRequest struct {
	CustomerName    string             `json:"customer_name" binding:"required"`
	CustomerEmail   string             `json:"customer_email" binding:"required,email"`
	CustomerPhone   string             `json:"customer_phone"`
	ShippingAddress string             `json:"shipping_address" binding:"required"`
	Items           []OrderItemRequest `json:"items" binding:"required,min=1"`
}

func (r CreateOrderRequest) ToInput(userID *string) orderUsecases.CreateOrderInput {
	items := make([]orderUsecases.CreateOrderItemInput, len(r.Items))
	for i, it := range r.Items {
		items[i] = orderUsecases.CreateOrderItemInput{
			ProductID: it.ProductID,
			Title:     it.Title,
			Variant:   it.Variant,
			UnitPrice: it.UnitPrice,
			Quantity:  it.Quantity,
			Image:     it.Image,
		}
	}

	return orderUsecases.CreateOrderInput{
		UserID:          userID,
		CustomerName:    r.CustomerName,
		CustomerEmail:   r.CustomerEmail,
		CustomerPhone:   r.CustomerPhone,
		ShippingAddress: r.ShippingAddress,
		Items:           items,
	}
}
