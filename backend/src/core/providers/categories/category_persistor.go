package categories

import (
	"context"

	"ecommerce-ganador/backend/src/core/entities/categories"
)

type CategoriesPersistor interface {
	List(ctx context.Context) ([]categories.Category, error)
	GetByID(ctx context.Context, id string) (categories.Category, error)
	Create(ctx context.Context, category categories.Category) (categories.Category, error)
}
