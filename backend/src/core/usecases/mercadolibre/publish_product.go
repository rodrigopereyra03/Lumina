package mercadolibre

import (
	"context"
	"fmt"
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

	publishData := meliProviders.PublishItemData{
		Title:         prod.Title,
		Price:         price,
		CurrencyID:    "ARS",
		Stock:         prod.Stock,
		ListingTypeID: listingType,
		Condition:     "new",
		Description:   fmt.Sprintf("%s\n\n%s", prod.Subtitle, prod.Description),
		Pictures:      pictures,
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
