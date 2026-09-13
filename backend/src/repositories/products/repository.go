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

	// If DB pool exists, wipe all test/demo products from PostgreSQL so store starts completely empty
	if db != nil {
		go func() {
			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()
			_, _ = db.Exec(ctx, "DELETE FROM products")
		}()
	}

	return repo
}
