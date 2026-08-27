package products

import (
	"time"

	"ecommerce-ganador/backend/src/core/entities/products"
)

type ProductDAO struct {
	ID            string     `db:"id"`
	CategoryID    string     `db:"category_id"`
	CategoryName  string     `db:"category_name"`
	Title         string     `db:"title"`
	Subtitle      string     `db:"subtitle"`
	Description   string     `db:"description"`
	Price         float64    `db:"price"`
	OriginalPrice *float64   `db:"original_price"`
	Stock         int        `db:"stock"`
	Image         string     `db:"image"`
	Rating        float64    `db:"rating"`
	ReviewsCount  int        `db:"reviews_count"`
	CreatedAt     time.Time  `db:"created_at"`
	UpdatedAt     time.Time  `db:"updated_at"`
	DeletedAt     *time.Time `db:"deleted_at"`
}

func (d ProductDAO) ToEntity() products.Product {
	return products.Product{
		ID:            d.ID,
		CategoryID:    d.CategoryID,
		CategoryName:  d.CategoryName,
		Title:         d.Title,
		Subtitle:      d.Subtitle,
		Description:   d.Description,
		Price:         d.Price,
		OriginalPrice: d.OriginalPrice,
		Stock:         d.Stock,
		Image:         d.Image,
		Rating:        d.Rating,
		ReviewsCount:  d.ReviewsCount,
		CreatedAt:     d.CreatedAt,
		UpdatedAt:     d.UpdatedAt,
		DeletedAt:     d.DeletedAt,
	}
}

func ToDAO(p products.Product) ProductDAO {
	return ProductDAO{
		ID:            p.ID,
		CategoryID:    p.CategoryID,
		CategoryName:  p.CategoryName,
		Title:         p.Title,
		Subtitle:      p.Subtitle,
		Description:   p.Description,
		Price:         p.Price,
		OriginalPrice: p.OriginalPrice,
		Stock:         p.Stock,
		Image:         p.Image,
		Rating:        p.Rating,
		ReviewsCount:  p.ReviewsCount,
		CreatedAt:     p.CreatedAt,
		UpdatedAt:     p.UpdatedAt,
		DeletedAt:     p.DeletedAt,
	}
}

func ToEntities(daos []ProductDAO) []products.Product {
	entities := make([]products.Product, len(daos))
	for i, d := range daos {
		entities[i] = d.ToEntity()
	}
	return entities
}
