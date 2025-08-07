// API fallback for when backend is not available
// Production-safe API requests with automatic fallback

// Production API handler with fallback
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const baseUrl = import.meta.env.PROD ? '' : 'http://localhost:5000';
  const fullUrl = `${baseUrl}${url}`;
  
  try {
    console.log(`Making API request to: ${fullUrl}`);
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    
    // Fallback to localStorage for production
    if (url === '/api/students' && options.method === 'POST') {
      return handleStudentCreateFallback(JSON.parse(options.body as string));
    }
    
    throw error;
  }
};

// Fallback student creation for production
const handleStudentCreateFallback = (studentData: any) => {
  try {
    const existingStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const newStudent = {
      id: generateUUID(),
      ...studentData,
      role: 'student',
      isManualStudent: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      password: '112233',
      totalPrice: calculateTotalPrice(studentData.selectedCourses || []),
      finalPrice: calculateFinalPrice(studentData.selectedCourses || [], studentData.discountAmount || '0'),
    };
    
    existingStudents.push(newStudent);
    localStorage.setItem('students', JSON.stringify(existingStudents));
    
    console.log('Student created with fallback system:', newStudent.id);
    return {
      success: true,
      message: 'Kursiyer başarıyla kaydedildi',
      student: newStudent
    };
  } catch (error) {
    console.error('Fallback student creation failed:', error);
    throw new Error('Student creation failed');
  }
};

// UUID generator for fallback
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Price calculation for fallback
const calculateTotalPrice = (selectedCourses: string[]) => {
  const coursePrice = 5000; // Default price
  return (selectedCourses.length * coursePrice).toString();
};

const calculateFinalPrice = (selectedCourses: string[], discountAmount: string) => {
  const total = parseFloat(calculateTotalPrice(selectedCourses));
  const discount = parseFloat(discountAmount || '0');
  return Math.max(0, total - discount).toString();
};

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
  
  updateCourse: (id: string, updatedData: any) => {
    const courses = localDataManager.getCourses();
    const courseIndex = courses.findIndex((course: any) => course.id === id);
    if (courseIndex !== -1) {
      courses[courseIndex] = {
        ...courses[courseIndex],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      localDataManager.setCourses(courses);
      return courses[courseIndex];
    }
    throw new Error('Course not found');
  },
  
  deleteCourse: (id: string) => {
    const courses = localDataManager.getCourses();
    const filteredCourses = courses.filter((course: any) => course.id !== id);
    if (filteredCourses.length === courses.length) {
      throw new Error('Course not found');
    }
    localDataManager.setCourses(filteredCourses);
    return { success: true, message: 'Course deleted successfully' };
  },
  
  getStudents: () => {
    const stored = localStorage.getItem('students_data');
    return stored ? JSON.parse(stored) : mockStudents;
  },

  setStudents: (students: any[]) => {
    localStorage.setItem('students_data', JSON.stringify(students));
  },

  addStudent: (student: any) => {
    const students = localDataManager.getStudents();
    const newStudent = {
      ...student,
      id: 'student-' + Date.now(),
      role: 'student',
      isManualStudent: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    students.push(newStudent);
    localDataManager.setStudents(students);
    return newStudent;
  },

  updateStudent: (id: string, updatedData: any) => {
    const students = localDataManager.getStudents();
    const studentIndex = students.findIndex((student: any) => student.id === id);
    if (studentIndex !== -1) {
      students[studentIndex] = {
        ...students[studentIndex],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      localDataManager.setStudents(students);
      return students[studentIndex];
    }
    throw new Error('Student not found');
  },

  deleteStudent: (id: string) => {
    const students = localDataManager.getStudents();
    const filteredStudents = students.filter((student: any) => student.id !== id);
    if (filteredStudents.length === students.length) {
      throw new Error('Student not found');
    }
    localDataManager.setStudents(filteredStudents);
    return { success: true, message: 'Student deleted successfully' };
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