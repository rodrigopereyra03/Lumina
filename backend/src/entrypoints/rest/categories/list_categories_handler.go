package categories

import (
	"net/http"

	catContracts "ecommerce-ganador/backend/src/core/contracts/categories"
	catUsecases "ecommerce-ganador/backend/src/core/usecases/categories"
	"ecommerce-ganador/backend/packages/response"

	"github.com/gin-gonic/gin"
)

type ListCategoriesHandler struct {
	usecase catUsecases.ListCategories
}

func NewListCategoriesHandler(usecase catUsecases.ListCategories) ListCategoriesHandler {
	return ListCategoriesHandler{usecase: usecase}
}

func (h ListCategoriesHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		output, err := h.usecase.Execute(c.Request.Context(), catUsecases.ListCategoriesInput{})
		if err != nil {
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		resp := catContracts.ListCategoriesResponse{
			Categories: catContracts.ToCategoryDTOs(output.Categories),
		}

		response.Okf(c, http.StatusOK, resp)
	}
}
