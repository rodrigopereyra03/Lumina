package products

import (
	"encoding/json"
	"fmt"
	"strings"
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
	var images []string
	cleanSub := d.Subtitle
	if strings.Contains(d.Subtitle, "@@META@@") {
		parts := strings.Split(d.Subtitle, "@@META@@")
		cleanSub = strings.TrimSpace(parts[0])
		if len(parts) > 1 {
			var meta struct {
				Images []string `json:"images"`
			}
			if err := json.Unmarshal([]byte(parts[1]), &meta); err == nil && len(meta.Images) > 0 {
				images = meta.Images
			}
		}
	}
	if len(images) == 0 && d.Image != "" {
		images = []string{d.Image}
	}

	return products.Product{
		ID:            d.ID,
		CategoryID:    d.CategoryID,
		CategoryName:  d.CategoryName,
		Title:         d.Title,
		Subtitle:      cleanSub,
		Description:   d.Description,
		Price:         d.Price,
		OriginalPrice: d.OriginalPrice,
		Stock:         d.Stock,
		Image:         d.Image,
		Images:        images,
		Rating:        d.Rating,
		ReviewsCount:  d.ReviewsCount,
		CreatedAt:     d.CreatedAt,
		UpdatedAt:     d.UpdatedAt,
		DeletedAt:     d.DeletedAt,
	}
}

func ToDAO(p products.Product) ProductDAO {
	sub := p.Subtitle
	primaryImg := p.Image
	if primaryImg == "" && len(p.Images) > 0 {
		primaryImg = p.Images[0]
	}

	if len(p.Images) > 0 {
		var meta map[string]interface{}
		cleanSub := sub
		if strings.Contains(sub, "@@META@@") {
			parts := strings.Split(sub, "@@META@@")
			cleanSub = strings.TrimSpace(parts[0])
			if len(parts) > 1 {
				_ = json.Unmarshal([]byte(parts[1]), &meta)
			}
		}
		if meta == nil {
			meta = make(map[string]interface{})
		}
		meta["images"] = p.Images
		metaBytes, _ := json.Marshal(meta)
		sub = fmt.Sprintf("%s @@META@@%s", cleanSub, string(metaBytes))
	}

	return ProductDAO{
		ID:            p.ID,
		CategoryID:    p.CategoryID,
		CategoryName:  p.CategoryName,
		Title:         p.Title,
		Subtitle:      sub,
		Description:   p.Description,
		Price:         p.Price,
		OriginalPrice: p.OriginalPrice,
		Stock:         p.Stock,
		Image:         primaryImg,
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
