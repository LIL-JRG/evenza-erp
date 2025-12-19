-- Fix login issue for existing users
-- This creates a simple admin function to check auth status

-- Create a function to check if user exists in Supabase Auth
CREATE OR REPLACE FUNCTION check_user_auth_status(user_email TEXT)
RETURNS TABLE (
  exists_in_database BOOLEAN,
  exists_in_supabase_auth BOOLEAN,
  needs_migration BOOLEAN
) AS $$
BEGIN
  -- Check if user exists in our users table
  EXISTS_IN_DATABASE := EXISTS (
    SELECT 1 FROM users WHERE email = user_email
  );

  -- Note: We can't directly check Supabase Auth from here
  -- This would need to be done in application code
  EXISTS_IN_SUPABASE_AUTH := FALSE;
  NEEDS_MIGRATION := EXISTS_IN_DATABASE AND NOT EXISTS_IN_SUPABASE_AUTH;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_user_auth_status TO authenticated;

-- Create a simple view to see user auth status
CREATE OR REPLACE VIEW user_auth_status AS
SELECT 
  u.id,
  u.email,
  u.name,
  u.created_at,
  CASE 
    WHEN u.email_verified = TRUE THEN 'Verified'
    ELSE 'Not Verified'
  END as email_status,
  'Check in Supabase Auth dashboard' as auth_status
FROM users u;

GRANT SELECT ON user_auth_status TO authenticated;