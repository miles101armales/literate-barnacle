-- Добавляем новые столбцы в таблицу orders для даты и времени доставки
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_time TEXT;
