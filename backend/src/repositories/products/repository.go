package products

import (
	"context"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type ProductsRepository struct {
	db     *pgxpool.Pool
	mu     sync.RWMutex
	memory map[string]ProductDAO
}

func NewProductsRepository(db *pgxpool.Pool) *ProductsRepository {
	repo := &ProductsRepository{
		db:     db,
		memory: make(map[string]ProductDAO), // Clean in-memory catalog
	}

	// If DB pool exists, clean only mock/demo products from PostgreSQL
	if db != nil {
		go func() {
			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()
			_, _ = db.Exec(ctx, `
				DELETE FROM products 
				WHERE id IN (
					'lumina-pro-camera', 'aura-headphones', 'lumina-smartwatch', 
					'minimalist-tote', 'echo-hub-speaker', 'zenith-mechanical-board', 
					'test-mp-10-ars', 'c0000001-0000-0000-0000-000000000001', 
					'c0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000003', 
					'c0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000005', 
					'c0000001-0000-0000-0000-000000000006'
				);
			`)
		}()
	}

	return repo
}
