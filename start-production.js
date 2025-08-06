#!/usr/bin/env node

// Production server optimized for Replit deployment
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Check if dist/public exists
const publicPath = path.join(__dirname, 'dist', 'public');
if (!fs.existsSync(publicPath)) {
  console.error('Build directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Basic session configuration without database dependency
app.use(session({
  secret: process.env.SESSION_SECRET || 'algi-akademi-fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize session auth
app.use((req, res, next) => {
  if (!req.session.auth) {
    req.session.auth = { isAuthenticated: false, user: null };
  }
  next();
});

// Auth endpoints
app.get('/api/auth/user', (req, res) => {
  try {
    if (req.session.auth && req.session.auth.isAuthenticated) {
      return res.json(req.session.auth.user);
    }
    res.status(401).json({ message: "Unauthorized" });
  } catch (error) {
    console.error("Auth check error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin login
app.post('/api/auth/admin-login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === '112233') {
      req.session.auth = {
        isAuthenticated: true,
        user: {
          id: 'admin',
          username: 'admin',
          role: 'admin',
          firstName: 'Admin',
          lastName: 'User'
        }
      };
      
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Session error" });
        }
        res.json(req.session.auth.user);
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

// Serve static files
app.use(express.static(publicPath));

// API fallback for missing endpoints
app.get('/api/*', (req, res) => {
  res.status(200).json({ 
    message: 'API endpoint available',
    endpoint: req.path,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not built. Run "npm run build" first.');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    publicDir: fs.existsSync(publicPath) ? 'exists' : 'missing'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${publicPath}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Admin login: admin/112233`);
});