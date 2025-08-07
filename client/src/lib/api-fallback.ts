// API fallback for when backend is not available
export const mockCourses = [
  {
    id: "0b6fa053-1f58-4204-9c22-700a42913c03",
    title: "Adli Sekreterlik",
    description: "Adli Sekreterlik Kurs Dersleri",
    instructorId: "admin",
    price: "5000.00",
    duration: 13,
    sections: [
      { name: "Uyap Nedir?", pdfFile: {} },
      { name: "Sisteme Giriş", pdfFile: {} },
      { name: "Hukuk Mahkemeleri", pdfFile: {} },
      { name: "Dosya İşlemleri", pdfFile: {} },
      { name: "Dosya Modülü", pdfFile: {} },
      { name: "Dava Açılış Modülü", pdfFile: {} },
      { name: "Tebligat Modülü", pdfFile: {} },
      { name: "Duruşma İşlemleri", pdfFile: {} },
      { name: "Bilirkişi Alt Modülü", pdfFile: {} },
      { name: "Müzekkere Modülü", pdfFile: {} },
      { name: "Talimat Modülü", pdfFile: {} },
      { name: "Karar Modülü", pdfFile: {} },
      { name: "Genel İşlemler", pdfFile: {} }
    ],
    status: "active",
    category: "Genel",
    thumbnail: null,
    createdAt: "2025-08-06T00:04:09.733Z",
    updatedAt: "2025-08-06T00:10:09.298Z"
  },
  {
    id: "d9386f86-4055-4244-a420-a0d634094e95",
    title: "Aile Danışmanlığı",
    description: "Aile Danışmanlığı Dersleri",
    instructorId: "admin",
    price: "5000.00",
    duration: 17,
    sections: Array.from({ length: 17 }, (_, i) => ({ 
      name: `Ders ${i + 1}`, 
      pdfFile: {} 
    })),
    status: "active",
    category: "Genel",
    thumbnail: null,
    createdAt: "2025-08-06T00:14:19.399Z",
    updatedAt: "2025-08-06T00:14:19.399Z"
  },
  {
    id: "0daabd79-7013-42a6-b2e9-cc4e55f33322",
    title: "Arıcılık",
    description: "Arıcılık Dersleri",
    instructorId: "admin",
    price: "5000.00",
    duration: 2,
    sections: [
      { name: "Modül 1", pdfFile: {} },
      { name: "Modül 2", pdfFile: {} }
    ],
    status: "active",
    category: "Genel",
    thumbnail: null,
    createdAt: "2025-08-06T00:15:45.602Z",
    updatedAt: "2025-08-06T00:15:45.602Z"
  },
  {
    id: "6def0eec-ff20-4989-8c79-9dc6ba1db925",
    title: "Arıza Analiz Yöntemleri",
    description: "Arıza Analiz Yöntemleri Dersleri",
    instructorId: "admin",
    price: "5000.00",
    duration: 1,
    sections: [
      { name: "Modül 1", pdfFile: {} }
    ],
    status: "active",
    category: "Genel",
    thumbnail: null,
    createdAt: "2025-08-06T00:16:41.481Z",
    updatedAt: "2025-08-06T00:16:41.481Z"
  },
  {
    id: "a17172d0-9c2f-4c75-a803-df439448190b",
    title: "Aşçılık",
    description: "Aşçılık Eğitimi ve Ek Dosyalar",
    instructorId: "admin",
    price: "5000.00",
    duration: 3,
    sections: [
      { name: "Gastronomi 1", pdfFile: {} },
      { name: "Gastronomi 2", pdfFile: {} },
      { name: "Osmanlı Mutfağı", pdfFile: {} }
    ],
    status: "active",
    category: "Genel",
    thumbnail: null,
    createdAt: "2025-08-06T00:18:38.791Z",
    updatedAt: "2025-08-06T00:18:38.791Z"
  }
];

export const mockStudents = [
  {
    id: "584ab19f-e85d-465e-b290-265b3d9acd60",
    email: "test@test.com",
    firstName: "Test",
    lastName: "Student",
    role: "student",
    adi: "Rauf Onur",
    soyadi: "Çullu",
    createdAt: "2025-08-06T00:00:00.000Z"
  }
];

export const mockConsultants = [
  {
    id: "consultant-1",
    tcNo: "12345678901",
    firstName: "Ayşe",
    lastName: "Demir",
    title: "Uzman Danışman",
    email: "ayse.demir@algiacademy.com",
    phone: "0532 123 45 67",
    createdAt: "2025-08-06T00:00:00.000Z"
  },
  {
    id: "consultant-2", 
    tcNo: "98765432109",
    firstName: "Mehmet",
    lastName: "Kaya",
    title: "Satış Danışmanı",
    email: "mehmet.kaya@algiacademy.com",
    phone: "0533 987 65 43",
    createdAt: "2025-08-06T00:00:00.000Z"
  }
];

export const mockSales = [
  {
    id: "sale-1",
    consultantId: "consultant-1",
    studentId: "584ab19f-e85d-465e-b290-265b3d9acd60",
    courseIds: ["0b6fa053-1f58-4204-9c22-700a42913c03"],
    totalAmount: "5000.00",
    commissionRate: "10.00",
    commissionAmount: "500.00",
    status: "completed",
    paymentMethod: "credit_card",
    paymentDate: "2025-08-06",
    createdAt: "2025-08-06T00:00:00.000Z"
  }
];

export const mockActivities = [
  {
    id: "activity-1",
    userId: "584ab19f-e85d-465e-b290-265b3d9acd60",
    type: "enrollment",
    description: "Adli Sekreterlik kursuna kayıt oldu",
    createdAt: "2025-08-06T00:00:00.000Z"
  }
];

// LocalStorage based data management for fallback
export const localDataManager = {
  getCourses: () => {
    const stored = localStorage.getItem('courses_data');
    return stored ? JSON.parse(stored) : mockCourses;
  },
  
  setCourses: (courses: any[]) => {
    localStorage.setItem('courses_data', JSON.stringify(courses));
  },
  
  addCourse: (course: any) => {
    const courses = localDataManager.getCourses();
    const newCourse = {
      ...course,
      id: 'course-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      category: course.category || 'Genel',
      instructorId: 'admin'
    };
    courses.push(newCourse);
    localDataManager.setCourses(courses);
    return newCourse;
  },
  
  getStudents: () => {
    const stored = localStorage.getItem('students_data');
    return stored ? JSON.parse(stored) : mockStudents;
  },
  
  getConsultants: () => {
    const stored = localStorage.getItem('consultants_data');
    return stored ? JSON.parse(stored) : mockConsultants;
  },
  
  getSales: () => {
    const stored = localStorage.getItem('sales_data');
    return stored ? JSON.parse(stored) : mockSales;
  },
  
  getActivities: () => {
    const stored = localStorage.getItem('activities_data');
    return stored ? JSON.parse(stored) : mockActivities;
  }
};