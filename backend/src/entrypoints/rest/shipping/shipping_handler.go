package shipping

import (
	"net/http"

	"ecommerce-ganador/backend/packages/response"
	"ecommerce-ganador/backend/src/infrastructure/shipping"

	"github.com/gin-gonic/gin"
)

type ShippingHandler struct {
	service *shipping.EnvioPackService
}

func NewShippingHandler(service *shipping.EnvioPackService) ShippingHandler {
	return ShippingHandler{service: service}
}

// POST /api/v1/shipping/quote
func (h ShippingHandler) HandleQuote() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req shipping.ShippingQuoteRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			response.Errf(c, http.StatusBadRequest, "err-invalid-request", "El código postal es requerido")
			return
		}

		if req.PostalCodeDest == "" {
			response.Errf(c, http.StatusBadRequest, "err-missing-postal-code", "postal_code_dest es obligatorio")
			return
		}

		quote, err := h.service.QuoteRates(c.Request.Context(), req)
		if err != nil {
			response.Errf(c, http.StatusInternalServerError, "err-quote-failed", err.Error())
			return
		}

		response.Okf(c, http.StatusOK, quote)
	}
}
