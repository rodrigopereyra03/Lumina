package users

import (
	"sync"

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

	// Seed in-memory demo users if no DB
	if db == nil {
		repo.seedInMemory()
	}

	return repo
}

func (r *UsersRepository) seedInMemory() {
	r.memory["1"] = UserDAO{
		ID:           "1",
		Email:        "alex.morgan@example.com",
		PasswordHash: "$2a$10$7EqJtq98hPqEX7fNZaFWoOZhB7zG7tL8v6y9wQz5b2fV3oA9mQcZa", // "password123"
		FullName:     "Alex Morgan",
		Phone:        "+54 9 11 4455-6677",
		Role:         "premium",
	}
}
