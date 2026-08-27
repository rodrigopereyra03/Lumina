package orders

import (
	"net/http"

	orderContracts "ecommerce-ganador/backend/src/core/contracts/orders"
	orderUsecases "ecommerce-ganador/backend/src/core/usecases/orders"
	"ecommerce-ganador/backend/packages/response"

	"github.com/gin-gonic/gin"
)

type ListOrdersHandler struct {
	usecase orderUsecases.ListOrders
}

func NewListOrdersHandler(usecase orderUsecases.ListOrders) ListOrdersHandler {
	return ListOrdersHandler{usecase: usecase}
}

func (h ListOrdersHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		statusQuery := c.Query("status")
		var statusPtr *string
		if statusQuery != "" {
			statusPtr = &statusQuery
		}

		output, err := h.usecase.Execute(c.Request.Context(), orderUsecases.ListOrdersInput{
			Status: statusPtr,
		})
		if err != nil {
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		resp := orderContracts.ListOrdersResponse{
			Orders: orderContracts.ToOrderDTOs(output.Orders),
			Total:  output.Total,
		}

		response.Okf(c, http.StatusOK, resp)
	}
}
