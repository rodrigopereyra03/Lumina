---
name: backend-clean-arquitecture
description: "Reglas inquebrantables de sistema backend de arquitectura limpia"
---

# Backend Architecture & Best Practices — Universal Ruleset

> Reglas y convenciones de arquitectura, organización y buenas prácticas aplicables a cualquier nuevo proyecto de backend.
> Pensadas como un esquema universal: el lenguaje/framework puede cambiar, los principios no.
 
---

## 1. Filosofía general

1. **Clean Architecture / Hexagonal**: las reglas de negocio no dependen de detalles técnicos (HTTP, ORM, drivers, librerías de terceros). Las dependencias apuntan **siempre hacia adentro** (entidades ← casos de uso ← adapters).
2. **Inversión de dependencias**: los casos de uso definen interfaces (puertos); la infraestructura las implementa (adaptadores).
3. **Inyección de dependencias explícita**: nada de singletons globales. Todo lo que un componente necesita se recibe por constructor.
4. **Una responsabilidad por archivo / paquete**: si un archivo crece, se divide por feature, no por tipo.
5. **Lo que se modifica junto, vive junto** (cohesión por feature).
6. **Determinismo y testeabilidad por encima de comodidad**: si algo es difícil de testear, está mal diseñado.
7. **Fail fast en boundaries, fail safe internamente**: validar en los bordes (HTTP, DB, integraciones), confiar en los contratos internos.
---

## 2. Estructura de carpetas (esquema universal)

```
project-root/
├── main.go / index.ts / app.py            # entrypoint mínimo: solo arranca la app
├── config/                                # carga y exposición de configuración
├── db/
│   ├── migrations/                        # migraciones versionadas (000001_xxx.up/.down)
│   └── dev/                               # seed + config local
├── packages/                              # librerías internas reutilizables
│   ├── dbconn/                            # conector DB
│   ├── cacheconn/                         # conector cache
│   ├── transactions/                      # abstracción transaccional
│   └── middleware/                        # middlewares transversales
├── services/                              # servicios técnicos compartidos (PDF, mailer, etc.)
├── src/
│   ├── app/                               # bootstrap de la aplicación
│   │   ├── application.go                 # arranque (logger, db, cache, server)
│   │   ├── router/                        # creación del router base
│   │   ├── middleware/                    # middlewares específicos de la app
│   │   └── web/                           # mapping de rutas y server HTTP
│   ├── core/                              # NÚCLEO de negocio (sin dependencias externas)
│   │   ├── entities/                      # modelos de dominio puros
│   │   ├── contracts/                     # DTOs request/response por feature
│   │   ├── providers/                     # PUERTOS (interfaces) hacia el exterior
│   │   ├── policies/                      # reglas/políticas de autorización de negocio
│   │   └── usecases/                      # CASOS DE USO (la lógica del producto)
│   ├── entrypoints/                       # ADAPTADORES de entrada (HTTP, eventos, CLI)
│   │   └── rest/                          # handlers HTTP
│   ├── infrastructure/                    # ADAPTADORES técnicos
│   │   ├── dependencies/                  # wiring/DI container
│   │   ├── jwt/                           # tokens
│   │   ├── observability/                 # logs, métricas, tracing
│   │   └── tests/                         # helpers de tests de integración
│   ├── module/                            # módulos verticales o evaluadores complejos
│   ├── repositories/                      # ADAPTADORES de persistencia (DB, cache, APIs)
│   └── scripts/                           # scripts puntuales (one-off jobs, migraciones de datos)
└── docs/                                  # documentación, swagger, ADRs
```

### Regla clave de capas

| Capa | Puede importar de | NUNCA puede importar de |
|------|-------------------|--------------------------|
| `entities` | (stdlib y libs neutras) | usecases, repositories, entrypoints, infrastructure |
| `contracts` | entities, usecases (solo tipos de input) | repositories, entrypoints |
| `providers` (puertos) | entities | repositories, infrastructure |
| `usecases` | entities, providers, contracts | repositories, entrypoints, infrastructure |
| `repositories` (adapters) | entities, providers, infrastructure técnica | entrypoints, usecases (lógica) |
| `entrypoints` | usecases, contracts, app/middleware | repositories directamente |
| `infrastructure/dependencies` | TODO (es el wiring) | — |

> **Regla de oro**: si tu caso de uso `import`a una librería de DB, HTTP o un cliente concreto, está mal diseñado.
 
---

## 3. Capas y responsabilidades

### 3.1. `core/entities` — Dominio puro

- Solo estructuras de datos y reglas invariantes de negocio.
- **Sin tags de ORM, sin tags de JSON, sin anotaciones de framework.**
- Pueden tener métodos puros (validaciones, transformaciones).
- Tipos enumerados (`UserStatus`, `UserOrigin`, etc.) viven aquí con sus constantes.
- Una entidad por subcarpeta cuando hay tipos y enums asociados.
### 3.2. `core/contracts` — DTOs de la capa de transporte

- Una carpeta por feature: `contracts/users/create_request.go`, `contracts/users/create_response.go`.
- Cada request/response es un archivo separado.
- El request expone un método `ToInput()` que convierte el DTO al input del caso de uso (desacoplando HTTP de dominio).
- Los tags de serialización (`json`, `form`, etc.) viven **solo aquí**.
### 3.3. `core/providers` — Puertos (interfaces)

- Una carpeta por dependencia externa: `providers/users/`, `providers/emails/`, `providers/redis/`.
- Cada paquete define:
    - La **interfaz** del puerto (ej. `UsersPersistor`, `EmailSender`).
    - Las **configuraciones** de input (`ListConfig`, `CreateConfig`).
    - Un `//go:generate mockery --all` (o equivalente) para autogenerar mocks.
- Las implementaciones viven en `repositories/` o `services/`, **nunca acá**.
### 3.4. `core/usecases` — Lógica de aplicación

- Una carpeta por feature/agregado: `usecases/users`, `usecases/groups`.
- **Un caso de uso = un archivo**: `create_institutional_user.go`, `update_profile.go`.
- Cada caso de uso expone:
  ```
  type XxxInput struct { ... }
  type XxxOutput struct { ... }    // si aplica
 
  type Xxx interface {
      Execute(ctx context.Context, input XxxInput) (XxxOutput, error)
  }
 
  type XxxImpl struct { ...deps... }
  func NewXxxImpl(...deps...) XxxImpl { ... }
  func (uc XxxImpl) Execute(...) (...) { ... }
  ```
- **Una sola función pública**: `Execute`. Todo lo demás es privado (métodos auxiliares del struct).
- Los errores de negocio se definen en un `errors.go` por feature, como variables exportadas (`ErrUserNotFound`, etc.).
- Tests unitarios al lado del archivo: `create_institutional_user_test.go`.
### 3.5. `repositories` — Adaptadores de persistencia

- Una carpeta por entidad/recurso persistido: `repositories/users/`, `repositories/groups/`.
- Archivos típicos:
    - `repository.go`: struct base, constructor, helper `fromContext` para transacciones.
    - `dao.go`: estructura DAO con tags ORM + funciones `ToEntity`/`ToDAO`/`ToEntities`.
    - Un archivo por operación: `create.go`, `list.go`, `update.go`, `delete.go`.
    - Un test por operación: `create_test.go`, `list_test.go`.
- **El DAO nunca sale del paquete del repositorio**: siempre se traduce a entity antes de retornar.
- Modelo base compartido (`BaseModel`) con `ID`, `CreatedAt`, `UpdatedAt`, `DeletedAt` (soft-delete).
- Todos los IDs son UUIDs (`char(36)` en MySQL) salvo justificación explícita.
- Las queries dinámicas se arman con `if c.Field != zeroValue { q = q.Where(...) }`.
- Soporte de **soft-delete** universal vía `deleted_at IS NULL`.
### 3.6. `entrypoints/rest` — Handlers HTTP

- Una carpeta por feature: `entrypoints/rest/users/`.
- Un archivo por endpoint: `create_institutional_user.go`.
- Cada handler:
  ```
  type XxxHandler struct {
      rest.HandlerBase
      logger  *zap.Logger
      usecase usecases.Xxx
  }
  func NewXxxHandler(...) XxxHandler { ... }
  func (h XxxHandler) Handle() gin.HandlerFunc { ... }
  ```
- El handler **solo**:
    1. Binda y valida el request (`BindRequest[T]`).
    2. Llama al caso de uso (`usecase.Execute`).
    3. Mapea errores de dominio a códigos/HTTP status.
    4. Retorna respuesta normalizada (`Okf` / `Errf`).
- **No tiene lógica de negocio**, nunca toca repos ni DB directo.
- Un test por handler.
- Los `entrypoints/*.go` (fuera de `rest/`) exponen **contenedores** (`UsersContainer`) que agrupan los handlers de una feature para el wiring.
### 3.7. `infrastructure/dependencies` — Wiring / DI

- Container central de inyección (Wire, Fx, o equivalente).
- **Wire/DI compile-time** preferido sobre service locators runtime.
- Reglas:
    - Una función `Build()` que retorna un container con todos los handlers listos.
    - Un set/módulo por recurso (`usersSet`, `groupsSet`).
    - Las interfaces se bindan a sus implementaciones explícitamente.
- Cada vez que se agrega un repo/usecase/handler: actualizar el set correspondiente y **regenerar**.
### 3.8. `app/` — Bootstrap

- `application.go`: orquesta el arranque (config → logger → DB → cache → DI → servidor).
- `web/server.go`: configuración del servidor HTTP (timeouts, recovery, observability).
- `web/mapping.go`: declaración de TODAS las rutas y sus middlewares.
- `router/router.go`: instancia base del router + CORS + healthcheck (`/`, `/ping`).
- `middleware/`: middlewares específicos del proyecto (auth, role-guards).
### 3.9. `packages/` y `services/` — Reutilizables

- `packages/`: utilitarios técnicos genéricos (conectores DB, cache, transacciones, middlewares transversales reutilizables).
- `services/`: servicios técnicos verticales con lógica propia (generador de PDFs, mailer).
---

## 4. Reglas de organización

### 4.1. Nombrado

- Carpetas y archivos en **snake_case**.
- Tipos en **PascalCase**.
- Funciones/variables exportadas en **PascalCase**, internas en **camelCase**.
- Sufijos consistentes:
    - `XxxImpl` → implementación concreta de una interfaz `Xxx`.
    - `XxxDAO` → modelo de persistencia.
    - `XxxRequest` / `XxxResponse` → DTOs HTTP.
    - `XxxInput` / `XxxOutput` → DTOs de casos de uso.
    - `XxxPersistor` / `XxxClient` / `XxxSender` → puertos (interfaces).
    - `XxxHandler` → handler HTTP.
    - `XxxRepository` → adaptador de persistencia.
- Errores: `ErrXxx` como variables exportadas en `errors.go`.
## 5. Buenas prácticas de programación

### 5.1. Context

- **Todo método público que cruce la capa toma `ctx context.Context` como primer parámetro.**
- El `ctx` se propaga hasta el driver (DB, HTTP client, cache).
- Cancelación, timeouts y valores transversales (transacción actual, requester actual) viajan en el contexto.
### 5.2. Errores

- Errores de dominio son **variables exportadas** (`ErrUserNotFound`), no strings ni códigos mágicos.
- Wrapping (`fmt.Errorf("...: %w", err)`) solo para añadir contexto, sin perder el error original.
- En handlers: `switch err { case usecases.ErrXxx: ... }` mapea a HTTP. Nunca exponer detalles internos al cliente.
- Respuestas de error normalizadas:
  ```json
  { "code": "err-user-not-found", "description": "user not found" }
  ```
- Códigos `code` son slugs estables (kebab-case), pensados para ser consumidos por el frontend.
### 5.4. Configuración

- Toda la configuración pasa por una capa única (`config/`) que lee env vars.
- Archivo `.env.example` versionado, `.env.local` y `.env.*` ignorados.
- Validar configuración crítica al arranque y **fallar rápido** si falta algo.
- 
## 6. Persistencia y base de datos

- **Migrations versionadas** en `db/migrations/000NNN_descripcion.up.sql` + `.down.sql`.
- Toda migración tiene su `down`. No se modifican migraciones ya mergeadas.
- Setup local reproducible vía `make dev-setup` (docker-compose + seed + migrate).
- Soft-delete por convención (`deleted_at`). Los `List` filtran por `deleted_at IS NULL`.
- IDs UUID por defecto (mejor para sistemas distribuidos, evitan enumeración).
- Naming SQL:
    - Tablas en **snake_case plural** (`users`, `users_institutions`).
    - Columnas en **snake_case**.
    - FKs explícitas: `user_id`, `institution_id`.
    - Tablas pivot: `users_roles`, `users_institutions`.
---

## 7. Testing

### 7.1. Niveles

1. **Unitarios** (la base): casos de uso con todos los puertos mockeados.
2. **De integración** (repositorios): contra una DB real (la de dev o una efímera en Docker).
3. **De handler**: arman un `httptest` server con el handler + usecase mockeado.
4. **End-to-end** (opcionales): con la app levantada completa.
### 7.2. Convenciones

- Test al lado del código: `foo.go` ↔ `foo_test.go`.
- Cobertura mínima de casos de uso: success + cada rama de error.
- Mocks autogenerados (mockery, gomock) checked-in.
- Helpers de tests en `infrastructure/tests/`.
- Test runner determinístico: `go test ./src/...` (o equivalente) sin flakes.
### 7.3. Naming

- `TestXxxImpl_Execute_Success`
- `TestXxxImpl_Execute_WhenYIsZ_ReturnsErr`
---

## 8. HTTP y contratos

### 8.1. Respuestas normalizadas

- Éxito: `{ "content": <payload> }`.
- Error: `{ "code": "err-xxx", "description": "human readable" }`.
- Códigos HTTP correctos:
    - `200`/`201` éxito
    - `400` request inválido
    - `401` no autenticado
    - `403` no autorizado
    - `404` no encontrado
    - `409` conflicto (duplicate)
    - `422` validación
    - `500` error interno
### 8.2. CORS y headers

- CORS configurado explícitamente en `router/`.
- Headers permitidos restringidos al mínimo necesario.
### 8.3. Versionado

- Endpoints con cambios incompatibles → nueva versión en la ruta (`/v2/...`) o nuevo contrato.
- Mantener compatibilidad mientras haya clientes activos.