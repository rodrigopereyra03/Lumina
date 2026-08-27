package products

import (
	"context"

	prodProviders "ecommerce-ganador/backend/src/core/providers/products"
)

type DeleteProductInput struct {
	ID string
}

type DeleteProduct interface {
	Execute(ctx context.Context, input DeleteProductInput) error
}

type DeleteProductImpl struct {
	persistor prodProviders.ProductsPersistor
}

func NewDeleteProductImpl(persistor prodProviders.ProductsPersistor) DeleteProductImpl {
	return DeleteProductImpl{persistor: persistor}
}

func (uc DeleteProductImpl) Execute(ctx context.Context, input DeleteProductInput) error {
	if _, err := uc.persistor.GetByID(ctx, input.ID); err != nil {
		return ErrProductNotFound
	}
	return uc.persistor.Delete(ctx, input.ID)
}
