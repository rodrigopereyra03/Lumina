package users

import (
	userUsecases "ecommerce-ganador/backend/src/core/usecases/users"
)

type RegisterRequest struct {
	FullName string `json:"full_name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Phone    string `json:"phone,omitempty"`
}

func (r RegisterRequest) ToInput() userUsecases.RegisterUserInput {
	return userUsecases.RegisterUserInput{
		FullName: r.FullName,
		Email:    r.Email,
		Password: r.Password,
		Phone:    r.Phone,
	}
}
