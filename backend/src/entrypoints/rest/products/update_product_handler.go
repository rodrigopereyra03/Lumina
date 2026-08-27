package products

import (
	"errors"
	"net/http"

	"ecommerce-ganador/backend/packages/response"
	prodContracts "ecommerce-ganador/backend/src/core/contracts/products"
	prodUsecases "ecommerce-ganador/backend/src/core/usecases/products"

	"github.com/gin-gonic/gin"
)

type UpdateProductHandler struct {
	usecase prodUsecases.UpdateProduct
}

func NewUpdateProductHandler(usecase prodUsecases.UpdateProduct) UpdateProductHandler {
	return UpdateProductHandler{usecase: usecase}
}

func (h UpdateProductHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var req prodContracts.UpdateProductRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			response.Errf(c, http.StatusBadRequest, "err-invalid-payload", err.Error())
			return
		}

		output, err := h.usecase.Execute(c.Request.Context(), prodUsecases.UpdateProductInput{
			ID:            id,
			Title:         req.Title,
			Subtitle:      req.Subtitle,
			CategoryName:  req.CategoryName,
			Description:   req.Description,
			Price:         req.Price,
			OriginalPrice: req.OriginalPrice,
			Stock:         req.Stock,
			Image:         req.Image,
		})
		if err != nil {
			if errors.Is(err, prodUsecases.ErrProductNotFound) {
				response.Errf(c, http.StatusNotFound, "err-product-not-found", "Product not found")
				return
			}
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		response.Okf(c, http.StatusOK, prodContracts.ToProductDTO(output.Product))
	}
}

type DeleteProductHandler struct {
	usecase prodUsecases.DeleteProduct
}

func NewDeleteProductHandler(usecase prodUsecases.DeleteProduct) DeleteProductHandler {
	return DeleteProductHandler{usecase: usecase}
}

func (h DeleteProductHandler) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		err := h.usecase.Execute(c.Request.Context(), prodUsecases.DeleteProductInput{
			ID: id,
		})
		if err != nil {
			if errors.Is(err, prodUsecases.ErrProductNotFound) {
				response.Errf(c, http.StatusNotFound, "err-product-not-found", "Product not found")
				return
			}
			response.Errf(c, http.StatusInternalServerError, "err-internal-server", err.Error())
			return
		}

		response.Okf(c, http.StatusOK, gin.H{"message": "Product deleted successfully", "id": id})
	}
}
