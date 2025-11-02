# Force Clean Production Deployment

## The Problem
Production is showing old/cached code that doesn't match localhost.

## Solution: Force a Clean Deployment

### Step 1: Verify What's Actually Deployed
1. Go to **Vercel Dashboard** → Your Project
2. Click **Deployments** tab
3. Find the **latest deployment** (green checkmark)
4. Click on it to see details
5. Check the **commit hash** - does it match `8f78e7a` (Hide ChatDiagnostic)?
6. Check the **build logs** - did it build successfully?

### Step 2: Force a Fresh Build

**Option A: Redeploy from Vercel (Recommended)**
1. Vercel Dashboard → Deployments
2. Click **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Wait for it to complete
5. Hard refresh browser: `Ctrl + Shift + R`

**Option B: Empty Commit to Trigger New Build**
```bash
git commit --allow-empty -m "Force clean deployment"
git push origin main
```

### Step 3: Clear ALL Caches

**Browser:**
1. Open DevTools (F12)
2. Right-click refresh button → **"Empty Cache and Hard Reload"**
3. OR: Settings → Clear browsing data → **All time** → Clear

**Vercel:**
1. Vercel Dashboard → Your Project → Settings
2. Look for **"Build Cache"** or **"Cache"** options
3. Clear if available
4. Redeploy

### Step 4: Verify Production Matches Localhost

**Check these match:**
1. **Quick Action Buttons**: Should see "Strong & Bold", "Sweet & Creamy", "Cold Coffee"
2. **No Diagnostic Tool**: ChatDiagnostic should NOT appear in production
3. **Header**: Should show "Venessa" with "Your AI Barista"
4. **Input Placeholder**: "Ask about coffee recommendations..."

### Step 5: Nuclear Option - Delete and Redeploy

If still not working:
1. Vercel Dashboard → Settings → Danger Zone
2. **DO NOT delete the project** - instead:
3. Create a new branch, deploy from there, then merge back
4. OR: Temporarily change a file, deploy, then change it back

## Debug: Check What Version is Running

**In Browser Console (F12):**
```javascript
// Check if DEV mode (should be false in production)
console.log('Is DEV:', import.meta.env.DEV);
console.log('Mode:', import.meta.env.MODE);

// Check build date
console.log('Build time:', document.querySelector('script[src*="index"]')?.src);
```

**If `import.meta.env.DEV` is `true` in production**, Vercel is building in dev mode (wrong!).

## Verify Vercel Build Settings

1. Vercel Dashboard → Your Project → Settings → Build & Development Settings
2. Check:
   - **Build Command**: Should be `npm run build` (NOT `npm run dev`)
   - **Output Directory**: Should be `dist`
   - **Install Command**: Should be `npm install`

## Quick Test Command

After redeploying, test in incognito:
1. Open incognito/private window
2. Visit your production URL
3. If it shows correctly → It's cache, clear browser cache
4. If it still shows wrong → Build issue, check Vercel logs

