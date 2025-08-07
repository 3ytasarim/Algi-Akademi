#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function buildProduction() {
  try {
    console.log('🏗️  Building application...');
    await execAsync('npm run build');
    
    console.log('📁 Copying static files for production...');
    
    // Ensure server/public directory exists
    const serverPublicDir = './server/public';
    if (!fs.existsSync(serverPublicDir)) {
      fs.mkdirSync(serverPublicDir, { recursive: true });
    }
    
    // Copy all files from dist/public to server/public
    const copyRecursive = (src, dest) => {
      if (fs.statSync(src).isDirectory()) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        const entries = fs.readdirSync(src);
        for (const entry of entries) {
          copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
      } else {
        fs.copyFileSync(src, dest);
      }
    };
    
    // Clean and copy
    if (fs.existsSync('./dist/public')) {
      copyRecursive('./dist/public', serverPublicDir);
    }
    
    console.log('✅ Production build complete!');
    console.log('🚀 Ready for Autoscale deployment');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildProduction();