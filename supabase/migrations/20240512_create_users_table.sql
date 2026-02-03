-- Создаем таблицу users
CREATE TABLE IF NOT EXISTS users (
  tg_id BIGINT PRIMARY KEY,
  salebot_client_id TEXT,
  username TEXT,
  firstname TEXT,
  lastname TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем триггер для обновления поля updated_at
CREATE OR REPLACE FUNCTION update_users_modtime()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_modtime();

-- Настраиваем RLS политики для таблицы users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Пользователи могут видеть только свои данные
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (tg_id::text = auth.uid());

-- Пользователи могут обновлять только свои данные
CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (tg_id::text = auth.uid());

-- Пользователи могут создавать только свои записи
CREATE POLICY "Users can insert their own data"
  ON users FOR INSERT
  WITH CHECK (tg_id::text = auth.uid());

-- Администраторы могут видеть все данные
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE tg_id::text = auth.uid()));

-- Администраторы могут обновлять все данные
CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admins WHERE tg_id::text = auth.uid()));

-- Администраторы могут создавать записи для любых пользователей
CREATE POLICY "Admins can insert any user"
  ON users FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE tg_id::text = auth.uid()));
