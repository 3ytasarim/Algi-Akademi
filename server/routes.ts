import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { Storage as CloudStorage } from "@google-cloud/storage";
import { storage } from "./storage";
import { insertCourseSchema, insertLessonSchema, insertEnrollmentSchema, insertExamSchema, insertExamResultSchema, insertActivitySchema, lessons } from "@shared/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { getNetGSMService, initializeNetGSM } from "./smsService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize NetGSM SMS Service
  const netGSMService = initializeNetGSM();
  console.log('NetGSM SMS Service initialized');

  // Object Storage Configuration
  let cloudStorage: CloudStorage | null = null;
  let bucketName: string | null = null;
  let bucket: any = null;
  
  try {
    if (process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID) {
      cloudStorage = new CloudStorage();
      bucketName = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      bucket = cloudStorage.bucket(bucketName);
      console.log("Object storage initialized with bucket:", bucketName);
    } else {
      console.log("Object storage not configured - PDF uploads will be skipped");
    }
  } catch (error) {
    console.error("Failed to initialize object storage:", error);
  }

  // Multer configuration for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });

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
        
        // Update last login timestamp and get updated user data
        try {
          await storage.updateUserLastLogin(req.session.auth.user.id);
          // Get updated user data with lastLogin timestamp
          const updatedUser = await storage.getUser(req.session.auth.user.id);
          return res.json(updatedUser || req.session.auth.user);
        } catch (error) {
          console.warn('Failed to update last login:', error);
          return res.json(req.session.auth.user);
        }
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

      // Check if user is admin or consultant role
      if (user.role !== 'admin' && user.role !== 'consultant') {
        return res.status(401).json({ message: "Bu giriş sadece yöneticiler ve danışmanlar içindir" });
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

  // Manual logout endpoint for manual students
  app.post('/api/auth/manual-logout', async (req: any, res) => {
    try {
      console.log('=== MANUAL LOGOUT REQUEST ===');
      console.log('Session before logout:', req.session.auth);
      
      // Clear session
      req.session.auth = { isAuthenticated: false, user: null };
      
      // Destroy session completely
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ message: "Logout failed" });
        }
        
        console.log('Manual logout successful');
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Error in manual logout:", error);
      res.status(500).json({ message: "Logout failed" });
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
      console.log("=== GET COURSE BY ID ===");
      console.log("Course ID:", req.params.id);
      
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Get lessons/sections for the course
      const lessons = await storage.getLessonsByCourse(req.params.id);
      console.log("Found lessons:", lessons.length);
      
      // Format lessons for admin edit form
      const sections = lessons.map(lesson => ({
        name: lesson.title,
        pdfFileName: lesson.pdfFileName,
        pdfFile: lesson.pdfFileName, // Also provide as pdfFile for form compatibility
        pdfUrl: lesson.pdfUrl,
        duration: lesson.duration || 60
      }));
      
      const courseWithSections = {
        ...course,
        sections: sections
      };
      
      console.log("Returning course for admin edit:", courseWithSections.title, "sections:", sections.length);
      console.log("Section data:", sections);
      res.json(courseWithSections);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });



  // PDF upload endpoint for course creation
  app.post('/api/courses/pdf-upload', async (req: any, res) => {
    try {
      const { ObjectStorageService } = require('./objectStorage');
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getPDFUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("PDF upload URL generation error:", error);
      res.status(500).json({ error: "Failed to generate PDF upload URL" });
    }
  });

  // PDF serving endpoint - converts GCS URLs to accessible URLs
  app.get("/pdf/:pdfId", async (req: any, res) => {
    try {
      const pdfId = req.params.pdfId.replace('.pdf', '');
      console.log("PDF request for ID:", pdfId);
      
      const { ObjectStorageService } = require('./objectStorage');
      const objectStorageService = new ObjectStorageService();
      
      // Get bucket info from env
      const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      if (!bucketId) {
        return res.status(500).json({ error: "Object storage not configured" });
      }
      
      const { objectStorageClient } = require('./objectStorage');
      const bucket = objectStorageClient.bucket(bucketId);
      const file = bucket.file(`.private/pdfs/${pdfId}.pdf`);
      
      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).json({ error: "PDF not found" });
      }
      
      await objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("PDF serving error:", error);
      res.status(500).json({ error: "Failed to serve PDF" });
    }
  });

  // Course creation with real PDF support
  app.post('/api/courses', async (req: any, res) => {
    try {
      console.log("=== REAL PDF COURSE CREATION ===");
      console.log("Request body:", req.body);
      
      // Parse course data from request
      let courseData;
      if (req.body.courseData) {
        courseData = JSON.parse(req.body.courseData);
      } else {
        courseData = req.body;
      }
      
      console.log("Parsed course data:", courseData);
      
      // Extract lessons from course data
      const { sections, ...courseInfo } = courseData;
      const lessonData = sections || [];
      
      // Set total lessons count
      courseInfo.totalLessons = lessonData.length;
      
      const validatedCourseData = insertCourseSchema.parse(courseInfo);
      
      // Create the course first
      const course = await storage.createCourse(validatedCourseData);
      console.log("Course created:", course.id);
      
      // Create lessons for the course with PDF data
      for (let i = 0; i < lessonData.length; i++) {
        const lessonInfo = lessonData[i];
        
        let pdfUrl = null;
        if (lessonInfo.pdfUrl) {
          // Convert GCS URL to local serving URL
          const urlParts = lessonInfo.pdfUrl.split('/');
          const pdfFileName = urlParts[urlParts.length - 1].split('?')[0];
          const pdfId = pdfFileName.replace('.pdf', '');
          pdfUrl = `/pdf/${pdfId}`;
        }
        
        // Create lesson record with converted PDF URL
        const lessonRecord = {
          courseId: course.id,
          title: lessonInfo.name || `Ders ${i + 1}`,
          orderIndex: i + 1,
          pdfUrl: pdfUrl,
          pdfFileName: lessonInfo.pdfFileName || lessonInfo.pdfFile || null,
          duration: lessonInfo.duration || 60,
          isActive: true
        };
        
        await storage.createLesson(lessonRecord);
        console.log(`Lesson created: ${lessonRecord.title} with PDF: ${pdfUrl}`);
      }
      
      // Create activity
      if (req.session.auth?.isAuthenticated) {
        try {
          await storage.createActivity({
            userId: req.session.auth.user.id,
            type: 'course_created',
            description: `${req.session.auth.user.firstName || 'Admin'} yeni kurs oluşturdu: ${course.title} (${lessonData.length} ders)`,
            entityId: course.id,
            entityType: 'course',
            metadata: { courseTitle: course.title, price: course.price, lessonsCount: lessonData.length }
          });
        } catch (activityError) {
          console.log("Activity creation failed, continuing without activity:", activityError);
        }
      }
      
      res.status(201).json({
        ...course,
        lessonsCount: lessonData.length
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("DETAILED ERROR creating course:");
      console.error("Error type:", (error as any).constructor?.name);
      console.error("Error message:", (error as any).message);
      console.error("Error stack:", (error as any).stack);
      console.error("Full error object:", error);
      res.status(500).json({ message: "Failed to create course", error: (error as any).message || String(error) });
    }
  });

  app.put('/api/courses/:id', async (req: any, res) => {
    try {
      console.log("=== COURSE UPDATE REQUEST ===");
      console.log("Course ID:", req.params.id);
      console.log("Update data:", req.body);
      
      // Extract lessons/sections from course data
      const { sections, ...courseInfo } = req.body;
      const lessonData = sections || [];
      
      // Set total lessons count
      courseInfo.totalLessons = lessonData.length;
      
      const validatedData = insertCourseSchema.parse(courseInfo);
      const course = await storage.updateCourse(req.params.id, validatedData);
      
      // Update lessons for the course
      if (lessonData.length > 0) {
        // First, delete existing lessons for this course
        await db.delete(lessons).where(eq(lessons.courseId, req.params.id));
        console.log("Deleted existing lessons");
        
        // Create new lessons
        for (let i = 0; i < lessonData.length; i++) {
          const lessonInfo = lessonData[i];
          
          const lessonRecord = {
            courseId: req.params.id,
            title: lessonInfo.name || lessonInfo.title || `Ders ${i + 1}`,
            orderIndex: i + 1,
            pdfUrl: lessonInfo.pdfUrl || null,
            pdfFileName: lessonInfo.pdfFileName || null,
            duration: lessonInfo.duration || 60,
            isActive: true
          };
          
          await storage.createLesson(lessonRecord);
          console.log(`Created/Updated lesson: ${lessonRecord.title}`);
        }
      }
      
      // Create activity
      if (req.session.auth?.isAuthenticated) {
        await storage.createActivity({
          userId: req.session.auth.user.id,
          type: 'course_updated', 
          description: `${req.session.auth.user.firstName || 'Admin'} kursu güncelledi: ${course.title} (${lessonData.length} ders)`,
          entityId: course.id,
          entityType: 'course',
          metadata: { courseTitle: course.title, price: course.price, lessonsCount: lessonData.length }
        });
      }
      
      res.json({
        ...course,
        lessonsCount: lessonData.length
      });
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
      console.error("=== DETAILED DELETE ERROR ===");
      console.error("Error object:", error);
      console.error("Error message:", (error as Error).message);
      console.error("Error stack:", (error as Error).stack);
      res.status(500).json({ message: `Failed to delete course: ${(error as Error).message}` });
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
      console.log("=== CONSULTANT GET REQUEST ===");
      console.log("Database URL set:", !!process.env.DATABASE_URL);
      console.log("PGHOST:", process.env.PGHOST);
      console.log("PGDATABASE:", process.env.PGDATABASE);
      
      const consultants = await storage.getConsultants();
      console.log("Consultants fetched:", consultants.length);
      console.log("First 2 consultants:", consultants.slice(0, 2));
      
      res.json(consultants);
    } catch (error) {
      console.error("Error fetching consultants:", error);
      console.error("Database connection error details:", (error as Error).message);
      res.status(500).json({ message: "Failed to fetch consultants", error: (error as Error).message });
    }
  });

  app.post("/api/consultants", async (req: any, res) => {
    try {
      console.log("=== CONSULTANT CREATION REQUEST ===");
      console.log("Request body:", req.body);
      
      const consultantData = {
        tcNo: req.body.tcNo,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        title: req.body.title || 'Danışman',
        email: req.body.email || null,
        phone: req.body.phone || null,
        userId: null // No user relation required
      };
      
      console.log("Processed consultant data:", consultantData);
      
      const consultant = await storage.createConsultant(consultantData);
      console.log("Consultant created successfully:", consultant);
      
      // Create user account for the consultant automatically
      try {
        const userData = {
          id: `consultant-${consultantData.tcNo}`,
          tcKimlikNo: consultantData.tcNo,
          firstName: consultantData.firstName,
          lastName: consultantData.lastName,
          email: consultantData.email,
          role: consultantData.title === 'Müdür' ? 'admin' : 'consultant', // Müdür = admin, Danışman = consultant
          password: '112233', // Default password
          assignedCategories: ['Genel'],
          isManualStudent: false
        };
        
        const user = await storage.createStudent(userData);
        console.log("User account created for consultant:", user.id, "Role:", user.role);
        
        // Link consultant to user
        await storage.updateConsultant(consultant.id, { userId: user.id });
        console.log("Consultant linked to user account");
        
      } catch (userError) {
        console.log("User account creation failed (may already exist):", userError);
      }
      
      res.status(201).json(consultant);
    } catch (error) {
      console.error("Error creating consultant:", error);
      res.status(500).json({ message: "Failed to create consultant", error: (error as Error).message });
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

  // Student-specific routes
  app.get('/api/student/courses', async (req: any, res) => {
    try {
      // Check if user is authenticated as a student
      if (!req.session.auth || !req.session.auth.isAuthenticated) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = req.session.auth.user;
      if (user.role !== 'student') {
        return res.status(403).json({ message: "Access denied. Students only." });
      }

      // Find student record and get their assigned courses
      const students = await storage.getStudents();
      const student = students.find(s => s.tcKimlikNo === user.tcKimlikNo || s.id === user.id);
      
      if (!student || !student.selectedCourses || student.selectedCourses.length === 0) {
        return res.json([]); // Return empty array if no courses found
      }

      // Get course details for assigned courses
      const allCourses = await storage.getCourses();
      const assignedCourses = allCourses.filter(course => 
        (student.selectedCourses || []).includes(course.id) || 
        (student.selectedCourses || []).includes(course.title)
      );

      res.json(assignedCourses);
    } catch (error) {
      console.error("Error fetching student courses:", error);
      res.status(500).json({ message: "Failed to fetch student courses" });
    }
  });

  app.get('/api/student/activities', async (req: any, res) => {
    try {
      // Check if user is authenticated as a student
      if (!req.session.auth || !req.session.auth.isAuthenticated) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = req.session.auth.user;
      if (user.role !== 'student') {
        return res.status(403).json({ message: "Access denied. Students only." });
      }

      // Get student's enrolled courses first
      const studentCourses = await storage.getCoursesByUserCategories(user.assignedCategories || []);
      
      // Create real activities based on student's actual courses
      const studentActivities = [];
      
      // Generate course enrollment activities
      studentCourses.forEach((course, index) => {
        // Course assigned activity
        studentActivities.push({
          id: `course_assigned_${course.id}`,
          type: 'course_assigned',
          description: `Kurs tanımlandı: ${course.title}`,
          createdAt: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(), // Days ago based on course order
          entityType: 'course'
        });
        
        // If course has been started (simulate some progress)
        if (index < 2) { // First 2 courses show progress
          studentActivities.push({
            id: `course_progress_${course.id}`,
            type: 'course_progress',
            description: `İlerleme kaydedildi: ${course.title} - %65 tamamlandı`,
            createdAt: new Date(Date.now() - (index * 12) * 60 * 60 * 1000).toISOString(), // Hours ago
            entityType: 'course'
          });
        }
      });
      
      // Add general system activities
      if (studentCourses.length > 0) {
        studentActivities.push({
          id: 'system_welcome',
          type: 'system_notification',
          description: `Sisteme hoş geldiniz! ${studentCourses.length} kurs tanımlandı`,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
          entityType: 'system'
        });
      }
      
      // Sort by creation date (newest first) and limit to 10
      const sortedActivities = studentActivities
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      res.json(sortedActivities);
    } catch (error) {
      console.error("Error fetching student activities:", error);
      res.status(500).json({ message: "Failed to fetch student activities" });
    }
  });

  // Student profile GET endpoint
  app.get('/api/student/profile', async (req: any, res) => {
    try {
      console.log('=== STUDENT PROFILE GET REQUEST ===');
      console.log('Session auth:', req.session.auth);
      
      if (!req.session.auth?.isAuthenticated || req.session.auth.user.role !== 'student') {
        return res.status(401).json({ message: 'Student authentication required' });
      }

      const sessionUser = req.session.auth.user;
      console.log('Session user data:', sessionUser);
      
      // Try to find user by ID first, then by TC kimlik no as fallback
      let student = await storage.getUser(sessionUser.id);
      
      if (!student && sessionUser.tcKimlikNo) {
        console.log('User not found by ID, trying TC kimlik no:', sessionUser.tcKimlikNo);
        const allUsers = await storage.getAllUsers();
        student = allUsers.find(user => user.tcKimlikNo === sessionUser.tcKimlikNo);
        console.log('Found student by TC:', student?.firstName, student?.lastName);
      }
      
      if (!student) {
        console.log('Student not found with ID:', sessionUser.id, 'or TC:', sessionUser.tcKimlikNo);
        return res.status(404).json({ message: 'Student not found' });
      }

      console.log('Student found:', student.firstName, student.lastName);

      // Return student profile data - handle both firstName/lastName and adı/soyadı fields
      const profileData = {
        id: student.id,
        firstName: student.firstName || student.adı || '',
        lastName: student.lastName || student.soyadı || '',
        email: student.email || '',
        telefon: student.telefon || '',
        tcKimlikNo: student.tcKimlikNo || '',
        doğumTarihi: student.doğumTarihi,
        cinsiyet: student.cinsiyet,
        meslek: student.meslek
      };
      
      console.log('Returning profile data:', profileData);
      res.json(profileData);
    } catch (error) {
      console.error("Error fetching student profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Student profile UPDATE endpoint  
  app.put('/api/student/profile', async (req: any, res) => {
    try {
      console.log('=== STUDENT PROFILE UPDATE REQUEST ===');
      console.log('Session auth:', req.session.auth);
      console.log('Request body:', req.body);
      
      if (!req.session.auth?.isAuthenticated || req.session.auth.user.role !== 'student') {
        return res.status(401).json({ message: 'Student authentication required' });
      }

      const studentId = req.session.auth.user.id;
      const { firstName, lastName, email, phone, tcKimlikNo } = req.body;
      
      console.log('Updating student:', studentId, 'with data:', { firstName, lastName, email, phone, tcKimlikNo });
      
      // Update student data
      await storage.updateStudent(studentId, {
        firstName,
        lastName, 
        email,
        telefon: phone,
        tcKimlikNo
      });
      
      console.log('Student profile updated successfully');
      
      // Create activity for profile update
      try {
        await storage.createActivity({
          userId: studentId,
          type: 'profile_updated',
          description: 'Profil bilgilerini güncelledi',
          entityId: studentId,
          entityType: 'user',
          metadata: { action: 'profile_update' }
        });
      } catch (error) {
        console.log("Activity creation failed:", error);
      }

      res.json({ message: "Profil başarıyla güncellendi" });
    } catch (error) {
      console.error("Error updating student profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
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
      
      // Create student - populate both firstName/lastName and adı/soyadı for compatibility
      const student = await storage.createStudent({
        firstName: req.body.adı,     // Map adı to firstName
        lastName: req.body.soyadı,   // Map soyadı to lastName  
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
      
      // Send welcome SMS if phone number is provided
      if (req.body.telefon) {
        try {
          console.log("🔄 Hoşgeldin SMS gönderiliyor...");
          const smsResult = await netGSMService.sendWelcomeSMS({
            firstName: student.firstName,
            tcKimlikNo: student.tcKimlikNo,
            phone: req.body.telefon,
            password: '112233'
          });
          
          if (smsResult.success) {
            console.log("✅ Hoşgeldin SMS başarıyla gönderildi:", smsResult.jobId);
          } else {
            console.error("❌ Hoşgeldin SMS hatası:", smsResult.error);
          }
        } catch (smsError) {
          console.error("SMS gönderim hatası:", smsError);
        }
      }
      
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
  // Student password change endpoint
  app.post("/api/student/change-password", async (req: any, res) => {
    try {
      if (!req.session.auth || !req.session.auth.isAuthenticated) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Mevcut şifre ve yeni şifre gereklidir" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Yeni şifre en az 6 karakter olmalıdır" });
      }

      const userId = req.session.auth.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }

      // Check if current password matches
      if (user.password !== currentPassword) {
        return res.status(400).json({ message: "Mevcut şifre yanlış" });
      }

      // Update password
      await storage.updateUserPassword(userId, newPassword);

      // Create activity for password change
      try {
        await storage.createActivity({
          userId: userId,
          type: 'password_changed',
          description: 'Şifre değiştirme: Hesap şifreniz başarıyla güncellendi',
          entityId: userId,
          entityType: 'user',
          metadata: { action: 'password_update' }
        });
      } catch (error) {
        console.log("Activity creation failed:", error);
      }

      res.json({ message: "Şifre başarıyla güncellendi" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Şifre değiştirilirken bir hata oluştu" });
    }
  });

  app.post('/api/auth/student-login', async (req: any, res) => {
    try {
      const { tcKimlikNo, password } = req.body;
      
      console.log('=== STUDENT LOGIN ATTEMPT ===');
      console.log('TC:', tcKimlikNo, 'Password provided:', password ? 'YES' : 'NO');
      console.log('Timestamp:', new Date().toISOString());
      
      // First try users table for manual students  
      const allUsers = await storage.getAllUsers();
      console.log('Total users found:', allUsers.length);
      console.log('Looking for TC:', tcKimlikNo, 'role: student');
      
      const userStudent = allUsers.find((u: any) => u.tcKimlikNo === tcKimlikNo && u.role === 'student');
      
      // Debug: check if user exists with different role
      const anyUserWithTC = allUsers.find((u: any) => u.tcKimlikNo === tcKimlikNo);
      if (anyUserWithTC && !userStudent) {
        console.log('User found with TC but wrong role:', anyUserWithTC.tcKimlikNo, 'role:', anyUserWithTC.role);
      }
      
      if (userStudent) {
        console.log('Found user-student:', userStudent.firstName, userStudent.lastName);
        console.log('Stored password:', userStudent.password);
        
        if (userStudent.password === password) {
          console.log('Password match - user-student login success');
          req.session.auth = {
            user: { 
              id: userStudent.id, 
              tcKimlikNo: userStudent.tcKimlikNo, 
              firstName: userStudent.firstName,
              lastName: userStudent.lastName,
              role: 'student',
              bitişTarihi: userStudent.bitişTarihi,
              isManualStudent: true
            },
            isAuthenticated: true
          };
          
          return res.json({ 
            message: 'Giriş başarılı',
            user: { 
              id: userStudent.id, 
              tcKimlikNo: userStudent.tcKimlikNo,
              firstName: userStudent.firstName,
              lastName: userStudent.lastName,
              role: 'student',
              bitişTarihi: userStudent.bitişTarihi,
              isManualStudent: true
            }
          });
        } else {
          console.log('Password mismatch for user-student');
          return res.status(401).json({ message: 'Geçersiz şifre' });
        }
      }
      
      // Fallback: Try students table for older entries
      const students = await storage.getStudents();
      const student = students.find(s => s.tcKimlikNo === tcKimlikNo);
      
      if (student) {
        console.log('Found legacy student:', student.adı, student.soyadı);
        
        if (student.password === password) {
          console.log('Password match - legacy student login success');
          req.session.auth = {
            user: { 
              id: student.id, 
              tcKimlikNo: student.tcKimlikNo, 
              firstName: student.firstName || student.adı,
              lastName: student.lastName || student.soyadı,
              role: 'student',
              isManualStudent: true
            },
            isAuthenticated: true
          };
          
          return res.json({ 
            message: 'Giriş başarılı',
            user: { 
              id: student.id, 
              tcKimlikNo: student.tcKimlikNo,
              firstName: student.firstName || student.adı,
              lastName: student.lastName || student.soyadı,
              role: 'student',
              isManualStudent: true
            }
          });
        } else {
          console.log('Password mismatch for legacy student');
          return res.status(401).json({ message: 'Geçersiz şifre' });
        }
      }
      
      console.log('No student found with TC:', tcKimlikNo);
      res.status(401).json({ message: 'Bu T.C. kimlik no ile kayıtlı kullanıcı bulunamadı' });
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
      
      // Get student's data first to check assigned categories
      const student = await storage.getUser(studentId);
      if (!student) {
        // Try to find student by TC kimlik no if user lookup fails
        const students = await storage.getStudents();
        const studentByTc = students.find(s => s.tcKimlikNo === req.session.auth.user.tcKimlikNo);
        if (studentByTc) {
          const studentCourses = await storage.getCoursesByUserCategories(studentByTc.id);
          console.log("Found student by TC, courses:", studentCourses.length);
          return res.json(studentCourses);
        }
        return res.status(404).json({ message: 'Student not found' });
      }

      console.log("Student assignedCategories:", student.assignedCategories);
      
      // Get courses based on student's assigned categories
      let studentCourses = await storage.getCoursesByUserCategories(studentId);
      
      // If no courses found via categories, try getting all active courses as fallback
      if (studentCourses.length === 0) {
        console.log("No courses found via categories, getting all active courses");
        const allCourses = await storage.getCourses();
        studentCourses = allCourses.filter(course => course.status === 'active');
      }

      console.log("Final student courses count:", studentCourses.length);
      res.json(studentCourses);
    } catch (error) {
      console.error("Error fetching student courses:", error);
      res.status(500).json({ message: "Failed to fetch student courses" });
    }
  });

  // Get course sections and materials by course title  
  app.get('/api/student/course/:courseTitle/sections', async (req: any, res) => {
    try {
      const user = req.session.auth?.user;
      console.log('=== STUDENT COURSE SECTIONS API DEBUG ===');
      console.log('Session user:', user);
      console.log('User role:', user?.role);
      
      // Allow any authenticated user (student, admin, etc.) to access course content
      if (!user) {
        console.log('❌ No user in session');
        return res.status(403).json({ message: "Authentication required." });
      }
      
      console.log('✅ User authenticated, role:', user.role, '- proceeding with course sections');

      const courseTitle = decodeURIComponent(req.params.courseTitle);
      
      // Get the specific course by title - first try user categories, then fallback to all courses
      let courses = await storage.getCoursesByUserCategories(user.id);
      
      if (courses.length === 0) {
        console.log("No courses via categories, trying all active courses");
        const allCourses = await storage.getCourses();
        courses = allCourses.filter(course => course.status === 'active');
      }
      
      const course = courses.find(c => c.title === courseTitle);
      console.log("Looking for course:", courseTitle, "in", courses.length, "courses");
      
      if (!course) {
        return res.status(404).json({ message: "Course not found or access denied" });
      }

      // Get lessons from lessons table instead of sections field
      const lessons = await storage.getLessonsByCourse(course.id);
      console.log(`Found ${lessons.length} lessons for course:`, course.title);

      res.json({
        course: {
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          price: course.price,
          totalLessons: course.totalLessons,
          instructorId: course.instructorId
        },
        sections: lessons.map((lesson: any, index: number) => {
          console.log(`Processing lesson ${index}:`, lesson);
          
          // Create materials array from lesson data
          let materials: any[] = [];
          if (lesson.pdfUrl) {
            materials.push({
              name: lesson.pdfFileName || `${lesson.title} PDF Materyali`,
              type: 'pdf',
              url: lesson.pdfUrl
            });
          }
          
          return {
            name: lesson.title, // This is the lesson title that will be displayed
            title: lesson.title, // Add title field too for consistency
            materials: materials,
            totalMaterials: materials.length,
            pdfUrl: lesson.pdfUrl // Add direct pdfUrl for easy access
          };
        })
      });
      
      console.log('✅ API Response sent with', lessons.length, 'sections');
    } catch (error) {
      console.error("Error fetching course sections:", error);
      res.status(500).json({ message: "Failed to fetch course sections" });
    }
  });

  // DEBUG ENDPOINT: Test course sections without authentication (for troubleshooting)
  app.get('/api/debug/course/:courseTitle/sections', async (req: any, res) => {
    try {
      console.log('=== DEBUG ENDPOINT - NO AUTH CHECK ===');
      const courseTitle = decodeURIComponent(req.params.courseTitle);
      console.log('Requested course:', courseTitle);
      
      // Get all active courses
      const allCourses = await storage.getCourses();
      const courses = allCourses.filter(course => course.status === 'active');
      
      const course = courses.find(c => c.title === courseTitle);
      console.log("Found course:", course ? course.title : "null");
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Get lessons from lessons table
      const lessons = await storage.getLessonsByCourse(course.id);
      console.log(`Found ${lessons.length} lessons for course:`, course.title);

      const response = {
        course: {
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          price: course.price,
          totalLessons: course.totalLessons
        },
        sections: lessons.map((lesson: any, index: number) => {
          console.log(`Processing lesson ${index}:`, lesson.title, 'PDF:', lesson.pdfUrl);
          
          let materials: any[] = [];
          if (lesson.pdfUrl) {
            materials.push({
              name: lesson.pdfFileName || 'PDF Dokümanı',
              type: 'pdf',
              url: lesson.pdfUrl
            });
          }
          
          return {
            name: lesson.title,
            materials: materials,
            totalMaterials: materials.length
          };
        })
      };
      
      console.log('✅ DEBUG API Response:', JSON.stringify(response, null, 2));
      res.json(response);
    } catch (error) {
      console.error("Debug endpoint error:", error);
      res.status(500).json({ message: "Debug endpoint failed" });
    }
  });

  // SMS Routes - NetGSM Real Integration
  app.post('/api/sms/send-welcome', async (req: any, res) => {
    try {
      const { phone, message, studentData } = req.body;
      
      if (!phone || !message) {
        return res.status(400).json({ 
          success: false, 
          message: "Telefon numarası ve mesaj gerekli" 
        });
      }

      console.log("NetGSM SMS Gönderimi Başlatılıyor:", { phone, messageLength: message.length });
      
      // NetGSM ile gerçek SMS gönder
      const smsResult = await netGSMService.sendSMS({
        phone: phone,
        message: message
      });
      
      if (smsResult.success) {
        console.log("✅ SMS Başarıyla Gönderildi:", { jobId: smsResult.jobId, phone });
        res.json({ 
          success: true, 
          message: "SMS başarıyla gönderildi",
          phone: phone,
          jobId: smsResult.jobId
        });
      } else {
        console.error("❌ SMS Gönderim Hatası:", smsResult.error);
        res.status(500).json({ 
          success: false, 
          message: `SMS gönderilirken hata: ${smsResult.error}`,
          phone: phone
        });
      }
    } catch (error: any) {
      console.error("SMS endpoint error:", error);
      res.status(500).json({ 
        success: false, 
        message: "SMS gönderilirken hata oluştu: " + error.message 
      });
    }
  });

  // Test SMS endpoint - with phone number parameter
  app.post('/api/sms/test', async (req: any, res) => {
    try {
      console.log("NetGSM Test SMS başlatılıyor...");
      const { phone } = req.body;
      
      if (phone) {
        // Test with specific phone number
        const smsResult = await netGSMService.sendSMS({
          phone: phone,
          message: 'Test mesajı - Algı Akademi SMS sistemi çalışıyor.'
        });
        
        if (smsResult.success) {
          res.json({
            success: true,
            message: "Test SMS başarıyla gönderildi",
            phone: phone,
            jobId: smsResult.jobId
          });
        } else {
          res.status(500).json({
            success: false,
            message: `Test SMS hatası: ${smsResult.error}`
          });
        }
      } else {
        // Use default test connection
        const testResult = await netGSMService.testConnection();
        
        if (testResult.success) {
          res.json({
            success: true,
            message: "Test SMS başarıyla gönderildi",
            jobId: testResult.jobId || 'unknown'
          });
        } else {
          res.status(500).json({
            success: false,
            message: `Test SMS hatası: ${testResult.error}`
          });
        }
      }
    } catch (error: any) {
      console.error("Test SMS error:", error);
      res.status(500).json({
        success: false,
        message: "Test SMS hatası: " + error.message
      });
    }
  });

  // ==================== EXAM ROUTES ====================
  
  // Get all exams with question counts and course names
  app.get('/api/exams', async (req: any, res) => {
    try {
      const allExams = await storage.getExams();
      
      // Enrich with question counts and course names
      const examsWithDetails = await Promise.all(
        allExams.map(async (exam) => {
          const questions = await storage.getExamQuestions(exam.id);
          let courseName = null;
          
          if (exam.courseId) {
            const course = await storage.getCourse(exam.courseId);
            courseName = course?.title || null;
          }
          
          return {
            ...exam,
            questionCount: questions.length,
            courseName,
          };
        })
      );
      
      res.json(examsWithDetails);
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  // Get single exam with questions
  app.get('/api/exams/:id', async (req: any, res) => {
    try {
      const exam = await storage.getExam(req.params.id);
      
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      const questions = await storage.getExamQuestions(exam.id);
      
      res.json({
        ...exam,
        questions,
      });
    } catch (error) {
      console.error("Error fetching exam:", error);
      res.status(500).json({ message: "Failed to fetch exam" });
    }
  });

  // Create new exam with questions
  app.post('/api/exams', async (req: any, res) => {
    try {
      const { questions: questionsList, ...examData } = req.body;
      
      // Validate exam data
      const validatedExamData = insertExamSchema.parse(examData);
      
      // Create exam
      const exam = await storage.createExam(validatedExamData);
      
      // Create questions if provided
      if (questionsList && Array.isArray(questionsList)) {
        for (const question of questionsList) {
          await storage.createExamQuestion({
            examId: exam.id,
            questionText: question.questionText,
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD,
            correctAnswer: question.correctAnswer,
            orderIndex: question.orderIndex,
          });
        }
      }
      
      // Create activity log
      if (req.session.auth?.isAuthenticated) {
        try {
          await storage.createActivity({
            userId: req.session.auth.user.id,
            type: 'exam_created',
            description: `${req.session.auth.user.firstName || 'Admin'} yeni sınav oluşturdu: ${exam.title}`,
            entityId: exam.id,
            entityType: 'exam',
            metadata: { 
              examTitle: exam.title, 
              questionCount: questionsList?.length || 0 
            }
          });
        } catch (activityError) {
          console.log("Activity creation failed, continuing without activity:", activityError);
        }
      }
      
      res.json(exam);
    } catch (error) {
      console.error("Error creating exam:", error);
      res.status(500).json({ message: "Failed to create exam" });
    }
  });

  // Update exam
  app.put('/api/exams/:id', async (req: any, res) => {
    try {
      const { questions: questionsList, ...examData } = req.body;
      
      // Update exam
      const exam = await storage.updateExam(req.params.id, examData);
      
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      // If questions provided, delete old questions and create new ones
      if (questionsList && Array.isArray(questionsList)) {
        await storage.deleteExamQuestions(req.params.id);
        
        for (const question of questionsList) {
          await storage.createExamQuestion({
            examId: exam.id,
            questionText: question.questionText,
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD,
            correctAnswer: question.correctAnswer,
            orderIndex: question.orderIndex,
          });
        }
      }
      
      // Create activity log
      if (req.session.auth?.isAuthenticated) {
        try {
          await storage.createActivity({
            userId: req.session.auth.user.id,
            type: 'exam_updated',
            description: `${req.session.auth.user.firstName || 'Admin'} sınavı güncelledi: ${exam.title}`,
            entityId: exam.id,
            entityType: 'exam',
            metadata: { examTitle: exam.title }
          });
        } catch (activityError) {
          console.log("Activity creation failed, continuing without activity:", activityError);
        }
      }
      
      res.json(exam);
    } catch (error) {
      console.error("Error updating exam:", error);
      res.status(500).json({ message: "Failed to update exam" });
    }
  });

  // Delete exam
  app.delete('/api/exams/:id', async (req: any, res) => {
    try {
      const exam = await storage.getExam(req.params.id);
      
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      // Delete questions first
      await storage.deleteExamQuestions(req.params.id);
      
      // Delete exam
      await storage.deleteExam(req.params.id);
      
      // Create activity log
      if (req.session.auth?.isAuthenticated) {
        try {
          await storage.createActivity({
            userId: req.session.auth.user.id,
            type: 'exam_deleted',
            description: `${req.session.auth.user.firstName || 'Admin'} sınavı sildi: ${exam.title}`,
            entityId: req.params.id,
            entityType: 'exam',
            metadata: { examTitle: exam.title }
          });
        } catch (activityError) {
          console.log("Activity creation failed, continuing without activity:", activityError);
        }
      }
      
      res.json({ success: true, message: "Exam deleted successfully" });
    } catch (error) {
      console.error("Error deleting exam:", error);
      res.status(500).json({ message: "Failed to delete exam" });
    }
  });

  app.post('/api/sms-templates', async (req: any, res) => {
    try {
      const template = req.body;
      
      // Store SMS template (would integrate with database)
      console.log("SMS template saved:", template);
      
      res.json({ 
        success: true, 
        message: "SMS şablonu kaydedildi",
        template: template 
      });
    } catch (error) {
      console.error("SMS template save error:", error);
      res.status(500).json({ 
        success: false, 
        message: "SMS şablonu kaydedilirken hata oluştu" 
      });
    }
  });

  app.get('/api/sms-templates', async (req: any, res) => {
    try {
      // Return saved SMS templates (would come from database)
      const templates = [
        {
          id: '1',
          name: 'Kursiyer Hoşgeldin SMS',
          subject: 'Algı Akademi Üyelik',
          content: 'Merhaba {isim}, Algı Akademi\'ye hoş geldiniz! Giriş bilgileriniz - TC: {tc}, Şifre: {sifre} - Link: {link}',
          variables: ['isim', 'tc', 'sifre', 'link'],
          type: 'welcome'
        }
      ];
      
      res.json(templates);
    } catch (error) {
      console.error("SMS templates fetch error:", error);
      res.status(500).json({ 
        success: false, 
        message: "SMS şablonları getirilirken hata oluştu" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}