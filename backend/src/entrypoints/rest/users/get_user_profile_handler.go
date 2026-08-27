package users

import (
	"errors"
	"net/http"

	userContracts "ecommerce-ganador/backend/src/core/contracts/users"
	userUsecases "ecommerce-ganador/backend/src/core/usecases/users"
	"ecommerce-ganador/backend/packages/response"

	"github.com/gin-gonic/gin"
)

type GetUserProfileHandler struct {
	usecase userUsecases.GetUserProfile
}

func NewGetUserProfileHandler(usecase userUsecases.GetUserProfile) GetUserProfileHandler {
	return GetUserProfileHandler{usecase: usecase}
}

func (h GetUserProfileHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userId")
		if !exists {
			response.Errf(c, http.StatusUnauthorized, "err-unauthorized", "Unauthorized access")
			return
		}

		output, err := h.usecase.Execute(c.Request.Context(), userUsecases.GetUserProfileInput{
			UserID: userID.(string),
		})
		if err != nil {
			if errors.Is(err, userUsecases.ErrUserNotFound) {
				response.Errf(c, http.StatusNotFound, "err-user-not-found", "User profile not found")
				return
			}
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		response.Okf(c, http.StatusOK, userContracts.ToUserDTO(output.User))
	}
}
