-- Actualizar constraint de status en events para incluir 'draft'
-- Primero eliminamos el constraint existente si existe
DO $$
BEGIN
    -- Intentar eliminar constraint existente
    ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Agregar nuevo constraint con 'draft' incluido
ALTER TABLE events ADD CONSTRAINT events_status_check
    CHECK (status IN ('draft', 'pending', 'confirmed', 'completed', 'cancelled'));

-- Comentario explicativo
COMMENT ON COLUMN events.status IS 'Estado del evento: draft (borrador), pending (pendiente), confirmed (confirmado), completed (completado), cancelled (cancelado)';
