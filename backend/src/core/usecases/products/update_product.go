package products

import (
	"context"

	"ecommerce-ganador/backend/src/core/entities/products"
	prodProviders "ecommerce-ganador/backend/src/core/providers/products"
)

type UpdateProductInput struct {
	ID            string
	Title         string
	Subtitle      string
	CategoryName  string
	Description   string
	Price         float64
	OriginalPrice *float64
	Stock         int
	Image         string
}

type UpdateProductOutput struct {
	Product products.Product
}

type UpdateProduct interface {
	Execute(ctx context.Context, input UpdateProductInput) (UpdateProductOutput, error)
}

type UpdateProductImpl struct {
	persistor prodProviders.ProductsPersistor
}

func NewUpdateProductImpl(persistor prodProviders.ProductsPersistor) UpdateProductImpl {
	return UpdateProductImpl{persistor: persistor}
}

func (uc UpdateProductImpl) Execute(ctx context.Context, input UpdateProductInput) (UpdateProductOutput, error) {
	existing, err := uc.persistor.GetByID(ctx, input.ID)
	if err != nil {
		return UpdateProductOutput{}, ErrProductNotFound
	}

	if input.Title != "" {
		existing.Title = input.Title
	}
	if input.Subtitle != "" {
		existing.Subtitle = input.Subtitle
	}
	if input.CategoryName != "" {
		existing.CategoryName = input.CategoryName
	}
	if input.Description != "" {
		existing.Description = input.Description
	}
	if input.Price > 0 {
		existing.Price = input.Price
	}
	if input.OriginalPrice != nil {
		existing.OriginalPrice = input.OriginalPrice
	}
	if input.Stock >= 0 {
		existing.Stock = input.Stock
	}
	if input.Image != "" {
		existing.Image = input.Image
	}

	updated, err := uc.persistor.Update(ctx, existing)
	if err != nil {
		return UpdateProductOutput{}, err
	}

	return UpdateProductOutput{Product: updated}, nil
}
