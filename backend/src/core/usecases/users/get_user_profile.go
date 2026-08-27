package users

import (
	"context"

	"ecommerce-ganador/backend/src/core/entities/users"
	userProviders "ecommerce-ganador/backend/src/core/providers/users"
)

type GetUserProfileInput struct {
	UserID string
}

type GetUserProfileOutput struct {
	User users.User
}

type GetUserProfile interface {
	Execute(ctx context.Context, input GetUserProfileInput) (GetUserProfileOutput, error)
}

type GetUserProfileImpl struct {
	persistor userProviders.UsersPersistor
}

func NewGetUserProfileImpl(persistor userProviders.UsersPersistor) GetUserProfileImpl {
	return GetUserProfileImpl{persistor: persistor}
}

func (uc GetUserProfileImpl) Execute(ctx context.Context, input GetUserProfileInput) (GetUserProfileOutput, error) {
	user, err := uc.persistor.GetByID(ctx, input.UserID)
	if err != nil {
		return GetUserProfileOutput{}, ErrUserNotFound
	}

	return GetUserProfileOutput{User: user}, nil
}
