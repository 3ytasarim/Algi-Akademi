# Deployment Guide for Algı Akademi

## Issue Resolution

The deployment was failing because there was a mismatch between the build output directory and the expected deployment directory:

- **Build Output**: Vite builds frontend assets to `dist/public`
- **Deployment Expected**: Static files in `algi-akademi` directory
- **Server Configuration**: Expects static files in `server/public` directory

## Solution

Two deployment helper scripts have been created to resolve this issue:

### Method 1: Node.js Script (Recommended)
```bash
# Build the project and create deployment structure
npm run build
node create-deployment.js
```

### Method 2: Shell Script
```bash
# Run the deployment setup script
./deploy-setup.sh
```

## How It Works

Both scripts perform the following operations:
1. Ensure the project is built (`dist/public` directory exists)
2. Create an `algi-akademi` directory in the project root
3. Copy all built frontend assets from `dist/public` to `algi-akademi/`
4. Backend files remain in `dist/index.js` for production use

## Deployment Structure

After running either script, you'll have:

```
project-root/
├── dist/
│   ├── index.js          # Backend server (production)
│   └── public/           # Original build output
│       ├── index.html
│       └── assets/
├── algi-akademi/         # Deployment-ready frontend
│   ├── index.html
│   └── assets/
└── ...other files
```

## Production Deployment

**IMPORTANT**: Make sure your Replit deployment is configured as **Autoscale Deployment** (not Static)!

### Step 1: Prepare files
```bash
./prepare-deploy.sh
```

### Step 2: Configure Replit Deployment
When deploying on Replit:
1. **Deployment Type**: Choose "Autoscale" (NOT Static)
2. **Build Command**: `npm run build`
3. **Run Command**: `npm start`
4. **Public Directory**: Leave empty (backend will serve files)

### Step 3: Verify Deployment Structure
The deployment should have:
- **Backend Server**: `dist/index.js` (Express server with API routes)
- **Static Files**: `server/public/` (served by Express)
- **Environment**: `NODE_ENV=production`

### Current Issue Analysis
If admin login shows "Sunucuya bağlanırken bir hata oluştu":
- Check if deployment is set to **Autoscale** (not Static)
- API endpoints return 404 → Backend server is not running
- Only static files are served → Wrong deployment type

### Fix: Re-deploy as Autoscale
The deployment must be configured as **Autoscale Deployment** to run the Express server with API endpoints.

## Alternative Production Server
If deployment issues persist, use the simplified production server:
- File: `production-server.js` (standalone Express server)
- Tested working with admin login (admin/112233)
- Direct PostgreSQL session support
- Serves static files from dist/public

This server was tested locally and admin authentication works correctly.

## Updated Solution (January 6, 2025)
**Problem**: Backend server not running in deployment (Static deployment type)
**Solution**: Replaced bundled server with simplified production server
- Admin login credentials: admin/112233 ✓ Working locally
- Server file: `dist/index.js` (replaced with production-server.js)  
- Static files path corrected for deployment structure
- PostgreSQL session management working ✓

**Next**: Deploy as Autoscale with current build

## File Descriptions

- **create-deployment.js**: Node.js script that creates the deployment structure
- **deploy-setup.sh**: Shell script alternative for the same functionality
- **DEPLOYMENT.md**: This documentation file

## Configuration Files

The project uses protected configuration files that cannot be modified:
- `vite.config.ts`: Configures build output to `dist/public`
- `server/vite.ts`: Configures static file serving in production
- `package.json`: Contains build and start scripts

This solution works around the configuration constraints by creating the expected directory structure post-build.