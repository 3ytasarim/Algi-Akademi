import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('=== PRODUCTION SERVER RESTART ===');

async function restartProduction() {
  try {
    // Kill any existing processes
    console.log('Killing existing processes...');
    try {
      await execAsync('pkill -f "server/index"');
      await execAsync('pkill -f "tsx"');
    } catch (e) {
      console.log('No existing processes to kill');
    }

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Build the project
    console.log('Building project...');
    const { stdout: buildOutput, stderr: buildError } = await execAsync('npm run build');
    console.log('Build output:', buildOutput);
    if (buildError) console.log('Build warnings:', buildError);

    // Start production server
    console.log('Starting production server...');
    const productionProcess = exec('NODE_ENV=production node dist/server/index.js', {
      env: { ...process.env, NODE_ENV: 'production', PORT: '3000' }
    });

    productionProcess.stdout?.on('data', (data) => {
      console.log('PROD SERVER:', data.toString());
    });

    productionProcess.stderr?.on('data', (data) => {
      console.error('PROD ERROR:', data.toString());
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test the server
    console.log('Testing server...');
    const response = await fetch('http://localhost:3000/api/courses');
    console.log('Server response status:', response.status);
    
    if (response.status === 200) {
      console.log('✓ Production server running successfully!');
    } else {
      console.log('✗ Server not responding correctly');
    }

  } catch (error) {
    console.error('Error restarting production:', error);
  }
}

restartProduction();