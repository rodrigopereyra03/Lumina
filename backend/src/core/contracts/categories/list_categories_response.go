package categories

import (
	"ecommerce-ganador/backend/src/core/entities/categories"
)

type CategoryDTO struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Slug          string `json:"slug"`
	Icon          string `json:"icon"`
	ProductsCount int    `json:"products_count"`
}

type ListCategoriesResponse struct {
	Categories []CategoryDTO `json:"categories"`
}

func ToCategoryDTO(c categories.Category) CategoryDTO {
	return CategoryDTO{
		ID:            c.ID,
		Name:          c.Name,
		Slug:          c.Slug,
		Icon:          c.Icon,
		ProductsCount: c.ProductsCount,
	}
}

func ToCategoryDTOs(cats []categories.Category) []CategoryDTO {
	dtos := make([]CategoryDTO, len(cats))
	for i, c := range cats {
		dtos[i] = ToCategoryDTO(c)
	}
	return dtos
}
