# Find Where Localhost Supabase URL is Coming From

## Step 1: Check for Hidden .env Files

The Supabase URL might be in a hidden environment file. Check for:

```powershell
# In PowerShell, run:
Get-ChildItem -Path . -Filter ".env*" -Force

# Or check specific files:
if (Test-Path .env) { Get-Content .env }
if (Test-Path .env.local) { Get-Content .env.local }
if (Test-Path .env.development) { Get-Content .env.development }
```

## Step 2: Check Browser Console

**On localhost (working chat):**
1. Open DevTools (F12) → Console
2. Run:
```javascript
console.log('Localhost Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Localhost Supabase Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20) + '...');
```
3. **Copy both values** - these are your working Supabase credentials!

## Step 3: Check Production URL

**On production site:**
1. Open DevTools (F12) → Console
2. Run:
```javascript
console.log('Production Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Production Supabase Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20) + '...');
```
3. **Copy both values** - compare with localhost

## Step 4: Sync Them

### Option A: Use Localhost Supabase for Production (Recommended)

Since localhost is working, use that Supabase project for production:

1. **Get localhost credentials** (from Step 2)
2. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
3. **Update**:
   - `VITE_SUPABASE_URL` = localhost value
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = localhost value
4. **Redeploy** on Vercel
5. **Done!** ✅ Production will now use the same Supabase (which has edge function deployed)

### Option B: Deploy Edge Function to Production Supabase

If you want to keep different Supabase projects:

1. **Get production credentials** (from Step 3)
2. **Go to Supabase Dashboard** → Project matching production URL
3. **Deploy edge function**:
   - Edge Functions → Create `coffee-chat`
   - Copy code from `supabase/functions/coffee-chat/index.ts`
   - Deploy
4. **Set AI_API_KEY secret** in that Supabase project
5. **Done!** ✅

## Recommended Solution

**Use the SAME Supabase project for both localhost and production** (Option A)

**Why?**
- ✅ Simpler - one database to manage
- ✅ Edge function already deployed there
- ✅ Same users, same data
- ✅ Easier to maintain

**How:**
1. Get localhost Supabase URL from browser console
2. Update Vercel environment variables to match
3. Redeploy

## Quick Check Commands

**Find which Supabase localhost is using:**
```javascript
// Run in localhost browser console (F12)
console.log({
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 30)
});
```

**Then compare with production:**
```javascript
// Run in production browser console (F12)
console.log({
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 30)
});
```

**If they're different** → Use Option A (update Vercel to match localhost)

