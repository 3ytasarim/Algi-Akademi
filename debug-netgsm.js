// NetGSM API test script
import { Netgsm } from '@netgsm/sms';

async function testNetGSM() {
  console.log('🔍 NetGSM API Test Başlıyor...');
  
  // Environment variables kontrolü - Doğru sırada
  const username = process.env.NETGSM_USERNAME || '3129117683';
  const password = process.env.NETGSM_PASSWORD || '3@CAED1';
  const sender = process.env.NETGSM_SENDER || 'ALGIAKADEMI';
  
  console.log('🔍 Environment Variable Kontrolü:');
  console.log('NETGSM_USERNAME env:', process.env.NETGSM_USERNAME);
  console.log('NETGSM_PASSWORD env:', process.env.NETGSM_PASSWORD ? 'SET' : 'NOT SET');
  console.log('NETGSM_SENDER env:', process.env.NETGSM_SENDER);
  
  console.log('📋 NetGSM Bilgileri:');
  console.log('Username:', username);
  console.log('Password:', password ? '***' + password.slice(-2) : 'YOK');
  console.log('Sender:', sender);
  
  // NetGSM instance oluştur
  const netgsm = new Netgsm({
    username: username,
    password: password,
    appname: 'ALGIAKADEMI'
  });
  
  try {
    console.log('\n📤 SMS Gönderimi Test Ediliyor...');
    
    const response = await netgsm.sendRestSms({
      msgheader: sender,
      encoding: 'TR',
      iysfilter: '0', // Bilgilendirme amaçlı
      messages: [
        {
          msg: 'Test mesajı - Algı Akademi SMS sistemi çalışıyor.',
          no: '5050661535' // Test numarası
        }
      ]
    });
    
    console.log('✅ SMS Yanıtı:', JSON.stringify(response, null, 2));
    
    if (response && response.jobid) {
      console.log('🎉 SMS Başarıyla Gönderildi! Job ID:', response.jobid);
    } else {
      console.log('❌ SMS Gönderim Hatası:', response);
    }
    
  } catch (error) {
    console.error('💥 NetGSM Hatası:', error.message);
    console.error('Detay:', error);
    
    // Yaygın hata kodları kontrolü
    if (error.message.includes('30')) {
      console.log('🔑 Hata 30: Geçersiz kullanıcı adı/şifre veya API erişimi yok');
      console.log('💡 Çözüm: NetGSM panelinden alt kullanıcı oluşturun ve API yetkisi verin');
    }
    
    if (error.message.includes('40')) {
      console.log('📝 Hata 40: Mesaj başlığı tanımlanmamış');
      console.log('💡 Çözüm: ALGIAKADEMI başlığının NetGSM panelinde onaylanmış olduğundan emin olun');
    }
  }
}

// Test çalıştır
testNetGSM().catch(console.error);