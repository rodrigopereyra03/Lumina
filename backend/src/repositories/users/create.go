package users

import (
	"context"
	"fmt"
	"time"

	"ecommerce-ganador/backend/src/core/entities/users"

	"github.com/google/uuid"
)

func (r *UsersRepository) Create(ctx context.Context, user users.User) (users.User, error) {
	if user.ID == "" {
		user.ID = uuid.NewString()
	}
	if user.CreatedAt.IsZero() {
		user.CreatedAt = time.Now()
	}
	user.UpdatedAt = time.Now()

	dao := ToDAO(user)

	if r.db == nil {
		r.mu.Lock()
		defer r.mu.Unlock()
		r.memory[dao.ID] = dao
		return dao.ToEntity(), nil
	}

	query := `
		INSERT INTO users (id, email, password_hash, full_name, phone, role, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, email, password_hash, full_name, phone, role, created_at, updated_at
	`
	var created UserDAO
	err := r.db.QueryRow(ctx, query,
		dao.ID, dao.Email, dao.PasswordHash, dao.FullName, dao.Phone, dao.Role, dao.CreatedAt, dao.UpdatedAt,
	).Scan(
		&created.ID, &created.Email, &created.PasswordHash, &created.FullName, &created.Phone, &created.Role, &created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		return users.User{}, fmt.Errorf("postgres error creating user: %w", err)
	}

	return created.ToEntity(), nil
}
