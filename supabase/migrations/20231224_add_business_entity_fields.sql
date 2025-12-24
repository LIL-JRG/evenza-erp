-- Add business entity type and legal fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_entity_type TEXT CHECK (business_entity_type IN ('legal', 'local'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS legal_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rfc TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS legal_representative TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS fiscal_address TEXT;

-- Comments explaining the fields
COMMENT ON COLUMN users.business_entity_type IS 'Tipo de entidad: "legal" para empresa formal, "local" para negocio local';
COMMENT ON COLUMN users.legal_name IS 'Razón social de la empresa (solo para empresas legales)';
COMMENT ON COLUMN users.rfc IS 'RFC de la empresa (solo para empresas legales)';
COMMENT ON COLUMN users.legal_representative IS 'Nombre del representante legal (solo para empresas legales)';
COMMENT ON COLUMN users.fiscal_address IS 'Domicilio fiscal (solo para empresas legales)';
