-- Add Mercado Libre fields to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS meli_id VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS meli_permalink TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meli_status VARCHAR(50) DEFAULT 'not_published';
ALTER TABLE products ADD COLUMN IF NOT EXISTS meli_price NUMERIC(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS meli_last_sync TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_products_meli_id ON products(meli_id);

-- Add Channel & Mercado Libre Order ID to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS channel VARCHAR(50) DEFAULT 'web';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS meli_order_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_orders_meli_order_id ON orders(meli_order_id);

-- Mercado Libre Connected Account / Config Table
CREATE TABLE IF NOT EXISTS mercadolibre_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meli_user_id VARCHAR(100),
    nickname VARCHAR(100),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    app_id VARCHAR(100),
    client_secret VARCHAR(100),
    redirect_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sync_stock_automatically BOOLEAN NOT NULL DEFAULT true,
    price_markup_percent NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Mercado Libre Sync & Webhook Audit Logs Table
CREATE TABLE IF NOT EXISTS mercadolibre_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL, -- 'order_webhook', 'stock_sync', 'publish', 'price_sync', 'error'
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    meli_item_id VARCHAR(50),
    payload JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'success', -- 'success', 'warning', 'failed'
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_meli_sync_logs_product_id ON mercadolibre_sync_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_meli_sync_logs_meli_item_id ON mercadolibre_sync_logs(meli_item_id);
CREATE INDEX IF NOT EXISTS idx_meli_sync_logs_created_at ON mercadolibre_sync_logs(created_at DESC);
