import {
  users,
  courses,
  enrollments,
  exams,
  examResults,
  activities,
  consultants,
  sales,
  integrations,
  notifications,
  notificationTemplates,
  notificationSettings,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type Enrollment,
  type InsertEnrollment,
  type Exam,
  type InsertExam,
  type ExamResult,
  type InsertExamResult,
  type Activity,
  type InsertActivity,
  type Consultant,
  type InsertConsultant,
  type Sale,
  type InsertSale,
  type Integration,
  type InsertIntegration,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;
  updateUserPassword(id: string, newPassword: string): Promise<void>;
  
  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;
  
  // Enrollment operations
  getEnrollments(): Promise<(Enrollment & { student: User; course: Course })[]>;
  getEnrollmentsByStudent(studentId: string): Promise<(Enrollment & { course: Course })[]>;
  getEnrollmentsByCourse(courseId: string): Promise<(Enrollment & { student: User })[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: string, enrollment: Partial<InsertEnrollment>): Promise<Enrollment>;
  
  // Exam operations
  getExams(): Promise<Exam[]>;
  getExamsByCourse(courseId: string): Promise<Exam[]>;
  createExam(exam: InsertExam): Promise<Exam>;
  
  // Exam result operations
  getExamResults(): Promise<(ExamResult & { exam: Exam; student: User })[]>;
  getExamResultsByStudent(studentId: string): Promise<(ExamResult & { exam: Exam })[]>;
  createExamResult(result: InsertExamResult): Promise<ExamResult>;
  
  // Activity operations
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Student operations
  getStudents(): Promise<User[]>;
  createStudent(student: any): Promise<User>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalStudents: number;
    activeCourses: number;
    monthlyRevenue: number;
  }>;

  // Consultant operations
  getConsultants(): Promise<Consultant[]>;
  getConsultant(id: string): Promise<Consultant | undefined>;
  createConsultant(consultant: InsertConsultant): Promise<Consultant>;
  updateConsultant(id: string, consultant: Partial<InsertConsultant>): Promise<Consultant>;
  deleteConsultant(id: string): Promise<void>;

  // Sales operations
  getSales(): Promise<(Sale & { consultant: Consultant; student: User; course: Course })[]>;
  createSale(sale: InsertSale): Promise<Sale>;

  // Integration operations
  getIntegrations(): Promise<Integration[]>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: string, integration: Partial<InsertIntegration>): Promise<Integration>;

  // Category-based course operations
  getCoursesByUserCategories(userId: string): Promise<Course[]>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Student operations
  getStudents(): Promise<User[]>;
  createStudent(student: any): Promise<User>;
  updateStudent(id: string, student: any): Promise<User>;
  deleteStudent(id: string): Promise<void>;
  getStudentByTcNo(tcKimlikNo: string): Promise<User | undefined>;
  getUserByTcNo(tcKimlikNo: string): Promise<User | undefined>;

  // Notification operations
  getNotifications(): Promise<any[]>;
  createNotification(data: any): Promise<any>;
  getNotificationTemplates(): Promise<any[]>;
  createNotificationTemplate(data: any): Promise<any>;
  getNotificationSettings(userId: string): Promise<any>;
  updateNotificationSettings(userId: string, data: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Set default role if not provided
    const userDataWithDefaults = {
      ...userData,
      role: userData.role || 'student',
    };

    const [user] = await db
      .insert(users)
      .values(userDataWithDefaults)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userDataWithDefaults,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        lastLogin: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(users.id, id));
  }

  async updateUserPassword(id: string, newPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        password: newPassword,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id));
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .orderBy(desc(courses.createdAt));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db
      .insert(courses)
      .values(course)
      .returning();
    return newCourse;
  }

  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...course, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteCourse(id: string): Promise<void> {
    console.log("Storage.deleteCourse called with ID:", id);
    try {
      const result = await db.delete(courses).where(eq(courses.id, id));
      console.log("Database delete result:", result);
    } catch (error) {
      console.error("Storage.deleteCourse error:", error);
      throw error;
    }
  }

  // Enrollment operations
  async getEnrollments(): Promise<(Enrollment & { student: User; course: Course })[]> {
    const results = await db
      .select()
      .from(enrollments)
      .leftJoin(users, eq(enrollments.studentId, users.id))
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .orderBy(desc(enrollments.lastActivity));
    
    return results.map((result: any) => ({
      ...result.enrollments,
      student: result.users,
      course: result.courses,
    }));
  }

  async getEnrollmentsByStudent(studentId: string): Promise<(Enrollment & { course: Course })[]> {
    const results = await db
      .select()
      .from(enrollments)
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.studentId, studentId));
    
    return results.map((result: any) => ({
      ...result.enrollments,
      course: result.courses,
    }));
  }

  async getCoursesByUserCategories(userId: string): Promise<Course[]> {
    const user = await this.getUser(userId);
    console.log('getCoursesByUserCategories - User:', user?.tcKimlikNo, 'Categories:', user?.assignedCategories);
    
    if (!user?.assignedCategories || user.assignedCategories.length === 0) {
      console.log('No assigned categories, returning empty array');
      return [];
    }

    const result = await db
      .select()
      .from(courses)
      .where(
        and(
          eq(courses.status, 'active'),
          // Fix: Use inArray for category matching
          sql`${courses.category} = ANY(${user.assignedCategories})`
        )
      )
      .orderBy(desc(courses.createdAt));
    
    console.log('Found courses for categories:', result.length);
    return result;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, role))
      .orderBy(desc(users.createdAt));
  }

  async getEnrollmentsByCourse(courseId: string): Promise<(Enrollment & { student: User })[]> {
    const results = await db
      .select()
      .from(enrollments)
      .leftJoin(users, eq(enrollments.studentId, users.id))
      .where(eq(enrollments.courseId, courseId));
    
    return results.map((result: any) => ({
      ...result.enrollments,
      student: result.users,
    }));
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db
      .insert(enrollments)
      .values(enrollment)
      .returning();
    return newEnrollment;
  }

  async updateEnrollment(id: string, enrollment: Partial<InsertEnrollment>): Promise<Enrollment> {
    const [updatedEnrollment] = await db
      .update(enrollments)
      .set({ ...enrollment, lastActivity: new Date() })
      .where(eq(enrollments.id, id))
      .returning();
    return updatedEnrollment;
  }

  // Exam operations
  async getExams(): Promise<Exam[]> {
    return await db
      .select()
      .from(exams)
      .orderBy(desc(exams.createdAt));
  }

  async getExamsByCourse(courseId: string): Promise<Exam[]> {
    return await db
      .select()
      .from(exams)
      .where(eq(exams.courseId, courseId));
  }

  async createExam(exam: InsertExam): Promise<Exam> {
    const [newExam] = await db
      .insert(exams)
      .values(exam)
      .returning();
    return newExam;
  }

  // Exam result operations
  async getExamResults(): Promise<(ExamResult & { exam: Exam; student: User })[]> {
    const results = await db
      .select()
      .from(examResults)
      .leftJoin(exams, eq(examResults.examId, exams.id))
      .leftJoin(users, eq(examResults.studentId, users.id))
      .orderBy(desc(examResults.completedAt));
    
    return results.map((result: any) => ({
      ...result.exam_results,
      exam: result.exams,
      student: result.users,
    }));
  }

  async getExamResultsByStudent(studentId: string): Promise<(ExamResult & { exam: Exam })[]> {
    const results = await db
      .select()
      .from(examResults)
      .leftJoin(exams, eq(examResults.examId, exams.id))
      .where(eq(examResults.studentId, studentId));
    
    return results.map((result: any) => ({
      ...result.exam_results,
      exam: result.exams,
    }));
  }

  async createExamResult(result: InsertExamResult): Promise<ExamResult> {
    const [newResult] = await db
      .insert(examResults)
      .values(result)
      .returning();
    return newResult;
  }

  // Activity operations
  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values(activity)
      .returning();
    return newActivity;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalRegistrations: number;
    totalStudents: number;
    activeCourses: number;
    monthlyRevenue: number;
  }> {
    // Total registrations (all student entries including education definitions)
    const [totalRegistrations] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'student'));

    // Total real students (only those with actual data like adı, firstName, or tcKimlikNo)
    const allStudents = await db.select().from(users).where(eq(users.role, 'student'));
    const realStudents = allStudents.filter(student => 
      student.adı || student.firstName || student.tcKimlikNo
    );

    const [courseCount] = await db
      .select({ count: count() })
      .from(courses)
      .where(eq(courses.status, 'active'));

    // Calculate real monthly revenue from student registrations
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyStudents = await db.select().from(users).where(
      and(
        eq(users.role, 'student'),
        sql`EXTRACT(MONTH FROM ${users.createdAt}) = ${currentMonth + 1}`,
        sql`EXTRACT(YEAR FROM ${users.createdAt}) = ${currentYear}`
      )
    );
    
    const monthlyRevenue = monthlyStudents.reduce((total, student) => {
      const finalPrice = parseFloat(student.finalPrice || '0');
      return total + finalPrice;
    }, 0);

    return {
      totalRegistrations: totalRegistrations.count,
      totalStudents: realStudents.length,
      activeCourses: courseCount.count,
      monthlyRevenue,
    };
  }

  // Consultant operations
  async getConsultants(): Promise<Consultant[]> {
    return await db
      .select()
      .from(consultants)
      .orderBy(desc(consultants.createdAt));
  }

  async getConsultant(id: string): Promise<Consultant | undefined> {
    const [consultant] = await db.select().from(consultants).where(eq(consultants.id, id));
    return consultant;
  }

  async createConsultant(consultant: InsertConsultant): Promise<Consultant> {
    // First create user account for consultant
    const consultantRole = consultant.title === 'Müdür' ? 'admin' : 'consultant';
    const [newUser] = await db
      .insert(users)
      .values({
        tcKimlikNo: consultant.tcNo,
        firstName: consultant.firstName,
        lastName: consultant.lastName,
        email: consultant.email,
        telefon: consultant.phone,
        password: '112233', // Default password
        role: consultantRole,
        isManualStudent: false,
      })
      .returning();

    // Then create consultant record linked to user
    const [newConsultant] = await db
      .insert(consultants)
      .values({
        ...consultant,
        userId: newUser.id,
      })
      .returning();
    return newConsultant;
  }

  async updateConsultant(id: string, consultant: Partial<InsertConsultant>): Promise<Consultant> {
    const [updatedConsultant] = await db
      .update(consultants)
      .set({ ...consultant, updatedAt: new Date() })
      .where(eq(consultants.id, id))
      .returning();
    return updatedConsultant;
  }

  async deleteConsultant(id: string): Promise<void> {
    await db.delete(consultants).where(eq(consultants.id, id));
  }

  // Sales operations
  async getSales(): Promise<(Sale & { consultant: Consultant; student: User; course: Course })[]> {
    const results = await db
      .select()
      .from(sales)
      .leftJoin(consultants, eq(sales.consultantId, consultants.id))
      .leftJoin(users, eq(sales.studentId, users.id))
      .leftJoin(courses, eq(sales.courseId, courses.id))
      .orderBy(desc(sales.createdAt));
    
    return results.map((result: any) => ({
      ...result.sales,
      consultant: result.consultants,
      student: result.users,
      course: result.courses,
    }));
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const [newSale] = await db
      .insert(sales)
      .values(sale)
      .returning();
    return newSale;
  }

  // Integration operations
  async getIntegrations(): Promise<Integration[]> {
    return await db
      .select()
      .from(integrations)
      .orderBy(desc(integrations.createdAt));
  }

  async createIntegration(integration: InsertIntegration): Promise<Integration> {
    const [newIntegration] = await db
      .insert(integrations)
      .values(integration)
      .returning();
    return newIntegration;
  }

  async updateIntegration(id: string, integration: Partial<InsertIntegration>): Promise<Integration> {
    const [updatedIntegration] = await db
      .update(integrations)
      .set({ ...integration, updatedAt: new Date() })
      .where(eq(integrations.id, id))
      .returning();
    return updatedIntegration;
  }

  // Student operations implementation

  async getStudents(): Promise<User[]> {
    return this.getUsersByRole('student');
  }

  async createStudent(studentData: any): Promise<User> {
    const [student] = await db
      .insert(users)
      .values({
        email: studentData.email,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        tcKimlikNo: studentData.tcKimlikNo,
        password: studentData.password,
        adı: studentData.adı,
        soyadı: studentData.soyadı,
        doğumTarihi: studentData.doğumTarihi,
        telefon: studentData.telefon,
        cinsiyet: studentData.cinsiyet,
        meslek: studentData.meslek,
        kayıtTarihi: studentData.kayıtTarihi,
        bitişTarihi: studentData.bitişTarihi,
        isMernisOnaylı: studentData.isMernisOnaylı,
        isÜniversiteOnaylı: studentData.isÜniversiteOnaylı,
        isEDevletOnaylı: studentData.isEDevletOnaylı,
        isUluslararasıSertifikasyon: studentData.isUluslararasıSertifikasyon,
        selectedCourses: studentData.selectedCourses || [],
        totalPrice: studentData.totalPrice,
        discountAmount: studentData.discountAmount,
        finalPrice: studentData.finalPrice,
        role: 'student',
        isManualStudent: studentData.isManualStudent || true,
      })
      .returning();
    return student;
  }

  async updateStudent(id: string, studentData: any): Promise<User> {
    const [updatedStudent] = await db
      .update(users)
      .set({
        email: studentData.email,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        tcKimlikNo: studentData.tcKimlikNo,
        adı: studentData.adı,
        soyadı: studentData.soyadı,
        doğumTarihi: studentData.doğumTarihi,
        telefon: studentData.telefon,
        cinsiyet: studentData.cinsiyet,
        meslek: studentData.meslek,
        kayıtTarihi: studentData.kayıtTarihi,
        bitişTarihi: studentData.bitişTarihi,
        isMernisOnaylı: studentData.isMernisOnaylı,
        isÜniversiteOnaylı: studentData.isÜniversiteOnaylı,
        isEDevletOnaylı: studentData.isEDevletOnaylı,
        isUluslararasıSertifikasyon: studentData.isUluslararasıSertifikasyon,
        selectedCourses: studentData.selectedCourses || [],
        totalPrice: studentData.totalPrice,
        discountAmount: studentData.discountAmount,
        finalPrice: studentData.finalPrice,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getStudentByTcNo(tcKimlikNo: string): Promise<User | undefined> {
    const [student] = await db
      .select()
      .from(users)
      .where(eq(users.tcKimlikNo, tcKimlikNo));
    return student;
  }

  async getUserByTcNo(tcKimlikNo: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.tcKimlikNo, tcKimlikNo));
    return user;
  }

  // Notification operations
  async getNotifications(): Promise<any[]> {
    return await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(data: any): Promise<any> {
    const [notification] = await db
      .insert(notifications)
      .values(data)
      .returning();
    return notification;
  }

  async getNotificationTemplates(): Promise<any[]> {
    return await db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.isActive, true))
      .orderBy(desc(notificationTemplates.createdAt));
  }

  async createNotificationTemplate(data: any): Promise<any> {
    const [template] = await db
      .insert(notificationTemplates)
      .values(data)
      .returning();
    return template;
  }

  async getNotificationSettings(userId: string): Promise<any> {
    const [settings] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId));
    
    return settings || {
      emailEnabled: true,
      smsEnabled: true,
      courseReminders: true,
      examNotifications: true,
      systemUpdates: true,
      marketingEmails: false
    };
  }

  async updateNotificationSettings(userId: string, data: any): Promise<any> {
    const [settings] = await db
      .insert(notificationSettings)
      .values({ userId, ...data })
      .onConflictDoUpdate({
        target: notificationSettings.userId,
        set: { ...data, updatedAt: new Date() }
      })
      .returning();
    return settings;
  }
}

export const storage = new DatabaseStorage();
