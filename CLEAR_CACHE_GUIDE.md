# Clear Cache Guide - Website Not Updating After Deployment

If Vercel shows deployment is done but your website still shows old content, follow these steps:

## Quick Fix Steps (Try in Order)

### 1. Hard Refresh Browser Cache (Most Common Fix)

**Windows/Linux:**
- Press `Ctrl + Shift + R`
- Or `Ctrl + F5`

**Mac:**
- Press `Cmd + Shift + R`

**If that doesn't work:**
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Click "Empty Cache and Hard Reload"

### 2. Clear Browser Cache Completely

**Chrome:**
1. Press `Ctrl + Shift + Delete` (or `Cmd + Shift + Delete` on Mac)
2. Select "Cached images and files"
3. Time range: "All time"
4. Click "Clear data"

**Firefox:**
1. Press `Ctrl + Shift + Delete`
2. Check "Cache"
3. Time range: "Everything"
4. Click "Clear Now"

### 3. Use Incognito/Private Window

1. Open a new Incognito/Private window
2. Visit your site
3. If it works here → It's a cache issue
4. Clear cache using steps above

### 4. Force Vercel Cache Invalidation

**Option A: Redeploy**
1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Find your latest deployment
4. Click **"..."** (three dots) → **Redeploy**
5. Wait for deployment to complete
6. Hard refresh browser (Ctrl+Shift+R)

**Option B: Add a No-Cache Header (Temporary)**
1. Create/update `vercel.json` in your project root
2. Add cache headers to force refresh
3. Commit and push

### 5. Check Which Deployment is Live

1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Look for a deployment with a green checkmark ✅
4. Click on it to see details
5. Check the commit hash matches your latest push
6. Check the URL it's deployed to

### 6. Verify Deployment Actually Includes Your Changes

1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Check **"Build Logs"** tab
4. Look for your commit message
5. Verify the build completed successfully (not failed)

## Advanced: Verify File Versions

### Check in Browser Console:
1. Open your site
2. Press F12 → **Console** tab
3. Run:
```javascript
// Check when the JS bundle was built
console.log(document.querySelector('script[src*="index"]')?.src);

// Or check the source directly
fetch('/')
  .then(r => r.text())
  .then(html => {
    const scriptMatch = html.match(/src="([^"]*index[^"]*\.js)"/);
    if (scriptMatch) {
      fetch(scriptMatch[1] + '?v=' + Date.now())
        .then(r => console.log('Current version:', r.headers.get('last-modified')));
    }
  });
```

## If Still Not Working

### Check Vercel Project Settings:
1. Vercel Dashboard → Your Project → **Settings**
2. Check **Build & Development Settings**
3. Verify **Build Command** is correct
4. Check **Output Directory** is correct (should be `dist` for Vite)

### Check Environment Variables:
1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Make sure all required variables are set
3. Redeploy if you changed any

### Force New Deployment:
1. Make a small change to a file (add a comment)
2. Commit: `git commit --allow-empty -m "Force redeploy"`
3. Push: `git push origin main`
4. Wait for new deployment

## Common Causes

1. **Browser Cache** (90% of cases)
   - Solution: Hard refresh or clear cache

2. **Vercel CDN Cache**
   - Solution: Redeploy or wait 5-10 minutes

3. **Service Worker Cache**
   - Solution: Unregister service worker (F12 → Application → Service Workers)

4. **Old Deployment Still Active**
   - Solution: Check Vercel Dashboard to see which deployment is live

5. **Build Failed But Showed as Success**
   - Solution: Check build logs for errors

## Quick Test

**To verify if it's cache:**
1. Open site in Incognito mode
2. If it shows new version → It's cache
3. If it still shows old version → Check deployment status

## Nuclear Option (If Nothing Works)

1. Go to Vercel Dashboard → Your Project → **Settings** → **General**
2. Scroll to bottom → **Delete Project** (⚠️ **Don't actually do this!** Just see if there are other options)
3. OR better: Create a new deployment from the same GitHub repo
4. Update your domain to point to the new deployment

