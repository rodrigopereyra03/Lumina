package orders

import (
	"context"
	"fmt"
	"strings"

	"ecommerce-ganador/backend/src/core/entities/orders"
	"ecommerce-ganador/backend/src/core/entities/payments"
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

	normalizedStatus := strings.ToLower(string(input.Status))

	// 1. If status changed to shipped/enviado, trigger shipment dispatched email
	if uc.emailProvider != nil && (normalizedStatus == "enviado" || normalizedStatus == "en_camino" || input.Status == orders.StatusShipped) {
		tracking := fmt.Sprintf("#TRK-%07d", 1000000+len(order.OrderNumber)*731)
		_ = uc.emailProvider.SendShipmentDispatchedEmail(ctx, order.CustomerEmail, order, tracking, "Andreani / Envío Express")
	}

	// 2. If status changed to paid/aprobado, trigger payment approved email
	if uc.emailProvider != nil && (normalizedStatus == "pagado" || normalizedStatus == "aprobado" || input.Status == orders.StatusPaid) {
		_ = uc.emailProvider.SendPaymentApprovedEmail(ctx, order.CustomerEmail, order, payments.Payment{
			ID:            "pay_" + order.ID,
			OrderID:       order.ID,
			PaymentMethod: "Mercado Pago",
			Amount:        order.Total,
			Status:        "approved",
		})
	}

	return nil
}
