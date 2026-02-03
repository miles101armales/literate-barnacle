-- Включаем расширение для аутентификации
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создаем функцию для проверки Telegram ID
CREATE OR REPLACE FUNCTION public.match_telegram_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'telegram_id' IS NOT NULL THEN
    NEW.id := (NEW.raw_user_meta_data->>'telegram_id')::bigint::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем триггер для установки ID пользователя равным Telegram ID
DROP TRIGGER IF EXISTS set_user_id_to_telegram_id ON auth.users;
CREATE TRIGGER set_user_id_to_telegram_id
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.match_telegram_user_id();

-- Обновляем RLS политики для работы с аутентификацией
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders" 
ON public.orders FOR SELECT 
USING (user_tg_id::text = auth.uid());

CREATE POLICY "Users can create their own orders" 
ON public.orders FOR INSERT 
WITH CHECK (user_tg_id::text = auth.uid());

CREATE POLICY "Users can update their own orders" 
ON public.orders FOR UPDATE 
USING (user_tg_id::text = auth.uid());

-- Обновляем политики для order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own order items" 
ON public.order_items FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders
  WHERE orders.id = order_items.order_id
  AND orders.user_tg_id::text = auth.uid()
));

CREATE POLICY "Users can manage their own order items" 
ON public.order_items FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.orders
  WHERE orders.id = order_items.order_id
  AND orders.user_tg_id::text = auth.uid()
));

-- Обновляем политики для admins
CREATE POLICY "Admins can view all orders" 
ON public.orders FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.admins
  WHERE tg_id::text = auth.uid()
));

CREATE POLICY "Admins can update all orders" 
ON public.orders FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.admins
  WHERE tg_id::text = auth.uid()
));

CREATE POLICY "Admins can view all order items" 
ON public.order_items FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.admins
  WHERE tg_id::text = auth.uid()
));

CREATE POLICY "Admins can manage all order items" 
ON public.order_items FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admins
  WHERE tg_id::text = auth.uid()
));

-- Обновляем политики для products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active products" 
ON public.products FOR SELECT 
USING (is_active = TRUE);

CREATE POLICY "Admins can manage all products" 
ON public.products FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admins
  WHERE tg_id::text = auth.uid()
));
