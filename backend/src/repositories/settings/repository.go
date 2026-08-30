package settings

import (
	"context"
	"os"
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
	mpPub := os.Getenv("MP_PUBLIC_KEY")
	if mpPub == "" {
		mpPub = "APP_USR-09e00df2-06bc-4d0e-b5de-13aaffd650d2"
	}

	mpToken := os.Getenv("MP_ACCESS_TOKEN")
	if mpToken == "" {
		mpToken = os.Getenv("MERCADOPAGO_ACCESS_TOKEN")
	}
	if mpToken == "" {
		mpToken = "APP_USR-1887517460534002-082719-20e9045bc921801c6df09603e8ed153f-3644485241"
	}

	repo := &SettingsRepository{
		db: db,
		memory: settings.PaymentSettings{
			MPActive:         true,
			MPPublicKey:      mpPub,
			MPAccessToken:    mpToken,
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
