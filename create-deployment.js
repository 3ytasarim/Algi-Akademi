import fs from 'fs';
import path from 'path';

console.log('🚀 Creating production deployment...');

// Ensure algi-akademi directory exists and is current
const deployDir = './algi-akademi';
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir, { recursive: true });
}

// Copy all built assets
console.log('📦 Copying built assets...');
if (fs.existsSync('./dist/public')) {
  // Copy everything from dist/public to algi-akademi
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
  
  copyRecursive('./dist/public', deployDir);
}

// Copy server file
if (fs.existsSync('./dist/index.js')) {
  fs.copyFileSync('./dist/index.js', path.join(deployDir, 'index.js'));
}

// Update algi-akademi/index.html with correct asset paths
const indexPath = path.join(deployDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Ensure proper asset loading with correct paths
  html = html.replace(/href="\/assets\//g, 'href="./assets/');
  html = html.replace(/src="\/assets\//g, 'src="./assets/');
  
  fs.writeFileSync(indexPath, html);
  
  // Create 404.html for client-side routing
  fs.writeFileSync(path.join(deployDir, '404.html'), html);
}

// Create .replit file for proper deployment
const replitConfig = `
[deployment]
publicDir = "algi-akademi"
`;

fs.writeFileSync('./.replit', replitConfig.trim());

console.log('✅ Production deployment ready!');
console.log('📁 Deploy the algi-akademi/ folder');
console.log('🌐 All routes will work with client-side routing');