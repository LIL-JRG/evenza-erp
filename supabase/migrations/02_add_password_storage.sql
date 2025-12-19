-- Create user_credentials table for secure password storage
CREATE TABLE IF NOT EXISTS user_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for updated_at
CREATE TRIGGER update_user_credentials_updated_at BEFORE UPDATE ON user_credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_credentials
CREATE POLICY "Users can view their own credentials" ON user_credentials
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own credentials" ON user_credentials
    FOR ALL USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON user_credentials TO authenticated;
GRANT INSERT ON user_credentials TO authenticated;
GRANT UPDATE ON user_credentials TO authenticated;
GRANT DELETE ON user_credentials TO authenticated;

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for password_reset_tokens
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reset tokens" ON password_reset_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create reset tokens" ON password_reset_tokens
    FOR INSERT WITH CHECK (true);

-- Grant permissions for password_reset_tokens
GRANT SELECT ON password_reset_tokens TO authenticated;
GRANT INSERT ON password_reset_tokens TO anon, authenticated;