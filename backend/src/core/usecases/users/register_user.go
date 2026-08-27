package users

import (
	"context"
	"fmt"
	"time"

	"ecommerce-ganador/backend/src/core/entities/users"
	"ecommerce-ganador/backend/src/core/providers/jwt"
	notifProviders "ecommerce-ganador/backend/src/core/providers/notifications"
	userProviders "ecommerce-ganador/backend/src/core/providers/users"

	"golang.org/x/crypto/bcrypt"
)

type RegisterUserInput struct {
	FullName string
	Email    string
	Password string
	Phone    string
}

type RegisterUserOutput struct {
	User        users.User
	AccessToken string
}

type RegisterUser interface {
	Execute(ctx context.Context, input RegisterUserInput) (RegisterUserOutput, error)
}

type RegisterUserImpl struct {
	persistor     userProviders.UsersPersistor
	tokenProvider jwt.TokenProvider
	emailProvider notifProviders.EmailProvider
	accessDur     time.Duration
}

func NewRegisterUserImpl(
	persistor userProviders.UsersPersistor,
	tokenProvider jwt.TokenProvider,
	emailProvider notifProviders.EmailProvider,
	accessDur time.Duration,
) RegisterUserImpl {
	return RegisterUserImpl{
		persistor:     persistor,
		tokenProvider: tokenProvider,
		emailProvider: emailProvider,
		accessDur:     accessDur,
	}
}

func (uc RegisterUserImpl) Execute(ctx context.Context, input RegisterUserInput) (RegisterUserOutput, error) {
	// Check if email already exists
	if _, err := uc.persistor.GetByEmail(ctx, input.Email); err == nil {
		return RegisterUserOutput{}, ErrEmailAlreadyInUse
	}

	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return RegisterUserOutput{}, fmt.Errorf("failed to hash password: %w", err)
	}

	newUser := users.User{
		Email:        input.Email,
		PasswordHash: string(hashedBytes),
		FullName:     input.FullName,
		Phone:        input.Phone,
		Role:         users.RoleCustomer,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	created, err := uc.persistor.Create(ctx, newUser)
	if err != nil {
		return RegisterUserOutput{}, fmt.Errorf("failed to create user in storage: %w", err)
	}

	token, err := uc.tokenProvider.GenerateAccessToken(created.ID, created.Email, string(created.Role), uc.accessDur)
	if err != nil {
		return RegisterUserOutput{}, fmt.Errorf("failed to generate auth token: %w", err)
	}

	// Trigger async welcome email
	if uc.emailProvider != nil {
		_ = uc.emailProvider.SendWelcomeEmail(ctx, created.Email, created.FullName)
	}

	return RegisterUserOutput{
		User:        created,
		AccessToken: token,
	}, nil
}
