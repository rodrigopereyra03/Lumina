package users

import (
	"errors"
	"net/http"

	userContracts "ecommerce-ganador/backend/src/core/contracts/users"
	userUsecases "ecommerce-ganador/backend/src/core/usecases/users"
	"ecommerce-ganador/backend/packages/response"

	"github.com/gin-gonic/gin"
)

type RegisterUserHandler struct {
	usecase userUsecases.RegisterUser
}

func NewRegisterUserHandler(usecase userUsecases.RegisterUser) RegisterUserHandler {
	return RegisterUserHandler{usecase: usecase}
}

func (h RegisterUserHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req userContracts.RegisterRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			response.Errf(c, http.StatusBadRequest, "err-invalid-payload", err.Error())
			return
		}

		output, err := h.usecase.Execute(c.Request.Context(), req.ToInput())
		if err != nil {
			if errors.Is(err, userUsecases.ErrEmailAlreadyInUse) {
				response.Errf(c, http.StatusConflict, "err-email-already-registered", "Email is already registered")
				return
			}
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		resp := userContracts.RegisterResponse{
			User:        userContracts.ToUserDTO(output.User),
			AccessToken: output.AccessToken,
		}

		response.Okf(c, http.StatusCreated, resp)
	}
}
