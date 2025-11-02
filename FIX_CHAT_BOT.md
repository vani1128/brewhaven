# Fix Chat Bot - Quick Checklist

Since the AI was working in Lovable, the edge function should already be deployed. Let's verify and fix.

## Step 1: Verify Edge Function is Deployed

1. Go to **Supabase Dashboard** → Your Project
2. Click **Edge Functions** in left sidebar
3. Check if `coffee-chat` function exists
4. If it exists → ✅ Already deployed
5. If it doesn't exist → Deploy it (see Step 2)

## Step 2: Verify AI API Key is Set

1. In **Supabase Dashboard** → **Edge Functions**
2. Click **Secrets** tab
3. Check if `AI_API_KEY` exists
4. If missing → Add it (get Gemini key from https://makersuite.google.com/app/apikey)

## Step 3: Set Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your New Project
2. **Settings** → **Environment Variables**
3. Add these (get from Supabase Dashboard → Settings → API):
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```
4. **Save** and **Redeploy**

## Step 4: Test the Edge Function Directly

Open browser console (F12) and run:

```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

fetch(`${SUPABASE_URL}/functions/v1/coffee-chat`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_KEY}`
  },
  body: JSON.stringify({ message: 'Hello', conversationHistory: [] })
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

**If this works** → Edge function is fine, issue is in frontend
**If this fails** → Edge function issue (check deployment or AI key)

## Most Likely Issues

### Issue 1: Edge Function Not Deployed
- **Fix**: Deploy it (Supabase Dashboard → Edge Functions → Create → coffee-chat)

### Issue 2: AI_API_KEY Missing
- **Fix**: Add secret in Supabase → Edge Functions → Secrets → Add `AI_API_KEY`

### Issue 3: Wrong Supabase URL in Vercel
- **Fix**: Set correct `VITE_SUPABASE_URL` in Vercel environment variables

### Issue 4: Browser Cache Showing Old Code
- **Fix**: Hard refresh (Ctrl+Shift+R) or clear cache completely

## Quick Fix Steps

1. ✅ Check edge function exists in Supabase
2. ✅ Check AI_API_KEY is set in Supabase secrets
3. ✅ Set environment variables in Vercel (matching Supabase project)
4. ✅ Redeploy on Vercel
5. ✅ Clear browser cache
6. ✅ Test chat

