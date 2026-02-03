-- Сначала удаляем существующее ограничение внешнего ключа
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Затем добавляем новое ограничение с правилом ON DELETE CASCADE
ALTER TABLE order_items 
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products(id) 
ON DELETE CASCADE;
