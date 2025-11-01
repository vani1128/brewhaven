# Authentication Troubleshooting Guide

If you're experiencing "Invalid email or password" errors, follow these steps:

## Common Issues and Solutions

### 1. **Email Confirmation Required**

By default, Supabase requires email confirmation before users can sign in.

**Check Supabase Settings:**
1. Go to Supabase Dashboard → **Authentication** → **Settings**
2. Look for **"Enable email confirmations"**
3. If enabled, users must click the verification link in their email before they can sign in

**Solutions:**
- **Option A**: Check your email (including spam folder) and click the verification link
- **Option B**: Disable email confirmation for development:
  1. Go to Supabase Dashboard → **Authentication** → **Settings**
  2. Toggle off **"Enable email confirmations"**
  3. Existing users will still need to verify, but new signups won't

### 2. **Check Your Supabase Keys**

Make sure you're using the correct keys from Supabase:

1. Go to Supabase Dashboard → **Settings** → **API**
2. Copy these values:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon/public key** → Use as `VITE_SUPABASE_PUBLISHABLE_KEY`

**In your `.env` file:**
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important**: 
- Use the `anon` or `public` key, NOT the `service_role` key
- The `service_role` key should NEVER be used in frontend code

### 3. **Verify Environment Variables Are Loaded**

After setting `.env` file:
1. **Restart your development server** (`npm run dev`)
2. Check browser console for any errors about missing environment variables
3. If you see "Missing required environment variables", double-check your `.env` file

### 4. **Check Supabase Authentication Settings**

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. Check that your email domain is not blocked (if using custom domain restrictions)

### 5. **SMTP Configuration**

If email confirmation is enabled but emails aren't being sent:
1. Check `SUPABASE_SMTP_SETUP.md` for SMTP configuration
2. Go to Supabase Dashboard → **Settings** → **Auth** → **SMTP Settings**
3. Verify SMTP is configured (or use Supabase's built-in SMTP for testing)

### 6. **Browser Console Debugging**

Open browser console (F12) and check:
- Any error messages from Supabase
- Network tab for failed requests to Supabase
- Console logs showing authentication errors

The code now logs errors to console - look for:
- "Sign in error: ..."
- "Sign up error: ..."

### 7. **Create a New Test Account**

Try creating a completely new account:
1. Use a different email address
2. Use a strong password (at least 6 characters)
3. If email confirmation is enabled, check email for verification link

### 8. **Check User Status in Supabase**

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find your user account
3. Check:
   - **Email Confirmed**: Should be `true` if email confirmation is enabled
   - **Status**: Should be active
   - **Last Sign In**: Shows when you last logged in

### 9. **Common Error Messages**

| Error Message | Solution |
|--------------|----------|
| "Invalid login credentials" | Check email/password are correct, or email needs verification |
| "Email not confirmed" | Click verification link in your email |
| "User already registered" | User exists, try signing in instead |
| "Missing Supabase configuration" | Check `.env` file and restart dev server |

## Quick Fix Checklist

- [ ] Restarted dev server after setting `.env` file
- [ ] Using correct `anon/public` key (not service_role)
- [ ] Checked email for verification link
- [ ] Verified Supabase project URL is correct
- [ ] Checked browser console for detailed errors
- [ ] Tried creating a new test account
- [ ] Verified Email provider is enabled in Supabase
- [ ] Checked SMTP configuration if emails aren't sending

## Still Having Issues?

1. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for error messages
   - Share the error message for debugging

2. **Check Network Tab**:
   - Open Developer Tools (F12)
   - Go to Network tab
   - Try to sign in
   - Look for failed requests to `*.supabase.co`
   - Check the response for error details

3. **Verify Supabase Connection**:
   - Check if you can access Supabase Dashboard
   - Verify project is active
   - Check project settings for any restrictions

4. **Test with a New Account**:
   - Create a completely new email account
   - Sign up fresh
   - If it works, the issue might be with the specific account

---

**Note**: If you're using Supabase's built-in SMTP (default), it has limitations (3 emails/hour per user). For production, configure custom SMTP (see `SUPABASE_SMTP_SETUP.md`).

