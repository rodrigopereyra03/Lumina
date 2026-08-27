package products

import (
	"errors"
	"net/http"

	prodContracts "ecommerce-ganador/backend/src/core/contracts/products"
	prodUsecases "ecommerce-ganador/backend/src/core/usecases/products"
	"ecommerce-ganador/backend/packages/response"

	"github.com/gin-gonic/gin"
)

type GetProductByIDHandler struct {
	usecase prodUsecases.GetProductByID
}

func NewGetProductByIDHandler(usecase prodUsecases.GetProductByID) GetProductByIDHandler {
	return GetProductByIDHandler{usecase: usecase}
}

func (h GetProductByIDHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		output, err := h.usecase.Execute(c.Request.Context(), prodUsecases.GetProductByIDInput{
			ID: id,
		})
		if err != nil {
			if errors.Is(err, prodUsecases.ErrProductNotFound) {
				response.Errf(c, http.StatusNotFound, "err-product-not-found", "Product not found")
				return
			}
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		response.Okf(c, http.StatusOK, prodContracts.ToProductDTO(output.Product))
	}
}
