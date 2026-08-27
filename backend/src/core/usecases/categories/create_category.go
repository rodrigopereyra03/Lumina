package categories

import (
	"context"
	"strings"
	"time"

	"ecommerce-ganador/backend/src/core/entities/categories"
	catProviders "ecommerce-ganador/backend/src/core/providers/categories"
)

type CreateCategoryInput struct {
	Name string
	Slug string
	Icon string
}

type CreateCategoryOutput struct {
	Category categories.Category
}

type CreateCategory interface {
	Execute(ctx context.Context, input CreateCategoryInput) (CreateCategoryOutput, error)
}

type CreateCategoryImpl struct {
	persistor catProviders.CategoriesPersistor
}

func NewCreateCategoryImpl(persistor catProviders.CategoriesPersistor) CreateCategoryImpl {
	return CreateCategoryImpl{persistor: persistor}
}

func (uc CreateCategoryImpl) Execute(ctx context.Context, input CreateCategoryInput) (CreateCategoryOutput, error) {
	slug := input.Slug
	if slug == "" {
		slug = strings.ToLower(strings.ReplaceAll(input.Name, " ", "-"))
	}
	icon := input.Icon
	if icon == "" {
		icon = "category"
	}

	newCat := categories.Category{
		Name:          input.Name,
		Slug:          slug,
		Icon:          icon,
		ProductsCount: 0,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	created, err := uc.persistor.Create(ctx, newCat)
	if err != nil {
		return CreateCategoryOutput{}, err
	}

	return CreateCategoryOutput{Category: created}, nil
}
