package orders

import (
	"time"

	"ecommerce-ganador/backend/src/core/entities/orders"
)

type OrderItemDAO struct {
	ID        string    `db:"id"`
	OrderID   string    `db:"order_id"`
	ProductID string    `db:"product_id"`
	Title     string    `db:"title"`
	Variant   string    `db:"variant"`
	UnitPrice float64   `db:"unit_price"`
	Quantity  int       `db:"quantity"`
	Image     string    `db:"image"`
	CreatedAt time.Time `db:"created_at"`
}

type OrderDAO struct {
	ID              string         `db:"id"`
	UserID          *string        `db:"user_id"`
	OrderNumber     string         `db:"order_number"`
	CustomerName    string         `db:"customer_name"`
	CustomerEmail   string         `db:"customer_email"`
	CustomerPhone   string         `db:"customer_phone"`
	ShippingAddress string         `db:"shipping_address"`
	Status          string         `db:"status"`
	Subtotal        float64        `db:"subtotal"`
	ShippingCost    float64        `db:"shipping_cost"`
	Total           float64        `db:"total"`
	Items           []OrderItemDAO `db:"-"`
	CreatedAt       time.Time      `db:"created_at"`
	UpdatedAt       time.Time      `db:"updated_at"`
	DeletedAt       *time.Time     `db:"deleted_at"`
}

func (d OrderDAO) ToEntity() orders.Order {
	items := make([]orders.OrderItem, len(d.Items))
	for i, it := range d.Items {
		items[i] = orders.OrderItem{
			ID:        it.ID,
			OrderID:   it.OrderID,
			ProductID: it.ProductID,
			Title:     it.Title,
			Variant:   it.Variant,
			UnitPrice: it.UnitPrice,
			Quantity:  it.Quantity,
			Image:     it.Image,
			CreatedAt: it.CreatedAt,
		}
	}

	return orders.Order{
		ID:              d.ID,
		UserID:          d.UserID,
		OrderNumber:     d.OrderNumber,
		CustomerName:    d.CustomerName,
		CustomerEmail:   d.CustomerEmail,
		CustomerPhone:   d.CustomerPhone,
		ShippingAddress: d.ShippingAddress,
		Status:          orders.Status(d.Status),
		Subtotal:        d.Subtotal,
		ShippingCost:    d.ShippingCost,
		Total:           d.Total,
		Items:           items,
		CreatedAt:       d.CreatedAt,
		UpdatedAt:       d.UpdatedAt,
		DeletedAt:       d.DeletedAt,
	}
}

func ToDAO(o orders.Order) OrderDAO {
	items := make([]OrderItemDAO, len(o.Items))
	for i, it := range o.Items {
		items[i] = OrderItemDAO{
			ID:        it.ID,
			OrderID:   it.OrderID,
			ProductID: it.ProductID,
			Title:     it.Title,
			Variant:   it.Variant,
			UnitPrice: it.UnitPrice,
			Quantity:  it.Quantity,
			Image:     it.Image,
			CreatedAt: it.CreatedAt,
		}
	}

	return OrderDAO{
		ID:              o.ID,
		UserID:          o.UserID,
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
		UpdatedAt:       o.UpdatedAt,
		DeletedAt:       o.DeletedAt,
	}
}

func ToEntities(daos []OrderDAO) []orders.Order {
	entities := make([]orders.Order, len(daos))
	for i, d := range daos {
		entities[i] = d.ToEntity()
	}
	return entities
}
