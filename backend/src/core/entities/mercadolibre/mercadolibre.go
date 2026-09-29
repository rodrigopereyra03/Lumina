package mercadolibre

import "time"

type MeliAccount struct {
	ID                     string     `json:"id"`
	MeliUserID             string     `json:"meli_user_id"`
	Nickname               string     `json:"nickname"`
	AccessToken            string     `json:"access_token"`
	RefreshToken           string     `json:"refresh_token"`
	TokenExpiresAt         time.Time  `json:"token_expires_at"`
	AppID                  string     `json:"app_id"`
	ClientSecret           string     `json:"client_secret"`
	RedirectURL            string     `json:"redirect_url"`
	IsActive               bool       `json:"is_active"`
	SyncStockAutomatically bool       `json:"sync_stock_automatically"`
	PriceMarkupPercent     float64    `json:"price_markup_percent"`
	CreatedAt              time.Time  `json:"created_at"`
	UpdatedAt              time.Time  `json:"updated_at"`
}

func (a MeliAccount) IsTokenValid() bool {
	return a.AccessToken != "" && time.Now().Before(a.TokenExpiresAt)
}

type MeliSyncLog struct {
	ID         string                 `json:"id"`
	EventType  string                 `json:"event_type"` // 'order_webhook', 'stock_sync', 'publish', 'price_sync', 'error'
	ProductID  *string                `json:"product_id,omitempty"`
	MeliItemID *string                `json:"meli_item_id,omitempty"`
	Payload    map[string]interface{} `json:"payload,omitempty"`
	Status     string                 `json:"status"` // 'success', 'warning', 'failed'
	Message    string                 `json:"message"`
	CreatedAt  time.Time              `json:"created_at"`
}

type MeliWebhookNotification struct {
	Resource     string    `json:"resource"`
	UserID       int64     `json:"user_id"`
	Topic        string    `json:"topic"` // 'orders_v2', 'items', 'created_orders'
	ApplicationID int64    `json:"application_id"`
	Attempts     int       `json:"attempts"`
	Sent         time.Time `json:"sent"`
	Received     time.Time `json:"received"`
}
