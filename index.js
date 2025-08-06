#!/usr/bin/env node

// Main entry point for deployment
// This ensures the application works in both development and production

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  // Production: Use built server
  const serverPath = path.resolve(__dirname, 'dist', 'index.js');
  const publicPath = path.resolve(__dirname, 'dist', 'public');
  
  // Ensure static files exist
  if (!fs.existsSync(publicPath)) {
    console.error('Static files not found. Building...');
    process.exit(1);
  }
  
  // Copy static files to server/public for compatibility
  const serverPublicPath = path.resolve(__dirname, 'server', 'public');
  if (!fs.existsSync(serverPublicPath)) {
    fs.mkdirSync(serverPublicPath, { recursive: true });
    
    // Copy files
    function copyRecursive(src, dest) {
      if (fs.statSync(src).isDirectory()) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(file => {
          copyRecursive(path.join(src, file), path.join(dest, file));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    }
    
    copyRecursive(publicPath, serverPublicPath);
  }
  
  console.log('[Deployment] Starting production server...');
  
  // Use the simplified production server instead
  const prodServerPath = path.resolve(__dirname, 'production-server.js');
  console.log('[Deployment] Using simplified production server...');
  
  const server = spawn('node', [prodServerPath], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  server.on('error', (error) => {
    console.error('[Deployment] Server error:', error);
    process.exit(1);
  });
  
} else {
  // Development: Use dev server
  console.log('[Development] Starting dev server...');
  const devServer = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
  
  devServer.on('error', (error) => {
    console.error('[Development] Dev server error:', error);
    process.exit(1);
  });
}