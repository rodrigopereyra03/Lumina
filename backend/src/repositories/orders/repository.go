package orders

import (
	"context"
	"fmt"
	"sync"
	"time"

	"ecommerce-ganador/backend/src/core/entities/orders"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type OrdersRepository struct {
	db     *pgxpool.Pool
	mu     sync.RWMutex
	memory map[string]OrderDAO
}

func NewOrdersRepository(db *pgxpool.Pool) *OrdersRepository {
	repo := &OrdersRepository{
		db:     db,
		memory: make(map[string]OrderDAO),
	}

	return repo
}

func (r *OrdersRepository) Create(ctx context.Context, order orders.Order) (orders.Order, error) {
	if order.ID == "" {
		order.ID = uuid.NewString()
	}
	if order.CreatedAt.IsZero() {
		order.CreatedAt = time.Now()
	}
	order.UpdatedAt = time.Now()
	dao := ToDAO(order)

	if r.db == nil {
		r.mu.Lock()
		defer r.mu.Unlock()
		r.memory[dao.ID] = dao
		return dao.ToEntity(), nil
	}

	query := `
		INSERT INTO orders (id, user_id, order_number, customer_name, customer_email, customer_phone, shipping_address, status, subtotal, shipping_cost, total, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id, order_number, customer_name, customer_email, customer_phone, shipping_address, status, subtotal, shipping_cost, total, created_at, updated_at
	`
	var created OrderDAO
	err := r.db.QueryRow(ctx, query,
		dao.ID, dao.UserID, dao.OrderNumber, dao.CustomerName, dao.CustomerEmail, dao.CustomerPhone, dao.ShippingAddress, dao.Status, dao.Subtotal, dao.ShippingCost, dao.Total, dao.CreatedAt, dao.UpdatedAt,
	).Scan(
		&created.ID, &created.OrderNumber, &created.CustomerName, &created.CustomerEmail, &created.CustomerPhone, &created.ShippingAddress, &created.Status, &created.Subtotal, &created.ShippingCost, &created.Total, &created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		return orders.Order{}, fmt.Errorf("failed to create order in db: %w", err)
	}

	created.Items = dao.Items
	return created.ToEntity(), nil
}

func (r *OrdersRepository) GetByID(ctx context.Context, id string) (orders.Order, error) {
	if r.db == nil {
		r.mu.RLock()
		defer r.mu.RUnlock()
		if o, ok := r.memory[id]; ok && o.DeletedAt == nil {
			return o.ToEntity(), nil
		}
		for _, o := range r.memory {
			if o.OrderNumber == id && o.DeletedAt == nil {
				return o.ToEntity(), nil
			}
		}
		return orders.Order{}, fmt.Errorf("order not found")
	}

	query := `
		SELECT id, user_id::text, order_number, customer_name, customer_email, customer_phone, shipping_address, status, subtotal, shipping_cost, total, created_at, updated_at, deleted_at
		FROM orders
		WHERE (id = $1 OR order_number = $1) AND deleted_at IS NULL
	`
	var dao OrderDAO
	err := r.db.QueryRow(ctx, query, id).Scan(
		&dao.ID, &dao.UserID, &dao.OrderNumber, &dao.CustomerName, &dao.CustomerEmail, &dao.CustomerPhone, &dao.ShippingAddress, &dao.Status, &dao.Subtotal, &dao.ShippingCost, &dao.Total, &dao.CreatedAt, &dao.UpdatedAt, &dao.DeletedAt,
	)
	if err != nil {
		return orders.Order{}, fmt.Errorf("order not found: %w", err)
	}

	return dao.ToEntity(), nil
}

func (r *OrdersRepository) List(ctx context.Context, userID *string, status *string) ([]orders.Order, error) {
	if r.db == nil {
		r.mu.RLock()
		defer r.mu.RUnlock()
		var list []orders.Order
		for _, o := range r.memory {
			if o.DeletedAt == nil {
				if status != nil && *status != "" && *status != "Todas" && *status != "All" && o.Status != *status {
					continue
				}
				list = append(list, o.ToEntity())
			}
		}
		return list, nil
	}

	query := `
		SELECT id, user_id::text, order_number, customer_name, customer_email, customer_phone, shipping_address, status, subtotal, shipping_cost, total, created_at, updated_at, deleted_at
		FROM orders
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list orders: %w", err)
	}
	defer rows.Close()

	var daos []OrderDAO
	for rows.Next() {
		var dao OrderDAO
		if err := rows.Scan(
			&dao.ID, &dao.UserID, &dao.OrderNumber, &dao.CustomerName, &dao.CustomerEmail, &dao.CustomerPhone, &dao.ShippingAddress, &dao.Status, &dao.Subtotal, &dao.ShippingCost, &dao.Total, &dao.CreatedAt, &dao.UpdatedAt, &dao.DeletedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan order: %w", err)
		}
		daos = append(daos, dao)
	}

	return ToEntities(daos), nil
}

func (r *OrdersRepository) UpdateStatus(ctx context.Context, id string, status orders.Status) error {
	if r.db == nil {
		r.mu.Lock()
		defer r.mu.Unlock()
		if o, ok := r.memory[id]; ok {
			o.Status = string(status)
			o.UpdatedAt = time.Now()
			r.memory[id] = o
			return nil
		}
		for k, o := range r.memory {
			if o.OrderNumber == id {
				o.Status = string(status)
				o.UpdatedAt = time.Now()
				r.memory[k] = o
				return nil
			}
		}
		return fmt.Errorf("order not found")
	}

	query := `UPDATE orders SET status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 OR order_number = $1`
	_, err := r.db.Exec(ctx, query, id, string(status))
	return err
}
