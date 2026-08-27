package middleware

import (
	"net/http"
	"strings"

	"ecommerce-ganador/backend/packages/response"
	"ecommerce-ganador/backend/src/infrastructure/jwt"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtService *jwt.JWTService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Errf(c, http.StatusUnauthorized, "err-unauthorized", "Authorization header is required")
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			response.Errf(c, http.StatusUnauthorized, "err-invalid-auth-header", "Authorization header format must be Bearer {token}")
			c.Abort()
			return
		}

		tokenString := parts[1]
		userID, role, err := jwtService.ValidateToken(tokenString)
		if err != nil {
			response.Errf(c, http.StatusUnauthorized, "err-invalid-token", "Invalid or expired token")
			c.Abort()
			return
		}

		c.Set("userId", userID)
		c.Set("role", role)
		c.Next()
	}
}

func RoleGuard(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("role")
		if !exists {
			response.Errf(c, http.StatusForbidden, "err-forbidden", "Access forbidden")
			c.Abort()
			return
		}

		userRole := roleVal.(string)
		for _, r := range allowedRoles {
			if r == userRole {
				c.Next()
				return
			}
		}

		response.Errf(c, http.StatusForbidden, "err-insufficient-permissions", "Insufficient permissions for this resource")
		c.Abort()
	}
}
