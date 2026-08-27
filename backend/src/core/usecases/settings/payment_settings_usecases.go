package settings

import (
	"context"
	"time"

	"ecommerce-ganador/backend/src/core/entities/settings"
	settingProviders "ecommerce-ganador/backend/src/core/providers/settings"
)

type GetPaymentSettingsOutput struct {
	Settings settings.PaymentSettings
}

type GetPaymentSettings interface {
	Execute(ctx context.Context) (GetPaymentSettingsOutput, error)
}

type GetPaymentSettingsImpl struct {
	persistor settingProviders.PaymentSettingsPersistor
}

func NewGetPaymentSettingsImpl(persistor settingProviders.PaymentSettingsPersistor) GetPaymentSettingsImpl {
	return GetPaymentSettingsImpl{persistor: persistor}
}

func (uc GetPaymentSettingsImpl) Execute(ctx context.Context) (GetPaymentSettingsOutput, error) {
	s, err := uc.persistor.Get(ctx)
	if err != nil {
		return GetPaymentSettingsOutput{}, err
	}
	return GetPaymentSettingsOutput{Settings: s}, nil
}

type UpdatePaymentSettingsInput struct {
	MPActive         bool
	MPPublicKey      string
	MPAccessToken    string
	MPSandbox        bool
	MPInstallments   int
	TransferActive   bool
	TransferCBU      string
	TransferAlias    string
	TransferBank     string
	TransferHolder   string
	TransferDiscount float64
	CardActive       bool
}

type UpdatePaymentSettingsOutput struct {
	Settings settings.PaymentSettings
}

type UpdatePaymentSettings interface {
	Execute(ctx context.Context, input UpdatePaymentSettingsInput) (UpdatePaymentSettingsOutput, error)
}

type UpdatePaymentSettingsImpl struct {
	persistor settingProviders.PaymentSettingsPersistor
}

func NewUpdatePaymentSettingsImpl(persistor settingProviders.PaymentSettingsPersistor) UpdatePaymentSettingsImpl {
	return UpdatePaymentSettingsImpl{persistor: persistor}
}

func (uc UpdatePaymentSettingsImpl) Execute(ctx context.Context, input UpdatePaymentSettingsInput) (UpdatePaymentSettingsOutput, error) {
	ps := settings.PaymentSettings{
		MPActive:         input.MPActive,
		MPPublicKey:      input.MPPublicKey,
		MPAccessToken:    input.MPAccessToken,
		MPSandbox:        input.MPSandbox,
		MPInstallments:   input.MPInstallments,
		TransferActive:   input.TransferActive,
		TransferCBU:      input.TransferCBU,
		TransferAlias:    input.TransferAlias,
		TransferBank:     input.TransferBank,
		TransferHolder:   input.TransferHolder,
		TransferDiscount: input.TransferDiscount,
		CardActive:       input.CardActive,
		UpdatedAt:        time.Now(),
	}

	updated, err := uc.persistor.Update(ctx, ps)
	if err != nil {
		return UpdatePaymentSettingsOutput{}, err
	}

	return UpdatePaymentSettingsOutput{Settings: updated}, nil
}
