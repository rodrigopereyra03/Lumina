package categories

import (
	"net/http"

	"ecommerce-ganador/backend/packages/response"
	catContracts "ecommerce-ganador/backend/src/core/contracts/categories"
	catUsecases "ecommerce-ganador/backend/src/core/usecases/categories"

	"github.com/gin-gonic/gin"
)

type CreateCategoryHandler struct {
	usecase catUsecases.CreateCategory
}

func NewCreateCategoryHandler(usecase catUsecases.CreateCategory) CreateCategoryHandler {
	return CreateCategoryHandler{usecase: usecase}
}

func (h CreateCategoryHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req catContracts.CreateCategoryRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			response.Errf(c, http.StatusBadRequest, "err-invalid-payload", err.Error())
			return
		}

		output, err := h.usecase.Execute(c.Request.Context(), catUsecases.CreateCategoryInput{
			Name: req.Name,
			Slug: req.Slug,
			Icon: req.Icon,
		})
		if err != nil {
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		response.Okf(c, http.StatusCreated, catContracts.ToCategoryDTO(output.Category))
	}
}
