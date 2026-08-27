# ✦ Lumina — E-Commerce Platform & Backoffice

Plataforma de comercio electrónico de alto rendimiento y arquitectura limpia con diseño **Warm Glass**, catálogo de productos, pasarelas de pago, libreta de direcciones, cupones de descuento, sistema de notificaciones transaccionales con Resend y panel de administración integral.

---

## 🏗️ Arquitectura & Stack Tecnológico

### Backend (Go 1.25)
- **Patrón Arquitectónico:** Clean Architecture pura con separación de capas (`entities`, `contracts`, `providers`, `usecases`, `repositories`, `entrypoints`).
- **Framework Web:** Gin Gonic.
- **Base de Datos & Migraciones:** PostgreSQL 16 con `pgxpool` + fallback de alta resiliencia en memoria.
- **Autenticación:** JWT (Access Token + Refresh Token) y contraseñas cifradas con `bcrypt`.
- **Notificaciones Transaccionales:** Resend API con despacho asíncrono no bloqueante vía Goroutines y Canales (`chan EmailJob`).
- **Plantillas de Email:** 4 plantillas HTML responsivas inline (Bienvenida, Orden Creada, Pago Aprobado, Envío en Camino).

### Frontend (React 19 + TypeScript + Vite)
- **Estilos & UI:** Tailwind CSS con tokens Warm Glass (`#fbf9f8`, `#FF4D4F`, bordes translúcidos y desenfoques).
- **Animaciones:** Framer Motion.
- **Gestión de Estado:** Zustand (`useCartStore`, `useAuthStore`).
- **Cliente HTTP:** Axios con interceptores automáticos de autenticación.
- **Módulos:** Tienda pública, Carrito desplegable, Checkout con validación de cupones, Perfil con libreta de direcciones y Panel de Administración con CRUD completo (Productos, Categorías, Órdenes, Directorio de Clientes, Pasarelas de Pago).

---

## 🚀 Puesta en Marcha

### 1. Clonar el Repositorio
```bash
git clone https://github.com/rodrigopereyra03/Lumina.git
cd Lumina
```

### 2. Iniciar Base de Datos (Opcional - Docker)
```bash
docker compose up -d
```

### 3. Iniciar Backend (Go)
```bash
cd backend
go run main.go
# API disponible en http://localhost:8080/api/v1
```

### 4. Iniciar Frontend (React)
```bash
cd frontend
npm install
npm run dev
# Tienda disponible en http://localhost:5173
# Panel Admin disponible en http://localhost:5173/admin
```
