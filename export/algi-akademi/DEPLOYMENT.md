# Algı Akademi Deployment Guide

## Hızlı Başlangıç

### 1. Dosyaları Yükle
Bu klasörü hosting platformuna yükle

### 2. Environment Variables Ayarla
`.env.example` dosyasından `.env` oluştur ve doldur:
```
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=random-secret-key
NODE_ENV=production
PORT=3000
```

### 3. Database Setup
PostgreSQL database oluştur ve şu dosyayı çalıştır:
```bash
psql -d your_database -f database-schema.sql
```

### 4. Install & Build
```bash
npm install
npm run build
```

### 5. Start Application
```bash
npm start
```

## Hosting Platform Önerileri

### Railway (Önerilen)
1. GitHub'a push et
2. Railway'e import et
3. PostgreSQL addon ekle
4. Environment variables ayarla
5. Deploy et

### Render
1. GitHub'a push et  
2. Web Service olarak deploy et
3. PostgreSQL database ekle
4. Environment variables ayarla

### Vercel
1. Frontend: Vercel'e deploy et
2. Backend: Serverless functions kullan
3. Database: Neon/PlanetScale kullan

### DigitalOcean App Platform
1. GitHub'dan app oluştur
2. Database component ekle
3. Environment variables ayarla

## Admin Login
- Kullanıcı adı: `admin`
- Şifre: `112233`

## Port Configuration
Uygulama PORT environment variable'ını kullanır, yoksa 3000 portunu açar.

## Troubleshooting
- Database connection hatası: DATABASE_URL'i kontrol et
- Build hatası: Node.js 18+ gerekli
- Static files loading: dist/public klasörünün doğru oluştuğunu kontrol et