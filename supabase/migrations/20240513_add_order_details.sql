-- Добавляем новые столбцы в таблицу orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_cost NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS photo_send_to TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
