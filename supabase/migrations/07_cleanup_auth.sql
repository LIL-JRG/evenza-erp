-- Cleanup unused custom auth tables now that we rely on Supabase Auth
-- Drops: user_credentials, password_reset_tokens, auth_accounts

-- Drop dependent tables if they exist
DROP TABLE IF EXISTS user_credentials;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS auth_accounts;

-- No changes required for subscriptions or users tables
-- Ensure RLS policies on users remain intact
