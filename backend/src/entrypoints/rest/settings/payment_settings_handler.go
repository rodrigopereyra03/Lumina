package settings

import (
	"net/http"

	"ecommerce-ganador/backend/packages/response"
	settingsContracts "ecommerce-ganador/backend/src/core/contracts/settings"
	settingsUsecases "ecommerce-ganador/backend/src/core/usecases/settings"

	"github.com/gin-gonic/gin"
)

type PaymentSettingsHandler struct {
	getUc    settingsUsecases.GetPaymentSettings
	updateUc settingsUsecases.UpdatePaymentSettings
}

func NewPaymentSettingsHandler(
	getUc settingsUsecases.GetPaymentSettings,
	updateUc settingsUsecases.UpdatePaymentSettings,
) PaymentSettingsHandler {
	return PaymentSettingsHandler{
		getUc:    getUc,
		updateUc: updateUc,
	}
}

func (h PaymentSettingsHandler) HandleGet() gin.HandlerFunc {
	return func(c *gin.Context) {
		output, err := h.getUc.Execute(c.Request.Context())
		if err != nil {
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		s := output.Settings
		resp := settingsContracts.PaymentSettingsDTO{
			MPActive:         s.MPActive,
			MPPublicKey:      s.MPPublicKey,
			MPAccessToken:    s.MPAccessToken,
			MPSandbox:        s.MPSandbox,
			MPInstallments:   s.MPInstallments,
			TransferActive:   s.TransferActive,
			TransferCBU:      s.TransferCBU,
			TransferAlias:    s.TransferAlias,
			TransferBank:     s.TransferBank,
			TransferHolder:   s.TransferHolder,
			TransferDiscount: s.TransferDiscount,
			CardActive:       s.CardActive,
		}

		response.Okf(c, http.StatusOK, resp)
	}
}

func (h PaymentSettingsHandler) HandleUpdate() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req settingsContracts.PaymentSettingsDTO
		if err := c.ShouldBindJSON(&req); err != nil {
			response.Errf(c, http.StatusBadRequest, "err-invalid-payload", err.Error())
			return
		}

		output, err := h.updateUc.Execute(c.Request.Context(), settingsUsecases.UpdatePaymentSettingsInput{
			MPActive:         req.MPActive,
			MPPublicKey:      req.MPPublicKey,
			MPAccessToken:    req.MPAccessToken,
			MPSandbox:        req.MPSandbox,
			MPInstallments:   req.MPInstallments,
			TransferActive:   req.TransferActive,
			TransferCBU:      req.TransferCBU,
			TransferAlias:    req.TransferAlias,
			TransferBank:     req.TransferBank,
			TransferHolder:   req.TransferHolder,
			TransferDiscount: req.TransferDiscount,
			CardActive:       req.CardActive,
		})
		if err != nil {
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		s := output.Settings
		resp := settingsContracts.PaymentSettingsDTO{
			MPActive:         s.MPActive,
			MPPublicKey:      s.MPPublicKey,
			MPAccessToken:    s.MPAccessToken,
			MPSandbox:        s.MPSandbox,
			MPInstallments:   s.MPInstallments,
			TransferActive:   s.TransferActive,
			TransferCBU:      s.TransferCBU,
			TransferAlias:    s.TransferAlias,
			TransferBank:     s.TransferBank,
			TransferHolder:   s.TransferHolder,
			TransferDiscount: s.TransferDiscount,
			CardActive:       s.CardActive,
		}

		response.Okf(c, http.StatusOK, resp)
	}
}
