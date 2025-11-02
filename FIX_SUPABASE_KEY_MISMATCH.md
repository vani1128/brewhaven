# Fix Supabase Key Mismatch - Edge Function vs Frontend

## The Problem
Your edge function is deployed in **one Supabase project**, but your frontend/Vercel is using **different Supabase keys**, so they can't communicate.

## Step 1: Find Which Supabase Has the Working Edge Function

1. Go to **Supabase Dashboard** → https://supabase.com/dashboard
2. You should see multiple projects listed
3. **For EACH project**, check:
   - Click on the project
   - Go to **Edge Functions** (left sidebar)
   - Check if `coffee-chat` function exists
   - **Note which project has it** ✅

**Example:**
- Project A (`xxxxx.supabase.co`) → Has `coffee-chat` function ✅
- Project B (`yyyyy.supabase.co`) → No edge function ❌

## Step 2: Get Credentials from the Correct Project

**Go to the Supabase project that HAS the edge function:**

1. Click on that project in Supabase Dashboard
2. Go to **Settings** → **API**
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOi...` (long JWT token)

## Step 3: Update Everything to Use Same Project

### A. Update Vercel Environment Variables

1. **Go to Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. **Update or Add:**
   - `VITE_SUPABASE_URL` = Project URL from Step 2
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = anon key from Step 2
4. **Important:** Select all environments (Production, Preview, Development)
5. **Save**
6. **Redeploy** (Deployments → Latest → Redeploy)

### B. Update Local .env.local File

1. **Open** `.env.local` file in your project root
2. **Update** to match the same Supabase project:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi... (same key)
   ```
3. **Save**
4. **Restart** your local dev server (`npm run dev`)

## Step 4: Verify Everything Matches

### Check Localhost:
**Browser Console (F12) on localhost:**
```javascript
console.log('Localhost Supabase:', import.meta.env.VITE_SUPABASE_URL);
```

### Check Production:
**Browser Console (F12) on production:**
```javascript
console.log('Production Supabase:', import.meta.env.VITE_SUPABASE_URL);
```

### Check Vercel:
1. Vercel Dashboard → Settings → Environment Variables
2. Verify `VITE_SUPABASE_URL` matches the Supabase project with edge function

**All three should show the SAME URL!**

## Step 5: Test the Connection

After updating:

1. **Go to production site** → `/chat`
2. **Click "Test Edge Function"** in diagnostic tool
3. **Should show** ✅ (not ❌)
4. **Try sending a message** → Should work!

## Quick Checklist

- [ ] Found Supabase project with `coffee-chat` edge function
- [ ] Got Project URL and anon key from that project
- [ ] Updated Vercel environment variables
- [ ] Updated local `.env.local` file
- [ ] Redeployed on Vercel
- [ ] Restarted local dev server
- [ ] Verified all three show same Supabase URL
- [ ] Tested chat - works! ✅

## Common Issue: Multiple Supabase Projects

**If you have multiple Supabase projects:**

**Option 1: Use the Project with Edge Function (Recommended)**
- Update Vercel and local to use that project
- One project for everything ✅

**Option 2: Deploy Edge Function to Other Project**
- If you want to keep different projects
- Deploy `coffee-chat` function to the other Supabase project too
- But this is more work - Option 1 is better

## Troubleshooting

### "Edge function not found" after updating
- Wait 10 seconds for environment variables to propagate
- Hard refresh browser (Ctrl+Shift+R)
- Check Vercel deployment logs for errors

### "Different keys still showing"
- Clear browser cache completely
- Sign out and sign back in
- Check Vercel actually saved the new values

