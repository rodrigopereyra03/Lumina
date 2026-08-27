package products

import (
	"context"
	"time"

	"ecommerce-ganador/backend/src/core/entities/products"
	prodProviders "ecommerce-ganador/backend/src/core/providers/products"
)

type CreateProductInput struct {
	CategoryID    string
	CategoryName  string
	Title         string
	Subtitle      string
	Description   string
	Price         float64
	OriginalPrice *float64
	Stock         int
	Image         string
}

type CreateProductOutput struct {
	Product products.Product
}

type CreateProduct interface {
	Execute(ctx context.Context, input CreateProductInput) (CreateProductOutput, error)
}

type CreateProductImpl struct {
	persistor prodProviders.ProductsPersistor
}

func NewCreateProductImpl(persistor prodProviders.ProductsPersistor) CreateProductImpl {
	return CreateProductImpl{persistor: persistor}
}

func (uc CreateProductImpl) Execute(ctx context.Context, input CreateProductInput) (CreateProductOutput, error) {
	newProd := products.Product{
		CategoryID:    input.CategoryID,
		CategoryName:  input.CategoryName,
		Title:         input.Title,
		Subtitle:      input.Subtitle,
		Description:   input.Description,
		Price:         input.Price,
		OriginalPrice: input.OriginalPrice,
		Stock:         input.Stock,
		Image:         input.Image,
		Rating:        5.0,
		ReviewsCount:  0,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	created, err := uc.persistor.Create(ctx, newProd)
	if err != nil {
		return CreateProductOutput{}, err
	}

	return CreateProductOutput{Product: created}, nil
}
