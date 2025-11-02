# Chatbot Setup Checklist ✅

## Prerequisites

- [x] Edge function code ready in `supabase/functions/coffee-chat/index.ts`
- [x] Frontend code ready in `src/pages/Chat.tsx`
- [x] Database table `chat_history` created (via `FRESH_SETUP.sql`)

---

## Step 1: Deploy Edge Function

1. **Go to Supabase Dashboard** → Your Project
2. **Click "Edge Functions"** (left sidebar)
3. **Check if `coffee-chat` exists:**
   - ✅ If it exists → Click it → Verify code matches `supabase/functions/coffee-chat/index.ts`
   - ❌ If missing → Click "Create function" → Name it `coffee-chat`

4. **Copy code:**
   - Open `supabase/functions/coffee-chat/index.ts` from this repo
   - Copy ALL the code
   - Paste into Supabase Edge Functions editor

5. **Deploy:**
   - Click "Deploy" or "Save"
   - Wait for deployment to complete (should see "Deployed" status)

---

## Step 2: Set AI_API_KEY Secret

1. **In Supabase Dashboard** → Still in Edge Functions section
2. **Click "Secrets" tab** (top navigation)
3. **Check if `AI_API_KEY` exists:**
   - ✅ If it exists → Verify it's correct
   - ❌ If missing → Click "Add secret"

4. **Add Secret:**
   - **Name:** `AI_API_KEY`
   - **Value:** Your Google Gemini API key
     - Get from: https://makersuite.google.com/app/apikey
     - Sign in with Google
     - Click "Create API Key"
     - Copy the key

5. **Save** the secret

---

## Step 3: Verify Deployment

### Test in Supabase Dashboard:
1. **Go to Edge Functions** → `coffee-chat`
2. **Click "Logs" tab**
3. **Use "Invoke function" button** (if available)
4. **Test payload:**
```json
{
  "message": "Hello",
  "conversationHistory": []
}
```
5. **Check logs** for any errors

### Test in Your App:
1. **Go to `/chat` page** in your app
2. **Send a test message:** "I want strong coffee"
3. **Check:**
   - ✅ Should get AI response from Venessa
   - ❌ If error → Check error message (it will tell you what's wrong)

---

## Step 4: Troubleshooting

### Error: "Edge function 'coffee-chat' is NOT deployed"
**Fix:**
- Go to Supabase Dashboard → Edge Functions
- Create function named `coffee-chat`
- Copy code from `supabase/functions/coffee-chat/index.ts`
- Deploy it

### Error: "AI_API_KEY secret is missing"
**Fix:**
- Go to Supabase Dashboard → Edge Functions → Secrets
- Add secret: Name = `AI_API_KEY`, Value = Your Gemini API key
- Get API key from: https://makersuite.google.com/app/apikey

### Error: "Model not found" or "404 models/gemini-1.5-flash"
**Fix:**
- The code already uses `v1` API (not `v1beta`) ✅
- Verify your API key has access to Gemini 1.5 Flash
- Check Supabase Edge Functions logs for detailed error

### Error: "Rate limit exceeded" (429)
**Fix:**
- Wait a few minutes and try again
- Check your Gemini API quota at https://makersuite.google.com/app/apikey

### Error: "Cannot connect to chat service"
**Fix:**
- Check Supabase project URL and key in Vercel environment variables
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set
- Redeploy Vercel after setting env vars

---

## Step 5: Test Full Flow

1. **Open `/chat` page**
2. **Send message:** "What coffee do you recommend for morning?"
3. **Expected:**
   - User message appears immediately
   - Loading indicator shows
   - Venessa (AI) responds with coffee recommendation
   - Message saved to `chat_history` table

4. **Refresh page:**
   - Previous conversation should load
   - Chat history should persist

---

## Quick Diagnostic Tool

The app includes a diagnostic tool that shows when there are no messages:

1. **Go to `/chat` page**
2. **If chat is empty** → You'll see "Chat Bot Diagnostic Tool"
3. **Click "Test Edge Function"**
4. **Read the result:**
   - ✅ Success → Everything works!
   - ❌ Error → Follow the error message instructions

---

## Expected Behavior

✅ **Working Chatbot:**
- Sends messages to edge function
- Gets AI responses from Venessa
- Saves chat history to database
- Loads previous conversations on refresh
- Handles errors gracefully with helpful messages

✅ **Venessa (AI Barista) Personality:**
- Friendly and enthusiastic
- Recommends coffee based on preferences
- Explains different coffee types
- Keeps responses concise (2-4 sentences)

---

## Code Files

- **Edge Function:** `supabase/functions/coffee-chat/index.ts`
- **Frontend:** `src/pages/Chat.tsx`
- **Diagnostic Tool:** `src/components/ChatDiagnostic.tsx`
- **Database Table:** Created by `FRESH_SETUP.sql` (chat_history table)

---

## API Endpoints

**Edge Function:**
- **Name:** `coffee-chat`
- **Method:** POST
- **Body:**
  ```json
  {
    "message": "string",
    "conversationHistory": [
      { "role": "user", "content": "..." },
      { "role": "assistant", "content": "..." }
    ]
  }
  ```
- **Response:**
  ```json
  {
    "response": "AI response text"
  }
  ```

---

## That's It! 🎉

Once deployed and API key is set, your chatbot should work immediately!

If you encounter any issues, check:
1. Supabase Edge Functions logs
2. Browser console for frontend errors
3. The diagnostic tool in `/chat` page

