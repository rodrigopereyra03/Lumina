package products

import (
	"time"
)

type Product struct {
	ID            string
	CategoryID    string
	CategoryName  string
	Title         string
	Subtitle      string
	Description   string
	Price         float64
	OriginalPrice *float64
	Stock         int
	Image         string
	Rating        float64
	ReviewsCount  int
	CreatedAt     time.Time
	UpdatedAt     time.Time
	DeletedAt     *time.Time
}

func (p Product) IsInStock() bool {
	return p.Stock > 0
}
