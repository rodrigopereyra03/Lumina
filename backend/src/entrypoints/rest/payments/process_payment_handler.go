package payments

import (
	"errors"
	"net/http"

	"ecommerce-ganador/backend/packages/response"
	paymentContracts "ecommerce-ganador/backend/src/core/contracts/payments"
	paymentUsecases "ecommerce-ganador/backend/src/core/usecases/payments"

	"github.com/gin-gonic/gin"
)

type ProcessPaymentHandler struct {
	usecase paymentUsecases.ProcessPayment
}

func NewProcessPaymentHandler(usecase paymentUsecases.ProcessPayment) ProcessPaymentHandler {
	return ProcessPaymentHandler{usecase: usecase}
}

func (h ProcessPaymentHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req paymentContracts.ProcessPaymentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			response.Errf(c, http.StatusBadRequest, "err-invalid-payload", err.Error())
			return
		}

		output, err := h.usecase.Execute(c.Request.Context(), req.ToInput())
		if err != nil {
			if errors.Is(err, paymentUsecases.ErrInvalidPaymentData) {
				response.Errf(c, http.StatusBadRequest, "err-invalid-payment-data", err.Error())
				return
			}
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		resp := paymentContracts.ProcessPaymentResponse{
			PaymentID: output.Payment.ID,
			OrderID:   output.Payment.OrderID,
			Status:    string(output.Payment.Status),
			Amount:    output.Payment.Amount,
			Message:   "Pago procesado y acreditado con éxito",
		}

		response.Okf(c, http.StatusOK, resp)
	}
}
