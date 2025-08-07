import fs from 'fs';
import path from 'path';

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🚀 Preparing Autoscale deployment...');

// Build the application with proper static file handling
try {
  console.log('🏗️  Building application...');
  await execAsync('node scripts/build-production.js');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Verify all build files exist
if (!fs.existsSync('./dist/index.js')) {
  console.error('❌ Server file not found.');
  process.exit(1);
}

if (!fs.existsSync('./server/public/index.html')) {
  console.error('❌ Static files not found in server/public.');
  process.exit(1);
}

console.log('✅ All files ready for Autoscale deployment');

// Create .replit file for proper Autoscale deployment
const replitConfig = `
modules = ["nodejs-20", "postgresql-16"]
[deployment]
deploymentTarget = "autoscale"
build = "npm run build"
run = "npm start"

[nix]
channel = "stable-24_05"

[[ports]]
localPort = 3000
externalPort = 80

[agent]
integrations = ["javascript_mem_db==1.0.0"]
`;

fs.writeFileSync('./.replit', replitConfig.trim());

console.log('✅ Production deployment ready!');
console.log('📁 Deploy the algi-akademi/ folder');
console.log('🌐 All routes will work with client-side routing');