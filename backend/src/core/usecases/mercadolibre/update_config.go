package mercadolibre

import (
	"context"
	"time"

	"ecommerce-ganador/backend/src/core/entities/mercadolibre"
	meliProviders "ecommerce-ganador/backend/src/core/providers/mercadolibre"
)

type UpdateConfigInput struct {
	AppID                  string  `json:"app_id"`
	ClientSecret           string  `json:"client_secret"`
	RedirectURL            string  `json:"redirect_url"`
	IsActive               bool    `json:"is_active"`
	SyncStockAutomatically bool    `json:"sync_stock_automatically"`
	PriceMarkupPercent     float64 `json:"price_markup_percent"`
}

type UpdateConfigOutput struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type UpdateConfig interface {
	Execute(ctx context.Context, input UpdateConfigInput) (UpdateConfigOutput, error)
}

type UpdateConfigImpl struct {
	repo meliProviders.MeliRepository
}

func NewUpdateConfigImpl(repo meliProviders.MeliRepository) UpdateConfigImpl {
	return UpdateConfigImpl{repo: repo}
}

func (uc UpdateConfigImpl) Execute(ctx context.Context, input UpdateConfigInput) (UpdateConfigOutput, error) {
	acc, _ := uc.repo.GetAccount(ctx)
	if acc == nil {
		acc = &mercadolibre.MeliAccount{
			CreatedAt: time.Now(),
		}
	}

	if input.AppID != "" {
		acc.AppID = input.AppID
	}
	if input.ClientSecret != "" {
		acc.ClientSecret = input.ClientSecret
	}
	if input.RedirectURL != "" {
		acc.RedirectURL = input.RedirectURL
	}
	acc.IsActive = input.IsActive
	acc.SyncStockAutomatically = input.SyncStockAutomatically
	acc.PriceMarkupPercent = input.PriceMarkupPercent
	acc.UpdatedAt = time.Now()

	_, err := uc.repo.SaveAccount(ctx, *acc)
	if err != nil {
		return UpdateConfigOutput{}, err
	}

	return UpdateConfigOutput{
		Success: true,
		Message: "Configuración de Mercado Libre guardada correctamente",
	}, nil
}
