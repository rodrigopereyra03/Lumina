package users

import (
	"errors"
	"net/http"

	userContracts "ecommerce-ganador/backend/src/core/contracts/users"
	userUsecases "ecommerce-ganador/backend/src/core/usecases/users"
	"ecommerce-ganador/backend/packages/response"

	"github.com/gin-gonic/gin"
)

type LoginUserHandler struct {
	usecase userUsecases.LoginUser
}

func NewLoginUserHandler(usecase userUsecases.LoginUser) LoginUserHandler {
	return LoginUserHandler{usecase: usecase}
}

func (h LoginUserHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req userContracts.LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			response.Errf(c, http.StatusBadRequest, "err-invalid-payload", err.Error())
			return
		}

		output, err := h.usecase.Execute(c.Request.Context(), req.ToInput())
		if err != nil {
			if errors.Is(err, userUsecases.ErrInvalidCredentials) {
				response.Errf(c, http.StatusUnauthorized, "err-invalid-credentials", "Invalid email or password")
				return
			}
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		// Set HTTP-only cookie for refresh token
		c.SetCookie("refresh_token", output.RefreshToken, int(7*24*3600), "/", "", false, true)

		resp := userContracts.LoginResponse{
			User:        userContracts.ToUserDTO(output.User),
			AccessToken: output.AccessToken,
		}

		response.Okf(c, http.StatusOK, resp)
	}
}
