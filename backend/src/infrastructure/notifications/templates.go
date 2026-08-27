package notifications

import (
	"bytes"
	"fmt"
	"html/template"

	"ecommerce-ganador/backend/src/core/entities/orders"
	"ecommerce-ganador/backend/src/core/entities/payments"
)

// Template 1: Email de Bienvenida (Warm Glass)
func RenderWelcomeEmail(name string) (string, error) {
	const tpl = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Lumina</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fbf9f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1b1c1c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fbf9f8; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Email Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 540px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); border: 1px solid #f0eae7;">
          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding: 28px 24px 20px; border-bottom: 1px solid #fbf4f2;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #FF4D4F; width: 28px; height: 28px; border-radius: 8px; text-align: center; vertical-align: middle; color: #ffffff; font-weight: bold; font-size: 16px;">✦</td>
                  <td style="padding-left: 10px; font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: #1b1c1c;">Lumina Store</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Image -->
          <tr>
            <td align="center" style="padding: 0;">
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80" alt="Lumina Lifestyle" style="width: 100%; max-height: 220px; object-fit: cover; display: block;">
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px; text-align: center;">
              <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 800; color: #1b1c1c; letter-spacing: -0.4px;">
                ¡Bienvenido a nuestra comunidad, {{.Name}}!
              </h1>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #5b403e;">
                Estamos encantados de tenerte aquí. Prepárate para descubrir una selección exclusiva de productos de alta gama y diseño curado especialmente para elevar tu estilo de vida.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #FF4D4F;">
                    <a href="http://localhost:5173" target="_blank" style="font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; padding: 14px 28px; display: inline-block; border-radius: 12px;">
                      Explorar la Tienda &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Info -->
          <tr>
            <td style="padding: 20px 32px 30px; text-align: center; border-top: 1px solid #fbf4f2; background-color: #fcfbfa;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #8e7a78;">
                ¿Tienes dudas o necesitas ayuda? Escríbenos a <a href="mailto:soporte@lumina.com" style="color: #FF4D4F; text-decoration: none; font-weight: 600;">soporte@lumina.com</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #b5a8a6;">
                &copy; 2026 Lumina Store. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
	t, err := template.New("welcome").Parse(tpl)
	if err != nil {
		return "", err
	}
	var buf bytes.Buffer
	if err := t.Execute(&buf, map[string]string{"Name": name}); err != nil {
		return "", err
	}
	return buf.String(), nil
}

// Template 2: Email de Orden Creada (Warm Glass)
func RenderOrderCreatedEmail(order orders.Order) (string, error) {
	const tpl = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pedido Recibido</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fbf9f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1b1c1c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fbf9f8; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); border: 1px solid #f0eae7;">
          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding: 28px 24px 16px;">
              <div style="width: 48px; height: 48px; border-radius: 16px; background-color: #fff1f0; margin: 0 auto 12px; text-align: center; line-height: 48px; font-size: 22px;">📦</div>
              <h1 style="margin: 0 0 6px; font-size: 20px; font-weight: 800; color: #1b1c1c;">Tu pedido ha sido recibido</h1>
              <p style="margin: 0; font-size: 13px; color: #5b403e;">
                Orden <strong style="color: #1b1c1c;">{{.OrderNumber}}</strong> &bull; <span style="background-color: #fff1f0; color: #FF4D4F; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 11px;">En Proceso</span>
              </p>
            </td>
          </tr>

          <!-- Items List -->
          <tr>
            <td style="padding: 16px 28px 8px;">
              <h3 style="margin: 0 0 12px; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #8e7a78;">Resumen del Pedido</h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
                {{range .Items}}
                <tr style="border-bottom: 1px solid #f6f2f0;">
                  <td style="padding: 10px 0; width: 44px;">
                    <img src="{{.Image}}" alt="{{.Title}}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;">
                  </td>
                  <td style="padding: 10px 12px;">
                    <div style="font-size: 13px; font-weight: 700; color: #1b1c1c;">{{.Title}}</div>
                    <div style="font-size: 11px; color: #8e7a78;">Cant: {{.Quantity}} {{if .Variant}}&bull; {{.Variant}}{{end}}</div>
                  </td>
                  <td align="right" style="padding: 10px 0; font-size: 13px; font-weight: 700; color: #1b1c1c;">
                    ${{printf "%.2f" .UnitPrice}}
                  </td>
                </tr>
                {{end}}
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding: 12px 28px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px; color: #5b403e;">
                <tr>
                  <td style="padding: 4px 0;">Subtotal</td>
                  <td align="right" style="font-weight: 600; color: #1b1c1c;">${{printf "%.2f" .Subtotal}}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;">Envío</td>
                  <td align="right" style="font-weight: 600; color: #1b1c1c;">{{if eq .ShippingCost 0.0}}Gratis{{else}}${{printf "%.2f" .ShippingCost}}{{end}}</td>
                </tr>
                <tr style="border-top: 1px solid #f0eae7;">
                  <td style="padding: 10px 0 0; font-size: 15px; font-weight: 800; color: #1b1c1c;">Total</td>
                  <td align="right" style="padding: 10px 0 0; font-size: 18px; font-weight: 800; color: #FF4D4F;">${{printf "%.2f" .Total}}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 28px 24px; text-align: center; border-top: 1px solid #fbf4f2; background-color: #fcfbfa;">
              <p style="margin: 0; font-size: 11px; color: #b5a8a6;">
                Enviaremos una notificación en cuanto tu pago sea acreditado y tu pedido sea despachado.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
	t, err := template.New("order_created").Parse(tpl)
	if err != nil {
		return "", err
	}
	var buf bytes.Buffer
	if err := t.Execute(&buf, order); err != nil {
		return "", err
	}
	return buf.String(), nil
}

// Template 3: Email de Pago Aprobado (Warm Glass)
func RenderPaymentApprovedEmail(order orders.Order, payment payments.Payment) (string, error) {
	const tpl = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pago Aprobado</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fbf9f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1b1c1c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fbf9f8; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); border: 1px solid #f0eae7;">
          <!-- Success Check Icon -->
          <tr>
            <td align="center" style="padding: 32px 24px 16px;">
              <div style="width: 52px; height: 52px; border-radius: 50%; background-color: #E8F8F0; margin: 0 auto 14px; text-align: center; line-height: 52px; font-size: 26px; color: #1E824C;">✓</div>
              <h1 style="margin: 0 0 6px; font-size: 22px; font-weight: 800; color: #1b1c1c;">¡Tu pago ha sido aprobado!</h1>
              <p style="margin: 0; font-size: 13px; color: #5b403e;">
                Estamos preparando tu pedido para enviarlo lo antes posible.
              </p>
            </td>
          </tr>

          <!-- Summary Box (2 columns) -->
          <tr>
            <td style="padding: 12px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fcfbfa; border-radius: 14px; padding: 14px 18px; border: 1px solid #f2ece9;">
                <tr>
                  <td width="50%" valign="top" style="padding-right: 10px;">
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #8e7a78; margin-bottom: 4px;">Resumen de Orden</div>
                    <div style="font-size: 13px; font-weight: 700; color: #1b1c1c;">{{.Order.OrderNumber}}</div>
                    <div style="font-size: 13px; color: #1E824C; font-weight: 800; margin-top: 4px;">Total Pagado: ${{printf "%.2f" .Order.Total}}</div>
                  </td>
                  <td width="50%" valign="top" style="border-left: 1px solid #ede5e2; padding-left: 14px;">
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #8e7a78; margin-bottom: 4px;">Destinatario</div>
                    <div style="font-size: 13px; font-weight: 700; color: #1b1c1c;">{{.Order.CustomerName}}</div>
                    <div style="font-size: 12px; color: #5b403e;">{{.Order.ShippingAddress}}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 24px 28px 28px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #FF4D4F;">
                    <a href="http://localhost:5173" target="_blank" style="font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; padding: 12px 28px; display: inline-block; border-radius: 12px;">
                      Ver mi Pedido &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 28px 24px; text-align: center; border-top: 1px solid #fbf4f2; background-color: #fcfbfa;">
              <p style="margin: 0; font-size: 11px; color: #b5a8a6;">
                Transacción ID: {{.Payment.GatewayPaymentID}} &bull; Pasarela: {{.Payment.GatewayName}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
	t, err := template.New("payment_approved").Parse(tpl)
	if err != nil {
		return "", err
	}
	var buf bytes.Buffer
	data := map[string]any{
		"Order":   order,
		"Payment": payment,
	}
	if err := t.Execute(&buf, data); err != nil {
		return "", err
	}
	return buf.String(), nil
}

// Template 4: Email de Envío en Camino (Warm Glass)
func RenderShipmentDispatchedEmail(order orders.Order, trackingCode string, courier string) (string, error) {
	const tpl = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pedido en Camino</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fbf9f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1b1c1c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fbf9f8; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); border: 1px solid #f0eae7;">
          <!-- Header Truck Icon -->
          <tr>
            <td align="center" style="padding: 32px 24px 16px;">
              <div style="width: 52px; height: 52px; border-radius: 16px; background-color: #fff1f0; margin: 0 auto 14px; text-align: center; line-height: 52px; font-size: 26px;">🚚</div>
              <h1 style="margin: 0 0 6px; font-size: 22px; font-weight: 800; color: #1b1c1c;">¡Tu pedido está en camino!</h1>
              <p style="margin: 0; font-size: 13px; color: #5b403e;">
                Buenas noticias: hemos entregado tu paquete al transportista.
              </p>
            </td>
          </tr>

          <!-- Tracking Details Box -->
          <tr>
            <td style="padding: 12px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fcfbfa; border-radius: 14px; padding: 16px 20px; border: 1px solid #f2ece9;">
                <tr>
                  <td width="50%" valign="top">
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #8e7a78; margin-bottom: 4px;">Transportista</div>
                    <div style="font-size: 14px; font-weight: 700; color: #1b1c1c;">{{.Courier}}</div>
                  </td>
                  <td width="50%" valign="top" align="right">
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #8e7a78; margin-bottom: 4px;">Nº de Seguimiento</div>
                    <div style="font-size: 14px; font-family: monospace; font-weight: 700; color: #FF4D4F;">{{.TrackingCode}}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery Address -->
          <tr>
            <td style="padding: 10px 28px 20px; font-size: 13px; color: #5b403e;">
              <strong>Dirección de Destino:</strong> {{.Order.ShippingAddress}}
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 10px 28px 28px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #FF4D4F;">
                    <a href="http://localhost:5173" target="_blank" style="font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; padding: 12px 28px; display: inline-block; border-radius: 12px;">
                      Rastrear Envío &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 28px 24px; text-align: center; border-top: 1px solid #fbf4f2; background-color: #fcfbfa;">
              <p style="margin: 0; font-size: 11px; color: #b5a8a6;">
                Si tienes alguna consulta sobre tu entrega, contáctanos a soporte@lumina.com indicando tu orden {{.Order.OrderNumber}}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
	t, err := template.New("shipment_dispatched").Parse(tpl)
	if err != nil {
		return "", err
	}
	var buf bytes.Buffer
	data := map[string]any{
		"Order":        order,
		"TrackingCode": trackingCode,
		"Courier":      courier,
	}
	if err := t.Execute(&buf, data); err != nil {
		return "", err
	}
	return buf.String(), nil
}

func FormatMoney(amount float64) string {
	return fmt.Sprintf("$%.2f", amount)
}
