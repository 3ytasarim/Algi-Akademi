# Algı Akademi - Core Deployment Sorun Giderme

## Core Kullanıyorsunuz Ama Deployment Çalışmıyor

### Hemen Kontrol Edilmesi Gerekenler:

**1. Kredi Durumu Kontrolü:**
- Replit'te sağ üst → Profile → Account → Resource Usage
- Aylık $25 krediniz bitmiş olabilir
- Kullanım geçmişini kontrol edin

**2. Ödeme Durumu:**
- Account → Billing bölümünü kontrol edin
- Kredi kartınız reddedilmiş olabilir
- Ödeme metodunu güncellemeyi deneyin

**3. Deployment Pane Detayları:**
- Sol panel → Deployments sekmesini açın
- "View Details" veya "Logs" butonlarını tıklayın
- Spesifik hata mesajını kopyalayın

### Teknik Kontroller:

**4. Build Testi:**
```bash
npm run build
# Bu komut başarıyla çalışmalı
```

**5. Production Server Testi:**
```bash
NODE_ENV=production node dist/index.js
# Port 5000'de başlamalı
```

**6. Database Bağlantısı:**
- DATABASE_URL environment variable'ın var olduğunu kontrol edin
- PostgreSQL database'in aktif olduğunu doğrulayın

### Hızlı Çözümler:

**A. Deployment Cache Temizleme:**
- Deployment pane'de "Clear Cache" seçeneği varsa tıklayın
- Tekrar deploy etmeyi deneyin

**B. Replit Restart:**
- Sayfayı yenileyip tekrar deneyin
- Tarayıcı cache'ini temizleyin

**C. Support'a Başvuru:**
- Eğer yukarıdakiler çalışmazsa
- Replit Support'a ticket açın
- Core aboneliğiniz olduğunu belirtin

### Alternatif Çözüm:
Eğer Replit deployment hala çalışmazsa:
- Vercel, Railway, Heroku gibi alternatiflere deploy edebilirsiniz
- Proje tamamen hazır ve çalışır durumda