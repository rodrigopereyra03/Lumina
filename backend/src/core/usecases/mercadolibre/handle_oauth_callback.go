package mercadolibre

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"ecommerce-ganador/backend/src/core/entities/mercadolibre"
	meliProviders "ecommerce-ganador/backend/src/core/providers/mercadolibre"
)

type HandleOAuthCallbackInput struct {
	Code        string
	RedirectURI string
}

type HandleOAuthCallbackOutput struct {
	Success  bool   `json:"success"`
	Nickname string `json:"nickname"`
	Message  string `json:"message"`
}

type HandleOAuthCallback interface {
	Execute(ctx context.Context, input HandleOAuthCallbackInput) (HandleOAuthCallbackOutput, error)
}

type HandleOAuthCallbackImpl struct {
	repo   meliProviders.MeliRepository
	client meliProviders.MeliClient
}

func NewHandleOAuthCallbackImpl(repo meliProviders.MeliRepository, client meliProviders.MeliClient) HandleOAuthCallbackImpl {
	return HandleOAuthCallbackImpl{repo: repo, client: client}
}

func (uc HandleOAuthCallbackImpl) Execute(ctx context.Context, input HandleOAuthCallbackInput) (HandleOAuthCallbackOutput, error) {
	acc, err := uc.repo.GetAccount(ctx)
	if err != nil || acc == nil {
		return HandleOAuthCallbackOutput{}, fmt.Errorf("mercadolibre account configuration not found")
	}

	redirectURI := input.RedirectURI
	if redirectURI == "" {
		redirectURI = acc.RedirectURL
	}

	tokenResult, err := uc.client.ExchangeCode(ctx, acc.AppID, acc.ClientSecret, input.Code, redirectURI)
	if err != nil {
		_ = uc.repo.CreateSyncLog(ctx, mercadolibre.MeliSyncLog{
			EventType: "oauth_callback_error",
			Status:    "failed",
			Message:   fmt.Sprintf("OAuth exchange failed: %v", err),
			CreatedAt: time.Now(),
		})
		return HandleOAuthCallbackOutput{}, fmt.Errorf("failed to exchange code for tokens: %w", err)
	}

	expiresAt := time.Now().Add(time.Duration(tokenResult.ExpiresIn) * time.Second)
	acc.AccessToken = tokenResult.AccessToken
	acc.RefreshToken = tokenResult.RefreshToken
	acc.TokenExpiresAt = expiresAt
	acc.MeliUserID = strconv.FormatInt(tokenResult.UserID, 10)
	acc.IsActive = true
	acc.UpdatedAt = time.Now()

	_, err = uc.repo.SaveAccount(ctx, *acc)
	if err != nil {
		return HandleOAuthCallbackOutput{}, fmt.Errorf("failed to save account tokens: %w", err)
	}

	_ = uc.repo.CreateSyncLog(ctx, mercadolibre.MeliSyncLog{
		EventType: "oauth_connected",
		Status:    "success",
		Message:   fmt.Sprintf("Mercado Libre account %s connected successfully", acc.MeliUserID),
		CreatedAt: time.Now(),
	})

	return HandleOAuthCallbackOutput{
		Success:  true,
		Nickname: acc.MeliUserID,
		Message:  "Cuenta de Mercado Libre conectada con éxito",
	}, nil
}
