-- Add missing columns to users table for better business information
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS business_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS business_size VARCHAR(50),
ADD COLUMN IF NOT EXISTS years_in_business INTEGER;

-- Update RLS policies to allow users to update their own business info
-- These policies should already exist, but let's ensure they're correct

-- Grant permissions for new columns
GRANT UPDATE (phone, business_address, business_type, business_size, years_in_business) ON users TO authenticated;
GRANT SELECT (phone, business_address, business_type, business_size, years_in_business) ON users TO authenticated;