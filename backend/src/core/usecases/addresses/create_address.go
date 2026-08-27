package addresses

import (
	"context"
	"time"

	"ecommerce-ganador/backend/src/core/entities/addresses"
	addrProviders "ecommerce-ganador/backend/src/core/providers/addresses"
)

type CreateAddressInput struct {
	UserID         string
	Title          string
	RecipientName  string
	RecipientPhone string
	StreetAddress  string
	City           string
	State          string
	PostalCode     string
	IsDefault      bool
}

type CreateAddressOutput struct {
	Address addresses.Address
}

type CreateAddress interface {
	Execute(ctx context.Context, input CreateAddressInput) (CreateAddressOutput, error)
}

type CreateAddressImpl struct {
	persistor addrProviders.AddressesPersistor
}

func NewCreateAddressImpl(persistor addrProviders.AddressesPersistor) CreateAddressImpl {
	return CreateAddressImpl{persistor: persistor}
}

func (uc CreateAddressImpl) Execute(ctx context.Context, input CreateAddressInput) (CreateAddressOutput, error) {
	if input.StreetAddress == "" || input.City == "" || input.PostalCode == "" {
		return CreateAddressOutput{}, ErrInvalidAddress
	}

	newAddr := addresses.Address{
		UserID:         input.UserID,
		Title:          input.Title,
		RecipientName:  input.RecipientName,
		RecipientPhone: input.RecipientPhone,
		StreetAddress:  input.StreetAddress,
		City:           input.City,
		State:          input.State,
		PostalCode:     input.PostalCode,
		IsDefault:      input.IsDefault,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	created, err := uc.persistor.Create(ctx, newAddr)
	if err != nil {
		return CreateAddressOutput{}, err
	}

	return CreateAddressOutput{Address: created}, nil
}
