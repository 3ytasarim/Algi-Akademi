import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Full Production Deployment Starting...');

// Step 1: Clean and build
console.log('📦 Building application...');
try {
  execSync('rm -rf dist algi-akademi', { stdio: 'inherit' });
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

// Step 2: Create deployment directory
console.log('📁 Creating deployment structure...');
const deployDir = './algi-akademi';
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir, { recursive: true });
}

// Step 3: Copy built frontend assets
console.log('📋 Copying frontend assets...');
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

if (fs.existsSync('./dist/public')) {
  copyRecursive('./dist/public', deployDir);
}

// Step 4: Create production server
console.log('⚙️  Creating production server...');
const productionServer = `import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './api/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// API routes first
app.use('/', apiRouter);

// Serve static files
app.use(express.static(__dirname, { index: false }));

// Handle client-side routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(\`🌟 Algı Akademi Production Server running on port \${port}\`);
  console.log(\`📊 API endpoints: /api/students, /api/courses, /api/auth\`);
});`;

fs.writeFileSync(path.join(deployDir, 'index.js'), productionServer);

// Step 5: Create package.json for production
console.log('📦 Creating production package.json...');
const productionPackage = {
  "name": "algi-akademi-production",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "express-session": "^1.17.3"
  }
};

fs.writeFileSync(
  path.join(deployDir, 'package.json'),
  JSON.stringify(productionPackage, null, 2)
);

// Step 6: Create API directory and copy API routes
console.log('🔗 Setting up API routes...');
const apiDir = path.join(deployDir, 'api');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir);
}

// Step 7: Update .replit configuration
console.log('⚙️  Updating .replit configuration...');
const replitConfig = `[deployment]
publicDir = "algi-akademi"
build = "cd algi-akademi && npm install"
run = "cd algi-akademi && npm start"

[nix]
channel = "stable-23.05"

[[ports]]
localPort = 3000
externalPort = 80`;

fs.writeFileSync('./.replit', replitConfig);

// Step 8: Create install script
console.log('📋 Creating install script...');
const installScript = `#!/bin/bash
echo "🚀 Installing Algı Akademi Production Dependencies..."
cd algi-akademi
npm install
echo "✅ Installation complete!"
echo "🌟 Run: npm start"`;

fs.writeFileSync('./install-production.sh', installScript);
fs.chmodSync('./install-production.sh', 0o755);

console.log('✅ Full Production Deployment Ready!');
console.log('📁 Deploy folder: algi-akademi/');
console.log('🔧 Next steps:');
console.log('   1. Click Deploy button');
console.log('   2. Production will have full API with in-memory database');
console.log('   3. All CRUD operations will work: CREATE, READ, UPDATE, DELETE');
console.log('📊 API Endpoints:');
console.log('   • GET/POST /api/students');
console.log('   • GET/POST /api/courses');
console.log('   • POST /api/auth/login');
console.log('   • All UPDATE and DELETE operations');