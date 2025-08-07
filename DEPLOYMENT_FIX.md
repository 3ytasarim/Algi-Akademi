# Deployment Fix Instructions

## Problem
Your deployment is currently configured as **Static** but trying to run Node.js/npm commands, which requires **Autoscale** deployment.

## Solution: Change to Autoscale Deployment

### Step 1: Update .replit File
Replace the entire content of your `.replit` file with:

```
[deployment]
build = "npm run build"
run = "npm start"

[nix]
channel = "stable-23.05"

[[ports]]
localPort = 3000
externalPort = 80

[agent]
integrations = ["javascript_mem_db==1.0.0"]
```

### Step 2: Change Deployment Type in Replit
1. Go to your Replit deployment settings
2. Change deployment type from **Static** to **Autoscale**
3. This provides Node.js runtime and backend support

### Why This Fixes the Issue
- **Autoscale** supports Node.js runtime and npm commands
- **Static** deployments can only serve pre-built files without server processes
- Your app requires backend functionality with Express.js and database connections

### Key Changes Made
1. ✅ Removed `publicDir = "algi-akademi"` (not needed for Autoscale)
2. ✅ Changed `build` command to run from root directory
3. ✅ Simplified `run` command to use npm start
4. ✅ Your package.json already has correct scripts:
   - `build`: "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
   - `start`: "NODE_ENV=production node dist/index.js"

### Environment Variables
Your app uses these environment variables (keep them in Autoscale):
- `DATABASE_URL` - Required for PostgreSQL connection
- `PORT` - Automatically provided by Replit
- Session-related variables - Supported in Autoscale

### Verification
After making these changes:
1. The build process will run `npm run build`
2. The app will start with `npm start`
3. Your full-stack app with backend API will work correctly
4. Database connections will function properly

## Alternative: Pre-built Static Deployment
If you prefer to keep Static deployment (not recommended for your full-stack app):
1. Build locally: `npm run build`
2. Commit the `dist` folder to your repository
3. Set `publicDir = "dist/public"`
4. Remove the `build` and `run` commands
5. Remove database environment variables (won't work in Static)

**Recommendation: Use Autoscale deployment for full functionality.**