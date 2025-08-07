#!/bin/bash

echo "🚀 Preparing Algı Akademi for deployment..."

# Clean and rebuild
echo "📦 Building application..."
rm -rf dist
npm run build

# Create deployment structure
echo "📁 Setting up deployment structure..."
# Files are built directly to dist/ directory - no copying needed

echo "✅ Build completed - files ready in dist/ directory"
echo "🌐 Deploy using Autoscale deployment with:"
echo "   Build: npm install && npm run build"
echo "   Run: npm start"