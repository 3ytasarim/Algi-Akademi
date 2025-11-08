import { db } from "./db";
import { smsTemplates } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export async function seedSmsTemplates() {
  try {
    console.log("Seeding SMS templates...");
    
    const templates = [
      {
        name: 'Kursiyer Hoşgeldin SMS',
        subject: 'Hoşgeldin',
        content: 'Merhaba {isim}, Algı Akademi\'ye hoş geldiniz! Giriş bilgileriniz - TC: {tc}, Şifre: {sifre} - Link: {link}',
        variables: ['isim', 'tc', 'sifre', 'link'],
        type: 'welcome',
        isActive: true
      },
      {
        name: 'Şifre Sıfırlama SMS',
        subject: 'Şifre Sıfırlama',
        content: 'Merhaba {isim}, şifre sıfırlama kodunuz: {kod}. Bu kod 10 dakika geçerlidir.',
        variables: ['isim', 'kod'],
        type: 'password_reset',
        isActive: true
      },
      {
        name: 'Kurs Başlangıç Bildirimi',
        subject: 'Bildirim',
        content: '{isim}, {kurs_adi} kursunuz {tarih} tarihinde başlayacaktır. Hazır olun!',
        variables: ['isim', 'kurs_adi', 'tarih'],
        type: 'course_start',
        isActive: true
      },
      {
        name: 'Ödeme Hatırlatması',
        subject: 'Ödeme Hatırlatma',
        content: 'Sayın {isim}, Algı Akademi eğitim ücretinizden {tutar}₺ tutarında ödenmemiş borcunuz bulunmaktadır. Ödeme yapmak için lütfen bizimle iletişime geçiniz. Bilgi: 0XXX XXX XX XX',
        variables: ['isim', 'tutar'],
        type: 'payment_reminder',
        isActive: true
      }
    ];

    for (const template of templates) {
      // Check if template already exists by name
      const existing = await db.select()
        .from(smsTemplates)
        .where(eq(smsTemplates.name, template.name))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(smsTemplates).values(template);
        console.log(`✓ Seeded template: ${template.name}`);
      } else {
        console.log(`- Template already exists: ${template.name}`);
      }
    }
    
    console.log("SMS templates seeding completed");
  } catch (error) {
    console.error("Error seeding SMS templates:", error);
  }
}
