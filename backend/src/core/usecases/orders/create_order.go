package orders

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"ecommerce-ganador/backend/src/core/entities/orders"
	notifProviders "ecommerce-ganador/backend/src/core/providers/notifications"
	orderProviders "ecommerce-ganador/backend/src/core/providers/orders"
)

type CreateOrderItemInput struct {
	ProductID string
	Title     string
	Variant   string
	UnitPrice float64
	Quantity  int
	Image     string
}

type CreateOrderInput struct {
	UserID          *string
	CustomerName    string
	CustomerEmail   string
	CustomerPhone   string
	ShippingAddress string
	Items           []CreateOrderItemInput
}

type CreateOrderOutput struct {
	Order orders.Order
}

type CreateOrder interface {
	Execute(ctx context.Context, input CreateOrderInput) (CreateOrderOutput, error)
}

type CreateOrderImpl struct {
	persistor     orderProviders.OrdersPersistor
	emailProvider notifProviders.EmailProvider
}

func NewCreateOrderImpl(persistor orderProviders.OrdersPersistor, emailProvider notifProviders.EmailProvider) CreateOrderImpl {
	return CreateOrderImpl{
		persistor:     persistor,
		emailProvider: emailProvider,
	}
}

func (uc CreateOrderImpl) Execute(ctx context.Context, input CreateOrderInput) (CreateOrderOutput, error) {
	if len(input.Items) == 0 {
		return CreateOrderOutput{}, ErrEmptyOrderItems
	}

	var subtotal float64
	orderItems := make([]orders.OrderItem, len(input.Items))

	for i, it := range input.Items {
		subtotal += it.UnitPrice * float64(it.Quantity)
		orderItems[i] = orders.OrderItem{
			ProductID: it.ProductID,
			Title:     it.Title,
			Variant:   it.Variant,
			UnitPrice: it.UnitPrice,
			Quantity:  it.Quantity,
			Image:     it.Image,
			CreatedAt: time.Now(),
		}
	}

	shippingCost := 0.0
	if subtotal < 150 {
		shippingCost = 15.0
	}

	orderNum := fmt.Sprintf("#LUM-%06d-01", rand.Intn(900000)+100000)

	newOrder := orders.Order{
		UserID:          input.UserID,
		OrderNumber:     orderNum,
		CustomerName:    input.CustomerName,
		CustomerEmail:   input.CustomerEmail,
		CustomerPhone:   input.CustomerPhone,
		ShippingAddress: input.ShippingAddress,
		Status:          orders.StatusPaid,
		Subtotal:        subtotal,
		ShippingCost:    shippingCost,
		Total:           subtotal + shippingCost,
		Items:           orderItems,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	created, err := uc.persistor.Create(ctx, newOrder)
	if err != nil {
		return CreateOrderOutput{}, fmt.Errorf("failed to save order: %w", err)
	}

	// Trigger async order created email
	if uc.emailProvider != nil && created.CustomerEmail != "" {
		_ = uc.emailProvider.SendOrderCreatedEmail(ctx, created.CustomerEmail, created)
	}

	return CreateOrderOutput{Order: created}, nil
}
