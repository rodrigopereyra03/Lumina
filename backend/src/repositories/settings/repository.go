package settings

import (
	"context"
	"sync"
	"time"

	"ecommerce-ganador/backend/src/core/entities/settings"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SettingsRepository struct {
	db     *pgxpool.Pool
	mu     sync.RWMutex
	memory settings.PaymentSettings
}

func NewSettingsRepository(db *pgxpool.Pool) *SettingsRepository {
	repo := &SettingsRepository{
		db: db,
		memory: settings.PaymentSettings{
			MPActive:         true,
			MPPublicKey:      "APP_USR-49281039-4821-4820-9102-849201849201",
			MPAccessToken:    "APP_USR-948201948201948201948201-948201",
			MPSandbox:        false,
			MPInstallments:   6,
			TransferActive:   true,
			TransferCBU:      "0000003100010000849201",
			TransferAlias:    "LUMINA.PAGOS.OFICIAL",
			TransferBank:     "Banco Santander",
			TransferHolder:   "Lumina Retail S.A. (CUIT 30-71234567-9)",
			TransferDiscount: 10.0,
			CardActive:       true,
			UpdatedAt:        time.Now(),
		},
	}
	return repo
}

func (r *SettingsRepository) Get(ctx context.Context) (settings.PaymentSettings, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.memory, nil
}

func (r *SettingsRepository) Update(ctx context.Context, ps settings.PaymentSettings) (settings.PaymentSettings, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.memory = ps
	return r.memory, nil
}
