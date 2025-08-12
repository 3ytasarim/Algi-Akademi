// Test course creation API directly
console.log("Testing course creation API...");

const testData = {
  courseData: JSON.stringify({
    title: "Test Kurs",
    description: "Test Açıklama",
    price: "100",
    sections: [
      { name: "Ders 1" },
      { name: "Ders 2" }
    ]
  })
};

fetch('https://algiakademi.replit.app/api/courses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers);
  return response.text();
})
.then(data => {
  console.log('Response body:', data);
  try {
    const parsed = JSON.parse(data);
    console.log('Parsed response:', parsed);
  } catch (e) {
    console.log('Could not parse as JSON');
  }
})
.catch(error => {
  console.error('Error:', error);
});