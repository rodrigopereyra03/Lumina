package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Env                  string
	Port                 string
	DBSource             string
	JWTSecret            string
	JWTAccessExpiration  time.Duration
	JWTRefreshExpiration time.Duration
	ResendAPIKey         string
	ResendFromEmail      string
}

func LoadConfig() Config {
	// Attempt to load .env file if present
	if err := godotenv.Load(".env"); err != nil {
		log.Println("Info: No .env file found, reading from system environment")
	}

	env := getEnv("ENV", "development")
	port := getEnv("PORT", "8080")
	dbSource := os.Getenv("DB_SOURCE")

	jwtSecret := getEnv("JWT_SECRET", "super_secret_jwt_key_change_me_in_production")

	accessHours := 24
	if hStr := os.Getenv("JWT_EXPIRATION_HOURS"); hStr != "" {
		if h, err := strconv.Atoi(hStr); err == nil {
			accessHours = h
		}
	}

	refreshDays := 7
	if dStr := os.Getenv("JWT_REFRESH_EXPIRATION_DAYS"); dStr != "" {
		if d, err := strconv.Atoi(dStr); err == nil {
			refreshDays = d
		}
	}

	resendAPIKey := getEnv("RESEND_API_KEY", "")
	resendFromEmail := getEnv("FROM_EMAIL", getEnv("RESEND_FROM_EMAIL", "Lumina Store <onboarding@resend.dev>"))

	return Config{
		Env:                  env,
		Port:                 port,
		DBSource:             dbSource,
		JWTSecret:            jwtSecret,
		JWTAccessExpiration:  time.Duration(accessHours) * time.Hour,
		JWTRefreshExpiration: time.Duration(refreshDays) * 24 * time.Hour,
		ResendAPIKey:         resendAPIKey,
		ResendFromEmail:      resendFromEmail,
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
