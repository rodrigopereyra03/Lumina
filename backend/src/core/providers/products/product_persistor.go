package products

import (
	"context"

	"ecommerce-ganador/backend/src/core/entities/products"
)

type ProductsPersistor interface {
	List(ctx context.Context, categorySlug string) ([]products.Product, error)
	GetByID(ctx context.Context, id string) (products.Product, error)
	Create(ctx context.Context, product products.Product) (products.Product, error)
	Update(ctx context.Context, product products.Product) (products.Product, error)
	Delete(ctx context.Context, id string) error
}
