-- Изменяем тип данных в таблице администраторов
ALTER TABLE admins ALTER COLUMN tg_id TYPE TEXT USING tg_id::TEXT;

-- Обновляем существующую запись
UPDATE admins SET tg_id = '704310888' WHERE tg_id = '704310888';
