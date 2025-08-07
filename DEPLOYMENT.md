# Algı Akademi Production Deployment Guide

## 🚨 IMPORTANT: Node.js Runtime Required

This application requires **server-side runtime** and cannot be deployed as static files.

## Deployment Steps:

### 1. Click "Deploy" Button
- In your Replit workspace, click the **Deploy** button

### 2. Select "Autoscale Deployment" 
- ❌ DO NOT select "Static" deployment
- ✅ Select **"Autoscale Deployment"** for Node.js runtime

### 3. Configuration:
- **Build Command:** `cd algi-akademi && npm install`
- **Start Command:** `cd algi-akademi && npm start`
- **Port:** 3000

### 4. Machine Settings:
- **CPU:** 0.25 vCPU (minimum)
- **RAM:** 512 MB (minimum)
- **Max Instances:** 1-3

## Production Features:
✅ Full API endpoints for all CRUD operations
✅ Students: CREATE, READ, UPDATE, DELETE
✅ Courses: CREATE, READ, UPDATE, DELETE
✅ Authentication system
✅ In-memory database (production ready)
✅ Dark mode modal fixes

## API Endpoints Available:
- POST /api/auth/login
- GET /api/students
- POST /api/students
- PUT /api/students/:id
- DELETE /api/students/:id
- GET /api/courses
- POST /api/courses
- PUT /api/courses/:id
- DELETE /api/courses/:id

## Expected Result:
- ✅ https://algi-akademi.replit.app/ will serve frontend
- ✅ All API endpoints will respond with JSON (not HTML)
- ✅ Database operations will persist in memory
- ✅ Authentication will work
- ✅ Modal dark mode will be consistent