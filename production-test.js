// Production test that can be pasted into browser console
console.log("=== PRODUCTION DEBUG TEST ===");

// Test real API call
fetch('https://algi-akademi.replit.app/api/debug/course/Adli%20Sekreterlik/sections')
  .then(response => response.json())
  .then(data => {
    console.log("API Response:", data);
    
    data.sections.forEach((section, index) => {
      const lessonTitle = section.name || section.title || `Ders ${index + 1}`;
      console.log(`Section ${index}:`);
      console.log(`  section.name: "${section.name}"`);
      console.log(`  section.title: "${section.title}"`);
      console.log(`  final lessonTitle: "${lessonTitle}"`);
      console.log(`  Toast would show: "${lessonTitle} yeni sekmede açılıyor..."`);
    });
  })
  .catch(error => console.error("Error:", error));