package settings

import (
	"context"

	"ecommerce-ganador/backend/src/core/entities/settings"
)

type PaymentSettingsPersistor interface {
	Get(ctx context.Context) (settings.PaymentSettings, error)
	Update(ctx context.Context, ps settings.PaymentSettings) (settings.PaymentSettings, error)
}
