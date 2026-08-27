package jwt

import (
	"time"
)

type TokenProvider interface {
	GenerateAccessToken(userID, email, role string, duration time.Duration) (string, error)
	GenerateRefreshToken(userID string, duration time.Duration) (string, error)
	ValidateToken(tokenStr string) (string, string, error) // returns userID, role, error
}
