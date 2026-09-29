DROP TABLE IF EXISTS mercadolibre_sync_logs;
DROP TABLE IF EXISTS mercadolibre_accounts;

ALTER TABLE orders DROP COLUMN IF EXISTS meli_order_id;
ALTER TABLE orders DROP COLUMN IF EXISTS channel;

ALTER TABLE products DROP COLUMN IF EXISTS meli_last_sync;
ALTER TABLE products DROP COLUMN IF EXISTS meli_price;
ALTER TABLE products DROP COLUMN IF EXISTS meli_status;
ALTER TABLE products DROP COLUMN IF EXISTS meli_permalink;
ALTER TABLE products DROP COLUMN IF EXISTS meli_id;
