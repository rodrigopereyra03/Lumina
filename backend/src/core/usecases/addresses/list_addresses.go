package addresses

import (
	"context"

	"ecommerce-ganador/backend/src/core/entities/addresses"
	addrProviders "ecommerce-ganador/backend/src/core/providers/addresses"
)

type ListAddressesInput struct {
	UserID string
}

type ListAddressesOutput struct {
	Addresses []addresses.Address
}

type ListAddresses interface {
	Execute(ctx context.Context, input ListAddressesInput) (ListAddressesOutput, error)
}

type ListAddressesImpl struct {
	persistor addrProviders.AddressesPersistor
}

func NewListAddressesImpl(persistor addrProviders.AddressesPersistor) ListAddressesImpl {
	return ListAddressesImpl{persistor: persistor}
}

func (uc ListAddressesImpl) Execute(ctx context.Context, input ListAddressesInput) (ListAddressesOutput, error) {
	addrs, err := uc.persistor.ListByUserID(ctx, input.UserID)
	if err != nil {
		return ListAddressesOutput{}, err
	}

	return ListAddressesOutput{Addresses: addrs}, nil
}
