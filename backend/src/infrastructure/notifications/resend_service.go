package notifications

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"sync"
	"time"

	"ecommerce-ganador/backend/src/core/entities/orders"
	"ecommerce-ganador/backend/src/core/entities/payments"
	"ecommerce-ganador/backend/src/core/providers/notifications"
)

type EmailJob struct {
	To      string
	Subject string
	HTML    string
}

type ResendEmailPayload struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	HTML    string   `json:"html"`
}

type ResendEmailResponse struct {
	ID string `json:"id"`
}

type ResendEmailService struct {
	httpClient *http.Client
	fromEmail  string
	apiKey     string
	queue      chan EmailJob
	stopSignal chan struct{}
	wg         sync.WaitGroup
}

func NewResendEmailService(apiKey, fromEmail string) *ResendEmailService {
	if fromEmail == "" {
		fromEmail = "Lumina Store <onboarding@resend.dev>"
	}

	service := &ResendEmailService{
		httpClient: &http.Client{Timeout: 10 * time.Second},
		fromEmail:  fromEmail,
		apiKey:     apiKey,
		queue:      make(chan EmailJob, 100),
		stopSignal: make(chan struct{}),
	}

	// Start asynchronous background workers (Goroutines)
	service.startWorkers(2)

	return service
}

func (s *ResendEmailService) startWorkers(workerCount int) {
	for i := 0; i < workerCount; i++ {
		s.wg.Add(1)
		go func(workerID int) {
			defer s.wg.Done()
			for {
				select {
				case <-s.stopSignal:
					return
				case job, ok := <-s.queue:
					if !ok {
						return
					}
					s.processJob(job)
				}
			}
		}(i + 1)
	}
}

func (s *ResendEmailService) processJob(job EmailJob) {
	if s.apiKey != "" {
		payload := ResendEmailPayload{
			From:    s.fromEmail,
			To:      []string{job.To},
			Subject: job.Subject,
			HTML:    job.HTML,
		}

		payloadBytes, err := json.Marshal(payload)
		if err != nil {
			slog.Error("Failed to marshal Resend payload", "error", err)
			return
		}

		req, err := http.NewRequestWithContext(
			context.Background(),
			http.MethodPost,
			"https://api.resend.com/emails",
			bytes.NewBuffer(payloadBytes),
		)
		if err != nil {
			slog.Error("Failed to create Resend HTTP request", "error", err)
			return
		}

		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.apiKey))
		req.Header.Set("Content-Type", "application/json")

		resp, err := s.httpClient.Do(req)
		if err != nil {
			slog.Error("Failed to send email via Resend API", "to", job.To, "subject", job.Subject, "error", err)
			return
		}
		defer resp.Body.Close()

		respBody, _ := io.ReadAll(resp.Body)
		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			var resendResp ResendEmailResponse
			_ = json.Unmarshal(respBody, &resendResp)
			slog.Info("Email successfully delivered via Resend", "to", job.To, "id", resendResp.ID, "subject", job.Subject)
		} else {
			slog.Warn("Resend API returned non-2xx status", "status", resp.StatusCode, "body", string(respBody))
		}
	} else {
		// Dev / Simulator mode when API key is not yet set in environment
		slog.Info("[RESEND SIMULATOR] Email sent asynchronously",
			"from", s.fromEmail,
			"to", job.To,
			"subject", job.Subject,
			"status", "simulated_success",
		)
	}
}

func (s *ResendEmailService) enqueue(job EmailJob) {
	select {
	case s.queue <- job:
		slog.Debug("Email job enqueued", "to", job.To, "subject", job.Subject)
	default:
		slog.Warn("Email queue is full, processing in dedicated fallback goroutine", "to", job.To)
		go s.processJob(job)
	}
}

// 1. Bienvenida
func (s *ResendEmailService) SendWelcomeEmail(ctx context.Context, to string, name string) error {
	html, err := RenderWelcomeEmail(name)
	if err != nil {
		return err
	}

	s.enqueue(EmailJob{
		To:      to,
		Subject: "¡Bienvenido a Lumina Store! ✨",
		HTML:    html,
	})
	return nil
}

// 2. Orden Creada
func (s *ResendEmailService) SendOrderCreatedEmail(ctx context.Context, to string, order orders.Order) error {
	html, err := RenderOrderCreatedEmail(order)
	if err != nil {
		return err
	}

	s.enqueue(EmailJob{
		To:      to,
		Subject: "Confirmación de Pedido " + order.OrderNumber + " 📦",
		HTML:    html,
	})
	return nil
}

// 3. Pago Aprobado
func (s *ResendEmailService) SendPaymentApprovedEmail(ctx context.Context, to string, order orders.Order, payment payments.Payment) error {
	html, err := RenderPaymentApprovedEmail(order, payment)
	if err != nil {
		return err
	}

	s.enqueue(EmailJob{
		To:      to,
		Subject: "¡Pago Aprobado para tu orden " + order.OrderNumber + "! ✅",
		HTML:    html,
	})
	return nil
}

// 4. Envío en Camino
func (s *ResendEmailService) SendShipmentDispatchedEmail(ctx context.Context, to string, order orders.Order, trackingCode string, courier string) error {
	html, err := RenderShipmentDispatchedEmail(order, trackingCode, courier)
	if err != nil {
		return err
	}

	s.enqueue(EmailJob{
		To:      to,
		Subject: "¡Tu pedido " + order.OrderNumber + " está en camino! 🚚",
		HTML:    html,
	})
	return nil
}

// Graceful Shutdown
func (s *ResendEmailService) Close() {
	close(s.stopSignal)
	close(s.queue)
	s.wg.Wait()
}

var _ notifications.EmailProvider = (*ResendEmailService)(nil)
