package orders

import "errors"

var (
	ErrOrderNotFound    = errors.New("order not found")
	ErrEmptyOrderItems  = errors.New("order must contain at least one item")
	ErrInvalidStatus    = errors.New("invalid order status")
)
