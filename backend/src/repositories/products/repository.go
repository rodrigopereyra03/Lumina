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
		memory: make(map[string]ProductDAO),
	}

	repo.seedInMemory()

	// If DB pool exists, delete test product in postgres so it never appears
	if db != nil {
		go func() {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			_, _ = db.Exec(ctx, "DELETE FROM products WHERE id = 'test-mp-10-ars'")
		}()
	}

	return repo
}

func (r *ProductsRepository) seedInMemory() {
	origPriceCamera := 1499.00
	origPriceWatch := 229.00
	origPriceTote := 295.00

	demoProducts := []ProductDAO{
		{
			ID:            "lumina-pro-camera",
			CategoryName:  "Electrónica",
			Title:         "Lumina Pro Camera",
			Subtitle:      "Captura el Brillo de la Vida",
			Description:   "Sensor ultra amplio y enfoque inteligente impulsado por IA, diseñado para creadores que exigen la máxima perfección.",
			Price:         1299.00,
			OriginalPrice: &origPriceCamera,
			Stock:         12,
			Image:         "https://lh3.googleusercontent.com/aida-public/AB6AXuCJbw2mevdwZr1ggkqBSUar06BQd1rYytNLYe6m4zMhXXVf3Ms8J5-ZoVEbtZ7rulS0VuYDUK6Hkv0N720qnsiIayqSDmcCDsyPzMjGzUf8rwCntgX_oysVpfXwRwlDRFxqOAdzzZC6FOw29EuYfdnxvuUOgscWqzeX0DdHsZ-VE6kpSTcDK5CClnk5vFpzHElAnQA_xeema7pTbaQchKD6nhAoiDMCNZjtZDPXFb58vQVs-VBDxKWf",
			Rating:        5.0,
			ReviewsCount:  89,
			CreatedAt:     time.Now(),
			UpdatedAt:     time.Now(),
		},
		{
			ID:           "aura-headphones",
			CategoryName: "Electrónica",
			Title:        "Aura Studio Headphones",
			Subtitle:     "Auriculares circumaurales premium con cancelación activa de ruido.",
			Description:  "Acústica perfectamente equilibrada con cancelación activa de ruido y almohadillas de cuero suave.",
			Price:        249.00,
			Stock:        25,
			Image:        "https://lh3.googleusercontent.com/aida-public/AB6AXuDRMBqcSAOlGw8fva1sekJfFL1iyNxoOG30EYhsDenxyYzzAF04FxX1FgXEbZTU6SJvW2nVWHnGnBG7LopgiXjLXuwec6EUYzjEhi0vyeTA5_UyOCNKxM69zbbZiACDwI9KWpNKDEFd_KW2XBxPz1leGqc3w4m_9ye_DJiJdmIpiBESuU0NWnNtY1jzrcfkeSWfHS-wTW-dGKnwvrOmHslmo1tbHo2pGx5v07Ac0BaES2eb981u0_c0",
			Rating:       4.9,
			ReviewsCount: 230,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
		{
			ID:            "lumina-smartwatch",
			CategoryName:  "Electrónica",
			Title:         "Lumina Smartwatch Pro",
			Subtitle:      "Reloj inteligente circular minimalista con pantalla AMOLED.",
			Description:   "Pantalla AMOLED de alta resolución, monitoreo continuo de salud y resistencia al agua.",
			Price:         189.00,
			OriginalPrice: &origPriceWatch,
			Stock:         18,
			Image:         "https://lh3.googleusercontent.com/aida-public/AB6AXuDrMSU5FZSvEqRWGIPha8njwkDy9chq80vFltrL1uM8oUJ5_Yzz_89eJXVHQK5-r9c0lvT40Z9JaosqoL7gmwesL-zuTzng5rc6IqwOFk2spMDwnr9w2Vy-g8FhmXsVFiPshXvdNIWPGlTtoEO_e7hJh5u9HQYc730H-vcOski1mVKy08cbwKgHrbBFZmQoT9viQ3EMrG0ODI_JP4Mr0jvBB7pYEPe0FnjvJvEnsJLJvWqv6Ith5APe",
			Rating:        4.7,
			ReviewsCount:  165,
			CreatedAt:     time.Now(),
			UpdatedAt:     time.Now(),
		},
		{
			ID:            "minimalist-tote",
			CategoryName:  "Moda",
			Title:         "The Minimalist Tote",
			Subtitle:      "Bolso de Cuero Vacuno Auténtico de Primera Calidad",
			Description:   "Elegancia desestructurada con durabilidad funcional. Cuenta con amplio compartimento y funda para laptop.",
			Price:         245.00,
			OriginalPrice: &origPriceTote,
			Stock:         22,
			Image:         "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&q=80",
			Rating:        4.8,
			ReviewsCount:  124,
			CreatedAt:     time.Now(),
			UpdatedAt:     time.Now(),
		},
		{
			ID:           "echo-hub-speaker",
			CategoryName: "Hogar",
			Title:        "Echo Hub Speaker",
			Subtitle:     "Altavoz inteligente minimalista recubierto en tela acústica.",
			Description:  "Audio inmersivo 360 grados con conectividad inteligente y materiales cálidos.",
			Price:        129.00,
			Stock:        30,
			Image:        "https://lh3.googleusercontent.com/aida-public/AB6AXuAGKYxdDdkhw23SLm86Jy80Xw3x-Ka-RX74-P1Aicq2ZMo4-UYh8vCQOQTEzkze35uAAu6_eEKH1Y73GIZNN8H07Eahu3JwdtkcljKHOl-K8Loo_rTuzL52pjsAQdyUBcX90Da4cnvE2F93-B3zfPoAXbsw14DRn5Zb0mAGaGMdi_5N8J7m6QArP8jfzMKlfoLpYt9Pja_iIMp55YheB6z8lqsLXl3FasrryoUUi65f-VWncHWYG-jB",
			Rating:       4.6,
			ReviewsCount: 94,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
		{
			ID:           "zenith-mechanical-board",
			CategoryName: "Electrónica",
			Title:        "Zenith Mechanical Board",
			Subtitle:     "Teclado mecánico ultra delgado con switches táctiles.",
			Description:  "Chasis de aluminio anodizado, teclas PBT de doble inyección y conectividad inalámbrica triple.",
			Price:        159.00,
			Stock:        14,
			Image:        "https://lh3.googleusercontent.com/aida-public/AB6AXuDeIZeqUJDzgGM9e0qQZbs_gsCUzaeQphL3RXNTJsrB_7bz6xOZtf1bMVu2uaJLvHYxLTCpw_IZWONbhrEdysIXo570FTJls4r6ZbwvDSssFn5wxfdhRx_pQk5GL1HZ3ormMJjhT0VkwcV9OMhUUHyZdiUjfY6MW5sAa0liTOXNsJi-a380RKEPWx2pXOAG_C87cBJhPAv11OcRWVIdNEuwYuL4N8Gz9tYD3Z-L5y8QNfiYpRegho2p",
			Rating:       4.9,
			ReviewsCount: 312,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
	}

	for _, p := range demoProducts {
		r.memory[p.ID] = p
	}
}
