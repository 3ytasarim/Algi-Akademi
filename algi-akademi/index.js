import express from 'express';
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
  console.log(`🌟 Algı Akademi Production Server running on port ${port}`);
  console.log(`📊 API endpoints: /api/students, /api/courses, /api/auth`);
});