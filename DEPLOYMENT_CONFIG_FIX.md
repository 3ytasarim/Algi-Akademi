# Deployment Configuration Fix

## Issues Found:
1. `.replit` file has `deploymentTarget = "gce"` (should be `"cloudrun"`)
2. Port mapping conflict - multiple port configurations
3. Build command missing `npm install`
4. Conflicting `replit.toml` file (now removed)

## Required .replit Configuration:

Your `.replit` file should look like this:

```toml
modules = ["nodejs-20", "postgresql-16"]

[deployment]
deploymentTarget = "cloudrun"
build = "npm install && npm run build"
run = "npm start"

[nix]
channel = "stable-24_05"

[[ports]]
localPort = 5000
externalPort = 80

[env]
NODE_ENV = "production"

[agent]
integrations = ["javascript_object_storage==1.0.0", "javascript_mem_db==1.0.0"]
```

## How to Fix:

### Option 1: Manual Edit (Recommended)
1. Open the `.replit` file in your editor
2. Change `deploymentTarget = "gce"` to `deploymentTarget = "cloudrun"`
3. Remove the duplicate port configuration (keep only the 5000→80 mapping)
4. Update build command to include `npm install &&`

### Option 2: Using Replit UI
1. Go to the "Deploy" tab
2. Select "Autoscale Deployment"
3. Set the configuration:
   - **Build Command**: `npm install && npm run build`
   - **Run Command**: `npm start`
   - **Port**: 5000

## Verification:
- Your app listens on port 5000 (confirmed in server/index.ts)
- Build process creates `dist/index.js`
- Production environment uses `NODE_ENV=production`

## Next Steps:
1. Fix the .replit file as shown above
2. Try deployment again - it should work correctly now