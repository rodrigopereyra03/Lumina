package payments

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"ecommerce-ganador/backend/src/core/entities/payments"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PaymentDAO struct {
	ID               string    `db:"id"`
	OrderID          string    `db:"order_id"`
	PaymentMethod    string    `db:"payment_method"`
	GatewayName      string    `db:"gateway_name"`
	GatewayPaymentID string    `db:"gateway_payment_id"`
	Amount           float64   `db:"amount"`
	Status           string    `db:"status"`
	MetadataJSON     []byte    `db:"metadata"`
	CreatedAt        time.Time `db:"created_at"`
	UpdatedAt        time.Time `db:"updated_at"`
}

func (d PaymentDAO) ToEntity() payments.Payment {
	var meta map[string]any
	if len(d.MetadataJSON) > 0 {
		_ = json.Unmarshal(d.MetadataJSON, &meta)
	}

	return payments.Payment{
		ID:               d.ID,
		OrderID:          d.OrderID,
		PaymentMethod:    d.PaymentMethod,
		GatewayName:      d.GatewayName,
		GatewayPaymentID: d.GatewayPaymentID,
		Amount:           d.Amount,
		Status:           payments.PaymentStatus(d.Status),
		Metadata:         meta,
		CreatedAt:        d.CreatedAt,
		UpdatedAt:        d.UpdatedAt,
	}
}

type PaymentsRepository struct {
	db     *pgxpool.Pool
	mu     sync.RWMutex
	memory map[string]PaymentDAO
}

func NewPaymentsRepository(db *pgxpool.Pool) *PaymentsRepository {
	return &PaymentsRepository{
		db:     db,
		memory: make(map[string]PaymentDAO),
	}
}

func (r *PaymentsRepository) Create(ctx context.Context, payment payments.Payment) (payments.Payment, error) {
	if payment.ID == "" {
		payment.ID = uuid.NewString()
	}
	if payment.CreatedAt.IsZero() {
		payment.CreatedAt = time.Now()
	}
	payment.UpdatedAt = time.Now()

	metaBytes, _ := json.Marshal(payment.Metadata)
	dao := PaymentDAO{
		ID:               payment.ID,
		OrderID:          payment.OrderID,
		PaymentMethod:    payment.PaymentMethod,
		GatewayName:      payment.GatewayName,
		GatewayPaymentID: payment.GatewayPaymentID,
		Amount:           payment.Amount,
		Status:           string(payment.Status),
		MetadataJSON:     metaBytes,
		CreatedAt:        payment.CreatedAt,
		UpdatedAt:        payment.UpdatedAt,
	}

	if r.db == nil {
		r.mu.Lock()
		defer r.mu.Unlock()
		r.memory[dao.ID] = dao
		return dao.ToEntity(), nil
	}

	query := `
		INSERT INTO payments (id, order_id, payment_method, gateway_name, gateway_payment_id, amount, status, metadata, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, order_id, payment_method, gateway_name, gateway_payment_id, amount, status, metadata, created_at, updated_at
	`
	var created PaymentDAO
	err := r.db.QueryRow(ctx, query,
		dao.ID, dao.OrderID, dao.PaymentMethod, dao.GatewayName, dao.GatewayPaymentID, dao.Amount, dao.Status, dao.MetadataJSON, dao.CreatedAt, dao.UpdatedAt,
	).Scan(
		&created.ID, &created.OrderID, &created.PaymentMethod, &created.GatewayName, &created.GatewayPaymentID, &created.Amount, &created.Status, &created.MetadataJSON, &created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		return payments.Payment{}, fmt.Errorf("failed to insert payment: %w", err)
	}

	return created.ToEntity(), nil
}

func (r *PaymentsRepository) GetByID(ctx context.Context, id string) (payments.Payment, error) {
	if r.db == nil {
		r.mu.RLock()
		defer r.mu.RUnlock()
		if p, ok := r.memory[id]; ok {
			return p.ToEntity(), nil
		}
		return payments.Payment{}, fmt.Errorf("payment not found")
	}

	query := `SELECT id, order_id, payment_method, gateway_name, gateway_payment_id, amount, status, metadata, created_at, updated_at FROM payments WHERE id = $1`
	var dao PaymentDAO
	err := r.db.QueryRow(ctx, query, id).Scan(
		&dao.ID, &dao.OrderID, &dao.PaymentMethod, &dao.GatewayName, &dao.GatewayPaymentID, &dao.Amount, &dao.Status, &dao.MetadataJSON, &dao.CreatedAt, &dao.UpdatedAt,
	)
	if err != nil {
		return payments.Payment{}, fmt.Errorf("payment not found: %w", err)
	}

	return dao.ToEntity(), nil
}

func (r *PaymentsRepository) ListByOrderID(ctx context.Context, orderID string) ([]payments.Payment, error) {
	if r.db == nil {
		r.mu.RLock()
		defer r.mu.RUnlock()
		var list []payments.Payment
		for _, p := range r.memory {
			if p.OrderID == orderID {
				list = append(list, p.ToEntity())
			}
		}
		return list, nil
	}

	query := `SELECT id, order_id, payment_method, gateway_name, gateway_payment_id, amount, status, metadata, created_at, updated_at FROM payments WHERE order_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, orderID)
	if err != nil {
		return nil, fmt.Errorf("failed to list payments: %w", err)
	}
	defer rows.Close()

	var list []payments.Payment
	for rows.Next() {
		var dao PaymentDAO
		if err := rows.Scan(
			&dao.ID, &dao.OrderID, &dao.PaymentMethod, &dao.GatewayName, &dao.GatewayPaymentID, &dao.Amount, &dao.Status, &dao.MetadataJSON, &dao.CreatedAt, &dao.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, dao.ToEntity())
	}

	return list, nil
}
