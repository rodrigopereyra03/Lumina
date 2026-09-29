package mercadolibre

import (
	"context"
	"time"

	"ecommerce-ganador/backend/src/core/entities/mercadolibre"
	meliProviders "ecommerce-ganador/backend/src/core/providers/mercadolibre"
)

type AccountStatusOutput struct {
	IsConnected            bool                       `json:"is_connected"`
	IsActive               bool                       `json:"is_active"`
	MeliUserID             string                     `json:"meli_user_id"`
	Nickname               string                     `json:"nickname"`
	AppID                  string                     `json:"app_id"`
	RedirectURL            string                     `json:"redirect_url"`
	SyncStockAutomatically bool                       `json:"sync_stock_automatically"`
	PriceMarkupPercent     float64                    `json:"price_markup_percent"`
	TokenExpiresAt         *time.Time                 `json:"token_expires_at,omitempty"`
	RecentLogs             []mercadolibre.MeliSyncLog `json:"recent_logs"`
}

type GetStatus interface {
	Execute(ctx context.Context) (AccountStatusOutput, error)
}

type GetStatusImpl struct {
	repo meliProviders.MeliRepository
}

func NewGetStatusImpl(repo meliProviders.MeliRepository) GetStatusImpl {
	return GetStatusImpl{repo: repo}
}

func (uc GetStatusImpl) Execute(ctx context.Context) (AccountStatusOutput, error) {
	acc, err := uc.repo.GetAccount(ctx)
	if err != nil {
		return AccountStatusOutput{}, err
	}

	logs, _ := uc.repo.ListSyncLogs(ctx, 20)
	if logs == nil {
		logs = make([]mercadolibre.MeliSyncLog, 0)
	}

	if acc == nil {
		return AccountStatusOutput{
			IsConnected:            false,
			IsActive:               false,
			SyncStockAutomatically: true,
			PriceMarkupPercent:     0,
			RecentLogs:             logs,
		}, nil
	}

	isConnected := acc.AccessToken != ""

	return AccountStatusOutput{
		IsConnected:            isConnected,
		IsActive:               acc.IsActive,
		MeliUserID:             acc.MeliUserID,
		Nickname:               acc.Nickname,
		AppID:                  acc.AppID,
		RedirectURL:            acc.RedirectURL,
		SyncStockAutomatically: acc.SyncStockAutomatically,
		PriceMarkupPercent:     acc.PriceMarkupPercent,
		TokenExpiresAt:         &acc.TokenExpiresAt,
		RecentLogs:             logs,
	}, nil
}
