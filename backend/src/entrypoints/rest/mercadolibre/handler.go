package mercadolibre

import (
	"net/http"

	meliUsecases "ecommerce-ganador/backend/src/core/usecases/mercadolibre"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	getAuthURLUc      meliUsecases.GetAuthURL
	handleCallbackUc  meliUsecases.HandleOAuthCallback
	publishProductUc  meliUsecases.PublishProduct
	syncStockUc       meliUsecases.SyncStock
	handleWebhookUc   meliUsecases.HandleWebhook
	getStatusUc       meliUsecases.GetStatus
	updateConfigUc    meliUsecases.UpdateConfig
}

func NewHandler(
	getAuthURLUc meliUsecases.GetAuthURL,
	handleCallbackUc meliUsecases.HandleOAuthCallback,
	publishProductUc meliUsecases.PublishProduct,
	syncStockUc meliUsecases.SyncStock,
	handleWebhookUc meliUsecases.HandleWebhook,
	getStatusUc meliUsecases.GetStatus,
	updateConfigUc meliUsecases.UpdateConfig,
) Handler {
	return Handler{
		getAuthURLUc:     getAuthURLUc,
		handleCallbackUc: handleCallbackUc,
		publishProductUc: publishProductUc,
		syncStockUc:      syncStockUc,
		handleWebhookUc:  handleWebhookUc,
		getStatusUc:      getStatusUc,
		updateConfigUc:   updateConfigUc,
	}
}

func (h Handler) HandleGetAuthURL(c *gin.Context) {
	redirectURL := c.Query("redirect_url")
	res, err := h.getAuthURLUc.Execute(c.Request.Context(), meliUsecases.GetAuthURLInput{
		RedirectURL: redirectURL,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"content": res})
}

func (h Handler) HandleCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "código de autorización ausente"})
		return
	}

	redirectURI := c.Query("redirect_uri")
	res, err := h.handleCallbackUc.Execute(c.Request.Context(), meliUsecases.HandleOAuthCallbackInput{
		Code:        code,
		RedirectURI: redirectURI,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// If accessed from browser, redirect back to admin or show clean confirmation
	frontendRedirect := c.Query("return_to")
	if frontendRedirect != "" {
		c.Redirect(http.StatusFound, frontendRedirect+"?meli_connected=true")
		return
	}

	c.JSON(http.StatusOK, gin.H{"content": res})
}

func (h Handler) HandleGetStatus(c *gin.Context) {
	status, err := h.getStatusUc.Execute(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"content": status})
}

func (h Handler) HandleUpdateConfig(c *gin.Context) {
	var input meliUsecases.UpdateConfigInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "payload inválido"})
		return
	}

	res, err := h.updateConfigUc.Execute(c.Request.Context(), input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"content": res})
}

func (h Handler) HandlePublishProduct(c *gin.Context) {
	productID := c.Param("id")
	var req struct {
		CustomPrice   *float64 `json:"custom_price"`
		ListingTypeID string   `json:"listing_type_id"`
	}
	_ = c.ShouldBindJSON(&req)

	res, err := h.publishProductUc.Execute(c.Request.Context(), meliUsecases.PublishProductInput{
		ProductID:     productID,
		CustomPrice:   req.CustomPrice,
		ListingTypeID: req.ListingTypeID,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"content": res})
}

func (h Handler) HandleSyncStock(c *gin.Context) {
	productID := c.Param("id")
	res, err := h.syncStockUc.Execute(c.Request.Context(), meliUsecases.SyncStockInput{
		ProductID: productID,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"content": res})
}

func (h Handler) HandleWebhook(c *gin.Context) {
	var notification meliUsecases.HandleWebhookInput
	if err := c.ShouldBindJSON(&notification); err != nil {
		// Respond 200 OK so Mercado Libre does not repeatedly retry corrupt bodies
		c.JSON(http.StatusOK, gin.H{"status": "ignored", "error": err.Error()})
		return
	}

	res, err := h.handleWebhookUc.Execute(c.Request.Context(), notification)
	if err != nil {
		// Respond 200 OK to Meli to prevent spam, log the error internally
		c.JSON(http.StatusOK, gin.H{"status": "processed_with_error", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "content": res})
}
