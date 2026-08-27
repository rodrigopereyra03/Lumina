package payments

import "errors"

var (
	ErrPaymentFailed       = errors.New("payment processing failed")
	ErrInvalidPaymentData  = errors.New("invalid payment request data")
	ErrOrderAlreadyPaid    = errors.New("order is already paid")
)
