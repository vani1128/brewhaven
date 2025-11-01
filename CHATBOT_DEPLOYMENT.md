# Chatbot Deployment Guide for Production

The chatbot uses a Supabase Edge Function that needs to be deployed and configured properly for production.

## Issues in Production

If you see "Failed to fetch data" or "Failed to get response from AI" errors, it's likely because:

1. ❌ The Supabase Edge Function is not deployed
2. ❌ The `AI_API_KEY` secret is not set in Supabase

## Step-by-Step Fix

### Step 1: Deploy the Edge Function

The edge function (`coffee-chat`) needs to be deployed to Supabase. You have two options:

#### Option A: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   - Find your project ref in Supabase Dashboard → Settings → General → Reference ID

4. **Deploy the function**:
   ```bash
   supabase functions deploy coffee-chat
   ```

#### Option B: Using Supabase Dashboard

1. Go to Supabase Dashboard → **Edge Functions**
2. Click **"Create a new function"**
3. Name it `coffee-chat`
4. Copy the contents of `supabase/functions/coffee-chat/index.ts`
5. Paste it into the editor
6. Click **Deploy**

### Step 2: Set the AI_API_KEY Secret in Supabase

The edge function needs access to your AI API key. This must be set in Supabase, NOT in Vercel!

#### Using Supabase CLI:

```bash
supabase secrets set AI_API_KEY=your-openai-api-key-here
```

Replace `your-openai-api-key-here` with your actual OpenAI API key (starts with `sk-...`).

#### Using Supabase Dashboard:

1. Go to Supabase Dashboard → **Project Settings** → **Edge Functions** → **Secrets**
2. Click **"Add a new secret"**
3. Name: `AI_API_KEY`
4. Value: Your API key (the one you used for Lovable AI Gateway or your AI service)
5. Click **Save**

**Important**: 
- The secret name must be exactly `AI_API_KEY`
- This is different from Vercel environment variables!
- This secret is only accessible by your Supabase Edge Functions
- Use your OpenAI API key from https://platform.openai.com/api-keys

### Step 3: Verify Edge Function is Working

1. Go to Supabase Dashboard → **Edge Functions**
2. Find `coffee-chat` function
3. Check the logs to see if there are any errors
4. You can test it directly from the dashboard

### Step 4: Check Vercel Environment Variables

Make sure these are set in Vercel (these are for the frontend):

- ✅ `VITE_SUPABASE_URL` - Your Supabase project URL
- ✅ `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key

These are NOT the secrets needed by the edge function!

## Environment Variables Summary

### For Vercel (Frontend):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key

### For Supabase (Edge Function):
- `AI_API_KEY` - Your AI service API key (set as Supabase secret)

## Troubleshooting

### "Failed to fetch data" Error

1. **Check if edge function is deployed**:
   - Go to Supabase Dashboard → Edge Functions
   - Verify `coffee-chat` function exists and is deployed

2. **Check edge function logs**:
   - Go to Supabase Dashboard → Edge Functions → `coffee-chat` → Logs
   - Look for errors like "AI_API_KEY is not configured"

3. **Verify secret is set**:
   - Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
   - Make sure `AI_API_KEY` is listed with your OpenAI API key

4. **Test the endpoint directly**:
   - Open browser console (F12)
   - Check the Network tab when sending a chat message
   - Look at the response from `/functions/v1/coffee-chat`

### "AI service not configured" Error

This means `AI_API_KEY` is not set in Supabase secrets. Follow Step 2 above.

### CORS Errors

The edge function should handle CORS automatically. If you see CORS errors:
- Check that the edge function is deployed correctly
- Verify the CORS headers in the function code

## Quick Checklist

- [ ] Edge function `coffee-chat` is deployed to Supabase
- [ ] `AI_API_KEY` secret is set in Supabase (Project Settings → Edge Functions → Secrets)
- [ ] `VITE_SUPABASE_URL` is set in Vercel
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` is set in Vercel
- [ ] Edge function logs show no errors
- [ ] Test chat in production after deployment

## Testing

After deployment, test the chatbot:

1. Go to your production site
2. Navigate to the Chat page
3. Send a test message
4. Check browser console (F12) for any errors
5. Check Supabase Edge Function logs if it fails

## Getting Your AI API Key

The chatbot uses **OpenAI** directly. Here's how to get your API key:

### Get OpenAI API Key

1. **Get OpenAI API Key**:
   - Go to https://platform.openai.com/api-keys
   - Sign in or create account
   - Click **"Create new secret key"**
   - **Copy the key immediately** (you won't be able to see it again!)
   - The key will look like: `sk-...` (a long string)

2. **Set in Supabase**:
   - Go to Supabase Dashboard → **Project Settings** → **Edge Functions** → **Secrets**
   - Click **"Add a new secret"**
   - Name: `AI_API_KEY`
   - Value: (paste your OpenAI API key)
   - Click **Save**

### OpenAI Model Information

The chatbot currently uses `gpt-3.5-turbo` which is:
- ✅ Fast and responsive
- ✅ Cost-effective ($0.002 per 1K tokens)
- ✅ Good quality for chat applications

**Optional**: You can switch to `gpt-4` for better quality (more expensive):
- Edit `supabase/functions/coffee-chat/index.ts`
- Change `model: "gpt-3.5-turbo"` to `model: "gpt-4"`
- Costs: $0.03 per 1K tokens (15x more expensive)

### OpenAI Pricing

- **gpt-3.5-turbo**: $0.002 per 1K tokens (~750 words)
- **gpt-4**: $0.03 per 1K tokens
- **gpt-4-turbo**: $0.01 per 1K tokens

A typical chat conversation uses about 500-1000 tokens, so costs are minimal for most use cases.

### Important Notes:

- **Never commit API keys to Git** - They should only be stored in Supabase secrets
- **Keep your API key secure** - Treat it like a password
- **The key format**: Usually a long string like `sk-...` or `lv_...`
- **One key per project**: Each Supabase project needs its own secret set

---

**Remember**: Edge Functions and their secrets are managed in Supabase, not in Vercel!

