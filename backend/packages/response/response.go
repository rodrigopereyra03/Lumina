package response

import (
	"github.com/gin-gonic/gin"
)

type ErrorResponse struct {
	Code        string `json:"code"`
	Description string `json:"description"`
}

type SuccessResponse struct {
	Content any `json:"content"`
}

// Okf sends a normalized success response with { "content": <data> }
func Okf(c *gin.Context, status int, content any) {
	c.JSON(status, SuccessResponse{
		Content: content,
	})
}

// Errf sends a normalized error response with { "code": "...", "description": "..." }
func Errf(c *gin.Context, status int, code, description string) {
	c.JSON(status, ErrorResponse{
		Code:        code,
		Description: description,
	})
}
