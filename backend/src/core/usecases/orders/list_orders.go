package orders

import (
	"context"

	"ecommerce-ganador/backend/src/core/entities/orders"
	orderProviders "ecommerce-ganador/backend/src/core/providers/orders"
)

type ListOrdersInput struct {
	UserID *string
	Status *string
}

type ListOrdersOutput struct {
	Orders []orders.Order
	Total  int
}

type ListOrders interface {
	Execute(ctx context.Context, input ListOrdersInput) (ListOrdersOutput, error)
}

type ListOrdersImpl struct {
	persistor orderProviders.OrdersPersistor
}

func NewListOrdersImpl(persistor orderProviders.OrdersPersistor) ListOrdersImpl {
	return ListOrdersImpl{persistor: persistor}
}

func (uc ListOrdersImpl) Execute(ctx context.Context, input ListOrdersInput) (ListOrdersOutput, error) {
	ords, err := uc.persistor.List(ctx, input.UserID, input.Status)
	if err != nil {
		return ListOrdersOutput{}, err
	}

	return ListOrdersOutput{
		Orders: ords,
		Total:  len(ords),
	}, nil
}
