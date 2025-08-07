import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from algi-akademi directory
app.use(express.static(path.join(__dirname, 'algi-akademi/public')));

// Handle client-side routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'algi-akademi/public/index.html'));
});

app.listen(port, () => {
  console.log(`Production server running on port ${port}`);
});