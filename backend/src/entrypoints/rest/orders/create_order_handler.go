package orders

import (
	"errors"
	"net/http"

	orderContracts "ecommerce-ganador/backend/src/core/contracts/orders"
	orderUsecases "ecommerce-ganador/backend/src/core/usecases/orders"
	"ecommerce-ganador/backend/packages/response"

	"github.com/gin-gonic/gin"
)

type CreateOrderHandler struct {
	usecase orderUsecases.CreateOrder
}

func NewCreateOrderHandler(usecase orderUsecases.CreateOrder) CreateOrderHandler {
	return CreateOrderHandler{usecase: usecase}
}

func (h CreateOrderHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req orderContracts.CreateOrderRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			response.Errf(c, http.StatusBadRequest, "err-invalid-payload", err.Error())
			return
		}

		var userID *string
		if uID, exists := c.Get("userId"); exists {
			s := uID.(string)
			userID = &s
		}

		output, err := h.usecase.Execute(c.Request.Context(), req.ToInput(userID))
		if err != nil {
			if errors.Is(err, orderUsecases.ErrEmptyOrderItems) {
				response.Errf(c, http.StatusBadRequest, "err-empty-order", "Order must contain at least one item")
				return
			}
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		resp := orderContracts.CreateOrderResponse{
			Order: orderContracts.ToOrderDTO(output.Order),
		}

		response.Okf(c, http.StatusCreated, resp)
	}
}
