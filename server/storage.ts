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
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalStudents: number;
    activeCourses: number;
    monthlyRevenue: number;
    completionRate: number;
  }>;

  // Consultant operations
  getConsultants(): Promise<Consultant[]>;
  getConsultant(id: string): Promise<Consultant | undefined>;
  createConsultant(consultant: InsertConsultant): Promise<Consultant>;
  updateConsultant(id: string, consultant: Partial<InsertConsultant>): Promise<Consultant>;

  // Sales operations
  getSales(): Promise<(Sale & { consultant: Consultant; student: User; course: Course })[]>;
  createSale(sale: InsertSale): Promise<Sale>;

  // Integration operations
  getIntegrations(): Promise<Integration[]>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: string, integration: Partial<InsertIntegration>): Promise<Integration>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
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
    await db.delete(courses).where(eq(courses.id, id));
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
    totalStudents: number;
    activeCourses: number;
    monthlyRevenue: number;
    completionRate: number;
  }> {
    const [studentCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'student'));

    const [courseCount] = await db
      .select({ count: count() })
      .from(courses)
      .where(eq(courses.status, 'active'));

    // Calculate monthly revenue (mock calculation for now)
    const monthlyRevenue = 87340;

    // Calculate completion rate
    const [completedEnrollments] = await db
      .select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.status, 'completed'));

    const [totalEnrollments] = await db
      .select({ count: count() })
      .from(enrollments);

    const completionRate = totalEnrollments.count > 0 
      ? Math.round((completedEnrollments.count / totalEnrollments.count) * 100)
      : 0;

    return {
      totalStudents: studentCount.count,
      activeCourses: courseCount.count,
      monthlyRevenue,
      completionRate,
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
    const [newConsultant] = await db
      .insert(consultants)
      .values(consultant)
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
}

export const storage = new DatabaseStorage();
