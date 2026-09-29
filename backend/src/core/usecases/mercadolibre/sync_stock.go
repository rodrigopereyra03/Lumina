package mercadolibre

import (
	"context"
	"fmt"
	"time"

	"ecommerce-ganador/backend/src/core/entities/mercadolibre"
	meliProviders "ecommerce-ganador/backend/src/core/providers/mercadolibre"
	prodProviders "ecommerce-ganador/backend/src/core/providers/products"
)

type SyncStockInput struct {
	ProductID string `json:"product_id"`
}

type SyncStockOutput struct {
	ProductID  string `json:"product_id"`
	MeliItemID string `json:"meli_item_id"`
	Stock      int    `json:"stock"`
	Success    bool   `json:"success"`
	Message    string `json:"message"`
}

type SyncStock interface {
	Execute(ctx context.Context, input SyncStockInput) (SyncStockOutput, error)
}

type SyncStockImpl struct {
	meliRepo    meliProviders.MeliRepository
	meliClient  meliProviders.MeliClient
	productRepo prodProviders.ProductsPersistor
}

func NewSyncStockImpl(
	meliRepo meliProviders.MeliRepository,
	meliClient meliProviders.MeliClient,
	productRepo prodProviders.ProductsPersistor,
) SyncStockImpl {
	return SyncStockImpl{
		meliRepo:    meliRepo,
		meliClient:  meliClient,
		productRepo: productRepo,
	}
}

func (uc SyncStockImpl) Execute(ctx context.Context, input SyncStockInput) (SyncStockOutput, error) {
	acc, err := uc.meliRepo.GetAccount(ctx)
	if err != nil || acc == nil || acc.AccessToken == "" {
		return SyncStockOutput{}, fmt.Errorf("no hay cuenta de Mercado Libre conectada")
	}

	prod, err := uc.productRepo.GetByID(ctx, input.ProductID)
	if err != nil {
		return SyncStockOutput{}, fmt.Errorf("producto no encontrado: %w", err)
	}

	if prod.MeliID == "" {
		return SyncStockOutput{
			ProductID: prod.ID,
			Success:   false,
			Message:   "El producto no está publicado en Mercado Libre aún",
		}, nil
	}

	// Check token expiration
	token := acc.AccessToken
	if time.Now().After(acc.TokenExpiresAt.Add(-10 * time.Minute)) && acc.RefreshToken != "" {
		refreshed, err := uc.meliClient.RefreshToken(ctx, acc.AppID, acc.ClientSecret, acc.RefreshToken)
		if err == nil && refreshed != nil {
			token = refreshed.AccessToken
			newExp := time.Now().Add(time.Duration(refreshed.ExpiresIn) * time.Second)
			_ = uc.meliRepo.UpdateTokens(ctx, refreshed.AccessToken, refreshed.RefreshToken, newExp)
		}
	}

	err = uc.meliClient.UpdateStock(ctx, token, prod.MeliID, prod.Stock)
	if err != nil {
		_ = uc.meliRepo.CreateSyncLog(ctx, mercadolibre.MeliSyncLog{
			EventType:  "stock_sync_error",
			ProductID:  &prod.ID,
			MeliItemID: &prod.MeliID,
			Status:     "failed",
			Message:    fmt.Sprintf("Error sincronizando stock para %s: %v", prod.Title, err),
			CreatedAt:  time.Now(),
		})
		return SyncStockOutput{
			ProductID:  prod.ID,
			MeliItemID: prod.MeliID,
			Stock:      prod.Stock,
			Success:    false,
			Message:    err.Error(),
		}, err
	}

	status := "active"
	if prod.Stock <= 0 {
		status = "paused"
	}
	_ = uc.meliRepo.UpdateProductMeliInfo(ctx, prod.ID, prod.MeliID, prod.MeliPermalink, status, prod.MeliPrice)

	_ = uc.meliRepo.CreateSyncLog(ctx, mercadolibre.MeliSyncLog{
		EventType:  "stock_sync_success",
		ProductID:  &prod.ID,
		MeliItemID: &prod.MeliID,
		Status:     "success",
		Message:    fmt.Sprintf("Stock actualizado en Mercado Libre: %d unidades disponibles", prod.Stock),
		CreatedAt:  time.Now(),
	})

	return SyncStockOutput{
		ProductID:  prod.ID,
		MeliItemID: prod.MeliID,
		Stock:      prod.Stock,
		Success:    true,
		Message:    fmt.Sprintf("Stock sincronizado exitosamente (%d unidades)", prod.Stock),
	}, nil
}
