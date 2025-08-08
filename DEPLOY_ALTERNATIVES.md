# Algı Akademi - Alternatif Deployment Seçenekleri

Replit deployment sorunu yaşıyorsanız, bu alternatif platformları kullanabilirsiniz:

## 1. Vercel (Önerilen)
```bash
# Vercel CLI ile deploy
npm install -g vercel
vercel
```

## 2. Railway
```bash
# Railway CLI ile deploy
npm install -g @railway/cli
railway login
railway deploy
```

## 3. Heroku
```bash
# Heroku CLI ile deploy
heroku create algi-akademi
git push heroku main
```

## 4. DigitalOcean App Platform
- GitHub repo'nuzu bağlayın
- Build Command: `npm run build`
- Run Command: `npm start`

## Gerekli Environment Variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: production
- `PORT`: 5000 (otomatik ayarlanır)

## Database Migration:
Deployment sonrası:
```bash
npm run db:push
```

Bu komutla veritabanı şemanızı yeni platforma taşıyabilirsiniz.