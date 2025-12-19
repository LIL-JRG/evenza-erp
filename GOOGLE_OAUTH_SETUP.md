# Google OAuth Configuration Guide

## 1. Configure Google OAuth in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication > Providers**
3. Find **Google** and click "Enable"
4. Add your Google OAuth credentials:
   - Client ID: `GOOGLE_CLIENT_ID` from your Google Console
   - Client Secret: `GOOGLE_CLIENT_SECRET` from your Google Console

## 2. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the **Google+ API**:
   - Go to "APIs & Services > Library"
   - Search for "Google+ API" and enable it

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services > Credentials"
   - Click "Create Credentials > OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     ```
     https://[your-project-ref].supabase.co/auth/v1/callback
     http://localhost:3001/auth/callback
     ```

## 3. Update Environment Variables

Add these to your `.env` file:

```env
# Supabase Auth Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth (if using custom implementation)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 4. Test Google OAuth

1. Visit `/login` (updated to use Supabase Auth)
2. Click the "Google" button
3. You should be redirected to Google login
4. After authorization, you'll be redirected back to `/auth/callback`

## 5. Troubleshooting

### Error 400: redirect_uri_mismatch
This means the redirect URI in your Google Console doesn't match what Supabase is using.

**Solution**: Make sure these URIs are exactly the same in both places:
- In Google Console: `https://[your-project-ref].supabase.co/auth/v1/callback`
- In Supabase: The redirect URI should match

### User not appearing in Supabase Auth dashboard
This is expected behavior - users appear in the Auth dashboard when they authenticate through Supabase Auth, not when you manually insert them into the users table.

**Current behavior**: 
- Users authenticate through Supabase Auth
- User profiles are created in your custom `users` table
- Authentication is handled by Supabase Auth system

This is the correct approach for production applications!