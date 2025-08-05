import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCourseSchema, insertEnrollmentSchema, insertExamSchema, insertExamResultSchema, insertActivitySchema, type UpsertUser } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple session management for admin/student
  app.use((req: any, res, next) => {
    if (!req.session.auth) {
      req.session.auth = { isAuthenticated: false, user: null };
    }
    next();
  });

  // Unified auth endpoint for admin/student
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

  // Student login endpoint
  app.post('/api/auth/student-login', async (req: any, res) => {
    try {
      const { tcKimlikNo, password } = req.body;
      
      if (!tcKimlikNo || !password) {
        return res.status(400).json({ message: "T.C. Kimlik No ve şifre gerekli" });
      }

      // Check if student exists and password matches
      const student = await storage.getStudentByTcNo(tcKimlikNo);
      
      if (!student || !student.isManualStudent) {
        return res.status(401).json({ message: "Geçersiz T.C. Kimlik No" });
      }

      if (student.password !== password) {
        return res.status(401).json({ message: "Geçersiz şifre" });
      }

      req.session.auth = {
        isAuthenticated: true,
        user: {
          id: student.id,
          tcKimlikNo: student.tcKimlikNo,
          firstName: student.firstName || student.adı,
          lastName: student.lastName || student.soyadı,
          email: student.email,
          role: 'student'
        }
      };

      res.json({ 
        message: "Giriş başarılı",
        user: req.session.auth.user
      });
    } catch (error) {
      console.error("Error in student login:", error);
      res.status(500).json({ message: "Giriş işlemi başarısız" });
    }
  });

  // Manual student auth check
  app.get('/api/auth/manual-student', async (req: any, res) => {
    try {
      if (req.session.manualStudent) {
        res.json(req.session.manualStudent);
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } catch (error) {
      res.status(500).json({ message: "Auth check failed" });
    }
  });

  // Manual student logout
  app.post('/api/auth/manual-logout', async (req: any, res) => {
    try {
      req.session.manualStudent = null;
      res.json({ message: "Çıkış başarılı" });
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Update user role - only for Replit authenticated users
  app.post('/api/auth/set-role', async (req: any, res) => {
    try {
      // Skip role setting for manual students
      if (req.session.manualStudent) {
        return res.json(req.session.manualStudent);
      }

      // Handle Replit users
      if (!req. || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      if (!role || !['student', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      // Update user role in database
      const updatedUser = await storage.upsertUser({
        id: userId,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url,
        role: role,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Dashboard stats - check unified auth
  app.get('/api/dashboard/stats', async (req: any, res) => {
    try {
      // Check authentication (manual student or Replit)
      const  = req.session.manualStudent || (req. && req.user?.claims?.sub);
      
      if (!) {
        return res.status(401).json({ message: "Unauthorized" });
      }

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
      if (req.session.auth?.) {
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
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Create activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        type: 'course_updated',
        description: `Kurs güncellendi: ${course.title}`,
      });
      
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
      if (!req.session.auth || !req.session.auth.) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      await storage.deleteCourse(req.params.id);
      
      // Create activity
      await storage.createActivity({
        userId: req.session.auth.user.id,
        type: 'course_deleted',
        description: `Kurs silindi: ${course.title}`,
      });
      
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

  app.post('/api/enrollments', async (req: any, res) => {
    try {
      const validatedData = insertEnrollmentSchema.parse(req.body);
      const enrollment = await storage.createEnrollment(validatedData);
      
      // Create activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        type: 'enrollment',
        description: `Yeni kursiyer kaydı yapıldı`,
      });
      
      res.status(201).json(enrollment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating enrollment:", error);
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  // Exam routes
  app.get('/api/exams', async (req: any, res) => {
    try {
      const exams = await storage.getExams();
      res.json(exams);
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  app.post('/api/exams', async (req: any, res) => {
    try {
      const validatedData = insertExamSchema.parse(req.body);
      const exam = await storage.createExam(validatedData);
      
      // Create activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        type: 'exam_created',
        description: `Sınav oluşturuldu: ${exam.title}`,
      });
      
      res.status(201).json(exam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating exam:", error);
      res.status(500).json({ message: "Failed to create exam" });
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

  // Consultant routes
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
      res.json(consultant);
    } catch (error) {
      console.error("Error creating consultant:", error);
      res.status(500).json({ message: "Failed to create consultant" });
    }
  });

  // Sales routes
  app.get("/api/sales",  async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales",  async (req, res) => {
    try {
      const sale = await storage.createSale(req.body);
      res.json(sale);
    } catch (error) {
      console.error("Error creating sale:", error);
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  // Integration routes
  app.get("/api/integrations",  async (req, res) => {
    try {
      const integrations = await storage.getIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  app.post("/api/integrations",  async (req, res) => {
    try {
      const integration = await storage.createIntegration(req.body);
      res.json(integration);
    } catch (error) {
      console.error("Error creating integration:", error);
      res.status(500).json({ message: "Failed to create integration" });
    }
  });

  // Student routes
  app.get('/api/students',  async (req, res) => {
    try {
      const students = await storage.getUsersByRole('student');
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post('/api/students',  async (req: any, res) => {
    try {
      console.log('Creating student with data:', req.body);
      
      const student = await storage.createStudent(req.body);
      
      // Create activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        type: 'student_created',
        description: `Yeni öğrenci eklendi: ${student.firstName} ${student.lastName}`,
      });
      
      res.status(201).json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ 
        message: "Failed to create student",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Exam results route
  app.get("/api/exam-results",  async (req, res) => {
    try {
      const examResults = await storage.getExamResults();
      res.json(examResults);
    } catch (error) {
      console.error("Error fetching exam results:", error);
      res.status(500).json({ message: "Failed to fetch exam results" });
    }
  });

  // User courses by category
  app.get("/api/user-courses",  async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courses = await storage.getCoursesByUserCategories(userId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching user courses:", error);
      res.status(500).json({ message: "Failed to fetch user courses" });
    }
  });



  // Notification routes
  app.get('/api/notifications',  async (req, res) => {
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications',  async (req, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.get('/api/notification-templates',  async (req, res) => {
    try {
      const templates = await storage.getNotificationTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.post('/api/notification-templates',  async (req, res) => {
    try {
      const template = await storage.createNotificationTemplate(req.body);
      res.json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.get('/api/notification-settings',  async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const settings = await storage.getNotificationSettings(userId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put('/api/notification-settings',  async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const settings = await storage.updateNotificationSettings(userId, req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
