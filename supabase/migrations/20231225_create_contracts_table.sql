-- Migration: Create contracts table
-- Created: 2023-12-25
-- Description: Creates the contracts table for managing customer contracts generated from sale notes

-- Crear tabla de contratos
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  contract_number TEXT NOT NULL,
  terms_content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  signed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_reason TEXT,

  -- Constraints
  CONSTRAINT unique_contract_number_per_user UNIQUE (user_id, contract_number),
  CONSTRAINT unique_invoice_contract UNIQUE (invoice_id)
);

-- Comentarios de documentación
COMMENT ON TABLE contracts IS 'Stores customer contracts generated from sale notes';
COMMENT ON COLUMN contracts.id IS 'Unique contract identifier';
COMMENT ON COLUMN contracts.invoice_id IS 'Reference to the sale note that generated this contract';
COMMENT ON COLUMN contracts.user_id IS 'Reference to the user/company that owns this contract';
COMMENT ON COLUMN contracts.customer_id IS 'Reference to the customer';
COMMENT ON COLUMN contracts.event_id IS 'Optional reference to the event';
COMMENT ON COLUMN contracts.contract_number IS 'Human-readable contract number (e.g., CONT-202312-0001)';
COMMENT ON COLUMN contracts.terms_content IS 'The terms and conditions content at the time of contract creation';
COMMENT ON COLUMN contracts.status IS 'Contract status: pending, signed, or cancelled';
COMMENT ON COLUMN contracts.signed_at IS 'Timestamp when the contract was marked as signed';
COMMENT ON COLUMN contracts.cancelled_at IS 'Timestamp when the contract was cancelled';
COMMENT ON COLUMN contracts.cancelled_reason IS 'Reason for cancellation';

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_customer_id ON contracts(customer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_invoice_id ON contracts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_contracts_event_id ON contracts(event_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON contracts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_number ON contracts(contract_number);

-- RLS (Row Level Security)
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad

-- Política: Los usuarios solo pueden ver sus propios contratos
DROP POLICY IF EXISTS "Users can view own contracts" ON contracts;
CREATE POLICY "Users can view own contracts"
  ON contracts FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden crear sus propios contratos
DROP POLICY IF EXISTS "Users can create own contracts" ON contracts;
CREATE POLICY "Users can create own contracts"
  ON contracts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios contratos
DROP POLICY IF EXISTS "Users can update own contracts" ON contracts;
CREATE POLICY "Users can update own contracts"
  ON contracts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios no pueden eliminar contratos (solo cancelar)
-- Si necesitas permitir eliminación, descomenta lo siguiente:
-- DROP POLICY IF EXISTS "Users can delete own contracts" ON contracts;
-- CREATE POLICY "Users can delete own contracts"
--   ON contracts FOR DELETE
--   USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at automáticamente
-- Primero, verificar si la función update_updated_at_column existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  ) THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Crear trigger
DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Agregar columna template a la tabla invoices si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'template'
  ) THEN
    ALTER TABLE invoices ADD COLUMN template TEXT;
    COMMENT ON COLUMN invoices.template IS 'Invoice template used (simple, colorful, modern, elegant, professional)';
  END IF;
END $$;

-- Agregar columna preferred_invoice_template a la tabla users si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'preferred_invoice_template'
  ) THEN
    ALTER TABLE users ADD COLUMN preferred_invoice_template TEXT;
    COMMENT ON COLUMN users.preferred_invoice_template IS 'User preferred invoice template';
  END IF;
END $$;

-- Mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully: contracts table created';
END $$;
