-- Rollback Migration: Drop contracts table
-- Created: 2023-12-25
-- Description: Reverts the contracts table creation

-- ADVERTENCIA: Este rollback eliminará permanentemente todos los datos de contratos
-- Asegúrate de hacer un backup antes de ejecutar

-- Eliminar políticas RLS
DROP POLICY IF EXISTS "Users can view own contracts" ON contracts;
DROP POLICY IF EXISTS "Users can create own contracts" ON contracts;
DROP POLICY IF EXISTS "Users can update own contracts" ON contracts;
DROP POLICY IF EXISTS "Users can delete own contracts" ON contracts;

-- Eliminar triggers
DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;

-- Eliminar índices (se eliminan automáticamente con la tabla, pero por claridad)
DROP INDEX IF EXISTS idx_contracts_user_id;
DROP INDEX IF EXISTS idx_contracts_customer_id;
DROP INDEX IF EXISTS idx_contracts_invoice_id;
DROP INDEX IF EXISTS idx_contracts_event_id;
DROP INDEX IF EXISTS idx_contracts_status;
DROP INDEX IF EXISTS idx_contracts_created_at;
DROP INDEX IF EXISTS idx_contracts_contract_number;

-- Eliminar tabla
DROP TABLE IF EXISTS contracts CASCADE;

-- Eliminar columnas agregadas a otras tablas
ALTER TABLE invoices DROP COLUMN IF EXISTS template;
ALTER TABLE users DROP COLUMN IF EXISTS preferred_invoice_template;

-- Mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE 'Rollback completed successfully: contracts table dropped';
END $$;
