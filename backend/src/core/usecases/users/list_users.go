package users

import (
	"context"

	"ecommerce-ganador/backend/src/core/entities/users"
	userProviders "ecommerce-ganador/backend/src/core/providers/users"
)

type ListUsersInput struct{}

type ListUsersOutput struct {
	Users []users.User
	Total int
}

type ListUsers interface {
	Execute(ctx context.Context, input ListUsersInput) (ListUsersOutput, error)
}

type ListUsersImpl struct {
	persistor userProviders.UsersPersistor
}

func NewListUsersImpl(persistor userProviders.UsersPersistor) ListUsersImpl {
	return ListUsersImpl{persistor: persistor}
}

func (uc ListUsersImpl) Execute(ctx context.Context, _ ListUsersInput) (ListUsersOutput, error) {
	list, err := uc.persistor.List(ctx)
	if err != nil {
		return ListUsersOutput{}, err
	}

	return ListUsersOutput{
		Users: list,
		Total: len(list),
	}, nil
}
