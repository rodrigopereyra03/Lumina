package categories

type CreateCategoryRequest struct {
	Name string `json:"name" binding:"required"`
	Slug string `json:"slug"`
	Icon string `json:"icon"`
}
