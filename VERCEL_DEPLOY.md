# Vercel Deployment - Ready to Deploy ✅

## Quick Start (5 minutes)

### Prerequisites ✓
- ✅ Frontend builds successfully
- ✅ vercel.json configured
- ✅ Code pushed to GitHub
- ✅ Backend running on Render

---

## STEP 1: Sign Up / Login to Vercel

1. Go to **https://vercel.com**
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account
5. You'll be redirected to Vercel dashboard

---

## STEP 2: Import Project from GitHub

1. On Vercel dashboard, click **"Add New"** → **"Project"**
2. Search for **"AI_assessment_creator"** repository
3. Click **"Import"**

---

## STEP 3: Configure Project

1. **Framework:** Should auto-detect as **Next.js** ✓
2. **Root Directory:** Select **"frontend"**
3. **Build Command:** Leave as default (Vercel auto-detects from package.json)
4. Click **"Deploy"** to start building

**⏱️ Wait 2-3 minutes for build to complete**

---

## STEP 4: Add Environment Variables

After deployment starts:

1. Go to **Settings** (top menu)
2. Click **"Environment Variables"** (left sidebar)
3. Add this variable:

```
Name:  NEXT_PUBLIC_API_URL
Value: https://ai-assessment-creator-u42o.onrender.com
```

4. Click **"Save"**
5. Go back to **Deployments** → **Redeploy** with the new variable

---

## STEP 5: Verify Deployment

Once deployment is complete:

1. Vercel will show your site URL: `https://xxxxx.vercel.app`
2. Click the URL to visit your live site
3. Open browser console (F12) to check for errors

---

## STEP 6: Test Everything Works

**✅ Test 1: Frontend Loads**
```
Visit: https://xxxxx.vercel.app
Expected: See AI Assessment Creator home page
```

**✅ Test 2: API Connection**
```
Open browser console (F12)
Expected: No CORS errors
Check Network tab: API calls should proxy to Render backend
```

**✅ Test 3: Create Assignment**
```
1. Click "Create Assignment"
2. Fill in form details
3. Submit
4. Should appear in list without errors
```

**✅ Test 4: Socket.IO Connection**
```
Open console (F12)
Look for: "Socket connected" message (or similar)
Expected: Real-time updates should work
```

---

## STEP 7: Enable Auto-Deployments (Optional)

By default, Vercel auto-deploys on every push to master branch. To verify:

1. Go to **Settings** → **Git**
2. Check that **"Deploy on push"** is enabled
3. Now every time you push to master, Vercel auto-deploys

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **Build fails** | Check build logs in Vercel dashboard → Deployments |
| **Can't find page** | Check that root directory is set to "frontend" |
| **API calls fail** | Verify `NEXT_PUBLIC_API_URL` in Environment Variables |
| **CORS errors** | Check Render backend is running: https://ai-assessment-creator-u42o.onrender.com/health |
| **Site shows old version** | Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) |
| **Environment vars not working** | Redeploy after adding variables: Deployments → ... → Redeploy |

---

## What You Get with Vercel

✅ **Automatic HTTPS** - All connections encrypted  
✅ **Global Edge Network** - Blazing fast worldwide  
✅ **Auto-deploy on git push** - Push to master, site auto-updates  
✅ **Instant rollbacks** - Easy recovery to previous versions  
✅ **Environment variables** - Managed securely  
✅ **Free SSL certificates** - No additional cost  
✅ **Deployment previews** - Test pull requests automatically  
✅ **Analytics & monitoring** - Track performance  

---

## Backend Connection

Your Vercel frontend proxies requests to:
- **Backend API:** https://ai-assessment-creator-u42o.onrender.com/api
- **Socket.IO:** https://ai-assessment-creator-u42o.onrender.com/socket.io

These are configured in **vercel.json** under `rewrites` section.

---

## Optional: Custom Domain

To add your own domain:
1. In Vercel Dashboard → **Settings** → **Domains**
2. Click **"Add"** and enter your domain
3. Update DNS records at your domain provider
4. Wait for DNS propagation (5-30 minutes)

---

**You're ready to deploy! 🚀**

Start with **STEP 1** above.
