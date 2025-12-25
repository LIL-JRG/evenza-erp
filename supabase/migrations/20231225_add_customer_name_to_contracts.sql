-- Migration: Add customer_name to contracts table for better search
-- Created: 2023-12-25
-- Description: Adds denormalized customer_name field for efficient searching

-- Add customer_name column
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Create index for searching
CREATE INDEX IF NOT EXISTS idx_contracts_customer_name ON contracts(customer_name);

-- Update existing contracts with customer names
UPDATE contracts c
SET customer_name = cu.full_name
FROM customers cu
WHERE c.customer_id = cu.id
  AND c.customer_name IS NULL;

-- Add comment
COMMENT ON COLUMN contracts.customer_name IS 'Denormalized customer name for efficient searching';
