/**
 * T.C. Kimlik No doğrulama fonksiyonu
 * Türkiye Cumhuriyeti Kimlik Numarası algoritmasına göre doğrulama yapar
 */
export function validateTCKimlikNo(tcNo: string): boolean {
  // Boş veya null kontrolü
  if (!tcNo) return false;
  
  // String'i temizle (boşlukları kaldır)
  const cleanTcNo = tcNo.toString().trim();
  
  // 11 haneli olmalı
  if (cleanTcNo.length !== 11) return false;
  
  // Sadece rakam içermeli
  if (!/^\d{11}$/.test(cleanTcNo)) return false;
  
  // İlk hane 0 olamaz
  if (cleanTcNo[0] === '0') return false;
  
  // Rakamları diziye çevir
  const digits = cleanTcNo.split('').map(Number);
  
  // 10. hane kontrolü (1,3,5,7,9. hanelerin toplamının 7 katı eksi 2,4,6,8. hanelerin toplamı)
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]; // 1,3,5,7,9. haneler
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7]; // 2,4,6,8. haneler
  
  const tenthDigitCheck = (oddSum * 7 - evenSum) % 10;
  if (tenthDigitCheck !== digits[9]) return false;
  
  // 11. hane kontrolü (ilk 10 hanenin toplamının mod 10'u)
  const firstTenSum = digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0);
  const eleventhDigitCheck = firstTenSum % 10;
  if (eleventhDigitCheck !== digits[10]) return false;
  
  return true;
}

/**
 * T.C. Kimlik No'yu formatlar (11 haneli yapar, başındaki sıfırları ekler)
 */
export function formatTCKimlikNo(tcNo: string): string {
  const cleanTcNo = tcNo.toString().trim().replace(/\D/g, '');
  return cleanTcNo.padStart(11, '0');
}