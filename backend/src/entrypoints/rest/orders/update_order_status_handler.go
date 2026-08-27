package orders

import (
	"errors"
	"net/http"

	"ecommerce-ganador/backend/src/core/entities/orders"
	orderUsecases "ecommerce-ganador/backend/src/core/usecases/orders"
	"ecommerce-ganador/backend/packages/response"

	"github.com/gin-gonic/gin"
)

type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

type UpdateOrderStatusHandler struct {
	usecase orderUsecases.UpdateOrderStatus
}

func NewUpdateOrderStatusHandler(usecase orderUsecases.UpdateOrderStatus) UpdateOrderStatusHandler {
	return UpdateOrderStatusHandler{usecase: usecase}
}

func (h UpdateOrderStatusHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var req UpdateOrderStatusRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			response.Errf(c, http.StatusBadRequest, "err-invalid-payload", err.Error())
			return
		}

		err := h.usecase.Execute(c.Request.Context(), orderUsecases.UpdateOrderStatusInput{
			OrderID: id,
			Status:  orders.Status(req.Status),
		})
		if err != nil {
			if errors.Is(err, orderUsecases.ErrOrderNotFound) {
				response.Errf(c, http.StatusNotFound, "err-order-not-found", "Order not found")
				return
			}
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		response.Okf(c, http.StatusOK, gin.H{
			"message": "Order status updated successfully",
			"status":  req.Status,
		})
	}
}
