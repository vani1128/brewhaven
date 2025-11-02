# Using Lovable's Supabase Project

Since you want to use the Supabase project from Lovable, here's how to set it up in your new Vercel deployment.

## Step 1: Get Supabase Credentials from Lovable

1. **Open your Lovable project**
2. Go to **Settings** or **Environment Variables** in Lovable
3. Look for:
   - `SUPABASE_URL` or `VITE_SUPABASE_URL`
   - `SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`
4. **Copy both values**

## Step 2: Set Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Add:

```
VITE_SUPABASE_URL=<paste-lovable-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<paste-lovable-anon-key>
```

4. **Important**: Select all environments (Production, Preview, Development)
5. Click **Save**
6. **Redeploy**:
   - Go to **Deployments** tab
   - Click **"..."** on latest → **Redeploy**

## Step 3: Verify Edge Function is Deployed

The chat bot needs the `coffee-chat` edge function deployed in Lovable's Supabase:

1. Go to **Supabase Dashboard** (the one from Lovable)
2. Click **Edge Functions** in left sidebar
3. Check if `coffee-chat` function exists
4. If **NOT** deployed:
   - Click **"Create a new function"**
   - Name: `coffee-chat`
   - Copy code from `supabase/functions/coffee-chat/index.ts`
   - Paste and deploy

## Step 4: Set AI API Key (If Not Already Set)

1. In **Supabase Dashboard** (Lovable's project)
2. Go to **Edge Functions** → **Secrets**
3. Check if `AI_API_KEY` exists
4. If not, add it:
   - Get Gemini API key from https://makersuite.google.com/app/apikey
   - Add as secret: `AI_API_KEY`

## Step 5: Add Admin Role in Lovable's Database

1. Go to **Supabase Dashboard** (Lovable's project) → **SQL Editor**
2. Run:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('bbb3ac9c-6b63-4672-854e-f47b61e2302d', 'admin'::public.app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify
SELECT u.email, ur.role 
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.user_id = 'bbb3ac9c-6b63-4672-854e-f47b61e2302d';
```

## Step 6: Clear Browser Cache

1. Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
2. Or clear browser cache completely
3. Sign out and sign back in

## Step 7: Verify Everything Works

### ✅ Test Chat Bot
- Go to `/chat`
- Send a message
- Should get AI response

### ✅ Test Admin Access
- Check browser console for admin status
- Admin button should appear if role is set

### ✅ Test Database
- Go to `/shop` - should show coffees from Lovable database

## Where to Find Lovable Settings

**Option 1: Lovable Dashboard**
- Open your Lovable project
- Look for **Settings** or **Environment Variables** section
- Find Supabase credentials

**Option 2: Lovable Code/Config**
- Check if there's a `.env` file or config section
- Look for `SUPABASE_URL` and `SUPABASE_ANON_KEY`

**Option 3: Supabase Dashboard Directly**
- If you have access to Supabase Dashboard
- Go to **Settings** → **API**
- Copy **Project URL** and **anon/public key**

## Quick Checklist

- [ ] Copied Supabase URL from Lovable
- [ ] Copied Supabase anon key from Lovable
- [ ] Set both in Vercel Environment Variables
- [ ] Redeployed on Vercel
- [ ] Verified edge function `coffee-chat` is deployed in Lovable's Supabase
- [ ] Set `AI_API_KEY` in Supabase secrets (if not already)
- [ ] Added admin role in Lovable's Supabase database
- [ ] Cleared browser cache
- [ ] Tested chat bot
- [ ] Tested admin access

## Troubleshooting

**"Still showing old data"**
- Clear browser cache completely
- Check Vercel is using correct Supabase URL
- Redeploy on Vercel

**"Bot not working"**
- Check edge function is deployed in Lovable's Supabase
- Check `AI_API_KEY` is set in Supabase secrets
- Check Vercel environment variables are correct

**"Admin not working"**
- Verify admin role was added in Lovable's Supabase database
- Sign out and sign back in
- Check browser console for admin status

