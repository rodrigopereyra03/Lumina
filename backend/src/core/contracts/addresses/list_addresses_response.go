package addresses

import (
	"ecommerce-ganador/backend/src/core/entities/addresses"
)

type AddressDTO struct {
	ID             string `json:"id"`
	UserID         string `json:"user_id"`
	Title          string `json:"title"`
	RecipientName  string `json:"recipient_name"`
	RecipientPhone string `json:"recipient_phone"`
	StreetAddress  string `json:"street_address"`
	City           string `json:"city"`
	State          string `json:"state"`
	PostalCode     string `json:"postal_code"`
	IsDefault      bool   `json:"is_default"`
}

type ListAddressesResponse struct {
	Addresses []AddressDTO `json:"addresses"`
}

func ToAddressDTO(a addresses.Address) AddressDTO {
	return AddressDTO{
		ID:             a.ID,
		UserID:         a.UserID,
		Title:          a.Title,
		RecipientName:  a.RecipientName,
		RecipientPhone: a.RecipientPhone,
		StreetAddress:  a.StreetAddress,
		City:           a.City,
		State:          a.State,
		PostalCode:     a.PostalCode,
		IsDefault:      a.IsDefault,
	}
}

func ToAddressDTOs(addrs []addresses.Address) []AddressDTO {
	dtos := make([]AddressDTO, len(addrs))
	for i, a := range addrs {
		dtos[i] = ToAddressDTO(a)
	}
	return dtos
}
