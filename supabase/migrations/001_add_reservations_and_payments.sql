-- =====================================================
-- MIGRACIÓN: Sistema de Reservas y Pagos
-- Fecha: 2025-12-27
-- Descripción: Agrega sistema de reservas de stock,
--              gestión de pagos y mejora de estados
-- =====================================================

-- 1. Crear tabla de reservas de stock
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'in_use', 'returned', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Índices para búsqueda rápida
CREATE INDEX idx_stock_reservations_user ON stock_reservations(user_id);
CREATE INDEX idx_stock_reservations_product ON stock_reservations(product_id);
CREATE INDEX idx_stock_reservations_event ON stock_reservations(event_id);
CREATE INDEX idx_stock_reservations_dates ON stock_reservations(start_date, end_date);
CREATE INDEX idx_stock_reservations_status ON stock_reservations(status);

-- RLS para stock_reservations
ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reservations"
  ON stock_reservations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reservations"
  ON stock_reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations"
  ON stock_reservations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reservations"
  ON stock_reservations FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 2. Agregar campos de pago a invoices
-- =====================================================
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS balance_due DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_due_date TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('cash', 'transfer', 'card', 'other'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS generate_contract BOOLEAN DEFAULT true;

-- Índices para pagos
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_due_date ON invoices(payment_due_date);

-- =====================================================
-- 3. Actualizar estados de eventos (agregar in_progress y returned)
-- =====================================================
-- Nota: En Supabase necesitarás actualizar manualmente el constraint
-- Por ahora agregamos comentario para referencia
-- Los eventos ahora pueden tener estos estados:
-- 'draft', 'confirmed', 'in_progress', 'returned', 'completed', 'cancelled'

COMMENT ON COLUMN events.status IS 'Estados: draft, confirmed, in_progress, returned, completed, cancelled';

-- =====================================================
-- 4. Crear tabla de historial de actividades
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('invoice', 'event', 'contract', 'reservation')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'status_changed', 'payment_received', 'deleted')),
  old_value JSONB,
  new_value JSONB,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para activity_log
CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);

-- RLS para activity_log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity"
  ON activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create activity logs"
  ON activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 5. Función para verificar disponibilidad de stock
-- =====================================================
CREATE OR REPLACE FUNCTION check_stock_availability(
  p_product_id UUID,
  p_quantity INTEGER,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_exclude_reservation_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_total_stock INTEGER;
  v_reserved_quantity INTEGER;
  v_available INTEGER;
BEGIN
  -- Obtener stock total del producto
  SELECT stock INTO v_total_stock
  FROM products
  WHERE id = p_product_id;

  -- Calcular cantidad reservada en el rango de fechas
  -- Excluir la reserva actual si se está editando
  SELECT COALESCE(SUM(quantity), 0) INTO v_reserved_quantity
  FROM stock_reservations
  WHERE product_id = p_product_id
    AND status IN ('reserved', 'in_use')
    AND (
      (start_date <= p_end_date AND end_date >= p_start_date)
    )
    AND (p_exclude_reservation_id IS NULL OR id != p_exclude_reservation_id);

  -- Calcular stock disponible
  v_available := v_total_stock - v_reserved_quantity;

  -- Retornar si hay suficiente stock
  RETURN v_available >= p_quantity;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. Función para obtener stock disponible por fecha
-- =====================================================
CREATE OR REPLACE FUNCTION get_available_stock(
  p_user_id UUID,
  p_product_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS INTEGER AS $$
DECLARE
  v_total_stock INTEGER;
  v_reserved_quantity INTEGER;
BEGIN
  -- Obtener stock total del producto
  SELECT stock INTO v_total_stock
  FROM products
  WHERE id = p_product_id AND user_id = p_user_id;

  -- Calcular cantidad reservada en el rango de fechas
  SELECT COALESCE(SUM(quantity), 0) INTO v_reserved_quantity
  FROM stock_reservations
  WHERE product_id = p_product_id
    AND user_id = p_user_id
    AND status IN ('reserved', 'in_use')
    AND (start_date <= p_end_date AND end_date >= p_start_date);

  -- Retornar stock disponible
  RETURN COALESCE(v_total_stock, 0) - v_reserved_quantity;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. Trigger para actualizar updated_at en reservas
-- =====================================================
CREATE OR REPLACE FUNCTION update_reservation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_reservation_updated_at
  BEFORE UPDATE ON stock_reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_reservation_timestamp();

-- =====================================================
-- 8. Función para registrar actividad automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (user_id, entity_type, entity_id, action, new_value)
    VALUES (NEW.user_id, TG_ARGV[0], NEW.id, 'created', to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activity_log (user_id, entity_type, entity_id, action, old_value, new_value)
    VALUES (NEW.user_id, TG_ARGV[0], NEW.id, 'updated', to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_log (user_id, entity_type, entity_id, action, old_value)
    VALUES (OLD.user_id, TG_ARGV[0], OLD.id, 'deleted', to_jsonb(OLD));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para logging automático (opcional, puedes activar según necesites)
-- CREATE TRIGGER log_reservation_changes
--   AFTER INSERT OR UPDATE OR DELETE ON stock_reservations
--   FOR EACH ROW EXECUTE FUNCTION log_activity('reservation');

-- =====================================================
-- NOTAS PARA MIGRACIÓN MANUAL EN SUPABASE:
-- =====================================================
--
-- 1. Actualizar constraint de estado en eventos:
--    ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;
--    ALTER TABLE events ADD CONSTRAINT events_status_check
--      CHECK (status IN ('draft', 'confirmed', 'in_progress', 'returned', 'completed', 'cancelled'));
--
-- 2. Actualizar constraint de estado en invoices (opcional, si quieres nuevos estados):
--    ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
--    ALTER TABLE invoices ADD CONSTRAINT invoices_status_check
--      CHECK (status IN ('draft', 'sent', 'accepted', 'paid', 'cancelled'));
--
-- 3. Actualizar datos existentes:
--    UPDATE invoices SET payment_status = 'paid' WHERE status = 'completed';
--    UPDATE invoices SET payment_status = 'unpaid' WHERE status IN ('draft', 'pending');
--    UPDATE invoices SET balance_due = total WHERE payment_status = 'unpaid';
--
-- =====================================================

COMMENT ON TABLE stock_reservations IS 'Reservas de stock de productos por fechas para eventos';
COMMENT ON TABLE activity_log IS 'Historial de cambios y actividades en el sistema';
COMMENT ON FUNCTION check_stock_availability IS 'Verifica si hay stock disponible para un producto en un rango de fechas';
COMMENT ON FUNCTION get_available_stock IS 'Obtiene la cantidad de stock disponible para un producto en un rango de fechas';
