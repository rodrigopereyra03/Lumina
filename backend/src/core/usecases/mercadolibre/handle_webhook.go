package mercadolibre

import (
	"context"
	"fmt"
	"log/slog"
	"strconv"
	"strings"
	"time"

	"ecommerce-ganador/backend/src/core/entities/mercadolibre"
	"ecommerce-ganador/backend/src/core/entities/orders"
	meliProviders "ecommerce-ganador/backend/src/core/providers/mercadolibre"
	orderProviders "ecommerce-ganador/backend/src/core/providers/orders"
	prodProviders "ecommerce-ganador/backend/src/core/providers/products"
)

type HandleWebhookInput struct {
	Resource      string    `json:"resource"`
	UserID        int64     `json:"user_id"`
	Topic         string    `json:"topic"`
	ApplicationID int64     `json:"application_id"`
	Attempts      int       `json:"attempts"`
	Sent          time.Time `json:"sent"`
	Received      time.Time `json:"received"`
}

type HandleWebhookOutput struct {
	Processed bool   `json:"processed"`
	Message   string `json:"message"`
}

type HandleWebhook interface {
	Execute(ctx context.Context, input HandleWebhookInput) (HandleWebhookOutput, error)
}

type HandleWebhookImpl struct {
	meliRepo    meliProviders.MeliRepository
	meliClient  meliProviders.MeliClient
	productRepo prodProviders.ProductsPersistor
	orderRepo   orderProviders.OrdersPersistor
}

func NewHandleWebhookImpl(
	meliRepo meliProviders.MeliRepository,
	meliClient meliProviders.MeliClient,
	productRepo prodProviders.ProductsPersistor,
	orderRepo orderProviders.OrdersPersistor,
) HandleWebhookImpl {
	return HandleWebhookImpl{
		meliRepo:    meliRepo,
		meliClient:  meliClient,
		productRepo: productRepo,
		orderRepo:   orderRepo,
	}
}

func (uc HandleWebhookImpl) Execute(ctx context.Context, input HandleWebhookInput) (HandleWebhookOutput, error) {
	slog.Info("Mercado Libre webhook received", "topic", input.Topic, "resource", input.Resource)

	// We are specifically interested in orders
	if input.Topic != "orders_v2" && input.Topic != "created_orders" && !strings.HasPrefix(input.Resource, "/orders/") {
		return HandleWebhookOutput{Processed: false, Message: "Ignored non-order topic"}, nil
	}

	acc, err := uc.meliRepo.GetAccount(ctx)
	if err != nil || acc == nil || acc.AccessToken == "" {
		slog.Warn("Mercado Libre webhook ignored: account not connected")
		return HandleWebhookOutput{Processed: false, Message: "Account not connected"}, nil
	}

	// Extract order ID
	parts := strings.Split(strings.Trim(input.Resource, "/"), "/")
	if len(parts) < 2 {
		return HandleWebhookOutput{Processed: false, Message: "Invalid resource format"}, nil
	}
	meliOrderID := parts[len(parts)-1]

	// Ensure token is valid
	token := acc.AccessToken
	if time.Now().After(acc.TokenExpiresAt.Add(-10 * time.Minute)) && acc.RefreshToken != "" {
		refreshed, err := uc.meliClient.RefreshToken(ctx, acc.AppID, acc.ClientSecret, acc.RefreshToken)
		if err == nil && refreshed != nil {
			token = refreshed.AccessToken
			newExp := time.Now().Add(time.Duration(refreshed.ExpiresIn) * time.Second)
			_ = uc.meliRepo.UpdateTokens(ctx, refreshed.AccessToken, refreshed.RefreshToken, newExp)
		}
	}

	// Fetch order details from Mercado Libre
	orderData, err := uc.meliClient.GetOrderDetails(ctx, token, meliOrderID)
	if err != nil {
		slog.Error("Failed to fetch order details from Mercado Libre", "order_id", meliOrderID, "error", err)
		_ = uc.meliRepo.CreateSyncLog(ctx, mercadolibre.MeliSyncLog{
			EventType: "order_fetch_error",
			Status:    "failed",
			Message:   fmt.Sprintf("Failed to get order %s: %v", meliOrderID, err),
			CreatedAt: time.Now(),
		})
		return HandleWebhookOutput{Processed: false, Message: err.Error()}, err
	}

	// Process each item to deduct stock from database
	orderItems := make([]orders.OrderItem, 0)
	var totalDeductedStock int

	for _, it := range orderData.OrderItems {
		meliItemID := it.Item.ID
		qty := it.Quantity
		if qty <= 0 {
			qty = 1
		}

		// Find product in DB by MeliID
		productID, err := uc.meliRepo.GetProductIDByMeliID(ctx, meliItemID)
		if err == nil && productID != "" {
			prod, err := uc.productRepo.GetByID(ctx, productID)
			if err == nil {
				// Deduct stock!
				oldStock := prod.Stock
				newStock := oldStock - qty
				if newStock < 0 {
					newStock = 0
				}
				prod.Stock = newStock
				_, updateErr := uc.productRepo.Update(ctx, prod)
				if updateErr != nil {
					slog.Error("Failed to deduct stock for product", "product_id", prod.ID, "error", updateErr)
				} else {
					totalDeductedStock += qty
					slog.Info("Stock deducted from database via Mercado Libre sale",
						"product_id", prod.ID,
						"title", prod.Title,
						"old_stock", oldStock,
						"new_stock", newStock,
					)

					_ = uc.meliRepo.CreateSyncLog(ctx, mercadolibre.MeliSyncLog{
						EventType:  "stock_deducted_sale",
						ProductID:  &prod.ID,
						MeliItemID: &meliItemID,
						Status:     "success",
						Message:    fmt.Sprintf("Venta en Mercado Libre: Se descontaron %d unidades de '%s'. Stock actual: %d", qty, prod.Title, newStock),
						CreatedAt:  time.Now(),
					})
				}

				orderItems = append(orderItems, orders.OrderItem{
					ProductID: prod.ID,
					Title:     prod.Title,
					UnitPrice: it.UnitPrice,
					Quantity:  qty,
					Image:     prod.Image,
					CreatedAt: time.Now(),
				})
			}
		} else {
			// Item not yet mapped, still record in order items
			orderItems = append(orderItems, orders.OrderItem{
				ProductID: meliItemID,
				Title:     it.Item.Title,
				UnitPrice: it.UnitPrice,
				Quantity:  qty,
				CreatedAt: time.Now(),
			})
		}
	}

	// Build buyer address string
	addr := orderData.Shipping.ReceiverAddress
	shippingAddr := fmt.Sprintf("%s %s, %s, %s (CP: %s)",
		addr.StreetName, addr.StreetNumber, addr.City.Name, addr.State.Name, addr.ZipCode)
	if strings.TrimSpace(shippingAddr) == ", ,  (CP: )" {
		shippingAddr = "Envío Gestionado por Mercado Envíos"
	}

	customerName := fmt.Sprintf("%s %s", orderData.Buyer.FirstName, orderData.Buyer.LastName)
	if strings.TrimSpace(customerName) == "" {
		customerName = orderData.Buyer.Nickname
	}
	if customerName == "" {
		customerName = "Comprador Mercado Libre"
	}

	customerEmail := orderData.Buyer.Email
	if customerEmail == "" {
		customerEmail = fmt.Sprintf("meli_%d@mercadolibre.com", orderData.Buyer.ID)
	}

	orderNum := fmt.Sprintf("#MELI-%d", orderData.ID)
	meliIDStr := strconv.FormatInt(orderData.ID, 10)

	luminaOrder := orders.Order{
		OrderNumber:     orderNum,
		CustomerName:    customerName,
		CustomerEmail:   customerEmail,
		CustomerPhone:   fmt.Sprintf("%s%s", orderData.Buyer.Phone.AreaCode, orderData.Buyer.Phone.Number),
		ShippingAddress: shippingAddr,
		Status:          orders.StatusPaid,
		Channel:         "mercadolibre",
		MeliOrderID:     &meliIDStr,
		Subtotal:        orderData.TotalAmount,
		ShippingCost:    0,
		Total:           orderData.TotalAmount,
		Items:           orderItems,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	createdOrder, err := uc.orderRepo.Create(ctx, luminaOrder)
	if err != nil {
		slog.Error("Failed to register Mercado Libre order in local database", "error", err)
	} else {
		slog.Info("Mercado Libre order imported successfully into Lumina", "order_number", createdOrder.OrderNumber)
	}

	return HandleWebhookOutput{
		Processed: true,
		Message:   fmt.Sprintf("Orden Mercado Libre %s procesada. Stock descontado: %d unidades", meliOrderID, totalDeductedStock),
	}, nil
}
