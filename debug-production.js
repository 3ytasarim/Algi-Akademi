// Production debug script
const testAPI = async () => {
  try {
    const response = await fetch('https://algi-akademi.replit.app/api/debug/course/Adli%20Sekreterlik/sections');
    const data = await response.json();
    
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    // Test what frontend receives
    data.sections.forEach((section, index) => {
      console.log(`Section ${index}:`);
      console.log('  section.name:', section.name);
      console.log('  section.title:', section.title);
      console.log('  section.name || section.title:', section.name || section.title);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testAPI();