package addresses

import (
	addrUsecases "ecommerce-ganador/backend/src/core/usecases/addresses"
)

type CreateAddressRequest struct {
	Title          string `json:"title" binding:"required"`
	RecipientName  string `json:"recipient_name" binding:"required"`
	RecipientPhone string `json:"recipient_phone"`
	StreetAddress  string `json:"street_address" binding:"required"`
	City           string `json:"city" binding:"required"`
	State          string `json:"state" binding:"required"`
	PostalCode     string `json:"postal_code" binding:"required"`
	IsDefault      bool   `json:"is_default"`
}

func (r CreateAddressRequest) ToInput(userID string) addrUsecases.CreateAddressInput {
	return addrUsecases.CreateAddressInput{
		UserID:         userID,
		Title:          r.Title,
		RecipientName:  r.RecipientName,
		RecipientPhone: r.RecipientPhone,
		StreetAddress:  r.StreetAddress,
		City:           r.City,
		State:          r.State,
		PostalCode:     r.PostalCode,
		IsDefault:      r.IsDefault,
	}
}
