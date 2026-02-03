-- Проверяем текущий тип данных
DO $$
DECLARE
    column_type TEXT;
BEGIN
    SELECT data_type INTO column_type
    FROM information_schema.columns
    WHERE table_name = 'admins' AND column_name = 'tg_id';
    
    RAISE NOTICE 'Current type of tg_id: %', column_type;
    
    -- Если тип не TEXT, изменяем его
    IF column_type != 'text' THEN
        ALTER TABLE admins ALTER COLUMN tg_id TYPE TEXT USING tg_id::TEXT;
        RAISE NOTICE 'Changed tg_id type to TEXT';
    END IF;
END $$;

-- Проверяем существующие записи
DO $$
DECLARE
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM admins WHERE tg_id = '704310888';
    RAISE NOTICE 'Number of admins with tg_id 704310888: %', admin_count;
    
    -- Если записи нет, добавляем её
    IF admin_count = 0 THEN
        INSERT INTO admins (tg_id) VALUES ('704310888');
        RAISE NOTICE 'Added admin with tg_id 704310888';
    END IF;
END $$;
