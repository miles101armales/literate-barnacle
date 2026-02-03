-- Create tables
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  composition TEXT,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  photo_url TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_tg_id BIGINT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('editing', 'confirmed', 'paid')),
  total_amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE admins (
  tg_id BIGINT PRIMARY KEY
);

-- Create trigger to update total_amount in orders
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET total_amount = (
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    FROM order_items
    WHERE order_id = NEW.order_id OR order_id = OLD.order_id
  )
  WHERE id = NEW.order_id OR id = OLD.order_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_total_insert_update
AFTER INSERT OR UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_total();

CREATE TRIGGER update_order_total_delete
AFTER DELETE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_total();

-- Create trigger to update updated_at in products
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_modtime
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Set up RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage all products"
  ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE tg_id = auth.uid()));

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (user_tg_id = auth.uid());

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE tg_id = auth.uid()));

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (user_tg_id = auth.uid());

CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (user_tg_id = auth.uid());

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admins WHERE tg_id = auth.uid()));

-- Order items policies
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_tg_id = auth.uid()
  ));

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE tg_id = auth.uid()));

CREATE POLICY "Users can manage their own order items"
  ON order_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_tg_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all order items"
  ON order_items FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE tg_id = auth.uid()));

-- Insert initial admin
INSERT INTO admins (tg_id) VALUES (12345); -- Replace with your Telegram ID
