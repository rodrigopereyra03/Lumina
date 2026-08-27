package addresses

import (
	"context"

	"ecommerce-ganador/backend/src/core/entities/addresses"
)

type AddressesPersistor interface {
	Create(ctx context.Context, address addresses.Address) (addresses.Address, error)
	ListByUserID(ctx context.Context, userID string) ([]addresses.Address, error)
	Delete(ctx context.Context, id string, userID string) error
}
