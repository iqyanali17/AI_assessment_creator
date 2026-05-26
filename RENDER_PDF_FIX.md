# Fix PDF Download Issue on Render - Deployment Guide

## Problem
PDF download works in development but fails in production on Render with error:
```json
{
  "success": false,
  "error": "Unable to export assignment PDF.",
  "errors": {
    "pdf": ["PDF could not be generated. Please try again."]
  }
}
```

## Root Cause
Puppeteer requires Chrome/Chromium to generate PDFs, but Render's default environment doesn't have it installed.

---

## Solution: Install Chromium on Render

### Option 1: Using Render Build Command (Recommended)

1. **Go to your Render Dashboard**
   - Navigate to: https://dashboard.render.com
   - Select your backend service: `ai-assessment-creator-backend`

2. **Update Build Command**
   - Go to **Settings** tab
   - Find **Build Command** section
   - Replace the current build command with:
   ```bash
   apt-get update && apt-get install -y chromium chromium-browser fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils libgbm1 libxshmfence1 && npm install && npm run build
   ```

3. **Add Environment Variable**
   - In the same **Settings** page
   - Scroll to **Environment Variables**
   - Click **Add Environment Variable**
   - Add:
     ```
     Key:   PUPPETEER_EXECUTABLE_PATH
     Value: /usr/bin/chromium-browser
     ```

4. **Save and Deploy**
   - Click **Save Changes**
   - Render will automatically redeploy with the new configuration

---

### Option 2: Using render.yaml (Infrastructure as Code)

If you prefer to manage configuration via code:

1. **The `render.yaml` file has been created** in your project root with the proper configuration.

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Fix: Add Chromium support for PDF generation on Render"
   git push origin main
   ```

3. **Update Render Service**
   - Go to Render Dashboard
   - Click on your service
   - Go to **Settings** → **Build & Deploy**
   - Under **Blueprint**, click **Sync**
   - Or delete and recreate the service using the Blueprint

4. **Add Environment Variables Manually**
   - Even with render.yaml, you need to add sensitive env vars manually
   - Go to **Environment Variables** section
   - Ensure these are set:
     ```
     PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
     MONGODB_URI=<your-mongodb-uri>
     REDIS_URL=<your-redis-url>
     GEMINI_API_KEY=<your-gemini-key>
     GEMINI_MODEL=gemini-2.5-flash
     GEMINI_FALLBACK_MODELS=gemini-2.5-flash-lite,gemini-2.0-flash
     NODE_ENV=production
     NEXT_PUBLIC_APP_URL=<your-frontend-url>
     ```

---

## What Was Fixed

### 1. **Updated `backend/src/lib/pdf.ts`**
   - ✅ Better Chrome executable detection with priority order
   - ✅ Improved error messages with detailed logging
   - ✅ Support for environment variable `PUPPETEER_EXECUTABLE_PATH`
   - ✅ Fallback to common Linux Chrome paths

### 2. **Created `render.yaml`**
   - ✅ Defines service configuration
   - ✅ Sets environment variables for Puppeteer

### 3. **Created `backend/install-chromium.sh`**
   - ✅ Script to install Chromium (for reference)
   - ✅ Can be used in custom Docker deployments

---

## Verification Steps

After deployment completes:

### 1. Check Deployment Logs
```
Look for these messages in Render logs:
✓ "chromium-browser is already the newest version"
✓ "Build succeeded"
✓ "Server running on port 3001"
```

### 2. Test PDF Download
```bash
# Replace with your actual assignment ID
curl -I https://ai-assessment-creator-u42o.onrender.com/assignments/6a15252da963310c4859d7d1/export/pdf
```

Expected response:
```
HTTP/2 200
content-type: application/pdf
content-disposition: attachment; filename="..."
```

### 3. Test from Frontend
1. Go to your deployed frontend
2. Open an assignment that has been generated
3. Click **Download PDF** button
4. PDF should download successfully

---

## Troubleshooting

### Issue: Build fails with "Permission denied"
**Solution:** Render's free tier might not have apt-get access. Try:
- Upgrade to a paid plan, OR
- Use a Docker-based deployment

### Issue: "Chrome executable not found" still appears
**Solution:** Check environment variable:
1. Go to Render Dashboard → Settings → Environment Variables
2. Verify `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser` exists
3. Click **Manual Deploy** → **Clear build cache & deploy**

### Issue: PDF generation times out
**Solution:** Increase timeout in Render:
1. Go to Settings → Advanced
2. Increase **Health Check Timeout** to 60 seconds

### Issue: Build takes too long
**Solution:** The Chromium installation adds ~2-3 minutes to build time. This is normal.

---

## Alternative: Use Puppeteer with Chrome Buildpack

If the above doesn't work, try using Render's buildpack approach:

1. Create a file `render-build.sh` in backend folder:
```bash
#!/bin/bash
npm install
npm run build
```

2. Update Render settings:
   - Build Command: `./backend/render-build.sh`
   - Add buildpack: `https://github.com/jontewks/puppeteer-heroku-buildpack`

---

## Cost Implications

- **Free Tier:** Should work, but builds may be slower
- **Starter Plan ($7/mo):** Faster builds, more reliable
- **Chromium adds:** ~150MB to deployment size

---

## Files Modified

1. ✅ `backend/src/lib/pdf.ts` - Enhanced Chrome detection
2. ✅ `render.yaml` - Render configuration (new)
3. ✅ `backend/install-chromium.sh` - Installation script (new)
4. ✅ `RENDER_PDF_FIX.md` - This guide (new)

---

## Quick Deploy Checklist

- [ ] Update build command with Chromium installation
- [ ] Add `PUPPETEER_EXECUTABLE_PATH` environment variable
- [ ] Push code changes to GitHub
- [ ] Trigger manual deploy on Render
- [ ] Wait for build to complete (~5-8 minutes)
- [ ] Check deployment logs for errors
- [ ] Test PDF download endpoint
- [ ] Verify from frontend UI

---

## Support

If issues persist:
1. Check Render logs: Dashboard → Logs
2. Look for "PDF generation failed" errors
3. Verify Chrome path: Add temporary log in code
4. Contact Render support if buildpack needed

---

**Status:** ✅ Ready to deploy
**Estimated Fix Time:** 10-15 minutes
**Build Time:** 5-8 minutes (first time)

Good luck! 🚀
