package addresses

import "errors"

var (
	ErrAddressNotFound = errors.New("address not found")
	ErrInvalidAddress  = errors.New("invalid address data")
)
