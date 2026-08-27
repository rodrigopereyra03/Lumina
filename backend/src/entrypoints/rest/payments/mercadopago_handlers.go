package payments

import (
	"net/http"

	contract "ecommerce-ganador/backend/src/core/contracts/payments"
	paymentUsecases "ecommerce-ganador/backend/src/core/usecases/payments"

	"github.com/gin-gonic/gin"
)

type MercadoPagoHandler struct {
	createPrefUc  paymentUsecases.CreateMPPreference
	webhookUc     paymentUsecases.HandleMPWebhook
}

func NewMercadoPagoHandler(
	createPrefUc paymentUsecases.CreateMPPreference,
	webhookUc paymentUsecases.HandleMPWebhook,
) MercadoPagoHandler {
	return MercadoPagoHandler{
		createPrefUc: createPrefUc,
		webhookUc:    webhookUc,
	}
}

func (h MercadoPagoHandler) HandleCreatePreference(c *gin.Context) {
	var req contract.CreateMPPreferenceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	items := make([]paymentUsecases.MPItemPayload, len(req.Items))
	for i, it := range req.Items {
		items[i] = paymentUsecases.MPItemPayload{
			Title:       it.Title,
			Quantity:    it.Quantity,
			UnitPrice:   it.UnitPrice,
			CurrencyID:  it.CurrencyID,
			Description: it.Description,
			PictureURL:  it.PictureURL,
		}
	}

	payer := paymentUsecases.MPPayerPayload{
		Name:    req.Payer.Name,
		Surname: req.Payer.Surname,
		Email:   req.Payer.Email,
	}

	out, err := h.createPrefUc.Execute(c.Request.Context(), paymentUsecases.CreateMPPreferenceInput{
		OrderID: req.OrderID,
		Items:   items,
		Payer:   payer,
		BackURL: req.BackURL,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"content": contract.CreateMPPreferenceResponse{
			PreferenceID:     out.PreferenceID,
			InitPoint:        out.InitPoint,
			SandboxInitPoint: out.SandboxInitPoint,
			PublicKey:        out.PublicKey,
		},
	})
}

func (h MercadoPagoHandler) HandleWebhook(c *gin.Context) {
	var input paymentUsecases.MPWebhookInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "ignored"})
		return
	}

	_ = h.webhookUc.Execute(c.Request.Context(), input)
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
