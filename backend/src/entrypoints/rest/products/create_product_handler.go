package products

import (
	"net/http"

	prodContracts "ecommerce-ganador/backend/src/core/contracts/products"
	prodUsecases "ecommerce-ganador/backend/src/core/usecases/products"
	"ecommerce-ganador/backend/packages/response"

	"github.com/gin-gonic/gin"
)

type CreateProductHandler struct {
	usecase prodUsecases.CreateProduct
}

func NewCreateProductHandler(usecase prodUsecases.CreateProduct) CreateProductHandler {
	return CreateProductHandler{usecase: usecase}
}

func (h CreateProductHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req prodContracts.CreateProductRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			response.Errf(c, http.StatusBadRequest, "err-invalid-payload", err.Error())
			return
		}

		output, err := h.usecase.Execute(c.Request.Context(), req.ToInput())
		if err != nil {
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		response.Okf(c, http.StatusCreated, prodContracts.ToProductDTO(output.Product))
	}
}
