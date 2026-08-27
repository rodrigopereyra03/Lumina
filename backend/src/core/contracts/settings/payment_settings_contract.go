package settings

type PaymentSettingsDTO struct {
	MPActive         bool    `json:"mp_active"`
	MPPublicKey      string  `json:"mp_public_key"`
	MPAccessToken    string  `json:"mp_access_token"`
	MPSandbox        bool    `json:"mp_sandbox"`
	MPInstallments   int     `json:"mp_installments"`
	TransferActive   bool    `json:"transfer_active"`
	TransferCBU      string  `json:"transfer_cbu"`
	TransferAlias    string  `json:"transfer_alias"`
	TransferBank     string  `json:"transfer_bank"`
	TransferHolder   string  `json:"transfer_holder"`
	TransferDiscount float64 `json:"transfer_discount"`
	CardActive       bool    `json:"card_active"`
}
