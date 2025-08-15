// Production SMS Endpoints Test
import express from 'express';
import { getNetGSMService } from './server/smsService.js';

const app = express();
app.use(express.json());

// SMS test endpoint
app.post('/api/sms/test', async (req, res) => {
  try {
    console.log('📱 SMS Test Endpoint çağrıldı');
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Telefon numarası gerekli' 
      });
    }
    
    const smsService = getNetGSMService();
    const result = await smsService.sendSMS({
      phone: phone,
      message: 'Test mesajı - Algı Akademi SMS sistemi çalışıyor.'
    });
    
    console.log('📤 SMS Test Sonucu:', result);
    
    res.json({
      success: result.success,
      jobId: result.jobId,
      error: result.error
    });
    
  } catch (error) {
    console.error('💥 SMS Test Endpoint Hatası:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Hoşgeldin SMS test endpoint
app.post('/api/sms/welcome', async (req, res) => {
  try {
    console.log('👋 Hoşgeldin SMS Endpoint çağrıldı');
    const { firstName, tcKimlikNo, phone, password } = req.body;
    
    if (!firstName || !tcKimlikNo || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tüm alanlar gerekli' 
      });
    }
    
    const smsService = getNetGSMService();
    const result = await smsService.sendWelcomeSMS({
      firstName,
      tcKimlikNo,
      phone,
      password
    });
    
    console.log('👋 Hoşgeldin SMS Sonucu:', result);
    
    res.json({
      success: result.success,
      jobId: result.jobId,
      error: result.error
    });
    
  } catch (error) {
    console.error('💥 Hoşgeldin SMS Endpoint Hatası:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🔄 SMS Test Server başlatıldı: http://localhost:${PORT}`);
  console.log('📱 Test endpoints:');
  console.log(`POST http://localhost:${PORT}/api/sms/test`);
  console.log(`POST http://localhost:${PORT}/api/sms/welcome`);
});

export default app;