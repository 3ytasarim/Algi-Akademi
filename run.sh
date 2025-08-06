#!/bin/bash

# Alternative deployment script for Replit
echo "Starting Algı Akademi production server..."

# Set environment
export NODE_ENV=production
export PORT=${PORT:-3000}

# Ensure database connection
echo "Database URL configured: ${DATABASE_URL:+Yes}"

# Start the server
echo "Starting server on port $PORT"
node dist/index.js