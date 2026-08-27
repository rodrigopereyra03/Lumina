package categories

import (
	"context"

	"ecommerce-ganador/backend/src/core/entities/categories"
	catProviders "ecommerce-ganador/backend/src/core/providers/categories"
)

type ListCategoriesInput struct{}

type ListCategoriesOutput struct {
	Categories []categories.Category
}

type ListCategories interface {
	Execute(ctx context.Context, input ListCategoriesInput) (ListCategoriesOutput, error)
}

type ListCategoriesImpl struct {
	persistor catProviders.CategoriesPersistor
}

func NewListCategoriesImpl(persistor catProviders.CategoriesPersistor) ListCategoriesImpl {
	return ListCategoriesImpl{persistor: persistor}
}

func (uc ListCategoriesImpl) Execute(ctx context.Context, _ ListCategoriesInput) (ListCategoriesOutput, error) {
	cats, err := uc.persistor.List(ctx)
	if err != nil {
		return ListCategoriesOutput{}, err
	}

	return ListCategoriesOutput{Categories: cats}, nil
}
