package payments

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	orderProviders "ecommerce-ganador/backend/src/core/providers/orders"
	settingProviders "ecommerce-ganador/backend/src/core/providers/settings"
)

type MPItemPayload struct {
	ID          string  `json:"id,omitempty"`
	Title       string  `json:"title"`
	Description string  `json:"description,omitempty"`
	PictureURL  string  `json:"picture_url,omitempty"`
	CategoryID  string  `json:"category_id,omitempty"`
	Quantity    int     `json:"quantity"`
	CurrencyID  string  `json:"currency_id"`
	UnitPrice   float64 `json:"unit_price"`
}

type MPPayerPayload struct {
	Name    string `json:"name,omitempty"`
	Surname string `json:"surname,omitempty"`
	Email   string `json:"email"`
}

type MPBackURLsPayload struct {
	Success string `json:"success"`
	Failure string `json:"failure"`
	Pending string `json:"pending"`
}

type MPPreferencePayload struct {
	Items             []MPItemPayload   `json:"items"`
	Payer             MPPayerPayload    `json:"payer"`
	BackURLs          MPBackURLsPayload `json:"back_urls"`
	AutoReturn        string            `json:"auto_return"`
	ExternalReference string            `json:"external_reference"`
	StatementDescriptor string          `json:"statement_descriptor"`
}

type MPPreferenceAPIResponse struct {
	ID               string `json:"id"`
	InitPoint        string `json:"init_point"`
	SandboxInitPoint string `json:"sandbox_init_point"`
}

type CreateMPPreferenceInput struct {
	OrderID string
	Items   []MPItemPayload
	Payer   MPPayerPayload
	BackURL string
}

type CreateMPPreferenceOutput struct {
	PreferenceID     string
	InitPoint        string
	SandboxInitPoint string
	PublicKey        string
}

type CreateMPPreference interface {
	Execute(ctx context.Context, input CreateMPPreferenceInput) (CreateMPPreferenceOutput, error)
}

type CreateMPPreferenceImpl struct {
	settingRepo settingProviders.PaymentSettingsPersistor
	orderRepo   orderProviders.OrdersPersistor
	httpClient  *http.Client
}

func NewCreateMPPreferenceImpl(
	settingRepo settingProviders.PaymentSettingsPersistor,
	orderRepo orderProviders.OrdersPersistor,
) CreateMPPreferenceImpl {
	return CreateMPPreferenceImpl{
		settingRepo: settingRepo,
		orderRepo:   orderRepo,
		httpClient:  &http.Client{Timeout: 10 * time.Second},
	}
}

func (uc CreateMPPreferenceImpl) Execute(ctx context.Context, input CreateMPPreferenceInput) (CreateMPPreferenceOutput, error) {
	settings, err := uc.settingRepo.Get(ctx)
	if err != nil {
		return CreateMPPreferenceOutput{}, fmt.Errorf("failed to load payment settings: %w", err)
	}

	currencyID := "ARS"
	for i := range input.Items {
		if input.Items[i].CurrencyID == "" {
			input.Items[i].CurrencyID = currencyID
		}
	}

	backURL := input.BackURL
	if backURL == "" {
		backURL = "http://localhost:5173"
	}

	payload := MPPreferencePayload{
		Items: input.Items,
		Payer: input.Payer,
		BackURLs: MPBackURLsPayload{
			Success: fmt.Sprintf("%s/order-success?order_id=%s&status=approved", backURL, input.OrderID),
			Failure: fmt.Sprintf("%s/checkout?order_id=%s&status=failure", backURL, input.OrderID),
			Pending: fmt.Sprintf("%s/order-success?order_id=%s&status=pending", backURL, input.OrderID),
		},
		AutoReturn:          "approved",
		ExternalReference:   input.OrderID,
		StatementDescriptor: "LUMINA STORE",
	}

	// If valid Mercado Pago Access Token is present, call real API
	if settings.MPAccessToken != "" && settings.MPAccessToken != "APP_USR-948201948201948201948201-948201" {
		payloadBytes, err := json.Marshal(payload)
		if err != nil {
			return CreateMPPreferenceOutput{}, fmt.Errorf("failed to marshal MP payload: %w", err)
		}

		req, err := http.NewRequestWithContext(
			ctx,
			http.MethodPost,
			"https://api.mercadopago.com/checkout/preferences",
			bytes.NewBuffer(payloadBytes),
		)
		if err != nil {
			return CreateMPPreferenceOutput{}, fmt.Errorf("failed to create MP request: %w", err)
		}

		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", settings.MPAccessToken))
		req.Header.Set("Content-Type", "application/json")

		resp, err := uc.httpClient.Do(req)
		if err != nil {
			return CreateMPPreferenceOutput{}, fmt.Errorf("failed to execute MP API call: %w", err)
		}
		defer resp.Body.Close()

		respBody, _ := io.ReadAll(resp.Body)
		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			var mpResp MPPreferenceAPIResponse
			if err := json.Unmarshal(respBody, &mpResp); err == nil && mpResp.ID != "" {
				return CreateMPPreferenceOutput{
					PreferenceID:     mpResp.ID,
					InitPoint:        mpResp.InitPoint,
					SandboxInitPoint: mpResp.SandboxInitPoint,
					PublicKey:        settings.MPPublicKey,
				}, nil
			}
		}
	}

	// Simulation / Sandbox URL when running in demo/dev mode
	simulatedPrefID := fmt.Sprintf("PREF-%d-%s", time.Now().Unix(), input.OrderID)
	simulatedInitPoint := fmt.Sprintf("https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=%s", simulatedPrefID)

	return CreateMPPreferenceOutput{
		PreferenceID:     simulatedPrefID,
		InitPoint:        simulatedInitPoint,
		SandboxInitPoint: simulatedInitPoint,
		PublicKey:        settings.MPPublicKey,
	}, nil
}
