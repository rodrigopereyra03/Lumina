package users

import (
	"ecommerce-ganador/backend/src/core/entities/users"
)

type ListUsersResponse struct {
	Users []UserDTO `json:"users"`
	Total int       `json:"total"`
}

func ToUserDTOs(us []users.User) []UserDTO {
	dtos := make([]UserDTO, len(us))
	for i, u := range us {
		dtos[i] = ToUserDTO(u)
	}
	return dtos
}
