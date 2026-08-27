package users

import (
	"net/http"

	"ecommerce-ganador/backend/packages/response"
	userContracts "ecommerce-ganador/backend/src/core/contracts/users"
	userUsecases "ecommerce-ganador/backend/src/core/usecases/users"

	"github.com/gin-gonic/gin"
)

type ListUsersHandler struct {
	usecase userUsecases.ListUsers
}

func NewListUsersHandler(usecase userUsecases.ListUsers) ListUsersHandler {
	return ListUsersHandler{usecase: usecase}
}

func (h ListUsersHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		output, err := h.usecase.Execute(c.Request.Context(), userUsecases.ListUsersInput{})
		if err != nil {
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		resp := userContracts.ListUsersResponse{
			Users: userContracts.ToUserDTOs(output.Users),
			Total: output.Total,
		}

		response.Okf(c, http.StatusOK, resp)
	}
}
