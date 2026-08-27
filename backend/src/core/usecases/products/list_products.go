package products

import (
	"context"

	"ecommerce-ganador/backend/src/core/entities/products"
	prodProviders "ecommerce-ganador/backend/src/core/providers/products"
)

type ListProductsInput struct {
	CategorySlug string
}

type ListProductsOutput struct {
	Products []products.Product
	Total    int
}

type ListProducts interface {
	Execute(ctx context.Context, input ListProductsInput) (ListProductsOutput, error)
}

type ListProductsImpl struct {
	persistor prodProviders.ProductsPersistor
}

func NewListProductsImpl(persistor prodProviders.ProductsPersistor) ListProductsImpl {
	return ListProductsImpl{persistor: persistor}
}

func (uc ListProductsImpl) Execute(ctx context.Context, input ListProductsInput) (ListProductsOutput, error) {
	prods, err := uc.persistor.List(ctx, input.CategorySlug)
	if err != nil {
		return ListProductsOutput{}, err
	}

	return ListProductsOutput{
		Products: prods,
		Total:    len(prods),
	}, nil
}
