-- Fix RLS policies for user registration
-- Allow anonymous users to create accounts

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Create new policy that allows anyone to register
CREATE POLICY "Anyone can register" ON users
    FOR INSERT WITH CHECK (true);

-- Keep the existing policies for updates and selects (drop first if they exist)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own credentials after registration
DROP POLICY IF EXISTS "Users can manage their own credentials" ON user_credentials;
CREATE POLICY "Users can manage their own credentials" ON user_credentials
    FOR ALL USING (auth.uid() = user_id);

-- Allow anonymous users to create credentials during registration
DROP POLICY IF EXISTS "Anyone can create credentials during registration" ON user_credentials;
CREATE POLICY "Anyone can create credentials during registration" ON user_credentials
    FOR INSERT WITH CHECK (true);