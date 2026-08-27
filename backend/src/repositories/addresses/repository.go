package addresses

import (
	"context"
	"fmt"
	"sync"
	"time"

	"ecommerce-ganador/backend/src/core/entities/addresses"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AddressDAO struct {
	ID             string     `db:"id"`
	UserID         string     `db:"user_id"`
	Title          string     `db:"title"`
	RecipientName  string     `db:"recipient_name"`
	RecipientPhone string     `db:"recipient_phone"`
	StreetAddress  string     `db:"street_address"`
	City           string     `db:"city"`
	State          string     `db:"state"`
	PostalCode     string     `db:"postal_code"`
	IsDefault      bool       `db:"is_default"`
	CreatedAt      time.Time  `db:"created_at"`
	UpdatedAt      time.Time  `db:"updated_at"`
	DeletedAt      *time.Time `db:"deleted_at"`
}

func (d AddressDAO) ToEntity() addresses.Address {
	return addresses.Address{
		ID:             d.ID,
		UserID:         d.UserID,
		Title:          d.Title,
		RecipientName:  d.RecipientName,
		RecipientPhone: d.RecipientPhone,
		StreetAddress:  d.StreetAddress,
		City:           d.City,
		State:          d.State,
		PostalCode:     d.PostalCode,
		IsDefault:      d.IsDefault,
		CreatedAt:      d.CreatedAt,
		UpdatedAt:      d.UpdatedAt,
		DeletedAt:      d.DeletedAt,
	}
}

func ToDAO(a addresses.Address) AddressDAO {
	return AddressDAO{
		ID:             a.ID,
		UserID:         a.UserID,
		Title:          a.Title,
		RecipientName:  a.RecipientName,
		RecipientPhone: a.RecipientPhone,
		StreetAddress:  a.StreetAddress,
		City:           a.City,
		State:          a.State,
		PostalCode:     a.PostalCode,
		IsDefault:      a.IsDefault,
		CreatedAt:      a.CreatedAt,
		UpdatedAt:      a.UpdatedAt,
		DeletedAt:      a.DeletedAt,
	}
}

func ToEntities(daos []AddressDAO) []addresses.Address {
	entities := make([]addresses.Address, len(daos))
	for i, d := range daos {
		entities[i] = d.ToEntity()
	}
	return entities
}

type AddressesRepository struct {
	db     *pgxpool.Pool
	mu     sync.RWMutex
	memory map[string]AddressDAO
}

func NewAddressesRepository(db *pgxpool.Pool) *AddressesRepository {
	repo := &AddressesRepository{
		db:     db,
		memory: make(map[string]AddressDAO),
	}

	if db == nil {
		repo.seedInMemory()
	}

	return repo
}

func (r *AddressesRepository) seedInMemory() {
	r.memory["addr-1"] = AddressDAO{
		ID:             "addr-1",
		UserID:         "b0000001-0000-0000-0000-000000000002",
		Title:          "Casa Principal",
		RecipientName:  "Alex Morgan",
		RecipientPhone: "+54 9 11 4455-6677",
		StreetAddress:  "Av. Libertador 2450, Piso 8",
		City:           "Buenos Aires",
		State:          "CABA",
		PostalCode:     "C1425",
		IsDefault:      true,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
}

func (r *AddressesRepository) Create(ctx context.Context, address addresses.Address) (addresses.Address, error) {
	if address.ID == "" {
		address.ID = uuid.NewString()
	}
	if address.CreatedAt.IsZero() {
		address.CreatedAt = time.Now()
	}
	address.UpdatedAt = time.Now()
	dao := ToDAO(address)

	if r.db == nil {
		r.mu.Lock()
		defer r.mu.Unlock()
		r.memory[dao.ID] = dao
		return dao.ToEntity(), nil
	}

	query := `
		INSERT INTO user_addresses (id, user_id, title, recipient_name, recipient_phone, street_address, city, state, postal_code, is_default, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, user_id, title, recipient_name, recipient_phone, street_address, city, state, postal_code, is_default, created_at, updated_at
	`
	var created AddressDAO
	err := r.db.QueryRow(ctx, query,
		dao.ID, dao.UserID, dao.Title, dao.RecipientName, dao.RecipientPhone, dao.StreetAddress, dao.City, dao.State, dao.PostalCode, dao.IsDefault, dao.CreatedAt, dao.UpdatedAt,
	).Scan(
		&created.ID, &created.UserID, &created.Title, &created.RecipientName, &created.RecipientPhone, &created.StreetAddress, &created.City, &created.State, &created.PostalCode, &created.IsDefault, &created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		return addresses.Address{}, fmt.Errorf("failed to insert address: %w", err)
	}

	return created.ToEntity(), nil
}

func (r *AddressesRepository) ListByUserID(ctx context.Context, userID string) ([]addresses.Address, error) {
	if r.db == nil {
		r.mu.RLock()
		defer r.mu.RUnlock()
		var list []addresses.Address
		for _, a := range r.memory {
			if a.DeletedAt == nil {
				list = append(list, a.ToEntity())
			}
		}
		return list, nil
	}

	query := `
		SELECT id, user_id, title, recipient_name, recipient_phone, street_address, city, state, postal_code, is_default, created_at, updated_at, deleted_at
		FROM user_addresses
		WHERE user_id = $1 AND deleted_at IS NULL
		ORDER BY is_default DESC, created_at DESC
	`
	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list addresses: %w", err)
	}
	defer rows.Close()

	var daos []AddressDAO
	for rows.Next() {
		var dao AddressDAO
		if err := rows.Scan(
			&dao.ID, &dao.UserID, &dao.Title, &dao.RecipientName, &dao.RecipientPhone, &dao.StreetAddress, &dao.City, &dao.State, &dao.PostalCode, &dao.IsDefault, &dao.CreatedAt, &dao.UpdatedAt, &dao.DeletedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan address: %w", err)
		}
		daos = append(daos, dao)
	}

	return ToEntities(daos), nil
}

func (r *AddressesRepository) Delete(ctx context.Context, id string, userID string) error {
	if r.db == nil {
		r.mu.Lock()
		defer r.mu.Unlock()
		delete(r.memory, id)
		return nil
	}

	query := `UPDATE user_addresses SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2`
	_, err := r.db.Exec(ctx, query, id, userID)
	return err
}
