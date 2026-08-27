package web

import (
	"ecommerce-ganador/backend/src/app/middleware"
	"ecommerce-ganador/backend/src/infrastructure/dependencies"

	"github.com/gin-gonic/gin"
)

func MapRoutes(r *gin.Engine, c *dependencies.Container) {
	v1 := r.Group("/api/v1")
	{
		// Auth Routes
		auth := v1.Group("/auth")
		{
			auth.POST("/register", c.RegisterUserHandler.Handle())
			auth.POST("/login", c.LoginUserHandler.Handle())
		}

		// Users Routes (Profile & Addresses & Admin User Directory)
		userGroup := v1.Group("/users")
		userGroup.Use(middleware.AuthMiddleware(c.JWTService))
		{
			userGroup.GET("/profile", c.GetUserProfileHandler.Handle())
			userGroup.GET("/addresses", c.ListAddressesHandler.Handle())
			userGroup.POST("/addresses", c.CreateAddressHandler.Handle())
			userGroup.GET("", c.ListUsersHandler.Handle()) // Admin directory
		}

		// Coupons Routes
		coupons := v1.Group("/coupons")
		{
			coupons.POST("/validate", c.ValidateCouponHandler.Handle())
		}

		// Payments Routes
		payments := v1.Group("/payments")
		{
			payments.POST("/process", c.ProcessPaymentHandler.Handle())
		}

		// Products Routes
		products := v1.Group("/products")
		{
			products.GET("", c.ListProductsHandler.Handle())
			products.GET("/:id", c.GetProductByIDHandler.Handle())

			// Admin: Create, Update, Delete Product
			adminProducts := products.Group("")
			adminProducts.Use(middleware.AuthMiddleware(c.JWTService))
			{
				adminProducts.POST("", c.CreateProductHandler.Handle())
				adminProducts.PUT("/:id", c.UpdateProductHandler.Handle())
				adminProducts.DELETE("/:id", c.DeleteProductHandler.Handle())
			}
		}

		// Categories Routes
		categories := v1.Group("/categories")
		{
			categories.GET("", c.ListCategoriesHandler.Handle())

			// Admin: Create Category
			adminCategories := categories.Group("")
			adminCategories.Use(middleware.AuthMiddleware(c.JWTService))
			{
				adminCategories.POST("", c.CreateCategoryHandler.Handle())
			}
		}

		// Orders Routes
		orders := v1.Group("/orders")
		{
			orders.POST("", c.CreateOrderHandler.Handle())
			orders.GET("", c.ListOrdersHandler.Handle())
			orders.PATCH("/:id/status", c.UpdateOrderStatusHandler.Handle())
		}

		// Admin Settings
		adminSettings := v1.Group("/admin")
		adminSettings.Use(middleware.AuthMiddleware(c.JWTService))
		{
			adminSettings.GET("/payment-settings", c.PaymentSettingsHandler.HandleGet())
			adminSettings.PUT("/payment-settings", c.PaymentSettingsHandler.HandleUpdate())
		}
	}
}
