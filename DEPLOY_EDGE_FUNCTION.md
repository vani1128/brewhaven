# Deploy Edge Function for Chat Bot

The chat bot needs the `coffee-chat` edge function deployed to Supabase. Here's how to do it.

## Option 1: Using Supabase CLI (Recommended)

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```

### Step 3: Link to Your Project
```bash
# Get your project reference ID from Supabase Dashboard → Settings → General
supabase link --project-ref your-project-ref
```

**To find project-ref:**
- Go to Supabase Dashboard
- Settings → General
- Copy the "Reference ID" (looks like: `eoryyqttzktnwjpzdwef`)

### Step 4: Deploy the Function
```bash
supabase functions deploy coffee-chat
```

### Step 5: Set AI API Key Secret
```bash
# Get your Gemini API key from https://makersuite.google.com/app/apikey
supabase secrets set AI_API_KEY=your-gemini-api-key-here
```

---

## Option 2: Using Supabase Dashboard (Easier, No CLI)

### Step 1: Create the Function

1. Go to **Supabase Dashboard** → Your Project
2. Click **Edge Functions** in left sidebar
3. Click **"Create a new function"**
4. Name it: `coffee-chat`
5. Copy the code from `supabase/functions/coffee-chat/index.ts`
6. Paste it into the code editor
7. Click **Deploy**

### Step 2: Set AI API Key

1. Still in **Edge Functions** section
2. Click **Secrets** tab
3. Click **Add Secret**
4. Name: `AI_API_KEY`
5. Value: Your Gemini API key (get from https://makersuite.google.com/app/apikey)
6. Click **Save**

---

## Verify It Works

### Test in Browser Console
1. Open your app
2. Open browser console (F12)
3. Go to `/chat`
4. Send a message
5. Check console for errors

### Check Edge Function Logs
1. Supabase Dashboard → Edge Functions
2. Click on `coffee-chat` function
3. Click **Logs** tab
4. Try sending a message in chat
5. You should see logs appear

---

## Troubleshooting

### "Edge function not found" or 404
- Function not deployed → Deploy it (Option 2 above)

### "AI service not configured"
- `AI_API_KEY` not set → Add it in Supabase Secrets

### "Rate limit exceeded"
- Gemini API quota reached → Wait or upgrade API key

### "Network error"
- Check Supabase project is active (not paused)
- Check environment variables in Vercel are correct

---

## Quick Checklist

- [ ] Edge function `coffee-chat` deployed in Supabase
- [ ] `AI_API_KEY` secret set in Supabase
- [ ] Environment variables set in Vercel
- [ ] Vercel redeployed after setting env vars
- [ ] Tested chat - sends message and gets response

