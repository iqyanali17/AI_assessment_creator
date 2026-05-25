# NETLIFY DEPLOYMENT - STEP BY STEP

## Quick Summary
- **Frontend:** Netlify  
- **Backend:** Render (https://ai-assessment-creator-u42o.onrender.com)
- **Time to Deploy:** 5-10 minutes

---

## STEP 1: Prepare Your Code ✅

Run this command locally to verify build works:

```bash
cd frontend
npm run build
```

Expected output: `▲ Next.js 16.3.0-canary.28 (Turbopack)` ✓ Compiled successfully

---

## STEP 2: Push to GitHub

```bash
cd c:\New folder\AI-Assessment-creator

git add .
git commit -m "Add Netlify configuration for frontend deployment"
git push
```

---

## STEP 3: Sign Up / Login to Netlify

1. Go to **[netlify.com](https://netlify.com)**
2. Click **"Sign up"** (or log in if you have account)
3. Choose **"Sign up with GitHub"**
4. Authorize Netlify to access your GitHub account
5. Click **"Authorize netlify"**

---

## STEP 4: Create New Site from Git

1. After login, click **"Add new site"** button
2. Select **"Import an existing project"**
3. Choose **GitHub** as provider
4. Search for **"AI_assessment_creator"** repository
5. Click on it to select

---

## STEP 5: Configure Build Settings

1. **Base directory:** `frontend`
2. **Build command:** `npm run build`  
3. **Publish directory:** `frontend/out`
4. Leave other settings as default
5. Click **"Deploy site"**

Netlify will start building. Wait for the build to complete (3-5 minutes).

---

## STEP 6: Add Environment Variables

**BEFORE** deploying, add environment variables:

1. Go to **Site settings** (top menu)
2. Click **"Build & deploy"** → **"Environment"**
3. Click **"Edit variables"**
4. Add this variable:

```
Name:  NEXT_PUBLIC_API_URL
Value: https://ai-assessment-creator-u42o.onrender.com
```

5. Click **"Save"**
6. Go to **"Deployments"** → Click **"Trigger deploy"** → **"Deploy site"**

Wait for new build to complete with the environment variable.

---

## STEP 7: Verify Deployment

Once deployment is complete:

1. Click the **Site name** at the top
2. You'll see your site URL: `https://xxxxx.netlify.app`
3. Click it to visit your live site
4. Check browser console for any errors (F12)

---

## STEP 8: Test Everything Works

**Test 1: Frontend loads**
```
Visit: https://xxxxx.netlify.app
Expected: See the AI Assessment Creator home page
```

**Test 2: API connection**
```
Open browser console (F12)
Expected: No CORS errors, Socket.IO should connect
```

**Test 3: Create Assignment**
```
1. Click "Create Assignment"
2. Fill in details
3. Should submit without errors
```

---

## STEP 9: Set Custom Domain (Optional)

1. In Netlify Dashboard → **Domain settings**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., assessment.yourdomain.com)
4. Follow DNS setup instructions
5. Wait for DNS propagation (5-30 minutes)

---

## TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| **404 errors on page refresh** | Check netlify.toml `[[redirects]]` rules |
| **API calls fail (CORS error)** | Verify `NEXT_PUBLIC_API_URL` in Environment variables |
| **Build fails** | Check build logs: Site → Deployments → Failed build → View logs |
| **Site still loading old version** | Hard refresh: `Ctrl+Shift+R` (Chrome) or `Cmd+Shift+R` (Mac) |
| **Backend connection fails** | Verify Render backend is running: https://ai-assessment-creator-u42o.onrender.com/api/health |

---

## WHAT NETLIFY DOES AUTOMATICALLY

✅ GitHub integration (auto-redeploy on git push)  
✅ SSL certificate (HTTPS)  
✅ CDN distribution  
✅ Automatic deploys on master branch push  
✅ Rollback to previous versions  
✅ Free tier with generous limits  

---

## NEXT STEPS AFTER DEPLOYMENT

1. **Share your site URL** with users
2. **Monitor** in Netlify dashboard
3. **Enable auto-deploys** (already enabled with GitHub)
4. **Set up custom domain** if needed
5. **Track analytics** in Netlify Analytics

---

## GIT COMMIT YOUR NETLIFY CONFIG

After successful deployment, commit these changes:

```bash
git add frontend/netlify.toml frontend/.env.production frontend/NETLIFY_DEPLOYMENT.md
git commit -m "Add Netlify deployment configuration"
git push
```

---

## QUICK REFERENCE

| Item | Value |
|------|-------|
| **Frontend Host** | Netlify |
| **Backend Host** | Render |
| **Frontend URL** | https://xxxxx.netlify.app |
| **Backend URL** | https://ai-assessment-creator-u42o.onrender.com |
| **Environment Var** | NEXT_PUBLIC_API_URL |

---

**Status:** ✅ Ready to deploy!

Any issues? Check the logs or reply with error messages.
