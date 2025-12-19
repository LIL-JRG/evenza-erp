-- Fix the address column issue by ensuring the correct column names
-- The onboarding form is trying to update 'address' but we have 'business_address'

-- First, let's check if we need to rename the column
ALTER TABLE users 
DROP COLUMN IF EXISTS address;

-- Ensure we have the correct business fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS business_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS business_size VARCHAR(50),
ADD COLUMN IF NOT EXISTS years_in_business INTEGER;

-- Remove business_address since we're not using it in the form
ALTER TABLE users 
DROP COLUMN IF EXISTS business_address;

-- Update RLS policies to ensure users can update their business info
-- These should already exist, but let's ensure they're correct
-- CREATE POLICY IF NOT EXISTS is not valid syntax; use CREATE OR REPLACE POLICY instead
-- CREATE OR REPLACE POLICY is not valid in PostgreSQL; use DROP POLICY + CREATE POLICY
DROP POLICY IF EXISTS "Users can update their business info" ON users;
-- Ensure policy exists using valid syntax
CREATE POLICY "Users can update their business info" ON users
    FOR UPDATE USING (auth.uid() = id);
-- Grant proper permissions
GRANT UPDATE (company_name, business_type, business_size, years_in_business, phone, onboarding_completed) ON users TO authenticated;
GRANT SELECT (company_name, business_type, business_size, years_in_business, phone, onboarding_completed) ON users TO authenticated;
