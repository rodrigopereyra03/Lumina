package products

type UpdateProductRequest struct {
	Title         string   `json:"title"`
	Subtitle      string   `json:"subtitle"`
	CategoryName  string   `json:"category_name"`
	Description   string   `json:"description"`
	Price         float64  `json:"price"`
	OriginalPrice *float64 `json:"original_price,omitempty"`
	Stock         int      `json:"stock"`
	Image         string   `json:"image"`
}
