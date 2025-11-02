# Debug "Non-2xx Status Code" Error

## The Issue
You're getting: `❌ Error: Edge Function returned a non-2xx status code`

This means the edge function **IS deployed** and reachable, but it's returning an error (likely 500 or 400).

## Step 1: Check Supabase Edge Function Logs

1. Go to **Supabase Dashboard** → Your Project
2. Click **Edge Functions** → **coffee-chat**
3. Click the **Logs** tab
4. Try sending a message in your chat
5. Check the logs - they will show the exact error

Common errors you might see:

### Error 1: "AI_API_KEY is not configured"
**Fix:**
1. Go to **Edge Functions** → **Secrets** tab
2. Check if `AI_API_KEY` exists
3. If missing → Add it with your Gemini API key
   - Get key from: https://makersuite.google.com/app/apikey

### Error 2: "Invalid API key" or "API key not valid"
**Fix:**
1. Verify your Gemini API key is correct
2. Get a new key from https://makersuite.google.com/app/apikey
3. Update the `AI_API_KEY` secret in Supabase

### Error 3: Code errors (JavaScript/TypeScript)
**Fix:**
1. Check the logs for specific error messages
2. Compare your deployed code with `supabase/functions/coffee-chat/index.ts`
3. Re-deploy the function with the correct code

### Error 4: "Rate limit exceeded" (429)
**Fix:**
- Wait a few minutes and try again
- Or upgrade your Gemini API quota

## Step 2: Test the Function Directly in Supabase

1. Go to **Supabase Dashboard** → **Edge Functions** → **coffee-chat**
2. Click **"Invoke"** or **"Test"** button
3. Send this JSON:
```json
{
  "message": "Hello",
  "conversationHistory": []
}
```
4. Check what error you get

## Step 3: Check Browser Console

1. Open your app in browser
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Try sending a message
5. Look for detailed error logs (I added better logging)
6. Check the **Network** tab → Find the request to `coffee-chat` → Check the response

## Step 4: Verify Function Code

Make sure your deployed function matches the code in `supabase/functions/coffee-chat/index.ts`.

To update:
1. Go to **Supabase Dashboard** → **Edge Functions** → **coffee-chat**
2. Click **Edit** or the code editor
3. Copy the code from `supabase/functions/coffee-chat/index.ts` in this repo
4. Paste and click **Deploy** or **Save**

## Most Common Issue: Missing AI_API_KEY

**90% of the time**, this error means `AI_API_KEY` secret is missing or incorrect.

### To fix:
1. **Get your Gemini API key:**
   - Go to https://makersuite.google.com/app/apikey
   - Sign in with Google
   - Click "Create API Key"
   - Copy the key (starts with `AIza...`)

2. **Add it to Supabase:**
   - Supabase Dashboard → Edge Functions
   - Click **Secrets** tab
   - If `AI_API_KEY` exists → Click it → Update the value
   - If missing → Click **Add Secret** → Name: `AI_API_KEY`, Value: (paste your key) → Save

3. **Test again:**
   - Wait 10 seconds for secret to propagate
   - Try the chat again

## Need More Help?

Check the logs in:
- **Supabase Dashboard** → Edge Functions → coffee-chat → Logs tab
- **Browser Console** (F12) → Console tab
- The error message should now be more specific with the updated code

