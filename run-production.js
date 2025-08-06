#!/usr/bin/env node

// Production runner for Algı Akademi
// This script ensures proper deployment structure and starts the server

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message) {
  console.log(`[Production] ${message}`);
}

async function ensureDeploymentStructure() {
  log('Ensuring deployment structure...');
  
  const sourceDir = path.join(__dirname, 'dist', 'public');
  const serverPublicDir = path.join(__dirname, 'server', 'public');
  
  // Check if built files exist
  if (!fs.existsSync(sourceDir)) {
    log('Built files not found. Running build...');
    return new Promise((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'build'], { stdio: 'inherit' });
      buildProcess.on('close', (code) => {
        if (code === 0) {
          log('Build completed successfully');
          resolve();
        } else {
          reject(new Error(`Build failed with code ${code}`));
        }
      });
    });
  }
  
  // Ensure server/public directory exists and is up to date
  if (fs.existsSync(sourceDir)) {
    if (fs.existsSync(serverPublicDir)) {
      fs.rmSync(serverPublicDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(serverPublicDir, { recursive: true });
    
    // Copy files recursively
    function copyRecursive(src, dest) {
      const stats = fs.statSync(src);
      
      if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        
        const files = fs.readdirSync(src);
        files.forEach(file => {
          const srcPath = path.join(src, file);
          const destPath = path.join(dest, file);
          copyRecursive(srcPath, destPath);
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    }
    
    copyRecursive(sourceDir, serverPublicDir);
    log('Static files copied to server/public');
  }
}

async function startServer() {
  log('Starting production server...');
  
  const serverPath = path.join(__dirname, 'dist', 'index.js');
  
  if (!fs.existsSync(serverPath)) {
    throw new Error('Server build not found. Please run npm run build first.');
  }
  
  // Start the server
  const serverProcess = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: process.env.PORT || '5000'
    }
  });
  
  serverProcess.on('error', (error) => {
    console.error('[Production] Server error:', error);
    process.exit(1);
  });
  
  serverProcess.on('close', (code) => {
    console.error(`[Production] Server exited with code ${code}`);
    process.exit(code);
  });
  
  // Handle shutdown gracefully
  process.on('SIGINT', () => {
    log('Received SIGINT, shutting down gracefully...');
    serverProcess.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    log('Received SIGTERM, shutting down gracefully...');
    serverProcess.kill('SIGTERM');
  });
}

async function main() {
  try {
    await ensureDeploymentStructure();
    await startServer();
  } catch (error) {
    console.error('[Production] Failed to start:', error.message);
    process.exit(1);
  }
}

main();