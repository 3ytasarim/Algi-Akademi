#!/bin/bash

# Build the application
echo "Building application..."
npm run build

# Create deployment directory structure
echo "Setting up deployment directory..."
mkdir -p algi-akademi
cp -r dist/public/* algi-akademi/

echo "Deployment setup complete!"
echo "Frontend files are available in: algi-akademi/"
echo "Backend files are available in: dist/"