-- Add contract template fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS legal_contract_template TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_template TEXT;

-- Comments explaining the fields
COMMENT ON COLUMN users.legal_contract_template IS 'Plantilla de contrato legal formal con estructura legal, RFC, razón social, etc.';
COMMENT ON COLUMN users.terms_template IS 'Plantilla de términos y condiciones informal para negocios';
