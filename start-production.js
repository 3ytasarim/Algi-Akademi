#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function startProduction() {
  try {
    console.log('🏗️  Building for production...');
    await execAsync('npm run build');
    
    console.log('📁 Setting up deployment...');
    await execAsync('node create-deployment.js');
    
    console.log('🚀 Starting production server...');
    process.chdir('./algi-akademi');
    await execAsync('node index.js');
    
  } catch (error) {
    console.error('❌ Production startup failed:', error.message);
    process.exit(1);
  }
}

startProduction();