package users

import (
	userUsecases "ecommerce-ganador/backend/src/core/usecases/users"
)

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (r LoginRequest) ToInput() userUsecases.LoginUserInput {
	return userUsecases.LoginUserInput{
		Email:    r.Email,
		Password: r.Password,
	}
}
