package orders

import (
	"context"
	"fmt"

	"ecommerce-ganador/backend/src/core/entities/orders"
	notifProviders "ecommerce-ganador/backend/src/core/providers/notifications"
	orderProviders "ecommerce-ganador/backend/src/core/providers/orders"
)

type UpdateOrderStatusInput struct {
	OrderID string
	Status  orders.Status
}

type UpdateOrderStatus interface {
	Execute(ctx context.Context, input UpdateOrderStatusInput) error
}

type UpdateOrderStatusImpl struct {
	persistor     orderProviders.OrdersPersistor
	emailProvider notifProviders.EmailProvider
}

func NewUpdateOrderStatusImpl(persistor orderProviders.OrdersPersistor, emailProvider notifProviders.EmailProvider) UpdateOrderStatusImpl {
	return UpdateOrderStatusImpl{
		persistor:     persistor,
		emailProvider: emailProvider,
	}
}

func (uc UpdateOrderStatusImpl) Execute(ctx context.Context, input UpdateOrderStatusInput) error {
	order, err := uc.persistor.GetByID(ctx, input.OrderID)
	if err != nil {
		return ErrOrderNotFound
	}

	if err := uc.persistor.UpdateStatus(ctx, input.OrderID, input.Status); err != nil {
		return err
	}

	// If status changed to shipped/en_camino, trigger async email notification
	if uc.emailProvider != nil && (input.Status == orders.StatusShipped || input.Status == "en_camino" || input.Status == "Enviado") {
		tracking := fmt.Sprintf("#TRK-%07d", 1000000+len(order.OrderNumber)*731)
		_ = uc.emailProvider.SendShipmentDispatchedEmail(ctx, order.CustomerEmail, order, tracking, "Andreani / Envío Express")
	}

	return nil
}
