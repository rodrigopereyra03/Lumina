package settings

import "time"

type PaymentSettings struct {
	ID               string
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
	UpdatedAt        time.Time
}
