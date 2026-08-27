package router

import (
	"net/http"

	"ecommerce-ganador/backend/packages/middleware"
	"ecommerce-ganador/backend/packages/response"

	"github.com/gin-gonic/gin"
)

func NewRouter(env string) *gin.Engine {
	if env == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.CORS())

	// Basic health check routes
	r.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	r.GET("/health", func(c *gin.Context) {
		response.Okf(c, http.StatusOK, gin.H{
			"status":  "healthy",
			"message": "Lumina E-commerce API is running",
		})
	})

	return r
}
