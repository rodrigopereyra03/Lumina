package mercadolibre

import (
	"context"
	"fmt"

	meliProviders "ecommerce-ganador/backend/src/core/providers/mercadolibre"
)

type GetAuthURLInput struct {
	RedirectURL string
}

type GetAuthURLOutput struct {
	AuthURL string `json:"auth_url"`
}

type GetAuthURL interface {
	Execute(ctx context.Context, input GetAuthURLInput) (GetAuthURLOutput, error)
}

type GetAuthURLImpl struct {
	repo   meliProviders.MeliRepository
	client meliProviders.MeliClient
}

func NewGetAuthURLImpl(repo meliProviders.MeliRepository, client meliProviders.MeliClient) GetAuthURLImpl {
	return GetAuthURLImpl{repo: repo, client: client}
}

func (uc GetAuthURLImpl) Execute(ctx context.Context, input GetAuthURLInput) (GetAuthURLOutput, error) {
	acc, err := uc.repo.GetAccount(ctx)
	if err != nil {
		return GetAuthURLOutput{}, err
	}

	appID := ""
	redirectURL := input.RedirectURL
	if acc != nil {
		appID = acc.AppID
		if redirectURL == "" {
			redirectURL = acc.RedirectURL
		}
	}

	if appID == "" {
		return GetAuthURLOutput{}, fmt.Errorf("mercadolibre app_id not configured. Please set your credentials in admin settings")
	}

	url := uc.client.GetAuthURL(appID, redirectURL, "lumina_oauth_state")
	return GetAuthURLOutput{AuthURL: url}, nil
}
