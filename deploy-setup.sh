#!/bin/bash

echo "🚀 Preparing Algı Akademi for deployment..."

# Clean and rebuild
echo "📦 Building application..."
rm -rf dist algi-akademi
npm run build

# Create deployment structure
echo "📁 Setting up deployment structure..."
mkdir -p algi-akademi

# Copy built files to deployment directory
cp -r dist/public/* algi-akademi/
cp dist/index.js algi-akademi/

# Create proper index.html for client-side routing
cat > algi-akademi/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>Algı Akademi</title>
    <link rel="stylesheet" href="/modal-force.css" />
    <script type="module" crossorigin src="/assets/index-CYbDY9r6.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-DvUH2z-U.css">
  </head>
  <body>
    <div id="root"></div>
    <script type="text/javascript" src="https://replit.com/public/js/replit-dev-banner.js"></script>
  </body>
</html>
EOF

# Copy index.html to 404.html for SPA routing
cp algi-akademi/index.html algi-akademi/404.html

# Create _redirects for Netlify-style routing (if supported)
echo "/*    /index.html   200" > algi-akademi/_redirects

echo "✅ Deployment ready in algi-akademi/ folder"
echo "🌐 Deploy this folder to production"