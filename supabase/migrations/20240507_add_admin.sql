-- Добавляем указанный Telegram ID в таблицу администраторов
INSERT INTO admins (tg_id) 
VALUES (704310888)
ON CONFLICT (tg_id) DO NOTHING;

-- Обновляем тип данных в таблице администраторов, если необходимо
-- ALTER TABLE admins ALTER COLUMN tg_id TYPE TEXT USING tg_id::TEXT;
