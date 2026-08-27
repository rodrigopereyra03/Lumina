package products

import (
	"context"

	"ecommerce-ganador/backend/src/core/entities/products"
	prodProviders "ecommerce-ganador/backend/src/core/providers/products"
)

type GetProductByIDInput struct {
	ID string
}

type GetProductByIDOutput struct {
	Product products.Product
}

type GetProductByID interface {
	Execute(ctx context.Context, input GetProductByIDInput) (GetProductByIDOutput, error)
}

type GetProductByIDImpl struct {
	persistor prodProviders.ProductsPersistor
}

func NewGetProductByIDImpl(persistor prodProviders.ProductsPersistor) GetProductByIDImpl {
	return GetProductByIDImpl{persistor: persistor}
}

func (uc GetProductByIDImpl) Execute(ctx context.Context, input GetProductByIDInput) (GetProductByIDOutput, error) {
	prod, err := uc.persistor.GetByID(ctx, input.ID)
	if err != nil {
		return GetProductByIDOutput{}, ErrProductNotFound
	}

	return GetProductByIDOutput{Product: prod}, nil
}
