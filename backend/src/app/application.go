package app

import (
	"log/slog"

	"ecommerce-ganador/backend/config"
	"ecommerce-ganador/backend/packages/dbconn"
	"ecommerce-ganador/backend/src/app/router"
	"ecommerce-ganador/backend/src/app/web"
	"ecommerce-ganador/backend/src/infrastructure/dependencies"
	"ecommerce-ganador/backend/src/infrastructure/observability"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Application struct {
	server *web.Server
	dbPool *pgxpool.Pool
}

func Bootstrap() (*Application, error) {
	// 1. Config
	cfg := config.LoadConfig()

	// 2. Observability / Logger
	observability.SetupLogger(cfg.Env)
	slog.Info("Bootstrapping application...", slog.String("env", cfg.Env))

	// 3. Database Connection
	var dbPool *pgxpool.Pool
	if cfg.DBSource != "" {
		if err := dbconn.RunMigrations(cfg.DBSource, "db/migrations"); err != nil {
			slog.Warn("Could not apply migrations automatically", slog.Any("error", err))
		}

		var err error
		dbPool, err = dbconn.InitDB(cfg.DBSource)
		if err != nil {
			slog.Warn("Failed to connect to database. Falling back to resilient in-memory mode.", slog.Any("error", err))
		} else {
			slog.Info("Successfully connected to PostgreSQL")
		}
	} else {
		slog.Warn("No DB_SOURCE provided. Running with resilient in-memory repository adapters.")
	}

	// 4. DI Container
	container := dependencies.BuildContainer(dbPool, cfg)

	// 5. Router & Mapping
	r := router.NewRouter(cfg.Env)
	web.MapRoutes(r, container)

	// 6. Server
	srv := web.NewServer(cfg.Port, r)

	return &Application{
		server: srv,
		dbPool: dbPool,
	}, nil
}

func (a *Application) Run() error {
	slog.Info("Application server is running...")
	return a.server.Start()
}

func (a *Application) Close() {
	if a.dbPool != nil {
		a.dbPool.Close()
	}
}
