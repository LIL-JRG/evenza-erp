# Complete Google OAuth Setup Guide

## Why Users Don't Appear in Supabase Auth Dashboard

You're seeing users in your `users` table but not in the Supabase Auth dashboard because:

1. **You registered users manually** - You created them in your `users` table
2. **Supabase Auth handles authentication separately** - Users need to authenticate through Supabase Auth to appear in the dashboard

## Current Status

✅ **Registration works** - Users are created in your database
❌ **Login fails** - Because passwords aren't stored in Supabase Auth
❌ **Google OAuth fails** - Redirect URI mismatch

## Solution: Use Supabase Auth Properly

### 1. Enable Google OAuth in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication > Providers**
4. Find **Google** and click "Enable"
5. Enter your credentials:
   - Client ID: `your_google_client_id`
   - Client Secret: `your_google_client_secret`

### 2. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select your project
3. **Enable Google+ API**:
   - APIs & Services > Library
   - Search "Google+ API" → Enable
4. **Create OAuth Credentials**:
   - APIs & Services > Credentials
   - Create Credentials > OAuth client ID
   - Application type: "Web application"
   - Add these **Authorized redirect URIs**:
     ```
     https://[your-project-ref].supabase.co/auth/v1/callback
     http://localhost:3001/auth/callback
     ```

### 3. Test the Fixed Flow

1. **Registration**: Visit `/register` and create an account
   - This now uses Supabase Auth
   - Users will appear in Supabase Auth dashboard

2. **Login**: Visit `/login` and sign in
   - Uses Supabase Auth for authentication
   - Should work with your new account

3. **Google OAuth**: Click "Google" button
   - Should redirect to Google login
   - Then redirect back to your app

## Expected Behavior After Fix

- ✅ Users appear in **Supabase Auth dashboard** when they register
- ✅ Login works with **Supabase Auth** (not manual verification)
- ✅ Google OAuth redirects properly
- ✅ All authentication goes through **Supabase Auth**

## Migration Note

Your existing users (like `jmhr.221004@outlook.com`) were created manually in the database, so they won't work with Supabase Auth login. You'll need to:

1. **Create new accounts** through the registration form (uses Supabase Auth)
2. **Or manually migrate** existing users to Supabase Auth (advanced)

## Quick Test

Try this sequence:
1. Go to `/register`
2. Create a new account with a different email
3. Check if it appears in Supabase Auth dashboard
4. Try logging in with that new account
5. Test Google OAuth button

Let me know if you need help with any of these steps!