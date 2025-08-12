#!/bin/bash

echo "=== RESTARTING PRODUCTION SERVER ==="

# Kill existing processes
pkill -f "node dist" || echo "No existing processes"

# Wait
sleep 3

# Start fresh
cd /home/runner/workspace
export NODE_ENV=production
export PORT=3000
nohup node dist/index.js > prod.log 2>&1 &

# Wait for startup
sleep 8

echo "Production server restarted"
echo "Check logs: tail -f prod.log"