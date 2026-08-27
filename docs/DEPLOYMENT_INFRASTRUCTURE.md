# ☁️ Infraestructura & Despliegue — Lumina E-Commerce

Este documento describe la arquitectura de infraestructura, proveedores en la nube y configuración de despliegue para la plataforma **Lumina Store & Admin Panel**.

---

## 🗺️ Mapa de Infraestructura

```
                                  ┌────────────────────────┐
                                  │   USUARIO / CLIENTE    │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                        ┌───────────────────────────────────────────┐
                        │         CLOUDFLARE PAGES (EDGE)           │
                        │   • Frontend React 19 + Vite + Tailwind   │
                        │   • Dominio Global con CDN y SSL          │
                        │   • Reglas SPA vía `_redirects`           │
                        └─────────────────────┬─────────────────────┘
                                              │
                                              │ Peticiones API REST
                                              ▼
                        ┌───────────────────────────────────────────┐
                        │             BACKEND GO 1.25               │
                        │   • Clean Architecture & Gin Framework    │
                        │   • Autenticación JWT + Bcrypt            │
                        │   • Despacho Asíncrono Resend (Goroutines)│
                        └─────────────────────┬─────────────────────┘
                                              │
                                              │ Connection Pooling (pgxpool)
                                              ▼
                        ┌───────────────────────────────────────────┐
                        │          SUPABASE (POSTGRESQL 16)         │
                        │   • Instancia Cloud: `Lumina-bd`          │
                        │   • Tablas: users, products, orders...    │
                        │   • Persistencia Permanente en Disco      │
                        └───────────────────────────────────────────┘
```

---

## 🌐 1. Frontend — Cloudflare Pages

El frontend de la tienda y el panel de administración se despliegan sobre la red perimetral (Edge) de **Cloudflare Pages**.

### Características Principales:
- **Repositorio Conectado:** `https://github.com/rodrigopereyra03/Lumina` (rama `main`).
- **CI/CD Automático:** Cada `git push origin main` compila y despliega la aplicación automáticamente en segundos.
- **Enrutamiento SPA (Single Page Application):** Se incluye el archivo [`frontend/public/_redirects`](file:///c:/Users/Usuario/Documents/Rodrigo/Ecommerce%20Ganador/frontend/public/_redirects) (`/* /index.html 200`) para garantizar que rutas profundas como `/admin`, `/login`, o `/profile` no den error 404 al recargar.

### Configuración en Cloudflare Pages:
| Parámetro | Valor Configurado |
| :--- | :--- |
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Build Output Directory** | `dist` |
| **Root Directory (Advanced)** | `frontend` |
| **Entorno Node.js** | Node.js 22 LTS / npm 10 |

---

## 🗄️ 2. Base de Datos & Persistencia — Supabase PostgreSQL

La base de datos relacional de producción reside en **Supabase** bajo un motor PostgreSQL 16.

### Características Principales:
- **Proyecto:** `Lumina-bd` (Región: `us-east-1`).
- **Host de Conexión:** `db.dxxoxzaowyaxpxphqpsd.supabase.co:5432`.
- **Conector en Backend:** Driver nativo de alto rendimiento `pgxpool` en Go con configuración de pool de conexiones:
  - `MaxConns`: 25
  - `MinConns`: 5
  - `MaxConnLifetime`: 1 hora
  - `MaxConnIdleTime`: 30 minutos

### Modelo de Seguridad & RLS:
- Las tablas se inicializan con **"Ejecutar sin RLS"** (o RLS gestionado internamente) dado que el acceso a la base de datos se realiza **únicamente** a través del Backend en Go.
- La capa de aplicación en Go valida los tokens JWT, roles de administrador (`admin` vs `customer`), hashes `bcrypt` y lógica de negocio antes de consultar la base de datos.

### Tablas Inicializadas ([`backend/db/supabase_init.sql`](file:///c:/Users/Usuario/Documents/Rodrigo/Ecommerce%20Ganador/backend/db/supabase_init.sql)):
1. `users` — Clientes, administradores, contraseñas cifradas y roles.
2. `categories` — Categorías de productos con slugs e iconos.
3. `products` — Catálogo, variantes, stock, precios y calificaciones.
4. `orders` — Pedidos de clientes, subtotales, costo de envío y estado.
5. `order_items` — Ítems de cada pedido con fotos y precios históricos.
6. `user_addresses` — Libreta de múltiples domicilios por cliente.
7. `coupons` — Cupones de descuento (% y fijo) con límites de uso y fechas.
8. `payments` — Registro de transacciones de pago (Mercado Pago, tarjetas, transferencias).
9. `shipments` — Envíos logísticos con tracking number y transportista.

---

## 📧 3. Notificaciones Transaccionales — Resend

- **Proveedor:** Resend API (3,000 envíos mensuales gratuitos).
- **Despacho:** Asíncrono no bloqueante vía canal bufferizado `chan EmailJob` y pool de Goroutines trabajadoras.
- **Plantillas HTML:** 4 plantillas responsivas con diseño **Warm Glass** (Bienvenida, Pedido Creado, Pago Aprobado, Envío en Camino).

---

## ⚙️ Variables de Entorno del Backend (`backend/.env`)

```env
ENV=production
PORT=8080
DB_SOURCE=postgresql://postgres:[PASSWORD]@db.dxxoxzaowyaxpxphqpsd.supabase.co:5432/postgres
JWT_SECRET=super_secret_jwt_key_change_me_in_production
JWT_EXPIRATION_HOURS=24
JWT_REFRESH_EXPIRATION_DAYS=7
RESEND_API_KEY=re_tu_clave_resend
RESEND_FROM_EMAIL=Lumina Store <onboarding@resend.dev>
```
