# Netlify Deployment Guide

## Backend Configuration
**Backend URL:** https://ai-assessment-creator-u42o.onrender.com

## Frontend Setup for Netlify Functions

### Files Created:
1. **netlify.toml** - Netlify build configuration
2. **netlify/functions/nextjs.ts** - Next.js serverless handler
3. **.env.production** - Production environment variables

### Deployment Steps:

#### Step 1: Connect GitHub to Netlify
```bash
1. Go to https://netlify.com
2. Click "New site from Git"
3. Select GitHub repository: AI_assessment_creator
4. Authorize Netlify access
```

#### Step 2: Configure Build Settings
```
Build command:     npm run build (in frontend directory)
Publish directory: frontend/.next/standalone
Functions directory: frontend/netlify/functions
Node version:      18.x or 20.x
```

#### Step 3: Add Environment Variables
In Netlify Dashboard → Site settings → Build & deploy → Environment:
```
NEXT_PUBLIC_API_URL = https://ai-assessment-creator-u42o.onrender.com
```

#### Step 4: Deploy
```bash
1. Push changes to GitHub
2. Netlify automatically detects and builds
3. Wait for deployment (3-5 minutes)
4. Your site is live at: https://<your-site>.netlify.app
```

### What Each File Does:

**netlify.toml:**
- Configures build process
- Redirects API calls to Render backend
- Sets up Netlify Functions
- Handles all routes through the Next.js function

**netlify/functions/nextjs.ts:**
- Runs Next.js in serverless function
- Handles dynamic routes, API routes, and server components
- Proxies requests to standalone Next.js server

**.env.production:**
- Points frontend to your Render backend
- Used during production build

### Testing After Deployment:

```bash
# Test frontend is live
curl https://<your-site>.netlify.app

# Test API connection (should proxy to Render)
curl https://<your-site>.netlify.app/api/health

# Expected response:
# {"status":"ok","timestamp":"2026-05-26T..."}
```

### Troubleshooting:

| Issue | Solution |
|-------|----------|
| 404 errors | Check netlify.toml redirects are correct |
| API not working | Verify NEXT_PUBLIC_API_URL in env vars |
| Build fails | Check Node version is 18+ in build settings |
| Cold start delays | Normal for serverless; backend warm-up helps |

### Performance Optimization:

1. **Enable Caching** in Netlify:
   ```toml
   [[headers]]
     for = "/static/*"
     [headers.values]
       Cache-Control = "public, max-age=31536000"
   ```

2. **Enable Image Optimization**:
   - Already configured in next.config.ts

3. **Monitor Performance**:
   - Netlify Analytics dashboard
   - Google Lighthouse reports

### Next Steps:

- [ ] Deploy to Netlify
- [ ] Test all routes work
- [ ] Verify API connectivity
- [ ] Check performance metrics
- [ ] Set up custom domain (optional)
- [ ] Enable auto-redeploy on Git push
