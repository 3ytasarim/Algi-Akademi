#!/usr/bin/env node

// Alternative production server that directly serves from dist/public
import express from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Session configuration for production
const isProduction = true;
const pgStore = connectPg(session);
const sessionStore = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: false,
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  tableName: "sessions",
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'algı-akademi-secret-key',
  store: sessionStore,
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

// Simple session management
app.use((req, res, next) => {
  if (!req.session.auth) {
    req.session.auth = { isAuthenticated: false, user: null };
  }
  next();
});

// Auth endpoints
app.get('/api/auth/user', async (req, res) => {
  try {
    if (req.session.auth && req.session.auth.isAuthenticated) {
      return res.json(req.session.auth.user);
    }
    res.status(401).json({ message: "Unauthorized" });
  } catch (error) {
    console.error("Error in auth check:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Admin login endpoint
app.post('/api/auth/admin-login', async (req, res) => {
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
      
      res.json({ 
        message: "Giriş başarılı",
        user: req.session.auth.user
      });
    } else {
      res.status(401).json({ message: "Geçersiz kullanıcı adı veya şifre" });
    }
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ message: "Giriş işlemi başarısız" });
  }
});

// Logout endpoint
app.post('/api/auth/logout', async (req, res) => {
  try {
    req.session.auth = { isAuthenticated: false, user: null };
    res.json({ message: "Çıkış başarılı" });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: "Çıkış işlemi başarısız" });
  }
});

// Serve static files - deployment uses current directory structure
const staticPath = process.env.NODE_ENV === 'production' 
  ? path.resolve(__dirname, 'public')  // For deployment: files are at same level
  : path.resolve(__dirname, 'dist', 'public'); // For local testing
console.log('Serving static files from:', staticPath);
app.use(express.static(staticPath));

// Fall through to index.html
app.use("*", (req, res) => {
  res.sendFile(path.resolve(staticPath, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`[Production Server] serving on port ${port}`);
  console.log(`[Production Server] Static files: ${staticPath}`);
});