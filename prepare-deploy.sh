#!/bin/bash

# Prepare deployment for Algı Akademi
echo "Preparing Algı Akademi for deployment..."

# Build the application
echo "Building application..."
npm run build

echo "Replacing server with simplified production server..."
cp production-server.js dist/index.js

# Create the deployment directory structure
echo "Setting up deployment structure..."

# Copy static files to server/public for backend to serve
mkdir -p server/public
cp -r dist/public/* server/public/

# Also create algi-akademi directory for static deployment option
mkdir -p algi-akademi  
cp -r dist/public/* algi-akademi/

echo "Deployment preparation completed!"
echo ""
echo "Files ready for deployment:"
echo "  Backend server: dist/index.js"
echo "  Static files: server/public/"
echo "  Alternative static: algi-akademi/"
echo ""
echo "To deploy: Configure deployment with:"
echo "  Build command: npm install && npm run build"
echo "  Run command: npm start"  
echo "  Deployment type: Autoscale (NOT Static)"
echo ""
echo "Backend server will serve static files and handle API requests"