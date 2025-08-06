#!/usr/bin/env node

// Alternative deployment solution - works with static deployment
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[Deployment] Alternative server startup...');

// Try to start the server in background for static deployment
const serverPath = path.resolve(__dirname, 'dist', 'index.js');

const server = spawn('node', [serverPath], {
  detached: true,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { 
    ...process.env, 
    NODE_ENV: 'production',
    PORT: process.env.PORT || '3000'
  }
});

server.stdout.on('data', (data) => {
  console.log(`[Server] ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`[Server Error] ${data}`);
});

server.on('error', (error) => {
  console.error('[Deployment] Server startup error:', error);
});

// Keep the process alive
setInterval(() => {
  console.log('[Deployment] Server process check...');
}, 30000);

console.log('[Deployment] Server started with PID:', server.pid);