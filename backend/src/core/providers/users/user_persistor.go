package users

import (
	"context"

	"ecommerce-ganador/backend/src/core/entities/users"
)

type UsersPersistor interface {
	Create(ctx context.Context, user users.User) (users.User, error)
	GetByEmail(ctx context.Context, email string) (users.User, error)
	GetByID(ctx context.Context, id string) (users.User, error)
	List(ctx context.Context) ([]users.User, error)
}
