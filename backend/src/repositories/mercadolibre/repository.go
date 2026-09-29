package mercadolibre

import (
	"context"
	"fmt"
	"sync"
	"time"

	"ecommerce-ganador/backend/src/core/entities/mercadolibre"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db          *pgxpool.Pool
	mu          sync.RWMutex
	account     *mercadolibre.MeliAccount
	logs        []mercadolibre.MeliSyncLog
	meliProduct map[string]string // meliID -> productID
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{
		db:          db,
		logs:        make([]mercadolibre.MeliSyncLog, 0),
		meliProduct: make(map[string]string),
	}
}

func (r *Repository) GetAccount(ctx context.Context) (*mercadolibre.MeliAccount, error) {
	if r.db == nil {
		r.mu.RLock()
		defer r.mu.RUnlock()
		if r.account == nil {
			return nil, nil
		}
		cpy := *r.account
		return &cpy, nil
	}

	query := `
		SELECT id, COALESCE(meli_user_id, ''), COALESCE(nickname, ''), COALESCE(access_token, ''),
		       COALESCE(refresh_token, ''), COALESCE(token_expires_at, CURRENT_TIMESTAMP),
		       COALESCE(app_id, ''), COALESCE(client_secret, ''), COALESCE(redirect_url, ''),
		       is_active, sync_stock_automatically, price_markup_percent, created_at, updated_at
		FROM mercadolibre_accounts
		ORDER BY created_at DESC
		LIMIT 1
	`
	var acc mercadolibre.MeliAccount
	err := r.db.QueryRow(ctx, query).Scan(
		&acc.ID, &acc.MeliUserID, &acc.Nickname, &acc.AccessToken,
		&acc.RefreshToken, &acc.TokenExpiresAt,
		&acc.AppID, &acc.ClientSecret, &acc.RedirectURL,
		&acc.IsActive, &acc.SyncStockAutomatically, &acc.PriceMarkupPercent,
		&acc.CreatedAt, &acc.UpdatedAt,
	)
	if err != nil {
		r.mu.RLock()
		defer r.mu.RUnlock()
		return r.account, nil
	}

	return &acc, nil
}

func (r *Repository) SaveAccount(ctx context.Context, account mercadolibre.MeliAccount) (*mercadolibre.MeliAccount, error) {
	if account.ID == "" {
		account.ID = uuid.NewString()
	}
	account.UpdatedAt = time.Now()
	if account.CreatedAt.IsZero() {
		account.CreatedAt = time.Now()
	}

	r.mu.Lock()
	r.account = &account
	r.mu.Unlock()

	if r.db == nil {
		return &account, nil
	}

	query := `
		INSERT INTO mercadolibre_accounts (
			id, meli_user_id, nickname, access_token, refresh_token, token_expires_at,
			app_id, client_secret, redirect_url, is_active, sync_stock_automatically,
			price_markup_percent, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
		ON CONFLICT (id) DO UPDATE SET
			meli_user_id = EXCLUDED.meli_user_id,
			nickname = EXCLUDED.nickname,
			access_token = EXCLUDED.access_token,
			refresh_token = EXCLUDED.refresh_token,
			token_expires_at = EXCLUDED.token_expires_at,
			app_id = EXCLUDED.app_id,
			client_secret = EXCLUDED.client_secret,
			redirect_url = EXCLUDED.redirect_url,
			is_active = EXCLUDED.is_active,
			sync_stock_automatically = EXCLUDED.sync_stock_automatically,
			price_markup_percent = EXCLUDED.price_markup_percent,
			updated_at = EXCLUDED.updated_at
		RETURNING id
	`
	_, err := r.db.Exec(ctx, query,
		account.ID, account.MeliUserID, account.Nickname, account.AccessToken,
		account.RefreshToken, account.TokenExpiresAt, account.AppID,
		account.ClientSecret, account.RedirectURL, account.IsActive,
		account.SyncStockAutomatically, account.PriceMarkupPercent,
		account.CreatedAt, account.UpdatedAt,
	)
	if err != nil {
		return &account, nil
	}

	return &account, nil
}

func (r *Repository) UpdateTokens(ctx context.Context, accessToken, refreshToken string, expiresAt time.Time) error {
	r.mu.Lock()
	if r.account != nil {
		r.account.AccessToken = accessToken
		r.account.RefreshToken = refreshToken
		r.account.TokenExpiresAt = expiresAt
		r.account.UpdatedAt = time.Now()
	}
	r.mu.Unlock()

	if r.db != nil {
		query := `
			UPDATE mercadolibre_accounts
			SET access_token = $1, refresh_token = $2, token_expires_at = $3, updated_at = CURRENT_TIMESTAMP
			WHERE is_active = true
		`
		_, _ = r.db.Exec(ctx, query, accessToken, refreshToken, expiresAt)
	}
	return nil
}

func (r *Repository) CreateSyncLog(ctx context.Context, log mercadolibre.MeliSyncLog) error {
	if log.ID == "" {
		log.ID = uuid.NewString()
	}
	if log.CreatedAt.IsZero() {
		log.CreatedAt = time.Now()
	}

	r.mu.Lock()
	r.logs = append([]mercadolibre.MeliSyncLog{log}, r.logs...)
	if len(r.logs) > 100 {
		r.logs = r.logs[:100]
	}
	r.mu.Unlock()

	if r.db != nil {
		query := `
			INSERT INTO mercadolibre_sync_logs (id, event_type, product_id, meli_item_id, payload, status, message, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		`
		_, _ = r.db.Exec(ctx, query,
			log.ID, log.EventType, log.ProductID, log.MeliItemID,
			log.Payload, log.Status, log.Message, log.CreatedAt,
		)
	}
	return nil
}

func (r *Repository) ListSyncLogs(ctx context.Context, limit int) ([]mercadolibre.MeliSyncLog, error) {
	if limit <= 0 {
		limit = 25
	}

	if r.db == nil {
		r.mu.RLock()
		defer r.mu.RUnlock()
		if len(r.logs) > limit {
			return r.logs[:limit], nil
		}
		return r.logs, nil
	}

	query := `
		SELECT id, event_type, COALESCE(product_id::text, ''), COALESCE(meli_item_id, ''),
		       status, COALESCE(message, ''), created_at
		FROM mercadolibre_sync_logs
		ORDER BY created_at DESC
		LIMIT $1
	`
	rows, err := r.db.Query(ctx, query, limit)
	if err != nil {
		r.mu.RLock()
		defer r.mu.RUnlock()
		return r.logs, nil
	}
	defer rows.Close()

	var logs []mercadolibre.MeliSyncLog
	for rows.Next() {
		var l mercadolibre.MeliSyncLog
		var pid, mid string
		if err := rows.Scan(&l.ID, &l.EventType, &pid, &mid, &l.Status, &l.Message, &l.CreatedAt); err == nil {
			if pid != "" {
				l.ProductID = &pid
			}
			if mid != "" {
				l.MeliItemID = &mid
			}
			logs = append(logs, l)
		}
	}
	return logs, nil
}

func (r *Repository) UpdateProductMeliInfo(ctx context.Context, productID, meliID, permalink, status string, meliPrice *float64) error {
	r.mu.Lock()
	if meliID != "" {
		r.meliProduct[meliID] = productID
	}
	r.mu.Unlock()

	if r.db != nil {
		now := time.Now()
		query := `
			UPDATE products
			SET meli_id = $1, meli_permalink = $2, meli_status = $3, meli_price = $4, meli_last_sync = $5
			WHERE id = $6
		`
		_, err := r.db.Exec(ctx, query, meliID, permalink, status, meliPrice, now, productID)
		if err != nil {
			return fmt.Errorf("failed to update product meli info: %w", err)
		}
	}
	return nil
}

func (r *Repository) GetProductIDByMeliID(ctx context.Context, meliID string) (string, error) {
	r.mu.RLock()
	if pid, ok := r.meliProduct[meliID]; ok && pid != "" {
		r.mu.RUnlock()
		return pid, nil
	}
	r.mu.RUnlock()

	if r.db != nil {
		var productID string
		query := `SELECT id FROM products WHERE meli_id = $1 AND deleted_at IS NULL LIMIT 1`
		err := r.db.QueryRow(ctx, query, meliID).Scan(&productID)
		if err == nil && productID != "" {
			return productID, nil
		}
	}

	return "", fmt.Errorf("no product linked to meli_id %s", meliID)
}
