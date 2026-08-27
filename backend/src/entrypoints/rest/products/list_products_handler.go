package products

import (
	"net/http"

	prodContracts "ecommerce-ganador/backend/src/core/contracts/products"
	prodUsecases "ecommerce-ganador/backend/src/core/usecases/products"
	"ecommerce-ganador/backend/packages/response"

	"github.com/gin-gonic/gin"
)

type ListProductsHandler struct {
	usecase prodUsecases.ListProducts
}

func NewListProductsHandler(usecase prodUsecases.ListProducts) ListProductsHandler {
	return ListProductsHandler{usecase: usecase}
}

func (h ListProductsHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		categorySlug := c.Query("category")

		output, err := h.usecase.Execute(c.Request.Context(), prodUsecases.ListProductsInput{
			CategorySlug: categorySlug,
		})
		if err != nil {
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		resp := prodContracts.ListProductsResponse{
			Products: prodContracts.ToProductDTOs(output.Products),
			Total:    output.Total,
		}

		response.Okf(c, http.StatusOK, resp)
	}
}
