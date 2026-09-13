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

	repo.seedInMemory()

	if db != nil {
		go func() {
			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()

			// Clean old electronics categories and ensure "Perfumes" exists
			_, _ = db.Exec(ctx, `
				DELETE FROM categories WHERE slug IN ('electronics', 'fashion', 'home', 'sports');
				INSERT INTO categories (id, name, slug, icon, created_at, updated_at)
				VALUES ('a0000001-0000-0000-0000-000000000001', 'Perfumes', 'perfumes', 'spa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
				ON CONFLICT (slug) DO NOTHING;
			`)
		}()
	}

	return repo
}

func (r *CategoriesRepository) seedInMemory() {
	demoCats := []CategoryDAO{
		{
			ID:            "cat-perfumes",
			Name:          "Perfumes",
			Slug:          "perfumes",
			Icon:          "spa",
			ProductsCount: 0,
			CreatedAt:     time.Now(),
			UpdatedAt:     time.Now(),
		},
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

	if len(daos) == 0 {
		// Fallback in-memory category
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
	now := time.Now()
	category.CreatedAt = now
	category.UpdatedAt = now

	if r.db == nil {
		r.mu.Lock()
		defer r.mu.Unlock()
		r.memory[category.ID] = ToDAO(category)
		return category, nil
	}

	query := `
		INSERT INTO categories (id, name, slug, icon, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.Exec(ctx, query, category.ID, category.Name, category.Slug, category.Icon, category.CreatedAt, category.UpdatedAt)
	if err != nil {
		return categories.Category{}, fmt.Errorf("failed to create category: %w", err)
	}

	return category, nil
}
