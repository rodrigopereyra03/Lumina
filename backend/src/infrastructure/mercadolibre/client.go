package mercadolibre

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"strings"
	"time"

	meliProviders "ecommerce-ganador/backend/src/core/providers/mercadolibre"
)

type Client struct {
	httpClient *http.Client
	baseURL    string
	authURL    string
}

func NewClient() *Client {
	return &Client{
		httpClient: &http.Client{Timeout: 15 * time.Second},
		baseURL:    "https://api.mercadolibre.com",
		authURL:    "https://auth.mercadolibre.com.ar/authorization",
	}
}

func (c *Client) GetAuthURL(appID, redirectURI, state string) string {
	params := url.Values{}
	params.Add("response_type", "code")
	params.Add("client_id", appID)
	params.Add("redirect_uri", redirectURI)
	if state != "" {
		params.Add("state", state)
	}
	return fmt.Sprintf("%s?%s", c.authURL, params.Encode())
}

func (c *Client) ExchangeCode(ctx context.Context, appID, clientSecret, code, redirectURI string) (*meliProviders.TokenResult, error) {
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("client_id", appID)
	data.Set("client_secret", clientSecret)
	data.Set("code", code)
	data.Set("redirect_uri", redirectURI)

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		fmt.Sprintf("%s/oauth/token", c.baseURL),
		bytes.NewBufferString(data.Encode()),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create oauth request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("oauth token exchange failed: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("mercadolibre oauth error (status %d): %s", resp.StatusCode, string(body))
	}

	var parsed struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		ExpiresIn    int    `json:"expires_in"`
		UserID       int64  `json:"user_id"`
		Scope        string `json:"scope"`
	}
	if err := json.Unmarshal(body, &parsed); err != nil {
		return nil, fmt.Errorf("failed to parse oauth response: %w", err)
	}

	return &meliProviders.TokenResult{
		AccessToken:  parsed.AccessToken,
		RefreshToken: parsed.RefreshToken,
		ExpiresIn:    parsed.ExpiresIn,
		UserID:       parsed.UserID,
		Scope:        parsed.Scope,
	}, nil
}

func (c *Client) RefreshToken(ctx context.Context, appID, clientSecret, refreshToken string) (*meliProviders.TokenResult, error) {
	data := url.Values{}
	data.Set("grant_type", "refresh_token")
	data.Set("client_id", appID)
	data.Set("client_secret", clientSecret)
	data.Set("refresh_token", refreshToken)

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		fmt.Sprintf("%s/oauth/token", c.baseURL),
		bytes.NewBufferString(data.Encode()),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create refresh token request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("oauth token refresh failed: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("mercadolibre refresh error (status %d): %s", resp.StatusCode, string(body))
	}

	var parsed struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		ExpiresIn    int    `json:"expires_in"`
		UserID       int64  `json:"user_id"`
		Scope        string `json:"scope"`
	}
	if err := json.Unmarshal(body, &parsed); err != nil {
		return nil, fmt.Errorf("failed to parse refresh token response: %w", err)
	}

	return &meliProviders.TokenResult{
		AccessToken:  parsed.AccessToken,
		RefreshToken: parsed.RefreshToken,
		ExpiresIn:    parsed.ExpiresIn,
		UserID:       parsed.UserID,
		Scope:        parsed.Scope,
	}, nil
}

func (c *Client) PublishItem(ctx context.Context, accessToken string, item meliProviders.PublishItemData) (*meliProviders.PublishItemResult, error) {
	categoryID := item.CategoryID
	if categoryID == "" {
		categoryID = "MLA1271" // Belleza y Cuidado Personal > Perfumes (default en MLA)
	}

	pictures := make([]map[string]string, 0)
	for _, pic := range item.Pictures {
		if pic != "" {
			pictures = append(pictures, map[string]string{"source": pic})
		}
	}
	if len(pictures) == 0 {
		pictures = append(pictures, map[string]string{"source": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80"})
	}

	buyingMode := item.BuyingMode
	if buyingMode == "" {
		buyingMode = "buy_it_now"
	}
	listingType := item.ListingTypeID
	if listingType == "" {
		listingType = "gold_special" // Publicación clásica
	}
	condition := item.Condition
	if condition == "" {
		condition = "new"
	}
	currency := item.CurrencyID
	if currency == "" {
		currency = "ARS"
	}

	familyName := strings.TrimSpace(item.Title)
	if len(familyName) > 60 {
		familyName = strings.TrimSpace(familyName[:60])
	}
	if familyName == "" {
		familyName = "Perfume de Autor"
	}

	// Payload configured for Mercado Libre User Products (UP):
	// In UP categories/sellers, family_name is required and title is strictly forbidden.
	payload := map[string]interface{}{
		"family_name":        familyName,
		"category_id":        categoryID,
		"price":              item.Price,
		"currency_id":        currency,
		"available_quantity": item.Stock,
		"buying_mode":        buyingMode,
		"listing_type_id":    listingType,
		"condition":          condition,
		"pictures":           pictures,
	}

	if item.Description != "" {
		payload["description"] = map[string]string{
			"plain_text": item.Description,
		}
	}

	if len(item.Attributes) > 0 {
		payload["attributes"] = item.Attributes
	}

	var lastErr error
	var res struct {
		ID        string `json:"id"`
		Permalink string `json:"permalink"`
		Status    string `json:"status"`
	}

	needSeparateDescription := false

	// Attempt publishing with automatic recovery if MELI returns field validation mismatches
	for attempt := 0; attempt < 3; attempt++ {
		bodyBytes, err := json.Marshal(payload)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal item: %w", err)
		}

		req, err := http.NewRequestWithContext(
			ctx,
			http.MethodPost,
			fmt.Sprintf("%s/items", c.baseURL),
			bytes.NewBuffer(bodyBytes),
		)
		if err != nil {
			return nil, fmt.Errorf("failed to create item request: %w", err)
		}
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
		req.Header.Set("Content-Type", "application/json")

		resp, err := c.httpClient.Do(req)
		if err != nil {
			return nil, fmt.Errorf("item publish request failed: %w", err)
		}

		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			if err := json.Unmarshal(body, &res); err != nil {
				return nil, fmt.Errorf("failed to parse publish response: %w", err)
			}
			lastErr = nil
			break
		}

		bodyStr := string(body)
		lastErr = fmt.Errorf("mercadolibre item publish error (%d): %s", resp.StatusCode, bodyStr)

		// Self-healing adjustments
		modified := false
		if strings.Contains(bodyStr, "invalid_fields") || strings.Contains(bodyStr, "invalid") {
			if strings.Contains(bodyStr, "[title]") {
				delete(payload, "title")
				payload["family_name"] = familyName
				modified = true
			}
			if strings.Contains(bodyStr, "[family_name]") {
				delete(payload, "family_name")
				payload["title"] = item.Title
				modified = true
			}
			if strings.Contains(bodyStr, "[description]") {
				delete(payload, "description")
				needSeparateDescription = true
				modified = true
			}
		}

		if strings.Contains(bodyStr, "required_fields") || strings.Contains(bodyStr, "required") {
			if strings.Contains(bodyStr, "[family_name]") {
				payload["family_name"] = familyName
				delete(payload, "title")
				modified = true
			}
			if strings.Contains(bodyStr, "[title]") {
				payload["title"] = item.Title
				delete(payload, "family_name")
				modified = true
			}
		}

		if !modified {
			return nil, lastErr
		}
	}

	if lastErr != nil {
		return nil, lastErr
	}

	if needSeparateDescription && item.Description != "" && res.ID != "" {
		_ = c.SetItemDescription(ctx, accessToken, res.ID, item.Description)
	}

	return &meliProviders.PublishItemResult{
		MeliID:    res.ID,
		Permalink: res.Permalink,
		Status:    res.Status,
	}, nil
}

func (c *Client) SetItemDescription(ctx context.Context, accessToken string, meliItemID string, description string) error {
	payload := map[string]string{
		"plain_text": description,
	}
	bodyBytes, _ := json.Marshal(payload)
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		fmt.Sprintf("%s/items/%s/description", c.baseURL, meliItemID),
		bytes.NewBuffer(bodyBytes),
	)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return nil
}

func (c *Client) UpdateStock(ctx context.Context, accessToken string, meliItemID string, quantity int) error {
	payload := map[string]interface{}{
		"available_quantity": quantity,
	}
	if quantity <= 0 {
		payload["status"] = "paused"
	}

	bodyBytes, _ := json.Marshal(payload)
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPut,
		fmt.Sprintf("%s/items/%s", c.baseURL, meliItemID),
		bytes.NewBuffer(bodyBytes),
	)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("mercadolibre update stock error (%d): %s", resp.StatusCode, string(body))
	}

	slog.Info("Successfully synced stock to Mercado Libre", "meli_item_id", meliItemID, "quantity", quantity)
	return nil
}

func (c *Client) UpdatePrice(ctx context.Context, accessToken string, meliItemID string, price float64) error {
	payload := map[string]interface{}{
		"price": price,
	}
	bodyBytes, _ := json.Marshal(payload)
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPut,
		fmt.Sprintf("%s/items/%s", c.baseURL, meliItemID),
		bytes.NewBuffer(bodyBytes),
	)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("mercadolibre update price error (%d): %s", resp.StatusCode, string(body))
	}

	return nil
}

func (c *Client) GetOrderDetails(ctx context.Context, accessToken string, meliOrderID string) (*meliProviders.MeliOrderData, error) {
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		fmt.Sprintf("%s/orders/%s", c.baseURL, meliOrderID),
		nil,
	)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("mercadolibre get order error (%d): %s", resp.StatusCode, string(body))
	}

	var order meliProviders.MeliOrderData
	if err := json.Unmarshal(body, &order); err != nil {
		return nil, fmt.Errorf("failed to unmarshal meli order: %w", err)
	}

	return &order, nil
}
