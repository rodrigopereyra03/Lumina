-- Seed Categories
INSERT INTO categories (id, name, slug, icon, created_at, updated_at)
VALUES 
    ('a0000001-0000-0000-0000-000000000001', 'Electrónica', 'electronics', 'devices', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a0000001-0000-0000-0000-000000000002', 'Moda', 'fashion', 'checkroom', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a0000001-0000-0000-0000-000000000003', 'Hogar & Confort', 'home', 'home', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a0000001-0000-0000-0000-000000000004', 'Belleza', 'beauty', 'spa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('a0000001-0000-0000-0000-000000000005', 'Deportes', 'sports', 'fitness_center', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Seed Users (Password: password123)
INSERT INTO users (id, email, password_hash, full_name, phone, role, created_at, updated_at)
VALUES 
    ('b0000001-0000-0000-0000-000000000001', 'admin@lumina.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOZhB7zG7tL8v6y9wQz5b2fV3oA9mQcZa', 'Administrador Lumina', '+54 9 11 0000-0000', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('b0000001-0000-0000-0000-000000000002', 'alex.morgan@example.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOZhB7zG7tL8v6y9wQz5b2fV3oA9mQcZa', 'Alex Morgan', '+54 9 11 4455-6677', 'customer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Seed Products
INSERT INTO products (id, category_id, title, subtitle, description, price, original_price, stock, image, rating, reviews_count, created_at, updated_at)
VALUES
    (
        'c0000001-0000-0000-0000-000000000001',
        'a0000001-0000-0000-0000-000000000001',
        'Lumina Pro Camera',
        'Captura el Brillo de la Vida',
        'Sensor ultra amplio y enfoque inteligente impulsado por IA, diseñado para creadores que exigen la máxima perfección.',
        1299.00,
        1499.00,
        12,
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCJbw2mevdwZr1ggkqBSUar06BQd1rYytNLYe6m4zMhXXVf3Ms8J5-ZoVEbtZ7rulS0VuYDUK6Hkv0N720qnsiIayqSDmcCDsyPzMjGzUf8rwCntgX_oysVpfXwRwlDRFxqOAdzzZC6FOw29EuYfdnxvuUOgscWqzeX0DdHsZ-VE6kpSTcDK5CClnk5vFpzHElAnQA_xeema7pTbaQchKD6nhAoiDMCNZjtZDPXFb58vQVs-VBDxKWf',
        5.0,
        89,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'c0000001-0000-0000-0000-000000000002',
        'a0000001-0000-0000-0000-000000000001',
        'Aura Studio Headphones',
        'Auriculares circumaurales premium con cancelación activa de ruido.',
        'Acústica perfectamente equilibrada con cancelación activa de ruido y almohadillas de cuero suave.',
        249.00,
        NULL,
        25,
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDRMBqcSAOlGw8fva1sekJfFL1iyNxoOG30EYhsDenxyYzzAF04FxX1FgXEbZTU6SJvW2nVWHnGnBG7LopgiXjLXuwec6EUYzjEhi0vyeTA5_UyOCNKxM69zbbZiACDwI9KWpNKDEFd_KW2XBxPz1leGqc3w4m_9ye_DJiJdmIpiBESuU0NWnNtY1jzrcfkeSWfHS-wTW-dGKnwvrOmHslmo1tbHo2pGx5v07Ac0BaES2eb981u0_c0',
        4.9,
        230,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'c0000001-0000-0000-0000-000000000003',
        'a0000001-0000-0000-0000-000000000001',
        'Lumina Smartwatch Pro',
        'Reloj inteligente circular minimalista con pantalla AMOLED.',
        'Pantalla AMOLED de alta resolución, monitoreo continuo de salud y resistencia al agua.',
        189.00,
        229.00,
        18,
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDrMSU5FZSvEqRWGIPha8njwkDy9chq80vFltrL1uM8oUJ5_Yzz_89eJXVHQK5-r9c0lvT40Z9JaosqoL7gmwesL-zuTzng5rc6IqwOFk2spMDwnr9w2Vy-g8FhmXsVFiPshXvdNIWPGlTtoEO_e7hJh5u9HQYc730H-vcOski1mVKy08cbwKgHrbBFZmQoT9viQ3EMrG0ODI_JP4Mr0jvBB7pYEPe0FnjvJvEnsJLJvWqv6Ith5APe',
        4.7,
        165,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'c0000001-0000-0000-0000-000000000004',
        'a0000001-0000-0000-0000-000000000002',
        'The Minimalist Tote',
        'Bolso de Cuero Vacuno Auténtico de Primera Calidad',
        'Elegancia desestructurada con durabilidad funcional. Cuenta con amplio compartimento y funda para laptop.',
        245.00,
        295.00,
        22,
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&q=80',
        4.8,
        124,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'c0000001-0000-0000-0000-000000000005',
        'a0000001-0000-0000-0000-000000000003',
        'Echo Hub Speaker',
        'Altavoz inteligente minimalista recubierto en tela acústica.',
        'Audio inmersivo 360 grados con conectividad inteligente y materiales cálidos.',
        129.00,
        NULL,
        30,
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAGKYxdDdkhw23SLm86Jy80Xw3x-Ka-RX74-P1Aicq2ZMo4-UYh8vCQOQTEzkze35uAAu6_eEKH1Y73GIZNN8H07Eahu3JwdtkcljKHOl-K8Loo_rTuzL52pjsAQdyUBcX90Da4cnvE2F93-B3zfPoAXbsw14DRn5Zb0mAGaGMdi_5N8J7m6QArP8jfzMKlfoLpYt9Pja_iIMp55YheB6z8lqsLXl3FasrryoUUi65f-VWncHWYG-jB',
        4.6,
        94,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'c0000001-0000-0000-0000-000000000006',
        'a0000001-0000-0000-0000-000000000001',
        'Zenith Mechanical Board',
        'Teclado mecánico ultra delgado con switches táctiles.',
        'Chasis de aluminio anodizado, teclas PBT de doble inyección y conectividad inalámbrica triple.',
        159.00,
        NULL,
        14,
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDeIZeqUJDzgGM9e0qQZbs_gsCUzaeQphL3RXNTJsrB_7bz6xOZtf1bMVu2uaJLvHYxLTCpw_IZWONbhrEdysIXo570FTJls4r6ZbwvDSssFn5wxfdhRx_pQk5GL1HZ3ormMJjhT0VkwcV9OMhUUHyZdiUjfY6MW5sAa0liTOXNsJi-a380RKEPWx2pXOAG_C87cBJhPAv11OcRWVIdNEuwYuL4N8Gz9tYD3Z-L5y8QNfiYpRegho2p',
        4.9,
        312,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
ON CONFLICT (id) DO NOTHING;

-- Seed Coupons
INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, usage_limit, is_active, created_at, updated_at)
VALUES
    ('d0000001-0000-0000-0000-000000000001', 'LUMINA10', 'percentage', 10.00, 50.00, 1000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('d0000001-0000-0000-0000-000000000002', 'BIENVENIDO', 'fixed', 20.00, 100.00, 500, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Seed Addresses
INSERT INTO user_addresses (id, user_id, title, recipient_name, recipient_phone, street_address, city, state, postal_code, is_default, created_at, updated_at)
VALUES
    ('e0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000002', 'Casa Principal', 'Alex Morgan', '+54 9 11 4455-6677', 'Av. Libertador 2450, Piso 8', 'Buenos Aires', 'CABA', 'C1425', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

