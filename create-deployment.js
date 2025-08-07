import fs from 'fs';
import path from 'path';

console.log('🚀 Configuring Autoscale deployment...');

// Autoscale deployments don't need separate directory structure
// The server serves static files from dist/public directory
console.log('📦 Static files ready in dist/public...');

// Verify build files exist
if (!fs.existsSync('./dist/public')) {
  console.error('❌ Build files not found. Run npm run build first.');
  process.exit(1);
}

if (!fs.existsSync('./dist/index.js')) {
  console.error('❌ Server file not found. Run npm run build first.');
  process.exit(1);
}

console.log('✅ All build files ready for Autoscale deployment');

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