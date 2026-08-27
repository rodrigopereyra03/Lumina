package products

import (
	"context"
	"fmt"
	"strings"
	"time"

	"ecommerce-ganador/backend/src/core/entities/products"

	"github.com/google/uuid"
)

func (r *ProductsRepository) List(ctx context.Context, categorySlug string) ([]products.Product, error) {
	if r.db == nil {
		r.mu.RLock()
		defer r.mu.RUnlock()
		var list []products.Product
		for _, p := range r.memory {
			if p.DeletedAt == nil {
				if categorySlug != "" && categorySlug != "all" {
					if !strings.EqualFold(p.CategoryName, categorySlug) && !strings.Contains(strings.ToLower(p.CategoryName), strings.ToLower(categorySlug)) {
						continue
					}
				}
				list = append(list, p.ToEntity())
			}
		}
		return list, nil
	}

	query := `
		SELECT id, COALESCE(category_id::text, ''), '', title, subtitle, description, price, original_price, stock, image, rating, reviews_count, created_at, updated_at, deleted_at
		FROM products
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list products: %w", err)
	}
	defer rows.Close()

	var daos []ProductDAO
	for rows.Next() {
		var dao ProductDAO
		if err := rows.Scan(
			&dao.ID, &dao.CategoryID, &dao.CategoryName, &dao.Title, &dao.Subtitle, &dao.Description, &dao.Price, &dao.OriginalPrice, &dao.Stock, &dao.Image, &dao.Rating, &dao.ReviewsCount, &dao.CreatedAt, &dao.UpdatedAt, &dao.DeletedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan product: %w", err)
		}
		daos = append(daos, dao)
	}

	return ToEntities(daos), nil
}

func (r *ProductsRepository) GetByID(ctx context.Context, id string) (products.Product, error) {
	if r.db == nil {
		r.mu.RLock()
		defer r.mu.RUnlock()
		if p, ok := r.memory[id]; ok && p.DeletedAt == nil {
			return p.ToEntity(), nil
		}
		return products.Product{}, fmt.Errorf("product not found")
	}

	query := `
		SELECT id, COALESCE(category_id::text, ''), '', title, subtitle, description, price, original_price, stock, image, rating, reviews_count, created_at, updated_at, deleted_at
		FROM products
		WHERE id = $1 AND deleted_at IS NULL
	`
	var dao ProductDAO
	err := r.db.QueryRow(ctx, query, id).Scan(
		&dao.ID, &dao.CategoryID, &dao.CategoryName, &dao.Title, &dao.Subtitle, &dao.Description, &dao.Price, &dao.OriginalPrice, &dao.Stock, &dao.Image, &dao.Rating, &dao.ReviewsCount, &dao.CreatedAt, &dao.UpdatedAt, &dao.DeletedAt,
	)
	if err != nil {
		return products.Product{}, fmt.Errorf("product not found: %w", err)
	}

	return dao.ToEntity(), nil
}

func (r *ProductsRepository) Create(ctx context.Context, product products.Product) (products.Product, error) {
	if product.ID == "" {
		product.ID = uuid.NewString()
	}
	if product.CreatedAt.IsZero() {
		product.CreatedAt = time.Now()
	}
	product.UpdatedAt = time.Now()

	dao := ToDAO(product)

	if r.db == nil {
		r.mu.Lock()
		defer r.mu.Unlock()
		r.memory[dao.ID] = dao
		return dao.ToEntity(), nil
	}

	query := `
		INSERT INTO products (id, title, subtitle, description, price, original_price, stock, image, rating, reviews_count, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, title, subtitle, description, price, original_price, stock, image, rating, reviews_count, created_at, updated_at
	`
	var created ProductDAO
	err := r.db.QueryRow(ctx, query,
		dao.ID, dao.Title, dao.Subtitle, dao.Description, dao.Price, dao.OriginalPrice, dao.Stock, dao.Image, dao.Rating, dao.ReviewsCount, dao.CreatedAt, dao.UpdatedAt,
	).Scan(
		&created.ID, &created.Title, &created.Subtitle, &created.Description, &created.Price, &created.OriginalPrice, &created.Stock, &created.Image, &created.Rating, &created.ReviewsCount, &created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		return products.Product{}, fmt.Errorf("failed to create product in db: %w", err)
	}

	return created.ToEntity(), nil
}

func (r *ProductsRepository) Update(ctx context.Context, product products.Product) (products.Product, error) {
	product.UpdatedAt = time.Now()
	dao := ToDAO(product)

	if r.db == nil {
		r.mu.Lock()
		defer r.mu.Unlock()
		r.memory[dao.ID] = dao
		return dao.ToEntity(), nil
	}

	query := `
		UPDATE products
		SET title = $2, subtitle = $3, description = $4, price = $5, stock = $6, image = $7, updated_at = $8
		WHERE id = $1 AND deleted_at IS NULL
		RETURNING id, title, subtitle, description, price, stock, image, updated_at
	`
	var updated ProductDAO
	err := r.db.QueryRow(ctx, query,
		dao.ID, dao.Title, dao.Subtitle, dao.Description, dao.Price, dao.Stock, dao.Image, dao.UpdatedAt,
	).Scan(
		&updated.ID, &updated.Title, &updated.Subtitle, &updated.Description, &updated.Price, &updated.Stock, &updated.Image, &updated.UpdatedAt,
	)
	if err != nil {
		return products.Product{}, fmt.Errorf("failed to update product: %w", err)
	}

	return updated.ToEntity(), nil
}

func (r *ProductsRepository) Delete(ctx context.Context, id string) error {
	if r.db == nil {
		r.mu.Lock()
		defer r.mu.Unlock()
		now := time.Now()
		if p, ok := r.memory[id]; ok {
			p.DeletedAt = &now
			r.memory[id] = p
		}
		return nil
	}

	query := `UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
