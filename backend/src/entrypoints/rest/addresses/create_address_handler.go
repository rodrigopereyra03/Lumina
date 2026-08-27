package addresses

import (
	"net/http"

	"ecommerce-ganador/backend/packages/response"
	addrContracts "ecommerce-ganador/backend/src/core/contracts/addresses"
	addrUsecases "ecommerce-ganador/backend/src/core/usecases/addresses"

	"github.com/gin-gonic/gin"
)

type CreateAddressHandler struct {
	usecase addrUsecases.CreateAddress
}

func NewCreateAddressHandler(usecase addrUsecases.CreateAddress) CreateAddressHandler {
	return CreateAddressHandler{usecase: usecase}
}

func (h CreateAddressHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userId")
		if !exists {
			response.Errf(c, http.StatusUnauthorized, "err-unauthorized", "Unauthorized")
			return
		}

		var req addrContracts.CreateAddressRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			response.Errf(c, http.StatusBadRequest, "err-invalid-payload", err.Error())
			return
		}

		output, err := h.usecase.Execute(c.Request.Context(), req.ToInput(userID.(string)))
		if err != nil {
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		response.Okf(c, http.StatusCreated, addrContracts.ToAddressDTO(output.Address))
	}
}
