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

1. Build and prepare deployment files:
   ```bash
   npm run build
   node create-deployment.js
   ```

2. The deployment system should now find:
   - **Frontend**: `algi-akademi/` directory with static files
   - **Backend**: `dist/index.js` for the server

3. Start production server:
   ```bash
   npm start
   ```

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