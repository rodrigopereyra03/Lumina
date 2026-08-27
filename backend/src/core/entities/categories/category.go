package categories

import (
	"time"
)

type Category struct {
	ID            string
	Name          string
	Slug          string
	Icon          string
	ProductsCount int
	CreatedAt     time.Time
	UpdatedAt     time.Time
	DeletedAt     *time.Time
}
