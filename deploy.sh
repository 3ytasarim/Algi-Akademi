#!/bin/bash

# Algı Akademi Deployment Script
echo "🚀 Preparing Algı Akademi for deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run type check
echo "🔍 Running type check..."
npm run check

# Build the application
echo "🏗️  Building application..."
npm run build

# Verify build output
echo "✅ Verifying build output..."
if [ -f "dist/index.js" ] && [ -d "dist/public" ]; then
    echo "✅ Build successful!"
    echo "   - Server bundle: dist/index.js"
    echo "   - Static assets: dist/public/"
    echo ""
    echo "🎯 Deployment Configuration:"
    echo "   - Type: Autoscale (Node.js runtime required)"
    echo "   - Build Command: npm install && npm run build"
    echo "   - Run Command: npm start"
    echo "   - Port: 5000"
    echo ""
    echo "✅ Ready for deployment!"
else
    echo "❌ Build failed - missing required files"
    exit 1
fi