#!/usr/bin/env node

// Full-stack deployment script for Replit
import express from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the full backend server routes
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from './shared/schema.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

// Session configuration
const pgStore = connectPg(session);
const sessionStore = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: true,
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  tableName: "sessions",
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'algi-akademi-secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Initialize session auth
app.use((req, res, next) => {
  if (!req.session.auth) {
    req.session.auth = { isAuthenticated: false, user: null };
  }
  next();
});

// Import and setup API routes - simplified version
// Auth routes
app.get('/api/auth/user', (req, res) => {
  if (req.session.auth?.isAuthenticated) {
    res.json(req.session.auth.user);
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

app.post('/api/auth/admin-login', (req, res) => {
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
        return res.status(500).json({ message: "Session error" });
      }
      res.json(req.session.auth.user);
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// Courses routes
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await db.select().from(schema.courses);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: "Error fetching courses" });
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const { title, description, price, duration, sections = [], category = 'Genel' } = req.body;
    
    const newCourse = await db.insert(schema.courses).values({
      title,
      description,
      instructorId: req.session.auth?.user?.id || 'admin',
      price: parseFloat(price).toFixed(2),
      duration: parseInt(duration),
      sections,
      category,
      status: 'active'
    }).returning();

    res.status(201).json(newCourse[0]);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: "Error creating course" });
  }
});

// Users/Students routes  
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.select().from(schema.users);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Consultants routes
app.get('/api/consultants', async (req, res) => {
  try {
    const consultants = await db.select().from(schema.consultants);
    res.json(consultants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching consultants" });
  }
});

// Sales routes
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await db.select().from(schema.sales);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sales" });
  }
});

// Activities routes
app.get('/api/activities', async (req, res) => {
  try {
    const activities = await db.select().from(schema.activities);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching activities" });
  }
});

// Serve static files
const publicPath = path.join(__dirname, 'dist', 'public');
app.use(express.static(publicPath));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    port: PORT,
    database: process.env.DATABASE_URL ? 'connected' : 'missing'
  });
});

// Catch-all handler for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Full-stack server running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`🔑 Admin: admin/112233`);
});