// NetGSM API test script
import { Netgsm } from '@netgsm/sms';

async function testNetGSM() {
  console.log('🔍 NetGSM API Test Başlıyor...');
  
  // NetGSM desteğinden onaylanan doğru bilgiler
  const username = '3129117683';
  const password = '3@CAED1';
  const sender = 'ALGIAKADEMI';
  
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
    // Hata kodları kontrolü
    const errorCode = error.code || error.message;
    if (errorCode && errorCode.toString().includes('30')) {
      console.log('🔑 Hata 30: Geçersiz kullanıcı adı/şifre veya API erişimi yok');
    }
    
    if (errorCode && errorCode.toString().includes('40')) {
      console.log('📝 Hata 40: Mesaj başlığı tanımlanmamış');
    }
  }
}

// Test çalıştır
testNetGSM().catch(console.error);