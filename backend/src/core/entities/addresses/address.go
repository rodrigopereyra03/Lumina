package addresses

import (
	"time"
)

type Address struct {
	ID             string
	UserID         string
	Title          string
	RecipientName  string
	RecipientPhone string
	StreetAddress  string
	City           string
	State          string
	PostalCode     string
	IsDefault      bool
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletedAt      *time.Time
}
