# Backend Setup - Complete Step-by-Step Guide

Follow these steps **in order** to set up your Supabase backend.

---

## STEP 1: Create Supabase Project

1. Go to **https://supabase.com** → Sign in
2. Click **"New Project"**
3. Fill details:
   - **Name**: `brewhaven`
   - **Database Password**: ⚠️ **SAVE THIS PASSWORD**
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. ⏳ Wait 2-3 minutes for initialization

---

## STEP 2: Run Database Setup SQL

1. In **Supabase Dashboard** → Click **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open file: `FRESH_SETUP.sql` from this repo
4. **Copy ALL the SQL code** (Ctrl+A, Ctrl+C)
5. **Paste into SQL Editor** (Ctrl+V)
6. Click **"Run"** button (or press `Ctrl+Enter`)
7. ✅ Should see: "Success. No rows returned"

**This creates:**
- ✅ All tables (coffees, categories, orders, etc.)
- ✅ Security policies (RLS)
- ✅ Admin role system
- ✅ Default categories and ice flavours

---

## STEP 3: Get Your Supabase Credentials

1. In **Supabase Dashboard** → Click **Settings** (gear icon)
2. Click **API** (left sidebar)
3. Copy these values:

   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGciOi... (long JWT token)
   ```

4. ⚠️ **Save these** - you'll need them next!

---

## STEP 4: Deploy Edge Function (Chatbot)

1. In **Supabase Dashboard** → Click **Edge Functions** (left sidebar)
2. Click **"Create a new function"** or **"Create function"**
3. Name it: `coffee-chat`
4. In the code editor, open: `supabase/functions/coffee-chat/index.ts`
5. **Copy ALL the code** from that file
6. **Paste into Supabase code editor**
7. Click **"Deploy"** or **"Save"**
8. ✅ Wait for deployment to complete

---

## STEP 5: Set AI_API_KEY Secret

1. Still in **Edge Functions** → Click **"Secrets"** tab
2. Click **"Add secret"**
3. Fill in:
   - **Name**: `AI_API_KEY`
   - **Value**: Your Google Gemini API key
     - Get from: https://makersuite.google.com/app/apikey
     - Sign in with Google → Click "Create API Key"
4. Click **"Save"**
5. ✅ Secret is now set

---

## STEP 6: Configure Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Add/Update these variables:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `VITE_SUPABASE_URL` | Your Project URL from Step 3 | **All** (Production, Preview, Development) |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | Your anon key from Step 3 | **All** |

4. ✅ Make sure to select **all environments**
5. Click **"Save"**
6. **Redeploy**: Go to **Deployments** → Latest → Click **"Redeploy"**

---

## STEP 7: Update Local .env.local

1. In your project root, create/update `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
```

2. Replace `xxxxx` with your actual values from Step 3
3. Restart dev server: `npm run dev`

---

## STEP 8: Create Your Admin Account

1. **Sign up** in your app (or via Supabase Auth)
2. **Copy your email address**
3. In **Supabase Dashboard** → **SQL Editor**
4. Run this SQL (replace email):

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

5. **Sign out** and **sign back in** to your app
6. ✅ Admin button should appear!

---

## STEP 9: Verify Everything Works

### Test Chatbot:
1. Go to `/chat` in your app
2. Send a message like "I want strong coffee"
3. ✅ Should get AI response

### Test Admin Panel:
1. Click **"Admin Panel"** button (should be visible)
2. Go to `/admin`
3. ✅ Should see admin dashboard
4. Try adding a coffee item

### Test Shop:
1. Go to `/shop`
2. ✅ Should see coffee products

---

## Troubleshooting

### Chat not working?
- ✅ Check Edge Function is deployed (Step 4)
- ✅ Check `AI_API_KEY` secret is set (Step 5)
- ✅ Check Vercel env vars match Supabase (Step 6)

### Admin button not showing?
- ✅ Run SQL from Step 8 (add admin role)
- ✅ Sign out and sign back in
- ✅ Check browser console for errors

### Tables missing?
- ✅ Re-run `FRESH_SETUP.sql` (Step 2)
- ✅ Check SQL Editor for errors

### Need to check Edge Function logs?
1. **Supabase Dashboard** → **Edge Functions** → `coffee-chat`
2. Click **"Logs"** tab
3. See real-time execution logs

---

## Quick Checklist

- [ ] Step 1: Supabase project created
- [ ] Step 2: Database tables created (ran FRESH_SETUP.sql)
- [ ] Step 3: Credentials copied
- [ ] Step 4: Edge function deployed
- [ ] Step 5: AI_API_KEY secret set
- [ ] Step 6: Vercel env vars configured
- [ ] Step 7: Local .env.local updated
- [ ] Step 8: Admin role added
- [ ] Step 9: Everything tested ✅

---

## That's It! 🎉

Your backend is now fully set up and ready to use.

