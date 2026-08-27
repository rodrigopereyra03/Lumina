package categories

import (
	"context"
	"fmt"
	"sync"
	"time"

	"ecommerce-ganador/backend/src/core/entities/categories"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CategoriesRepository struct {
	db     *pgxpool.Pool
	mu     sync.RWMutex
	memory map[string]CategoryDAO
}

func NewCategoriesRepository(db *pgxpool.Pool) *CategoriesRepository {
	repo := &CategoriesRepository{
		db:     db,
		memory: make(map[string]CategoryDAO),
	}

	if db == nil {
		repo.seedInMemory()
	}

	return repo
}

func (r *CategoriesRepository) seedInMemory() {
	demoCats := []CategoryDAO{
		{ ID: "cat-1", Name: "Electrónica", Slug: "electronics", Icon: "devices", ProductsCount: 14, CreatedAt: time.Now(), UpdatedAt: time.Now() },
		{ ID: "cat-2", Name: "Moda", Slug: "fashion", Icon: "checkroom", ProductsCount: 12, CreatedAt: time.Now(), UpdatedAt: time.Now() },
		{ ID: "cat-3", Name: "Hogar & Confort", Slug: "home", Icon: "home", ProductsCount: 8, CreatedAt: time.Now(), UpdatedAt: time.Now() },
		{ ID: "cat-4", Name: "Belleza", Slug: "beauty", Icon: "spa", ProductsCount: 6, CreatedAt: time.Now(), UpdatedAt: time.Now() },
		{ ID: "cat-5", Name: "Deportes", Slug: "sports", Icon: "fitness_center", ProductsCount: 8, CreatedAt: time.Now(), UpdatedAt: time.Now() },
	}
	for _, c := range demoCats {
		r.memory[c.ID] = c
	}
}

func (r *CategoriesRepository) List(ctx context.Context) ([]categories.Category, error) {
	if r.db == nil {
		r.mu.RLock()
		defer r.mu.RUnlock()
		var list []categories.Category
		for _, c := range r.memory {
			if c.DeletedAt == nil {
				list = append(list, c.ToEntity())
			}
		}
		return list, nil
	}

	query := `
		SELECT id, name, slug, icon, 0 as products_count, created_at, updated_at, deleted_at
		FROM categories
		WHERE deleted_at IS NULL
		ORDER BY name ASC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list categories: %w", err)
	}
	defer rows.Close()

	var daos []CategoryDAO
	for rows.Next() {
		var dao CategoryDAO
		if err := rows.Scan(&dao.ID, &dao.Name, &dao.Slug, &dao.Icon, &dao.ProductsCount, &dao.CreatedAt, &dao.UpdatedAt, &dao.DeletedAt); err != nil {
			return nil, fmt.Errorf("failed to scan category: %w", err)
		}
		daos = append(daos, dao)
	}

	return ToEntities(daos), nil
}

func (r *CategoriesRepository) GetByID(ctx context.Context, id string) (categories.Category, error) {
	if r.db == nil {
		r.mu.RLock()
		defer r.mu.RUnlock()
		if c, ok := r.memory[id]; ok && c.DeletedAt == nil {
			return c.ToEntity(), nil
		}
		return categories.Category{}, fmt.Errorf("category not found")
	}

	query := `SELECT id, name, slug, icon, 0, created_at, updated_at, deleted_at FROM categories WHERE id = $1 AND deleted_at IS NULL`
	var dao CategoryDAO
	err := r.db.QueryRow(ctx, query, id).Scan(&dao.ID, &dao.Name, &dao.Slug, &dao.Icon, &dao.ProductsCount, &dao.CreatedAt, &dao.UpdatedAt, &dao.DeletedAt)
	if err != nil {
		return categories.Category{}, fmt.Errorf("category not found: %w", err)
	}

	return dao.ToEntity(), nil
}

func (r *CategoriesRepository) Create(ctx context.Context, category categories.Category) (categories.Category, error) {
	if category.ID == "" {
		category.ID = uuid.NewString()
	}
	if category.CreatedAt.IsZero() {
		category.CreatedAt = time.Now()
	}
	category.UpdatedAt = time.Now()
	dao := ToDAO(category)

	if r.db == nil {
		r.mu.Lock()
		defer r.mu.Unlock()
		r.memory[dao.ID] = dao
		return dao.ToEntity(), nil
	}

	query := `
		INSERT INTO categories (id, name, slug, icon, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, name, slug, icon, created_at, updated_at
	`
	var created CategoryDAO
	err := r.db.QueryRow(ctx, query, dao.ID, dao.Name, dao.Slug, dao.Icon, dao.CreatedAt, dao.UpdatedAt).Scan(
		&created.ID, &created.Name, &created.Slug, &created.Icon, &created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		return categories.Category{}, fmt.Errorf("failed to create category: %w", err)
	}

	return created.ToEntity(), nil
}
