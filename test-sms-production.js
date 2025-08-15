// Production SMS Test - Directly test NetGSM
import { Netgsm } from '@netgsm/sms';

async function testProductionSMS() {
  console.log('🔄 Production SMS Servisini Test Ediliyor...');
  
  // Environment variables'dan NetGSM bilgilerini al
  const username = process.env.NETGSM_USERNAME;
  const password = process.env.NETGSM_PASSWORD;
  const sender = process.env.NETGSM_SENDER;
  
  console.log('📋 Production Environment Bilgileri:');
  console.log('Username:', username);
  console.log('Password:', password ? 'SET' : 'NOT SET');
  console.log('Sender:', sender);
  
  if (!username || !password || !sender) {
    console.log('❌ Environment variables eksik!');
    return;
  }
  
  try {
    // NetGSM instance oluştur
    const netgsm = new Netgsm({
      username: username,
      password: password,
      appname: 'ALGIAKADEMI'
    });
    
    console.log('\n📤 SMS Test Gönderimi...');
    const response = await netgsm.sendRestSms({
      msgheader: sender,
      encoding: 'TR',
      iysfilter: '0',
      messages: [
        {
          msg: 'Production test - Algı Akademi SMS sistemi çalışıyor.',
          no: '5050661535'
        }
      ]
    });
    
    console.log('✅ Production SMS Yanıtı:', JSON.stringify(response, null, 2));
    
    if (response && response.jobid) {
      console.log('🎉 Production SMS Başarılı! Job ID:', response.jobid);
      
      // Hoşgeldin SMS formatı test
      console.log('\n👋 Hoşgeldin SMS Test Ediliyor...');
      const welcomeMessage = 'Merhaba Test Kullanıcı, Algı Akademi\'ye hoş geldiniz! Giriş bilgileriniz - TC: 12345678901, Şifre: 112233 - Link: https://algi-akademi.replit.app/';
      
      const welcomeResponse = await netgsm.sendRestSms({
        msgheader: sender,
        encoding: 'TR',
        iysfilter: '0',
        messages: [
          {
            msg: welcomeMessage,
            no: '5050661535'
          }
        ]
      });
      
      console.log('✅ Hoşgeldin SMS Yanıtı:', JSON.stringify(welcomeResponse, null, 2));
      
    } else {
      console.log('❌ Production SMS Hatası:', response);
    }
    
  } catch (error) {
    console.error('💥 Production Test Hatası:', error.message);
    console.error('Detay:', error);
  }
}

testProductionSMS().catch(console.error);