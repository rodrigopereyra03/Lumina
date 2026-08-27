package users

import (
	"context"
	"fmt"

	"ecommerce-ganador/backend/src/core/entities/users"
)

func (r *UsersRepository) GetByEmail(ctx context.Context, email string) (users.User, error) {
	if r.db == nil {
		r.mu.RLock()
		defer r.mu.RUnlock()
		for _, u := range r.memory {
			if u.Email == email && u.DeletedAt == nil {
				return u.ToEntity(), nil
			}
		}
		return users.User{}, fmt.Errorf("user not found")
	}

	query := `
		SELECT id, email, password_hash, full_name, phone, role, created_at, updated_at, deleted_at
		FROM users
		WHERE email = $1 AND deleted_at IS NULL
	`
	var dao UserDAO
	err := r.db.QueryRow(ctx, query, email).Scan(
		&dao.ID, &dao.Email, &dao.PasswordHash, &dao.FullName, &dao.Phone, &dao.Role, &dao.CreatedAt, &dao.UpdatedAt, &dao.DeletedAt,
	)
	if err != nil {
		return users.User{}, fmt.Errorf("user not found: %w", err)
	}

	return dao.ToEntity(), nil
}

func (r *UsersRepository) GetByID(ctx context.Context, id string) (users.User, error) {
	if r.db == nil {
		r.mu.RLock()
		defer r.mu.RUnlock()
		if u, ok := r.memory[id]; ok && u.DeletedAt == nil {
			return u.ToEntity(), nil
		}
		return users.User{}, fmt.Errorf("user not found")
	}

	query := `
		SELECT id, email, password_hash, full_name, phone, role, created_at, updated_at, deleted_at
		FROM users
		WHERE id = $1 AND deleted_at IS NULL
	`
	var dao UserDAO
	err := r.db.QueryRow(ctx, query, id).Scan(
		&dao.ID, &dao.Email, &dao.PasswordHash, &dao.FullName, &dao.Phone, &dao.Role, &dao.CreatedAt, &dao.UpdatedAt, &dao.DeletedAt,
	)
	if err != nil {
		return users.User{}, fmt.Errorf("user not found: %w", err)
	}

	return dao.ToEntity(), nil
}

func (r *UsersRepository) List(ctx context.Context) ([]users.User, error) {
	if r.db == nil {
		r.mu.RLock()
		defer r.mu.RUnlock()
		var list []users.User
		for _, u := range r.memory {
			if u.DeletedAt == nil {
				list = append(list, u.ToEntity())
			}
		}
		return list, nil
	}

	query := `
		SELECT id, email, password_hash, full_name, phone, role, created_at, updated_at, deleted_at
		FROM users
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()

	var daos []UserDAO
	for rows.Next() {
		var dao UserDAO
		if err := rows.Scan(
			&dao.ID, &dao.Email, &dao.PasswordHash, &dao.FullName, &dao.Phone, &dao.Role, &dao.CreatedAt, &dao.UpdatedAt, &dao.DeletedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		daos = append(daos, dao)
	}

	return ToEntities(daos), nil
}
