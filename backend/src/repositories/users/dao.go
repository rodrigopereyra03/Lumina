package users

import (
	"time"

	"ecommerce-ganador/backend/src/core/entities/users"
)

type UserDAO struct {
	ID           string     `db:"id"`
	Email        string     `db:"email"`
	PasswordHash string     `db:"password_hash"`
	FullName     string     `db:"full_name"`
	Phone        string     `db:"phone"`
	Role         string     `db:"role"`
	CreatedAt    time.Time  `db:"created_at"`
	UpdatedAt    time.Time  `db:"updated_at"`
	DeletedAt    *time.Time `db:"deleted_at"`
}

func (d UserDAO) ToEntity() users.User {
	return users.User{
		ID:           d.ID,
		Email:        d.Email,
		PasswordHash: d.PasswordHash,
		FullName:     d.FullName,
		Phone:        d.Phone,
		Role:         users.Role(d.Role),
		CreatedAt:    d.CreatedAt,
		UpdatedAt:    d.UpdatedAt,
		DeletedAt:    d.DeletedAt,
	}
}

func ToDAO(u users.User) UserDAO {
	return UserDAO{
		ID:           u.ID,
		Email:        u.Email,
		PasswordHash: u.PasswordHash,
		FullName:     u.FullName,
		Phone:        u.Phone,
		Role:         string(u.Role),
		CreatedAt:    u.CreatedAt,
		UpdatedAt:    u.UpdatedAt,
		DeletedAt:    u.DeletedAt,
	}
}

func ToEntities(daos []UserDAO) []users.User {
	entities := make([]users.User, len(daos))
	for i, d := range daos {
		entities[i] = d.ToEntity()
	}
	return entities
}
