import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCourseSchema, insertEnrollmentSchema, insertExamSchema, insertExamResultSchema, insertActivitySchema, type UpsertUser } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Manual student login endpoint
  app.post('/api/auth/student-login', async (req, res) => {
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

      // Create session for manual student
      req.session.manualStudent = {
        id: student.id,
        tcKimlikNo: student.tcKimlikNo,
        firstName: student.firstName || student.adı,
        lastName: student.lastName || student.soyadı,
        email: student.email,
        role: 'student',
        isManualStudent: true
      };

      res.json({ 
        message: "Giriş başarılı",
        user: req.session.manualStudent
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

  // Update user role
  app.post('/api/auth/set-role', isAuthenticated, async (req: any, res) => {
    try {
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

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Course routes
  app.get('/api/courses', isAuthenticated, async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', isAuthenticated, async (req, res) => {
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

  app.post('/api/courses', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(validatedData);
      
      // Create activity
      await storage.createActivity({
        userId: req.user.claims.sub,
        type: 'course_created',
        description: `Yeni kurs oluşturuldu: ${course.title}`,
      });
      
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // Enrollment routes
  app.get('/api/enrollments', isAuthenticated, async (req, res) => {
    try {
      const enrollments = await storage.getEnrollments();
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.post('/api/enrollments', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/exams', isAuthenticated, async (req, res) => {
    try {
      const exams = await storage.getExams();
      res.json(exams);
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  app.post('/api/exams', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/activities', isAuthenticated, async (req, res) => {
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
  app.get("/api/consultants", isAuthenticated, async (req, res) => {
    try {
      const consultants = await storage.getConsultants();
      res.json(consultants);
    } catch (error) {
      console.error("Error fetching consultants:", error);
      res.status(500).json({ message: "Failed to fetch consultants" });
    }
  });

  app.post("/api/consultants", isAuthenticated, async (req, res) => {
    try {
      const consultant = await storage.createConsultant(req.body);
      res.json(consultant);
    } catch (error) {
      console.error("Error creating consultant:", error);
      res.status(500).json({ message: "Failed to create consultant" });
    }
  });

  // Sales routes
  app.get("/api/sales", isAuthenticated, async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales", isAuthenticated, async (req, res) => {
    try {
      const sale = await storage.createSale(req.body);
      res.json(sale);
    } catch (error) {
      console.error("Error creating sale:", error);
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  // Integration routes
  app.get("/api/integrations", isAuthenticated, async (req, res) => {
    try {
      const integrations = await storage.getIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  app.post("/api/integrations", isAuthenticated, async (req, res) => {
    try {
      const integration = await storage.createIntegration(req.body);
      res.json(integration);
    } catch (error) {
      console.error("Error creating integration:", error);
      res.status(500).json({ message: "Failed to create integration" });
    }
  });

  // Student routes
  app.get('/api/students', isAuthenticated, async (req, res) => {
    try {
      const students = await storage.getUsersByRole('student');
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post('/api/students', isAuthenticated, async (req: any, res) => {
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
  app.get("/api/exam-results", isAuthenticated, async (req, res) => {
    try {
      const examResults = await storage.getExamResults();
      res.json(examResults);
    } catch (error) {
      console.error("Error fetching exam results:", error);
      res.status(500).json({ message: "Failed to fetch exam results" });
    }
  });

  // User courses by category
  app.get("/api/user-courses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courses = await storage.getCoursesByUserCategories(userId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching user courses:", error);
      res.status(500).json({ message: "Failed to fetch user courses" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
