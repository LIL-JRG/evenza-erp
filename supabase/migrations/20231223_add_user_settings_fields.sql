-- Migration: Add user settings fields for avatar, logo, IVA, and business address
-- Created: 2023-12-23

-- Add new columns to users table if they don't exist
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS business_address TEXT,
  ADD COLUMN IF NOT EXISTS enable_iva BOOLEAN DEFAULT false;

-- Create storage buckets for logos and avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('logos', 'logos', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage buckets (if not already enabled)
DO $$
BEGIN
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Drop existing policies if they exist (to make migration idempotent)
DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Create storage policies for logos bucket
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Authenticated users can update logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'logos');

CREATE POLICY "Authenticated users can delete logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'logos');

CREATE POLICY "Anyone can view logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'logos');

-- Create storage policies for avatars bucket
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can update avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Add helpful comment
COMMENT ON COLUMN users.enable_iva IS 'Whether to include IVA (16%) in invoices and quotes';
COMMENT ON COLUMN users.business_address IS 'Business address displayed on invoices and quotes';
COMMENT ON COLUMN users.logo_url IS 'Company logo URL from storage';
COMMENT ON COLUMN users.avatar_url IS 'User profile avatar URL from storage';
