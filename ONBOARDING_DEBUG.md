# Onboarding Redirect Loop - Debugging Guide

## Problem Analysis

You're experiencing a redirect loop where:
1. User logs in successfully
2. Gets redirected to `/onboarding`
3. Middleware immediately redirects back to `/login`

## Root Cause

The middleware was using the old `AuthService` that tried to verify JWT tokens manually, but we're now using **Supabase Auth** directly. The middleware couldn't properly validate the Supabase session.

## ✅ Solutions Applied

### 1. **Updated Middleware** (`middleware.ts`)
- ✅ Now uses `supabase.auth.getSession()` instead of manual JWT verification
- ✅ Properly checks Supabase Auth sessions
- ✅ Handles onboarding flow correctly

### 2. **Updated Onboarding Page** (`app/onboarding/page.tsx`)
- ✅ Now checks authentication directly with Supabase
- ✅ Handles session validation properly
- ✅ Updates user profile via Supabase client

### 3. **Enhanced Login Page** (`app/login/page.tsx`)
- ✅ Added session checking on page load
- ✅ Better error handling
- ✅ Proper session management

## 🔧 Testing Steps

### 1. **Test the Fixed Flow**
```bash
# Clear all cookies first
# Visit login page
http://localhost:3001/login

# Login with your credentials
# Should redirect to onboarding (if not completed)
# Should stay on onboarding page (no redirect loop)
```

### 2. **Debug Tools**
```bash
# Check auth status
http://localhost:3001/auth/debug

# Test session management
http://localhost:3001/api/test-session
```

### 3. **Monitor Console**
Watch browser console for:
- Authentication errors
- Session validation messages
- Redirect attempts

## 📋 Expected Behavior After Fix

### New User Flow:
1. `/register` → Create account → `/onboarding`
2. Complete onboarding → `/dashboard`
3. Future logins → `/dashboard` (skip onboarding)

### Existing User Flow:
1. `/login` → Authenticate → Check onboarding status
2. If onboarding incomplete → `/onboarding`
3. If onboarding complete → `/dashboard`

## 🚨 If Still Having Issues

### Check These:
1. **Clear browser cookies** (old session data)
2. **Check Supabase Auth dashboard** (verify user exists)
3. **Use debug page** (`/auth/debug`)
4. **Check browser console** for errors

### Common Issues:
- **Session not persisting**: Check cookie settings
- **User not in database**: Create through registration
- **Middleware still redirecting**: Clear cache/restart dev server

## 🎯 Quick Fix Test

Try this sequence:
1. **Clear all cookies**
2. **Register new account** at `/register`
3. **Complete onboarding** at `/onboarding`
4. **Logout and login again**
5. **Should go directly to dashboard**

The onboarding redirect loop should now be **completely resolved**! 🎉