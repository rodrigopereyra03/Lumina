package users

import (
	"context"
	"fmt"
	"time"

	"ecommerce-ganador/backend/src/core/entities/users"
	"ecommerce-ganador/backend/src/core/providers/jwt"
	userProviders "ecommerce-ganador/backend/src/core/providers/users"

	"golang.org/x/crypto/bcrypt"
)

type LoginUserInput struct {
	Email    string
	Password string
}

type LoginUserOutput struct {
	User         users.User
	AccessToken  string
	RefreshToken string
}

type LoginUser interface {
	Execute(ctx context.Context, input LoginUserInput) (LoginUserOutput, error)
}

type LoginUserImpl struct {
	persistor     userProviders.UsersPersistor
	tokenProvider jwt.TokenProvider
	accessDur     time.Duration
	refreshDur    time.Duration
}

func NewLoginUserImpl(
	persistor userProviders.UsersPersistor,
	tokenProvider jwt.TokenProvider,
	accessDur time.Duration,
	refreshDur time.Duration,
) LoginUserImpl {
	return LoginUserImpl{
		persistor:     persistor,
		tokenProvider: tokenProvider,
		accessDur:     accessDur,
		refreshDur:    refreshDur,
	}
}

func (uc LoginUserImpl) Execute(ctx context.Context, input LoginUserInput) (LoginUserOutput, error) {
	user, err := uc.persistor.GetByEmail(ctx, input.Email)
	if err != nil {
		return LoginUserOutput{}, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		return LoginUserOutput{}, ErrInvalidCredentials
	}

	accessToken, err := uc.tokenProvider.GenerateAccessToken(user.ID, user.Email, string(user.Role), uc.accessDur)
	if err != nil {
		return LoginUserOutput{}, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := uc.tokenProvider.GenerateRefreshToken(user.ID, uc.refreshDur)
	if err != nil {
		return LoginUserOutput{}, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return LoginUserOutput{
		User:         user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}
