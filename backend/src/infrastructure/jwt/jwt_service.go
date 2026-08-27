package jwt

import (
	"errors"
	"fmt"
	"time"

	jwtPkg "github.com/golang-jwt/jwt/v5"
)

type JWTService struct {
	secretKey []byte
}

func NewJWTService(secret string) *JWTService {
	return &JWTService{
		secretKey: []byte(secret),
	}
}

type UserClaims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwtPkg.RegisteredClaims
}

func (s *JWTService) GenerateAccessToken(userID, email, role string, duration time.Duration) (string, error) {
	claims := UserClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwtPkg.RegisteredClaims{
			ExpiresAt: jwtPkg.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwtPkg.NewNumericDate(time.Now()),
			Subject:   userID,
		},
	}

	token := jwtPkg.NewWithClaims(jwtPkg.SigningMethodHS256, claims)
	signed, err := token.SignedString(s.secretKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign access token: %w", err)
	}

	return signed, nil
}

func (s *JWTService) GenerateRefreshToken(userID string, duration time.Duration) (string, error) {
	claims := jwtPkg.RegisteredClaims{
		ExpiresAt: jwtPkg.NewNumericDate(time.Now().Add(duration)),
		IssuedAt:  jwtPkg.NewNumericDate(time.Now()),
		Subject:   userID,
	}

	token := jwtPkg.NewWithClaims(jwtPkg.SigningMethodHS256, claims)
	signed, err := token.SignedString(s.secretKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign refresh token: %w", err)
	}

	return signed, nil
}

func (s *JWTService) ValidateToken(tokenStr string) (string, string, error) {
	token, err := jwtPkg.ParseWithClaims(tokenStr, &UserClaims{}, func(t *jwtPkg.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwtPkg.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return s.secretKey, nil
	})

	if err != nil {
		return "", "", fmt.Errorf("invalid token: %w", err)
	}

	if claims, ok := token.Claims.(*UserClaims); ok && token.Valid {
		return claims.UserID, claims.Role, nil
	}

	return "", "", errors.New("invalid token claims")
}
