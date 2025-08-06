# Hızlı Başlangıç - Sunucu Hatası Çözümü

## Adım 1: Basit Test
```bash
# Önce basit server ile test et:
npm install
npm run build
npm start
```

Bu çalışırsa, sorun database connection'da.

## Adım 2: Database Setup
```bash
# PostgreSQL database oluştur
createdb algi_akademi

# Schema import et
psql -d algi_akademi -f database-schema.sql
psql -d algi_akademi -f database-data.sql
```

## Adım 3: Environment Variables
`.env` dosyası oluştur:
```
DATABASE_URL=postgresql://username:password@localhost:5432/algi_akademi
SESSION_SECRET=your-secret-key
NODE_ENV=production
PORT=3000
```

## Adım 4: Full Server
```bash
# Full server ile çalıştır:
npm run start:full
```

## Platform Specific

### Railway:
1. GitHub'a push
2. Connect to Railway
3. Add PostgreSQL
4. Environment variables otomatik

### Render:
1. Web Service oluştur
2. PostgreSQL database ekle  
3. Environment variables ayarla

## Hata Devam Ederse:
1. `TROUBLESHOOTING.md` dosyasını kontrol et
2. Log'ları kontrol et: `npm start 2>&1 | tee error.log`
3. Database test: `psql $DATABASE_URL -c "SELECT 1;"`

Admin Login: `admin/112233`