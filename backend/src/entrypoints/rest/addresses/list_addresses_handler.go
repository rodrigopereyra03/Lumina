package addresses

import (
	"net/http"

	"ecommerce-ganador/backend/packages/response"
	addrContracts "ecommerce-ganador/backend/src/core/contracts/addresses"
	addrUsecases "ecommerce-ganador/backend/src/core/usecases/addresses"

	"github.com/gin-gonic/gin"
)

type ListAddressesHandler struct {
	usecase addrUsecases.ListAddresses
}

func NewListAddressesHandler(usecase addrUsecases.ListAddresses) ListAddressesHandler {
	return ListAddressesHandler{usecase: usecase}
}

func (h ListAddressesHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userId")
		if !exists {
			response.Errf(c, http.StatusUnauthorized, "err-unauthorized", "Unauthorized")
			return
		}

		output, err := h.usecase.Execute(c.Request.Context(), addrUsecases.ListAddressesInput{
			UserID: userID.(string),
		})
		if err != nil {
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		resp := addrContracts.ListAddressesResponse{
			Addresses: addrContracts.ToAddressDTOs(output.Addresses),
		}

		response.Okf(c, http.StatusOK, resp)
	}
}
