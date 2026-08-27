package categories

import (
	"time"

	"ecommerce-ganador/backend/src/core/entities/categories"
)

type CategoryDAO struct {
	ID            string     `db:"id"`
	Name          string     `db:"name"`
	Slug          string     `db:"slug"`
	Icon          string     `db:"icon"`
	ProductsCount int        `db:"products_count"`
	CreatedAt     time.Time  `db:"created_at"`
	UpdatedAt     time.Time  `db:"updated_at"`
	DeletedAt     *time.Time `db:"deleted_at"`
}

func (d CategoryDAO) ToEntity() categories.Category {
	return categories.Category{
		ID:            d.ID,
		Name:          d.Name,
		Slug:          d.Slug,
		Icon:          d.Icon,
		ProductsCount: d.ProductsCount,
		CreatedAt:     d.CreatedAt,
		UpdatedAt:     d.UpdatedAt,
		DeletedAt:     d.DeletedAt,
	}
}

func ToDAO(c categories.Category) CategoryDAO {
	return CategoryDAO{
		ID:            c.ID,
		Name:          c.Name,
		Slug:          c.Slug,
		Icon:          c.Icon,
		ProductsCount: c.ProductsCount,
		CreatedAt:     c.CreatedAt,
		UpdatedAt:     c.UpdatedAt,
		DeletedAt:     c.DeletedAt,
	}
}

func ToEntities(daos []CategoryDAO) []categories.Category {
	entities := make([]categories.Category, len(daos))
	for i, d := range daos {
		entities[i] = d.ToEntity()
	}
	return entities
}
