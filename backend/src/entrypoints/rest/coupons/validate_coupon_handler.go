package coupons

import (
	"errors"
	"net/http"

	"ecommerce-ganador/backend/packages/response"
	couponContracts "ecommerce-ganador/backend/src/core/contracts/coupons"
	couponUsecases "ecommerce-ganador/backend/src/core/usecases/coupons"

	"github.com/gin-gonic/gin"
)

type ValidateCouponHandler struct {
	usecase couponUsecases.ValidateCoupon
}

func NewValidateCouponHandler(usecase couponUsecases.ValidateCoupon) ValidateCouponHandler {
	return ValidateCouponHandler{usecase: usecase}
}

func (h ValidateCouponHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req couponContracts.ValidateCouponRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			response.Errf(c, http.StatusBadRequest, "err-invalid-payload", err.Error())
			return
		}

		output, err := h.usecase.Execute(c.Request.Context(), req.ToInput())
		if err != nil {
			if errors.Is(err, couponUsecases.ErrCouponNotFound) {
				response.Errf(c, http.StatusNotFound, "err-coupon-not-found", "Cupón no encontrado o inválido")
				return
			}
			if errors.Is(err, couponUsecases.ErrCouponExpired) {
				response.Errf(c, http.StatusBadRequest, "err-coupon-expired", "Cupón expirado o límite de usos alcanzado")
				return
			}
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		resp := couponContracts.ValidateCouponResponse{
			Code:           output.Coupon.Code,
			DiscountType:   string(output.Coupon.DiscountType),
			DiscountValue:  output.Coupon.DiscountValue,
			DiscountAmount: output.DiscountAmount,
			FinalAmount:    output.FinalAmount,
			Message:        "¡Cupón aplicado con éxito!",
		}

		response.Okf(c, http.StatusOK, resp)
	}
}
