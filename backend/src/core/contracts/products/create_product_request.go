package products

import (
	productUsecases "ecommerce-ganador/backend/src/core/usecases/products"
)

type CreateProductRequest struct {
	CategoryID    string   `json:"category_id"`
	CategoryName  string   `json:"category_name"`
	Title         string   `json:"title" binding:"required"`
	Subtitle      string   `json:"subtitle"`
	Description   string   `json:"description" binding:"required"`
	Price         float64  `json:"price" binding:"required,gt=0"`
	OriginalPrice *float64 `json:"original_price,omitempty"`
	Stock         int      `json:"stock" binding:"gte=0"`
	Image         string   `json:"image" binding:"required"`
}

func (r CreateProductRequest) ToInput() productUsecases.CreateProductInput {
	return productUsecases.CreateProductInput{
		CategoryID:    r.CategoryID,
		CategoryName:  r.CategoryName,
		Title:         r.Title,
		Subtitle:      r.Subtitle,
		Description:   r.Description,
		Price:         r.Price,
		OriginalPrice: r.OriginalPrice,
		Stock:         r.Stock,
		Image:         r.Image,
	}
}
