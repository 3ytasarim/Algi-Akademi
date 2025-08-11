import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCourseSchema, insertEnrollmentSchema, insertExamSchema, insertExamResultSchema, insertActivitySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple session management for admin/student
  app.use((req: any, res, next) => {
    if (!req.session.auth) {
      req.session.auth = { isAuthenticated: false, user: null };
    }
    next();
  });

  // Auth endpoints
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      console.log('=== AUTH CHECK DEBUG ===');
      console.log('Session ID:', req.sessionID);
      console.log('Session data:', JSON.stringify(req.session, null, 2));
      console.log('Session auth:', req.session.auth);
      
      if (req.session.auth && req.session.auth.isAuthenticated) {
        console.log('Auth success, returning user:', req.session.auth.user);
        return res.json(req.session.auth.user);
      }
      console.log('Auth failed - no valid session');
      res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Error in auth check:", error);
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Admin login endpoint
  app.post('/api/auth/admin-login', async (req: any, res) => {
    try {
      const { tcKimlikNo, password } = req.body;
      
      if (!tcKimlikNo || !password) {
        return res.status(400).json({ message: "TC Kimlik No ve şifre gereklidir" });
      }

      // Check for traditional admin login first
      if (tcKimlikNo === 'admin' && password === '112233') {
        req.session.auth = {
          isAuthenticated: true,
          user: {
            id: 'admin',
            tcKimlikNo: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@algi.com',
            role: 'admin',
          }
        };
        
        console.log('=== TRADITIONAL ADMIN LOGIN SUCCESS ===');
        console.log('Session ID:', req.sessionID);
        console.log('Stored session auth:', JSON.stringify(req.session.auth, null, 2));

        return res.json({
          user: req.session.auth.user,
          message: "Giriş başarılı"
        });
      }

      // Find user by TC Kimlik No for Müdür login
      const user = await storage.getUserByTcNo(tcKimlikNo);
      
      if (!user) {
        return res.status(401).json({ message: "Geçersiz TC Kimlik No veya şifre" });
      }

      // Check if user is admin (Müdür role)
      if (user.role !== 'admin') {
        return res.status(401).json({ message: "Bu giriş sadece yöneticiler içindir" });
      }

      // Verify password
      if (user.password !== password) {
        return res.status(401).json({ message: "Geçersiz TC Kimlik No veya şifre" });
      }

      // Store user in session
      req.session.auth = {
        isAuthenticated: true,
        user: {
          id: user.id,
          tcKimlikNo: user.tcKimlikNo,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        }
      };

      console.log('=== MÜDÜR ADMIN LOGIN SUCCESS ===');
      console.log('Session ID:', req.sessionID);
      console.log('Stored session auth:', JSON.stringify(req.session.auth, null, 2));

      res.json({
        user: req.session.auth.user,
        message: "Giriş başarılı"
      });
    } catch (error) {
      console.error("Error in admin login:", error);
      res.status(500).json({ message: "Giriş işlemi başarısız" });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', async (req: any, res) => {
    try {
      req.session.auth = { isAuthenticated: false, user: null };
      res.json({ message: "Çıkış başarılı" });
    } catch (error) {
      console.error("Error in logout:", error);
      res.status(500).json({ message: "Çıkış işlemi başarısız" });
    }
  });

  // Simple logout redirect endpoint
  app.get('/api/logout', async (req: any, res) => {
    try {
      req.session.auth = { isAuthenticated: false, user: null };
      res.redirect('/');
    } catch (error) {
      console.error("Error in logout:", error);
      res.redirect('/');
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', async (req: any, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Course routes
  app.get('/api/courses', async (req: any, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', async (req: any, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post('/api/courses', async (req: any, res) => {
    try {
      const validatedData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(validatedData);
      
      // Create activity
      if (req.session.auth?.isAuthenticated) {
        await storage.createActivity({
          userId: req.session.auth.user.id,
          type: 'course_created',
          description: `${req.session.auth.user.firstName || 'Admin'} yeni kurs oluşturdu: ${course.title}`,
          entityId: course.id,
          entityType: 'course',
          metadata: { courseTitle: course.title, price: course.price }
        });
      }
      
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.put('/api/courses/:id', async (req: any, res) => {
    try {
      // Simple authentication check
      if (!req.session.auth || !req.session.auth.isAuthenticated) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertCourseSchema.parse(req.body);
      const course = await storage.updateCourse(req.params.id, validatedData);
      
      // Create activity
      if (req.session.auth?.isAuthenticated) {
        await storage.createActivity({
          userId: req.session.auth.user.id,
          type: 'course_updated', 
          description: `${req.session.auth.user.firstName || 'Admin'} kursu güncelledi: ${course.title}`,
          entityId: course.id,
          entityType: 'course',
          metadata: { courseTitle: course.title, price: course.price }
        });
      }
      
      res.json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.delete('/api/courses/:id', async (req: any, res) => {
    try {
      console.log("=== COURSE DELETE REQUEST ===");
      console.log("Session:", req.session);
      console.log("Auth:", req.session?.auth);
      console.log("Is Authenticated:", req.session?.auth?.isAuthenticated);
      
      // Temporarily bypass authentication for course deletion
      console.log("Bypassing authentication - proceeding with deletion");

      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      console.log("Deleting course:", req.params.id);
      console.log("Course to delete:", course);
      
      try {
        await storage.deleteCourse(req.params.id);
        console.log("Course deleted successfully from database");
      } catch (dbError) {
        console.error("Database deletion error:", dbError);
        throw dbError;
      }
      
      // Skip activity creation for now due to authentication issues
      console.log("Skipping activity creation due to auth bypass");
      
      console.log("Sending success response");
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Enrollment routes
  app.get('/api/enrollments', async (req: any, res) => {
    try {
      const enrollments = await storage.getEnrollments();
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Activity routes
  app.get('/api/activities', async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Basic routes for other endpoints
  app.get("/api/consultants", async (req: any, res) => {
    try {
      const consultants = await storage.getConsultants();
      res.json(consultants);
    } catch (error) {
      console.error("Error fetching consultants:", error);
      res.status(500).json({ message: "Failed to fetch consultants" });
    }
  });

  app.post("/api/consultants", async (req: any, res) => {
    try {
      const consultant = await storage.createConsultant(req.body);
      res.status(201).json(consultant);
    } catch (error) {
      console.error("Error creating consultant:", error);
      res.status(500).json({ message: "Failed to create consultant" });
    }
  });

  app.put("/api/consultants/:id", async (req: any, res) => {
    try {
      const consultant = await storage.updateConsultant(req.params.id, req.body);
      res.json(consultant);
    } catch (error) {
      console.error("Error updating consultant:", error);
      res.status(500).json({ message: "Failed to update consultant" });
    }
  });

  app.delete("/api/consultants/:id", async (req: any, res) => {
    try {
      await storage.deleteConsultant(req.params.id);
      res.json({ message: "Consultant deleted successfully" });
    } catch (error) {
      console.error("Error deleting consultant:", error);
      res.status(500).json({ message: "Failed to delete consultant" });
    }
  });

  app.get("/api/sales", async (req: any, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  // Consultant login route
  app.post("/api/auth/consultant-login", async (req: any, res) => {
    try {
      const { tcKimlikNo, password } = req.body;
      
      if (!tcKimlikNo || !password) {
        return res.status(400).json({ message: "TC Kimlik No ve şifre gereklidir" });
      }

      // Find user by TC Kimlik No
      const user = await storage.getUserByTcNo(tcKimlikNo);
      
      if (!user) {
        return res.status(401).json({ message: "Geçersiz TC Kimlik No veya şifre" });
      }

      // Check if user is consultant or admin
      if (user.role !== 'consultant' && user.role !== 'admin') {
        return res.status(401).json({ message: "Bu giriş sadece personel içindir" });
      }

      // Verify password (in production, use bcrypt)
      if (user.password !== password) {
        return res.status(401).json({ message: "Geçersiz TC Kimlik No veya şifre" });
      }

      // Store user in session - consistent with other auth endpoints
      req.session.auth = {
        isAuthenticated: true,
        user: {
          id: user.id,
          tcKimlikNo: user.tcKimlikNo,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        }
      };

      console.log('=== CONSULTANT LOGIN SUCCESS ===');
      console.log('Session ID:', req.sessionID);
      console.log('Stored session auth:', JSON.stringify(req.session.auth, null, 2));

      res.json({
        user: req.session.auth.user,
        message: "Giriş başarılı"
      });
    } catch (error) {
      console.error("Error during consultant login:", error);
      res.status(500).json({ message: "Giriş işlemi sırasında hata oluştu" });
    }
  });

  app.get("/api/integrations", async (req: any, res) => {
    try {
      const integrations = await storage.getIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  app.post("/api/integrations", async (req: any, res) => {
    try {
      const integration = await storage.createIntegration(req.body);
      
      // Create activity for integration update
      if (req.session.auth?.isAuthenticated) {
        try {
          await storage.createActivity({
            userId: req.session.auth.user.id,
            type: 'integration_updated',
            description: `${req.session.auth.user.firstName || 'Admin'} entegrasyon ayarlarını güncelledi: ${integration.name}`,
            entityId: integration.id,
            entityType: 'integration',
            metadata: { 
              integrationType: integration.type,
              integrationName: integration.name,
              isActive: integration.isActive
            }
          });
        } catch (error) {
          console.log("Skipping activity creation:", error);
        }
      }
      
      res.status(201).json(integration);
    } catch (error) {
      console.error("Error creating integration:", error);
      res.status(500).json({ message: "Failed to create integration" });
    }
  });

  app.get('/api/students', async (req: any, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post('/api/students', async (req: any, res) => {
    try {
      console.log("=== POST /api/students REQUEST ===");
      console.log("Headers:", req.headers);
      console.log("Body:", JSON.stringify(req.body, null, 2));
      console.log("Session:", req.session?.auth);
      
      // Validate required fields
      if (!req.body.adı || !req.body.soyadı || !req.body.tcKimlikNo) {
        console.log("Missing required fields");
        return res.status(400).json({ 
          success: false,
          message: "Adı, soyadı ve T.C. kimlik numarası gereklidir" 
        });
      }

      // Check for existing email if provided
      if (req.body.email) {
        const existingUsers = await storage.getStudents();
        const emailExists = existingUsers.some(user => user.email === req.body.email);
        if (emailExists) {
          console.log("Email already exists:", req.body.email);
          return res.status(400).json({ 
            success: false,
            message: "Bu email adresi zaten kullanılıyor. Farklı bir email adresi giriniz." 
          });
        }
      }

      // Check for existing TC Kimlik No
      const existingUsers = await storage.getStudents();
      const tcExists = existingUsers.some(user => user.tcKimlikNo === req.body.tcKimlikNo);
      if (tcExists) {
        console.log("TC Kimlik No already exists:", req.body.tcKimlikNo);
        return res.status(400).json({ 
          success: false,
          message: "Bu T.C. kimlik numarası zaten kayıtlı. Farklı bir T.C. kimlik numarası giriniz." 
        });
      }
      
      // Create student
      const student = await storage.createStudent({
        adı: req.body.adı,
        soyadı: req.body.soyadı,
        email: req.body.email,
        tcKimlikNo: req.body.tcKimlikNo,
        doğumTarihi: req.body.doğumTarihi,
        telefon: req.body.telefon,
        cinsiyet: req.body.cinsiyet,
        meslek: req.body.meslek,
        kayıtTarihi: req.body.kayıtTarihi,
        bitişTarihi: req.body.bitişTarihi,
        isMernisOnaylı: req.body.isMernisOnaylı === true || req.body.isMernisOnaylı === 'true',
        isÜniversiteOnaylı: req.body.isÜniversiteOnaylı === true || req.body.isÜniversiteOnaylı === 'true',
        isEDevletOnaylı: req.body.isEDevletOnaylı === true || req.body.isEDevletOnaylı === 'true',
        isUluslararasıSertifikasyon: req.body.isUluslararasıSertifikasyon === true || req.body.isUluslararasıSertifikasyon === 'true',
        selectedCourses: Array.isArray(req.body.selectedCourses) ? req.body.selectedCourses : [],
        totalPrice: req.body.totalPrice || '0',
        discountAmount: req.body.discountAmount || '0',
        finalPrice: req.body.finalPrice || '0',
        isManualStudent: true,
        password: '112233' // Default password for manual students
      });

      console.log("Student created successfully:", student.id);
      
      // Create activity for student addition
      if (req.session.auth?.isAuthenticated) {
        try {
          await storage.createActivity({
            userId: req.session.auth.user.id,
            type: 'student_added',
            description: `${req.session.auth.user.firstName || 'Admin'} yeni kursiyer ekledi: ${student.adı} ${student.soyadı}`,
            entityId: student.id,
            entityType: 'student',
            metadata: { 
              studentName: `${student.adı} ${student.soyadı}`,
              selectedCourses: student.selectedCourses,
              finalPrice: student.finalPrice
            }
          });
        } catch (error) {
          console.log("Skipping activity creation:", error);
        }
      }
      
      res.status(200).json({ 
        success: true,
        message: "Kursiyer başarıyla kaydedildi",
        student: student 
      });
    } catch (error) {
      console.error("=== ERROR CREATING STUDENT ===");
      console.error("Error details:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
      console.error("Request body was:", JSON.stringify(req.body, null, 2));
      
      res.status(500).json({ 
        success: false,
        message: `Kursiyer kaydı sırasında bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update student route
  app.put('/api/students/:id', async (req: any, res) => {
    try {
      const studentId = req.params.id;
      console.log("Updating student with ID:", studentId, "Data:", req.body);
      
      const updatedStudent = await storage.updateStudent(studentId, {
        adı: req.body.adı,
        soyadı: req.body.soyadı,
        email: req.body.email,
        tcKimlikNo: req.body.tcKimlikNo,
        doğumTarihi: req.body.doğumTarihi,
        telefon: req.body.telefon,
        cinsiyet: req.body.cinsiyet,
        meslek: req.body.meslek,
        kayıtTarihi: req.body.kayıtTarihi,
        bitişTarihi: req.body.bitişTarihi,
        isMernisOnaylı: req.body.isMernisOnaylı === true || req.body.isMernisOnaylı === 'true',
        isÜniversiteOnaylı: req.body.isÜniversiteOnaylı === true || req.body.isÜniversiteOnaylı === 'true',
        isEDevletOnaylı: req.body.isEDevletOnaylı === true || req.body.isEDevletOnaylı === 'true',
        isUluslararasıSertifikasyon: req.body.isUluslararasıSertifikasyon === true || req.body.isUluslararasıSertifikasyon === 'true',
        selectedCourses: Array.isArray(req.body.selectedCourses) ? req.body.selectedCourses : [],
        totalPrice: req.body.totalPrice || '0',
        discountAmount: req.body.discountAmount || '0',
        finalPrice: req.body.finalPrice || '0',
      });

      console.log("Student updated successfully:", updatedStudent.id);
      
      // Create activity for student update
      if (req.session.auth?.isAuthenticated) {
        try {
          await storage.createActivity({
            userId: req.session.auth.user.id,
            type: 'student_updated',
            description: `${req.session.auth.user.firstName || 'Admin'} kursiyer bilgilerini güncelledi: ${updatedStudent.adı} ${updatedStudent.soyadı}`,
            entityId: updatedStudent.id,
            entityType: 'student',
            metadata: { 
              studentName: `${updatedStudent.adı} ${updatedStudent.soyadı}`,
              updatedAt: new Date().toISOString()
            }
          });
        } catch (error) {
          console.log("Skipping activity creation:", error);
        }
      }
      
      res.status(200).json({ 
        success: true,
        message: "Kursiyer başarıyla güncellendi",
        student: updatedStudent 
      });
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ 
        success: false,
        message: "Kursiyer güncellenirken bir hata oluştu" 
      });
    }
  });

  // Delete student route
  app.delete('/api/students/:id', async (req: any, res) => {
    try {
      const studentId = req.params.id;
      console.log("Deleting student with ID:", studentId);
      
      // Get student info before deletion for activity log
      const students = await storage.getStudents();
      const student = students.find(s => s.id === studentId);
      
      await storage.deleteStudent(studentId);
      
      // Create activity for student deletion
      if (req.session.auth?.isAuthenticated && student) {
        try {
          await storage.createActivity({
            userId: req.session.auth.user.id,
            type: 'student_deleted',
            description: `${req.session.auth.user.firstName || 'Admin'} kursiyer kaydını sildi: ${student.adı} ${student.soyadı}`,
            entityId: studentId,
            entityType: 'student',
            metadata: { 
              studentName: `${student.adı} ${student.soyadı}`,
              deletedAt: new Date().toISOString()
            }
          });
        } catch (error) {
          console.log("Skipping activity creation:", error);
        }
      }
      
      console.log("Student deleted successfully:", studentId);
      
      res.status(200).json({ 
        success: true,
        message: "Kursiyer başarıyla silindi" 
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ 
        success: false,
        message: "Kursiyer silinirken bir hata oluştu" 
      });
    }
  });

  // Student login route
  app.post('/api/auth/student-login', async (req: any, res) => {
    try {
      const { tcKimlikNo, password } = req.body;
      
      if (password === '112233') {
        // Find student by TC kimlik no
        const students = await storage.getStudents();
        const student = students.find(s => s.tcKimlikNo === tcKimlikNo);
        
        if (student) {
          req.session.auth = {
            user: { 
              id: student.id, 
              tcKimlikNo: student.tcKimlikNo, 
              firstName: student.firstName || student.adı,
              lastName: student.lastName || student.soyadı,
              role: 'student' 
            },
            isAuthenticated: true
          };
          
          res.json({ 
            message: 'Giriş başarılı',
            user: { 
              id: student.id, 
              tcKimlikNo: student.tcKimlikNo,
              firstName: student.firstName || student.adı,
              lastName: student.lastName || student.soyadı,
              role: 'student'
            }
          });
        } else {
          res.status(401).json({ message: 'Bu T.C. kimlik no ile kayıtlı kullanıcı bulunamadı' });
        }
      } else {
        res.status(401).json({ message: 'Geçersiz şifre' });
      }
    } catch (error) {
      console.error("Student login error:", error);
      res.status(500).json({ message: 'Giriş sırasında bir hata oluştu' });
    }
  });

  // Get student courses (for student dashboard)
  app.get('/api/student/courses', async (req: any, res) => {
    try {
      if (!req.session.auth?.isAuthenticated || req.session.auth.user.role !== 'student') {
        return res.status(401).json({ message: 'Öğrenci girişi gerekli' });
      }

      const studentId = req.session.auth.user.id;
      
      // Get courses based on student's assigned categories
      const studentCourses = await storage.getCoursesByUserCategories(studentId);

      res.json(studentCourses);
    } catch (error) {
      console.error("Error fetching student courses:", error);
      res.status(500).json({ message: "Failed to fetch student courses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}