# Algı Akademi Deployment Troubleshooting

## Yaygın Sunucu Hataları ve Çözümleri

### 1. "Cannot find module" Hatası
**Problem**: Node.js dependencies bulamıyor
**Çözüm**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 2. "Database connection failed" Hatası
**Problem**: DATABASE_URL yanlış veya database mevcut değil
**Çözüm**:
```bash
# .env dosyasını kontrol et
cat .env

# Database URL format:
DATABASE_URL=postgresql://username:password@host:port/database_name

# Test database connection:
psql $DATABASE_URL -c "SELECT 1;"
```

### 3. "Port already in use" Hatası
**Problem**: Port kullanımda
**Çözüm**:
```bash
# Farklı port kullan
PORT=8080 npm start

# Veya .env dosyasında:
echo "PORT=8080" >> .env
```

### 4. "Static files not found" Hatası
**Problem**: Frontend build edilmemiş
**Çözüm**:
```bash
npm run build
# dist/public klasörünün oluştuğunu kontrol et
ls -la dist/public
```

### 5. "Session store error" Hatası
**Problem**: PostgreSQL session store bağlanamıyor
**Çözüm**:
```bash
# Basit server ile test et
node start.js

# Full server için database gerekli
npm run db:push
```

## Platform-Specific Solutions

### Railway
```bash
# railway.json oluştur:
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
```

### Render
```bash
# Build command: npm install && npm run build
# Start command: npm start
# Environment: Node.js
```

### Vercel
```bash
# vercel.json oluştur:
{
  "version": 2,
  "builds": [
    { "src": "package.json", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/" }
  ]
}
```

## Debug Steps

1. **Log kontrolü**:
```bash
npm start 2>&1 | tee server.log
```

2. **Environment kontrol**:
```bash
node -e "console.log(process.env.DATABASE_URL ? 'DB OK' : 'DB Missing')"
```

3. **Port test**:
```bash
curl http://localhost:3000/
```

4. **Database test**:
```bash
npm run db:push
```

## Hızlı Test Sunucusu
Eğer hala çalışmıyorsa, `start.js` kullan:
```bash
node start.js
```

Bu basit sunucu çalışırsa, sorun database connection'da.