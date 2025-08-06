# Algı Akademi - Deployment Package

## Proje Açıklaması
Kapsamlı CRM tabanlı eğitim yönetim sistemi. React + Express.js + PostgreSQL kullanıyor.

## Teknolojiler
- Frontend: React 18, TypeScript, Tailwind CSS, Radix UI
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Authentication: Session-based (PostgreSQL store)

## Kurulum

### 1. Dependencies Yükle
```bash
npm install
```

### 2. Environment Variables
`.env` dosyası oluştur:
```
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-secret-key
NODE_ENV=production
PORT=3000
```

### 3. Database Setup
- PostgreSQL database oluştur
- `database-schema.sql` dosyasını import et
- Drizzle migration çalıştır:
```bash
npm run db:push
```

### 4. Build & Start
```bash
npm run build
npm start
```

## Admin Login
- Kullanıcı adı: admin
- Şifre: 112233

## Hosting Önerileri
- **Railway**: Otomatik PostgreSQL + Node.js
- **Render**: Web Service + PostgreSQL addon
- **Vercel**: Frontend + Serverless functions
- **DigitalOcean App Platform**: Full-stack hosting

## Database Export
`database-schema.sql` dosyası ile schema
`database-data.sql` dosyası ile sample data

## Port Configuration
Uygulama varsayılan olarak PORT environment variable'ını kullanır, yoksa 3000 portunu açar.