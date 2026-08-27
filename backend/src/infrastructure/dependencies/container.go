package dependencies

import (
	"ecommerce-ganador/backend/config"
	"ecommerce-ganador/backend/src/infrastructure/jwt"
	notifInfra "ecommerce-ganador/backend/src/infrastructure/notifications"

	addrRepos "ecommerce-ganador/backend/src/repositories/addresses"
	categoryRepos "ecommerce-ganador/backend/src/repositories/categories"
	couponRepos "ecommerce-ganador/backend/src/repositories/coupons"
	orderRepos "ecommerce-ganador/backend/src/repositories/orders"
	paymentRepos "ecommerce-ganador/backend/src/repositories/payments"
	productRepos "ecommerce-ganador/backend/src/repositories/products"
	settingRepos "ecommerce-ganador/backend/src/repositories/settings"
	userRepos "ecommerce-ganador/backend/src/repositories/users"

	addrUsecases "ecommerce-ganador/backend/src/core/usecases/addresses"
	categoryUsecases "ecommerce-ganador/backend/src/core/usecases/categories"
	couponUsecases "ecommerce-ganador/backend/src/core/usecases/coupons"
	orderUsecases "ecommerce-ganador/backend/src/core/usecases/orders"
	paymentUsecases "ecommerce-ganador/backend/src/core/usecases/payments"
	productUsecases "ecommerce-ganador/backend/src/core/usecases/products"
	settingUsecases "ecommerce-ganador/backend/src/core/usecases/settings"
	userUsecases "ecommerce-ganador/backend/src/core/usecases/users"

	addrHandlers "ecommerce-ganador/backend/src/entrypoints/rest/addresses"
	categoryHandlers "ecommerce-ganador/backend/src/entrypoints/rest/categories"
	couponHandlers "ecommerce-ganador/backend/src/entrypoints/rest/coupons"
	orderHandlers "ecommerce-ganador/backend/src/entrypoints/rest/orders"
	paymentHandlers "ecommerce-ganador/backend/src/entrypoints/rest/payments"
	productHandlers "ecommerce-ganador/backend/src/entrypoints/rest/products"
	settingHandlers "ecommerce-ganador/backend/src/entrypoints/rest/settings"
	userHandlers "ecommerce-ganador/backend/src/entrypoints/rest/users"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Container struct {
	// Handlers
	RegisterUserHandler      userHandlers.RegisterUserHandler
	LoginUserHandler         userHandlers.LoginUserHandler
	GetUserProfileHandler    userHandlers.GetUserProfileHandler
	ListUsersHandler         userHandlers.ListUsersHandler
	ListProductsHandler      productHandlers.ListProductsHandler
	GetProductByIDHandler    productHandlers.GetProductByIDHandler
	CreateProductHandler     productHandlers.CreateProductHandler
	UpdateProductHandler     productHandlers.UpdateProductHandler
	DeleteProductHandler     productHandlers.DeleteProductHandler
	ListCategoriesHandler    categoryHandlers.ListCategoriesHandler
	CreateCategoryHandler    categoryHandlers.CreateCategoryHandler
	CreateOrderHandler       orderHandlers.CreateOrderHandler
	ListOrdersHandler        orderHandlers.ListOrdersHandler
	UpdateOrderStatusHandler orderHandlers.UpdateOrderStatusHandler

	// Extended Handlers
	CreateAddressHandler   addrHandlers.CreateAddressHandler
	ListAddressesHandler   addrHandlers.ListAddressesHandler
	ValidateCouponHandler  couponHandlers.ValidateCouponHandler
	ProcessPaymentHandler  paymentHandlers.ProcessPaymentHandler
	PaymentSettingsHandler settingHandlers.PaymentSettingsHandler
	MercadoPagoHandler     paymentHandlers.MercadoPagoHandler

	// Services
	JWTService   *jwt.JWTService
	EmailService *notifInfra.ResendEmailService
}

func BuildContainer(dbPool *pgxpool.Pool, cfg config.Config) *Container {
	// Infrastructure
	jwtService := jwt.NewJWTService(cfg.JWTSecret)
	emailService := notifInfra.NewResendEmailService(cfg.ResendAPIKey, cfg.ResendFromEmail)

	// Repositories
	userRepo := userRepos.NewUsersRepository(dbPool)
	productRepo := productRepos.NewProductsRepository(dbPool)
	categoryRepo := categoryRepos.NewCategoriesRepository(dbPool)
	orderRepo := orderRepos.NewOrdersRepository(dbPool)
	addrRepo := addrRepos.NewAddressesRepository(dbPool)
	couponRepo := couponRepos.NewCouponsRepository(dbPool)
	paymentRepo := paymentRepos.NewPaymentsRepository(dbPool)
	settingRepo := settingRepos.NewSettingsRepository(dbPool)

	// Usecases
	registerUserUc := userUsecases.NewRegisterUserImpl(userRepo, jwtService, emailService, cfg.JWTAccessExpiration)
	loginUserUc := userUsecases.NewLoginUserImpl(userRepo, jwtService, cfg.JWTAccessExpiration, cfg.JWTRefreshExpiration)
	getUserProfileUc := userUsecases.NewGetUserProfileImpl(userRepo)
	listUsersUc := userUsecases.NewListUsersImpl(userRepo)

	listProductsUc := productUsecases.NewListProductsImpl(productRepo)
	getProductByIDUc := productUsecases.NewGetProductByIDImpl(productRepo)
	createProductUc := productUsecases.NewCreateProductImpl(productRepo)
	updateProductUc := productUsecases.NewUpdateProductImpl(productRepo)
	deleteProductUc := productUsecases.NewDeleteProductImpl(productRepo)

	listCategoriesUc := categoryUsecases.NewListCategoriesImpl(categoryRepo)
	createCategoryUc := categoryUsecases.NewCreateCategoryImpl(categoryRepo)

	createOrderUc := orderUsecases.NewCreateOrderImpl(orderRepo, emailService)
	listOrdersUc := orderUsecases.NewListOrdersImpl(orderRepo)
	updateOrderStatusUc := orderUsecases.NewUpdateOrderStatusImpl(orderRepo, emailService)

	createAddrUc := addrUsecases.NewCreateAddressImpl(addrRepo)
	listAddrsUc := addrUsecases.NewListAddressesImpl(addrRepo)

	validateCouponUc := couponUsecases.NewValidateCouponImpl(couponRepo)

	processPaymentUc := paymentUsecases.NewProcessPaymentImpl(paymentRepo, orderRepo, emailService)
	createMPPrefUc := paymentUsecases.NewCreateMPPreferenceImpl(settingRepo, orderRepo)
	handleMPWebhookUc := paymentUsecases.NewHandleMPWebhookImpl(orderRepo, paymentRepo, emailService)

	getSettingsUc := settingUsecases.NewGetPaymentSettingsImpl(settingRepo)
	updateSettingsUc := settingUsecases.NewUpdatePaymentSettingsImpl(settingRepo)

	// Handlers
	return &Container{
		RegisterUserHandler:      userHandlers.NewRegisterUserHandler(registerUserUc),
		LoginUserHandler:         userHandlers.NewLoginUserHandler(loginUserUc),
		GetUserProfileHandler:    userHandlers.NewGetUserProfileHandler(getUserProfileUc),
		ListUsersHandler:         userHandlers.NewListUsersHandler(listUsersUc),
		ListProductsHandler:      productHandlers.NewListProductsHandler(listProductsUc),
		GetProductByIDHandler:    productHandlers.NewGetProductByIDHandler(getProductByIDUc),
		CreateProductHandler:     productHandlers.NewCreateProductHandler(createProductUc),
		UpdateProductHandler:     productHandlers.NewUpdateProductHandler(updateProductUc),
		DeleteProductHandler:     productHandlers.NewDeleteProductHandler(deleteProductUc),
		ListCategoriesHandler:    categoryHandlers.NewListCategoriesHandler(listCategoriesUc),
		CreateCategoryHandler:    categoryHandlers.NewCreateCategoryHandler(createCategoryUc),
		CreateOrderHandler:       orderHandlers.NewCreateOrderHandler(createOrderUc),
		ListOrdersHandler:        orderHandlers.NewListOrdersHandler(listOrdersUc),
		UpdateOrderStatusHandler: orderHandlers.NewUpdateOrderStatusHandler(updateOrderStatusUc),

		CreateAddressHandler:   addrHandlers.NewCreateAddressHandler(createAddrUc),
		ListAddressesHandler:   addrHandlers.NewListAddressesHandler(listAddrsUc),
		ValidateCouponHandler:  couponHandlers.NewValidateCouponHandler(validateCouponUc),
		ProcessPaymentHandler:  paymentHandlers.NewProcessPaymentHandler(processPaymentUc),
		PaymentSettingsHandler: settingHandlers.NewPaymentSettingsHandler(getSettingsUc, updateSettingsUc),
		MercadoPagoHandler:     paymentHandlers.NewMercadoPagoHandler(createMPPrefUc, handleMPWebhookUc),

		JWTService:   jwtService,
		EmailService: emailService,
	}
}
