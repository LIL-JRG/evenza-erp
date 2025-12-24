-- Agregar campo de descuento a la tabla events
ALTER TABLE events ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT 0;

-- Comentario explicativo
COMMENT ON COLUMN events.discount IS 'Descuento aplicado al evento en pesos';
