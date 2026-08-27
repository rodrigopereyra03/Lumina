package main

import (
	"log"

	"ecommerce-ganador/backend/src/app"
)

func main() {
	application, err := app.Bootstrap()
	if err != nil {
		log.Fatalf("Failed to bootstrap application: %v", err)
	}
	defer application.Close()

	if err := application.Run(); err != nil {
		log.Fatalf("Application terminated unexpectedly: %v", err)
	}
}
