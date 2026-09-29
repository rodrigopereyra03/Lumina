package mercadolibre

import (
	"context"
	"time"

	"ecommerce-ganador/backend/src/core/entities/mercadolibre"
)

type TokenResult struct {
	AccessToken  string
	RefreshToken string
	ExpiresIn    int
	UserID       int64
	Scope        string
}

type PublishItemData struct {
	Title         string
	CategoryID    string
	Price         float64
	CurrencyID    string
	Stock         int
	BuyingMode    string // 'buy_it_now'
	ListingTypeID string // 'gold_special' (clásica) or 'gold_pro' (premium)
	Condition     string // 'new'
	Description   string
	Pictures      []string
	Attributes    []map[string]interface{}
}

type PublishItemResult struct {
	MeliID    string
	Permalink string
	Status    string
}

type MeliOrderItemData struct {
	Item struct {
		ID    string `json:"id"`
		Title string `json:"title"`
	} `json:"item"`
	Quantity  int     `json:"quantity"`
	UnitPrice float64 `json:"unit_price"`
}

type MeliOrderData struct {
	ID        int64               `json:"id"`
	DateCreated time.Time         `json:"date_created"`
	Status    string              `json:"status"`
	TotalAmount float64           `json:"total_amount"`
	Buyer     struct {
		ID        int64  `json:"id"`
		Nickname  string `json:"nickname"`
		Email     string `json:"email"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Phone     struct {
			AreaCode string `json:"area_code"`
			Number   string `json:"number"`
		} `json:"phone"`
	} `json:"buyer"`
	OrderItems []MeliOrderItemData `json:"order_items"`
	Shipping   struct {
		ID       int64  `json:"id"`
		Status   string `json:"status"`
		ReceiverAddress struct {
			AddressLine string `json:"address_line"`
			StreetName  string `json:"street_name"`
			StreetNumber string `json:"street_number"`
			City        struct {
				Name string `json:"name"`
			} `json:"city"`
			State       struct {
				Name string `json:"name"`
			} `json:"state"`
			ZipCode     string `json:"zip_code"`
		} `json:"receiver_address"`
	} `json:"shipping"`
}

type MeliRepository interface {
	GetAccount(ctx context.Context) (*mercadolibre.MeliAccount, error)
	SaveAccount(ctx context.Context, account mercadolibre.MeliAccount) (*mercadolibre.MeliAccount, error)
	UpdateTokens(ctx context.Context, accessToken, refreshToken string, expiresAt time.Time) error
	CreateSyncLog(ctx context.Context, log mercadolibre.MeliSyncLog) error
	ListSyncLogs(ctx context.Context, limit int) ([]mercadolibre.MeliSyncLog, error)
	UpdateProductMeliInfo(ctx context.Context, productID, meliID, permalink, status string, meliPrice *float64) error
	GetProductIDByMeliID(ctx context.Context, meliID string) (string, error)
}

type MeliClient interface {
	GetAuthURL(appID, redirectURI, state string) string
	ExchangeCode(ctx context.Context, appID, clientSecret, code, redirectURI string) (*TokenResult, error)
	RefreshToken(ctx context.Context, appID, clientSecret, refreshToken string) (*TokenResult, error)
	PublishItem(ctx context.Context, accessToken string, item PublishItemData) (*PublishItemResult, error)
	UpdateStock(ctx context.Context, accessToken string, meliItemID string, quantity int) error
	UpdatePrice(ctx context.Context, accessToken string, meliItemID string, price float64) error
	GetOrderDetails(ctx context.Context, accessToken string, meliOrderID string) (*MeliOrderData, error)
}
