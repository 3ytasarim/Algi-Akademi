import { Netgsm } from '@netgsm/sms';

interface SMSConfig {
  username: string;
  password: string;
  msgheader: string;
}

interface SMSMessage {
  phone: string;
  message: string;
}

export class NetGSMService {
  private netgsm: Netgsm;
  private config: SMSConfig;

  constructor(config: SMSConfig) {
    this.config = config;
    this.netgsm = new Netgsm({
      username: config.username,
      password: config.password,
      appname: 'ALGIAKADEMI'
    });
  }

  async sendSMS(message: SMSMessage): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      console.log('NetGSM SMS Gönderimi:', {
        phone: message.phone,
        header: this.config.msgheader,
        messageLength: message.message.length
      });

      // Telefon numarasını formatla (başındaki + ve 0'ları temizle)
      const cleanPhone = this.cleanPhoneNumber(message.phone);
      
      if (!this.isValidTurkishPhone(cleanPhone)) {
        throw new Error('Geçersiz Türk telefon numarası formatı');
      }

      const response = await this.netgsm.sendRestSms({
        msgheader: this.config.msgheader,
        encoding: 'TR', // Türkçe karakter desteği
        iysfilter: '0', // Bilgilendirme amaçlı (İYS kontrolü yok)
        messages: [
          {
            msg: message.message,
            no: cleanPhone
          }
        ]
      });

      console.log('NetGSM Yanıtı:', response);

      if (response && response.jobid) {
        return {
          success: true,
          jobId: response.jobid
        };
      } else {
        // Safely stringify response
        let errorMessage = 'Bilinmeyen hata';
        try {
          if (response) {
            errorMessage = JSON.stringify(response);
          }
        } catch (e) {
          errorMessage = 'NetGSM yanıt formatı hatalı: ' + String(response);
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }

    } catch (error: any) {
      console.error('NetGSM SMS Hatası:', error);
      return {
        success: false,
        error: error.message || 'SMS gönderim hatası'
      };
    }
  }

  private cleanPhoneNumber(phone: string): string {
    // Telefon numarasını temizle
    let cleaned = phone.replace(/\D/g, ''); // Sadece rakamları al
    
    // Türkiye için +90 veya 0 ile başlıyorsa düzelt
    if (cleaned.startsWith('90')) {
      cleaned = cleaned.substring(2);
    } else if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // 5 ile başlayan 10 haneli numara olmalı
    return cleaned;
  }

  private isValidTurkishPhone(phone: string): boolean {
    // Türk cep telefonu: 5XXXXXXXXX (10 hane, 5 ile başlayan)
    return /^5\d{9}$/.test(phone);
  }

  async sendWelcomeSMS(studentData: {
    firstName: string;
    tcKimlikNo: string;
    phone: string;
    password: string;
  }): Promise<{ success: boolean; jobId?: string; error?: string }> {
    const message = `Merhaba ${studentData.firstName}, Algı Akademi'ye hoş geldiniz! Giriş bilgileriniz - TC: ${studentData.tcKimlikNo}, Şifre: ${studentData.password} - Link: https://algi-akademi.replit.app/`;
    
    return this.sendSMS({
      phone: studentData.phone,
      message: message
    });
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Test SMS gönder
      const testResult = await this.sendSMS({
        phone: '5050661535', // Test numarası
        message: 'Test mesajı - Algı Akademi SMS sistemi çalışıyor.'
      });
      
      return testResult;
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// NetGSM servis instance'ı
let netGSMService: NetGSMService | null = null;

export function initializeNetGSM() {
  const username = process.env.NETGSM_USERNAME || '3129117683';
  const password = process.env.NETGSM_PASSWORD || '3@CAED1';
  const msgheader = process.env.NETGSM_SENDER || 'ALGIAKADEMI';

  console.log('NetGSM İnitialize:', {
    username: username,
    hasPassword: !!password,
    sender: msgheader
  });

  netGSMService = new NetGSMService({
    username,
    password,
    msgheader
  });

  return netGSMService;
}

export function getNetGSMService(): NetGSMService {
  if (!netGSMService) {
    netGSMService = initializeNetGSM();
  }
  return netGSMService;
}