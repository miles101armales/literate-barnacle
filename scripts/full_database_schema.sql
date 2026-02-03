-- ============================================================================
-- ПОЛНЫЙ SQL СКРИПТ ДЛЯ FLOWER SHOP TELEGRAM MINI APP
-- ============================================================================
-- Версия: 1.0
-- Дата: 2026-01-23
-- Описание: Создание всех таблиц, функций, триггеров и RLS политик
-- ============================================================================

-- Удаление существующих объектов (для чистой установки)
-- ВНИМАНИЕ: Раскомментируйте только если нужна полная переустановка!
-- ============================================================================
/*
DROP TRIGGER IF EXISTS update_order_total_insert_update ON order_items;
DROP TRIGGER IF EXISTS update_order_total_delete ON order_items;
DROP TRIGGER IF EXISTS update_products_modtime ON products;
DROP TRIGGER IF EXISTS update_users_modtime ON users;

DROP FUNCTION IF EXISTS update_order_total();
DROP FUNCTION IF EXISTS update_modified_column();
DROP FUNCTION IF EXISTS update_users_modtime();

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
*/

-- ============================================================================
-- РАСШИРЕНИЯ
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ТАБЛИЦА: admins (Администраторы)
-- ============================================================================
CREATE TABLE IF NOT EXISTS admins (
  tg_id BIGINT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE admins IS 'Таблица администраторов системы';
COMMENT ON COLUMN admins.tg_id IS 'Telegram ID администратора';

-- ============================================================================
-- ТАБЛИЦА: users (Пользователи)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  tg_id BIGINT PRIMARY KEY,
  salebot_client_id TEXT,
  username TEXT,
  firstname TEXT,
  lastname TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE users IS 'Таблица пользователей Telegram';
COMMENT ON COLUMN users.tg_id IS 'Telegram ID пользователя';
COMMENT ON COLUMN users.salebot_client_id IS 'ID клиента в Salebot (опционально)';
COMMENT ON COLUMN users.username IS 'Username в Telegram';
COMMENT ON COLUMN users.firstname IS 'Имя пользователя';
COMMENT ON COLUMN users.lastname IS 'Фамилия пользователя';

-- Индекс для поиска по username
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================================================
-- ТАБЛИЦА: products (Товары)
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  composition TEXT,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  photo_url TEXT,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE products IS 'Каталог товаров (цветы, букеты)';
COMMENT ON COLUMN products.id IS 'Уникальный идентификатор товара';
COMMENT ON COLUMN products.name IS 'Название товара';
COMMENT ON COLUMN products.composition IS 'Состав букета';
COMMENT ON COLUMN products.description IS 'Описание товара';
COMMENT ON COLUMN products.price IS 'Цена товара в рублях';
COMMENT ON COLUMN products.photo_url IS 'URL фотографии товара';
COMMENT ON COLUMN products.stock IS 'Количество на складе';
COMMENT ON COLUMN products.is_active IS 'Активен ли товар для продажи';
COMMENT ON COLUMN products.sort_order IS 'Порядок сортировки в каталоге';

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(sort_order);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- ============================================================================
-- ТАБЛИЦА: orders (Заказы)
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_tg_id BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'editing' CHECK (status IN ('editing', 'confirmed', 'paid', 'cancelled', 'completed')),
  total_amount NUMERIC(10,2) DEFAULT 0 CHECK (total_amount >= 0),
  
  -- Информация о клиенте
  customer_name TEXT,
  phone_number TEXT,
  
  -- Информация о доставке
  delivery_type TEXT,
  delivery_address TEXT,
  delivery_cost NUMERIC(10,2) DEFAULT 0 CHECK (delivery_cost >= 0),
  delivery_date DATE,
  delivery_time TEXT,
  
  -- Дополнительные опции
  photo_send_to TEXT,
  payment_method TEXT,
  
  -- Служебные поля
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE orders IS 'Заказы клиентов';
COMMENT ON COLUMN orders.id IS 'Уникальный идентификатор заказа';
COMMENT ON COLUMN orders.user_tg_id IS 'Telegram ID пользователя';
COMMENT ON COLUMN orders.status IS 'Статус заказа: editing, confirmed, paid, cancelled, completed';
COMMENT ON COLUMN orders.total_amount IS 'Общая сумма заказа';
COMMENT ON COLUMN orders.customer_name IS 'Имя получателя';
COMMENT ON COLUMN orders.phone_number IS 'Телефон для связи';
COMMENT ON COLUMN orders.delivery_type IS 'Тип доставки: pickup, delivery, express';
COMMENT ON COLUMN orders.delivery_address IS 'Адрес доставки';
COMMENT ON COLUMN orders.delivery_cost IS 'Стоимость доставки';
COMMENT ON COLUMN orders.delivery_date IS 'Дата доставки';
COMMENT ON COLUMN orders.delivery_time IS 'Время доставки';
COMMENT ON COLUMN orders.photo_send_to IS 'Куда отправить фото: to_me, to_recipient, both, none';
COMMENT ON COLUMN orders.payment_method IS 'Способ оплаты: card, cash, transfer';
COMMENT ON COLUMN orders.notes IS 'Примечания к заказу';

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_orders_user_tg_id ON orders(user_tg_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);

-- ============================================================================
-- ТАБЛИЦА: order_items (Позиции заказа)
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE order_items IS 'Позиции в заказе';
COMMENT ON COLUMN order_items.id IS 'Уникальный идентификатор позиции';
COMMENT ON COLUMN order_items.order_id IS 'ID заказа';
COMMENT ON COLUMN order_items.product_id IS 'ID товара';
COMMENT ON COLUMN order_items.quantity IS 'Количество';
COMMENT ON COLUMN order_items.unit_price IS 'Цена за единицу на момент заказа';

-- Индексы
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Уникальный индекс для предотвращения дублирования товаров в заказе
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_items_order_product 
  ON order_items(order_id, product_id);

-- ============================================================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- ============================================================================

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Функция обновления общей суммы заказа
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
DECLARE
  target_order_id UUID;
BEGIN
  -- Определяем ID заказа в зависимости от операции
  IF TG_OP = 'DELETE' THEN
    target_order_id := OLD.order_id;
  ELSE
    target_order_id := NEW.order_id;
  END IF;
  
  -- Обновляем сумму заказа
  UPDATE orders
  SET 
    total_amount = COALESCE((
      SELECT SUM(quantity * unit_price)
      FROM order_items
      WHERE order_id = target_order_id
    ), 0),
    updated_at = now()
  WHERE id = target_order_id;
  
  -- Возвращаем соответствующую запись
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Функция обновления updated_at для users
CREATE OR REPLACE FUNCTION update_users_modtime()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ТРИГГЕРЫ
-- ============================================================================

-- Триггер обновления updated_at для products
DROP TRIGGER IF EXISTS update_products_modtime ON products;
CREATE TRIGGER update_products_modtime
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- Триггер обновления updated_at для orders
DROP TRIGGER IF EXISTS update_orders_modtime ON orders;
CREATE TRIGGER update_orders_modtime
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- Триггер обновления updated_at для users
DROP TRIGGER IF EXISTS update_users_modtime ON users;
CREATE TRIGGER update_users_modtime
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_modtime();

-- Триггеры для автоматического обновления суммы заказа
DROP TRIGGER IF EXISTS update_order_total_insert ON order_items;
CREATE TRIGGER update_order_total_insert
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_total();

DROP TRIGGER IF EXISTS update_order_total_update ON order_items;
CREATE TRIGGER update_order_total_update
  AFTER UPDATE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_total();

DROP TRIGGER IF EXISTS update_order_total_delete ON order_items;
CREATE TRIGGER update_order_total_delete
  AFTER DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_total();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Включаем RLS для всех таблиц
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS ПОЛИТИКИ: products
-- ============================================================================
DROP POLICY IF EXISTS "products_select_active" ON products;
CREATE POLICY "products_select_active" ON products
  FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "products_admin_all" ON products;
CREATE POLICY "products_admin_all" ON products
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE tg_id::text = auth.uid()::text)
  );

-- ============================================================================
-- RLS ПОЛИТИКИ: orders
-- ============================================================================
DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT
  USING (user_tg_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT
  WITH CHECK (user_tg_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "orders_update_own" ON orders;
CREATE POLICY "orders_update_own" ON orders
  FOR UPDATE
  USING (user_tg_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "orders_admin_select" ON orders;
CREATE POLICY "orders_admin_select" ON orders
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admins WHERE tg_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "orders_admin_update" ON orders;
CREATE POLICY "orders_admin_update" ON orders
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM admins WHERE tg_id::text = auth.uid()::text)
  );

DROP POLICY IF EXISTS "orders_admin_delete" ON orders;
CREATE POLICY "orders_admin_delete" ON orders
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM admins WHERE tg_id::text = auth.uid()::text)
  );

-- ============================================================================
-- RLS ПОЛИТИКИ: order_items
-- ============================================================================
DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
CREATE POLICY "order_items_select_own" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_tg_id::text = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "order_items_insert_own" ON order_items;
CREATE POLICY "order_items_insert_own" ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_tg_id::text = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "order_items_update_own" ON order_items;
CREATE POLICY "order_items_update_own" ON order_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_tg_id::text = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "order_items_delete_own" ON order_items;
CREATE POLICY "order_items_delete_own" ON order_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_tg_id::text = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "order_items_admin_all" ON order_items;
CREATE POLICY "order_items_admin_all" ON order_items
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE tg_id::text = auth.uid()::text)
  );

-- ============================================================================
-- RLS ПОЛИТИКИ: users
-- ============================================================================
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (tg_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own" ON users
  FOR INSERT
  WITH CHECK (tg_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (tg_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "users_admin_all" ON users;
CREATE POLICY "users_admin_all" ON users
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM admins WHERE tg_id::text = auth.uid()::text)
  );

-- ============================================================================
-- RLS ПОЛИТИКИ: admins
-- ============================================================================
DROP POLICY IF EXISTS "admins_select_self" ON admins;
CREATE POLICY "admins_select_self" ON admins
  FOR SELECT
  USING (tg_id::text = auth.uid()::text);

-- ============================================================================
-- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
-- ============================================================================

-- Функция проверки является ли пользователь администратором
CREATE OR REPLACE FUNCTION is_admin(user_tg_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admins WHERE tg_id = user_tg_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция получения активной корзины пользователя
CREATE OR REPLACE FUNCTION get_or_create_cart(p_user_tg_id BIGINT)
RETURNS UUID AS $$
DECLARE
  cart_id UUID;
BEGIN
  -- Ищем существующий заказ в статусе 'editing'
  SELECT id INTO cart_id
  FROM orders
  WHERE user_tg_id = p_user_tg_id AND status = 'editing'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Если нет, создаем новый
  IF cart_id IS NULL THEN
    INSERT INTO orders (user_tg_id, status)
    VALUES (p_user_tg_id, 'editing')
    RETURNING id INTO cart_id;
  END IF;
  
  RETURN cart_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция добавления товара в корзину
CREATE OR REPLACE FUNCTION add_to_cart(
  p_user_tg_id BIGINT,
  p_product_id UUID,
  p_quantity INTEGER DEFAULT 1
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  cart_id UUID,
  item_id UUID
) AS $$
DECLARE
  v_cart_id UUID;
  v_item_id UUID;
  v_product_price NUMERIC(10,2);
  v_product_stock INTEGER;
  v_current_qty INTEGER;
BEGIN
  -- Проверяем товар
  SELECT price, stock INTO v_product_price, v_product_stock
  FROM products
  WHERE id = p_product_id AND is_active = TRUE;
  
  IF v_product_price IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Товар не найден или недоступен'::TEXT, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;
  
  -- Получаем или создаем корзину
  v_cart_id := get_or_create_cart(p_user_tg_id);
  
  -- Проверяем, есть ли уже такой товар в корзине
  SELECT id, quantity INTO v_item_id, v_current_qty
  FROM order_items
  WHERE order_id = v_cart_id AND product_id = p_product_id;
  
  IF v_item_id IS NOT NULL THEN
    -- Обновляем количество
    UPDATE order_items
    SET quantity = v_current_qty + p_quantity
    WHERE id = v_item_id;
  ELSE
    -- Добавляем новую позицию
    INSERT INTO order_items (order_id, product_id, quantity, unit_price)
    VALUES (v_cart_id, p_product_id, p_quantity, v_product_price)
    RETURNING id INTO v_item_id;
  END IF;
  
  RETURN QUERY SELECT TRUE, 'Товар добавлен в корзину'::TEXT, v_cart_id, v_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция обновления количества товара в корзине
CREATE OR REPLACE FUNCTION update_cart_item(
  p_user_tg_id BIGINT,
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_cart_id UUID;
BEGIN
  -- Получаем корзину пользователя
  SELECT id INTO v_cart_id
  FROM orders
  WHERE user_tg_id = p_user_tg_id AND status = 'editing'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_cart_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Корзина не найдена'::TEXT;
    RETURN;
  END IF;
  
  IF p_quantity <= 0 THEN
    -- Удаляем товар из корзины
    DELETE FROM order_items
    WHERE order_id = v_cart_id AND product_id = p_product_id;
    
    RETURN QUERY SELECT TRUE, 'Товар удален из корзины'::TEXT;
  ELSE
    -- Обновляем количество
    UPDATE order_items
    SET quantity = p_quantity
    WHERE order_id = v_cart_id AND product_id = p_product_id;
    
    RETURN QUERY SELECT TRUE, 'Количество обновлено'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- НАЧАЛЬНЫЕ ДАННЫЕ
-- ============================================================================

-- Добавляем администратора (замените на свой Telegram ID)
INSERT INTO admins (tg_id) 
VALUES (704310888)
ON CONFLICT (tg_id) DO NOTHING;

-- ============================================================================
-- ТЕСТОВЫЕ ТОВАРЫ (опционально)
-- ============================================================================
/*
INSERT INTO products (name, composition, description, price, stock, is_active, sort_order) VALUES
('Букет "Нежность"', 'Розы, пионы, эустома', 'Нежный букет в пастельных тонах', 3500.00, 10, TRUE, 1),
('Букет "Страсть"', 'Красные розы 25 шт', 'Классический букет из красных роз', 5000.00, 15, TRUE, 2),
('Букет "Солнечный"', 'Подсолнухи, хризантемы', 'Яркий солнечный букет', 2800.00, 8, TRUE, 3),
('Букет "Весенний"', 'Тюльпаны, нарциссы, гиацинты', 'Свежий весенний букет', 3200.00, 12, TRUE, 4),
('Композиция "Элегантность"', 'Орхидеи, розы, зелень', 'Элегантная композиция в коробке', 6500.00, 5, TRUE, 5)
ON CONFLICT DO NOTHING;
*/

-- ============================================================================
-- ПРОВЕРКА УСТАНОВКИ
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'База данных успешно создана!';
  RAISE NOTICE 'Таблицы: products, orders, order_items, users, admins';
  RAISE NOTICE 'RLS политики настроены';
  RAISE NOTICE 'Триггеры активированы';
END $$;
