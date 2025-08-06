#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createDeploymentStructure() {
  console.log('Setting up deployment structure...');
  
  const sourceDir = path.join(__dirname, 'dist', 'public');
  const targetDir = path.join(__dirname, 'algi-akademi');
  
  // Check if source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.error('Source directory dist/public does not exist. Please build the project first.');
    process.exit(1);
  }
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
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
  
  try {
    // Clear target directory first
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    fs.mkdirSync(targetDir, { recursive: true });
    
    // Copy all files from source to target
    copyRecursive(sourceDir, targetDir);
    
    console.log('✅ Deployment structure created successfully!');
    console.log(`📁 Frontend files available in: ${targetDir}`);
    console.log(`📁 Backend files available in: ${path.join(__dirname, 'dist')}`);
    
  } catch (error) {
    console.error('❌ Error creating deployment structure:', error.message);
    process.exit(1);
  }
}

// Run the script
createDeploymentStructure();