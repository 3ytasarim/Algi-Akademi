# NetGSM SMS Entegrasyonu - Kurulum Rehberi

## ❌ Mevcut Durum
- **Hata Kodu 30**: credentialError
- **Sebep**: Alt kullanıcı veya API yetkilendirme sorunu

## ✅ NetGSM Panelinden Yapılması Gerekenler

### 1. Alt Kullanıcı Oluşturma (ZORUNLU)
1. https://www.netgsm.com.tr adresine gidin
2. Ana hesabınızla giriş yapın (3129117683 / ana şifre)
3. **Abonelik İşlemleri** > **Alt Kullanıcı Hesapları** menüsüne gidin
4. **Yeni Alt Kullanıcı** oluşturun:
   - Kullanıcı Adı: `api_kullanici` (örnek)
   - Şifre: Güçlü bir şifre belirleyin
   - **ÖNEMLİ**: API yetkilerini işaretleyin ✅

### 2. API Erişim İzni (ZORUNLU)
1. **Abonelik İşlemleri** > **API İşlemleri** menüsüne gidin
2. **API Erişim Talebi** butonuna tıklayın
3. API erişimini aktifleştirin

### 3. Gönderici Adı Onayı (ZORUNLU)
1. **SMS Hizmeti** > **SMS Ayarları** > **Başlıklarım** menüsüne gidin
2. **ALGIAKADEMI** başlığının **onaylanmış** durumda olduğunu kontrol edin
3. Eğer yoksa yeni başlık talebinde bulunun

### 4. IP Kısıtlaması Kontrolü
1. **Abonelik İşlemleri** > **API İşlemleri** menüsünde
2. **API için IP Erişimini Sınırla** özelliğinin kapalı olduğunu kontrol edin
3. Veya Replit IP'sini whitelist'e ekleyin

## 🔧 Doğru API Bilgileri

NetGSM API için gereken bilgiler:
- **username**: Ana abone numaranız (3129117683)
- **password**: ALT KULLANICI şifresi (ana şifre değil!)
- **msgheader**: Onaylanmış gönderici adı (ALGIAKADEMI)

## 📞 NetGSM Destek
Eğer API erişiminde sorun yaşanıyorsa:
- **Telefon**: 0312 911 0 911 veya 0850 303 0 303
- **E-posta**: teknikdestek@netgsm.com.tr

"API entegrasyonu için alt kullanıcı oluşturmak ve API yetkisi vermek istiyorum" deyin.

## 🧪 Test Sonrası
Alt kullanıcı oluşturduktan sonra bu bilgileri güncelleyin:
- NETGSM_USERNAME: 3129117683 (abone numarası)
- NETGSM_PASSWORD: [yeni alt kullanıcı şifresi]
- NETGSM_SENDER: ALGIAKADEMI (onaylanmış başlık)