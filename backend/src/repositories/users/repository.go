package users

import (
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UsersRepository struct {
	db     *pgxpool.Pool
	mu     sync.RWMutex
	memory map[string]UserDAO
}

func NewUsersRepository(db *pgxpool.Pool) *UsersRepository {
	repo := &UsersRepository{
		db:     db,
		memory: make(map[string]UserDAO),
	}

	// Seed in-memory initial admin user if no DB
	if db == nil {
		repo.seedInMemory()
	}

	return repo
}

func (r *UsersRepository) seedInMemory() {
	now := time.Now()
	r.memory["admin-1"] = UserDAO{
		ID:           "admin-1",
		Email:        "admin@lumina.com",
		PasswordHash: "$2a$10$7EqJtq98hPqEX7fNZaFWoOZhB7zG7tL8v6y9wQz5b2fV3oA9mQcZa", // "admin123"
		FullName:     "Administrador Lumina",
		Phone:        "+54 9 11 0000-0000",
		Role:         "admin",
		CreatedAt:    now,
		UpdatedAt:    now,
	}
}
