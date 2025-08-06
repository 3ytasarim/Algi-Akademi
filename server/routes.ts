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
      if (req.session.auth && req.session.auth.isAuthenticated) {
        return res.json(req.session.auth.user);
      }
      res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Error in auth check:", error);
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Admin login endpoint
  app.post('/api/auth/admin-login', async (req: any, res) => {
    try {
      const { username, password } = req.body;
      
      if (username === 'admin' && password === '112233') {
        req.session.auth = {
          isAuthenticated: true,
          user: {
            id: 'admin',
            username: 'admin',
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User'
          }
        };
        
        res.json({ 
          message: "Giriş başarılı",
          user: req.session.auth.user
        });
      } else {
        res.status(401).json({ message: "Geçersiz kullanıcı adı veya şifre" });
      }
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
          description: `Yeni kurs oluşturuldu: ${course.title}`,
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
      const validatedData = insertCourseSchema.parse(req.body);
      const course = await storage.updateCourse(req.params.id, validatedData);
      
      // Create activity
      if (req.session.auth?.isAuthenticated) {
        await storage.createActivity({
          userId: req.session.auth.user.id,
          type: 'course_updated',
          description: `Kurs güncellendi: ${course.title}`,
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
      // Simple authentication check
      if (!req.session.auth || !req.session.auth.isAuthenticated) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      await storage.deleteCourse(req.params.id);
      
      // Create activity (skip if user doesn't exist in users table)
      try {
        await storage.createActivity({
          userId: req.session.auth.user.id,
          type: 'course_deleted',
          description: `Kurs silindi: ${course.title}`,
        });
      } catch (error) {
        console.log("Skipping activity creation for non-existent user:", req.session.auth.user.id);
      }
      
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

  app.get("/api/integrations", async (req: any, res) => {
    try {
      const integrations = await storage.getIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
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
      console.log("Creating student with data:", req.body);
      
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
      
      res.status(200).json({ 
        success: true,
        message: "Kursiyer başarıyla kaydedildi",
        student: student 
      });
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ 
        success: false,
        message: "Kursiyer kaydı sırasında bir hata oluştu" 
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
      
      await storage.deleteStudent(studentId);
      
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
      const students = await storage.getStudents();
      const student = students.find(s => s.id === studentId);
      
      if (!student) {
        return res.status(404).json({ message: 'Öğrenci bulunamadı' });
      }

      // Get all courses and filter by selected courses
      const allCourses = await storage.getCourses();
      const studentCourses = allCourses.filter(course => 
        student.selectedCourses && student.selectedCourses.includes(course.id)
      );

      res.json(studentCourses);
    } catch (error) {
      console.error("Error fetching student courses:", error);
      res.status(500).json({ message: "Failed to fetch student courses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}