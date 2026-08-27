package users

import (
	"time"

	"ecommerce-ganador/backend/src/core/entities/users"
)

type UserDTO struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	FullName  string    `json:"full_name"`
	Phone     string    `json:"phone,omitempty"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

type RegisterResponse struct {
	User        UserDTO `json:"user"`
	AccessToken string  `json:"access_token"`
}

func ToUserDTO(u users.User) UserDTO {
	return UserDTO{
		ID:        u.ID,
		Email:     u.Email,
		FullName:  u.FullName,
		Phone:     u.Phone,
		Role:      string(u.Role),
		CreatedAt: u.CreatedAt,
	}
}
