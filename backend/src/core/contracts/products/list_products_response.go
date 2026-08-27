package products

import (
	"ecommerce-ganador/backend/src/core/entities/products"
)

type ProductDTO struct {
	ID            string   `json:"id"`
	CategoryID    string   `json:"category_id"`
	CategoryName  string   `json:"category_name"`
	Title         string   `json:"title"`
	Subtitle      string   `json:"subtitle"`
	Description   string   `json:"description"`
	Price         float64  `json:"price"`
	OriginalPrice *float64 `json:"original_price,omitempty"`
	Stock         int      `json:"stock"`
	Image         string   `json:"image"`
	Rating        float64  `json:"rating"`
	ReviewsCount  int      `json:"reviews_count"`
}

type ListProductsResponse struct {
	Products []ProductDTO `json:"products"`
	Total    int          `json:"total"`
}

func ToProductDTO(p products.Product) ProductDTO {
	return ProductDTO{
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
	}
}

func ToProductDTOs(prods []products.Product) []ProductDTO {
	dtos := make([]ProductDTO, len(prods))
	for i, p := range prods {
		dtos[i] = ToProductDTO(p)
	}
	return dtos
}
