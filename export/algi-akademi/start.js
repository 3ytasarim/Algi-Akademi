// Simplified production server for deployment
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist/public
app.use(express.static(join(__dirname, 'dist', 'public')));

// API fallback for missing backend
app.get('/api/*', (req, res) => {
  res.status(503).json({ 
    error: 'Backend service unavailable',
    message: 'Database connection needed. Check DATABASE_URL environment variable.'
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Missing'}`);
});