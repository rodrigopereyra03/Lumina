package mercadolibre

import (
	"context"
	"fmt"
	"strings"
	"time"

	"ecommerce-ganador/backend/src/core/entities/mercadolibre"
	meliProviders "ecommerce-ganador/backend/src/core/providers/mercadolibre"
	prodProviders "ecommerce-ganador/backend/src/core/providers/products"
)

type PublishProductInput struct {
	ProductID     string  `json:"product_id"`
	CustomPrice   *float64 `json:"custom_price,omitempty"`
	ListingTypeID string  `json:"listing_type_id,omitempty"` // 'gold_special' (clásica) / 'gold_pro' (premium)
}

type PublishProductOutput struct {
	MeliID    string  `json:"meli_id"`
	Permalink string  `json:"meli_permalink"`
	Status    string  `json:"status"`
	Price     float64 `json:"price"`
}

type PublishProduct interface {
	Execute(ctx context.Context, input PublishProductInput) (PublishProductOutput, error)
}

type PublishProductImpl struct {
	meliRepo    meliProviders.MeliRepository
	meliClient  meliProviders.MeliClient
	productRepo prodProviders.ProductsPersistor
}

func NewPublishProductImpl(
	meliRepo meliProviders.MeliRepository,
	meliClient meliProviders.MeliClient,
	productRepo prodProviders.ProductsPersistor,
) PublishProductImpl {
	return PublishProductImpl{
		meliRepo:    meliRepo,
		meliClient:  meliClient,
		productRepo: productRepo,
	}
}

func (uc PublishProductImpl) Execute(ctx context.Context, input PublishProductInput) (PublishProductOutput, error) {
	acc, err := uc.meliRepo.GetAccount(ctx)
	if err != nil || acc == nil || acc.AccessToken == "" {
		return PublishProductOutput{}, fmt.Errorf("no hay cuenta de Mercado Libre vinculada. Conéctala desde el panel")
	}

	prod, err := uc.productRepo.GetByID(ctx, input.ProductID)
	if err != nil {
		return PublishProductOutput{}, fmt.Errorf("producto no encontrado: %w", err)
	}

	// Calculate price (apply custom price or configured markup)
	price := prod.Price
	if input.CustomPrice != nil && *input.CustomPrice > 0 {
		price = *input.CustomPrice
	} else if acc.PriceMarkupPercent > 0 {
		price = prod.Price * (1.0 + (acc.PriceMarkupPercent / 100.0))
	}

	// Prepare pictures
	pictures := prod.Images
	if len(pictures) == 0 && prod.Image != "" {
		pictures = []string{prod.Image}
	}

	listingType := input.ListingTypeID
	if listingType == "" {
		listingType = "gold_special" // Clásica
	}

	brand := prod.CategoryName
	if brand == "" {
		brand = "Fórmula 1370"
	}

	volume := "100 mL"
	combinedText := strings.ToLower(prod.Title + " " + prod.Subtitle + " " + prod.Description)
	switch {
	case strings.Contains(combinedText, "50ml") || strings.Contains(combinedText, "50 ml"):
		volume = "50 mL"
	case strings.Contains(combinedText, "30ml") || strings.Contains(combinedText, "30 ml"):
		volume = "30 mL"
	case strings.Contains(combinedText, "60ml") || strings.Contains(combinedText, "60 ml"):
		volume = "60 mL"
	case strings.Contains(combinedText, "75ml") || strings.Contains(combinedText, "75 ml"):
		volume = "75 mL"
	case strings.Contains(combinedText, "125ml") || strings.Contains(combinedText, "125 ml"):
		volume = "125 mL"
	case strings.Contains(combinedText, "200ml") || strings.Contains(combinedText, "200 ml"):
		volume = "200 mL"
	}

	attributes := []map[string]interface{}{
		{"id": "BRAND", "value_name": brand},
		{"id": "LINE", "value_name": prod.Title},
		{"id": "PERFUME_NAME", "value_name": prod.Title},
		{"id": "UNIT_VOLUME", "value_name": volume},
		{"id": "ITEM_CONDITION", "value_id": "2230284", "value_name": "Nuevo"},
		{"id": "GENDER", "value_id": "110461", "value_name": "Sin género"},
		{"id": "EMPTY_GTIN_REASON", "value_id": "17055160", "value_name": "El producto no tiene código registrado"},
	}

	publishData := meliProviders.PublishItemData{
		Title:         prod.Title,
		Price:         price,
		CurrencyID:    "ARS",
		Stock:         prod.Stock,
		ListingTypeID: listingType,
		Condition:     "new",
		Description:   fmt.Sprintf("%s\n\n%s", prod.Subtitle, prod.Description),
		Pictures:      pictures,
		Attributes:    attributes,
	}

	// Token refresh check
	token := acc.AccessToken
	if time.Now().After(acc.TokenExpiresAt.Add(-10 * time.Minute)) && acc.RefreshToken != "" {
		refreshed, err := uc.meliClient.RefreshToken(ctx, acc.AppID, acc.ClientSecret, acc.RefreshToken)
		if err == nil && refreshed != nil {
			token = refreshed.AccessToken
			newExp := time.Now().Add(time.Duration(refreshed.ExpiresIn) * time.Second)
			_ = uc.meliRepo.UpdateTokens(ctx, refreshed.AccessToken, refreshed.RefreshToken, newExp)
		}
	}

	res, err := uc.meliClient.PublishItem(ctx, token, publishData)
	if err != nil {
		_ = uc.meliRepo.CreateSyncLog(ctx, mercadolibre.MeliSyncLog{
			EventType:  "publish_error",
			ProductID:  &prod.ID,
			Status:     "failed",
			Message:    fmt.Sprintf("Fallo al publicar en Mercado Libre: %v", err),
			CreatedAt:  time.Now(),
		})
		return PublishProductOutput{}, fmt.Errorf("error publicando en Mercado Libre: %w", err)
	}

	// Save meli info in DB
	_ = uc.meliRepo.UpdateProductMeliInfo(ctx, prod.ID, res.MeliID, res.Permalink, res.Status, &price)

	_ = uc.meliRepo.CreateSyncLog(ctx, mercadolibre.MeliSyncLog{
		EventType:  "publish_success",
		ProductID:  &prod.ID,
		MeliItemID: &res.MeliID,
		Status:     "success",
		Message:    fmt.Sprintf("Producto '%s' publicado en Mercado Libre con éxito (ID: %s)", prod.Title, res.MeliID),
		CreatedAt:  time.Now(),
	})

	return PublishProductOutput{
		MeliID:    res.MeliID,
		Permalink: res.Permalink,
		Status:    res.Status,
		Price:     price,
	}, nil
}
