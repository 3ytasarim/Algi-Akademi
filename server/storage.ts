import {
  users,
  courses,
  lessons,
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
  type Lesson,
  type InsertLesson,
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
import { eq, desc, count, and, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
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
  
  // Lesson operations
  getLessonsByCourse(courseId: string): Promise<Lesson[]>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<Lesson>;
  deleteLesson(id: string): Promise<void>;
  
  // Student operations
  getStudents(): Promise<User[]>;
  createStudent(student: any): Promise<User>;
  updateStudent(id: string, student: any): Promise<User>;
  deleteStudent(id: string): Promise<void>;
  getStudentByTcNo(tcKimlikNo: string): Promise<User | undefined>;
  getUserByTcNo(tcKimlikNo: string): Promise<User | undefined>;
  
  // Dashboard and other operations
  getDashboardStats(): Promise<any>;
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getCoursesByUserCategories(userId: string): Promise<Course[]>;
  getUsersByRole(role: string): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userDataWithDefaults = {
      ...userData,
      role: userData.role || 'student',
    };

    const [user] = await db
      .insert(users)
      .values(userDataWithDefaults)
      .onConflictDoUpdate({
        target: users.id,
        set: { ...userDataWithDefaults, updatedAt: new Date() },
      })
      .returning();
    return user;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await db.update(users)
      .set({ lastLogin: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async updateUserPassword(id: string, newPassword: string): Promise<void> {
    await db.update(users)
      .set({ password: newPassword, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).orderBy(desc(courses.createdAt));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async updateCourse(id: string, courseData: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...courseData, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteCourse(id: string): Promise<void> {
    // First delete related lessons
    await db.delete(lessons).where(eq(lessons.courseId, id));
    // Then delete the course
    await db.delete(courses).where(eq(courses.id, id));
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  // Lesson operations
  async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    return await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, courseId))
      .orderBy(lessons.orderIndex);
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const [newLesson] = await db.insert(lessons).values(lesson).returning();
    return newLesson;
  }

  async updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<Lesson> {
    const [updatedLesson] = await db
      .update(lessons)
      .set({ ...lesson, updatedAt: new Date() })
      .where(eq(lessons.id, id))
      .returning();
    return updatedLesson;
  }

  async deleteLesson(id: string): Promise<void> {
    await db.delete(lessons).where(eq(lessons.id, id));
  }

  // Student operations
  async getStudents(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, 'student')).orderBy(desc(users.createdAt));
  }

  async createStudent(student: any): Promise<User> {
    const [newStudent] = await db.insert(users).values(student).returning();
    return newStudent;
  }

  async updateStudent(id: string, student: any): Promise<User> {
    const [updatedStudent] = await db
      .update(users)
      .set({ ...student, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getStudentByTcNo(tcKimlikNo: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.tcKimlikNo, tcKimlikNo));
    return user;
  }

  async getUserByTcNo(tcKimlikNo: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.tcKimlikNo, tcKimlikNo));
    return user;
  }

  // Dashboard operations
  async getDashboardStats(): Promise<any> {
    const [totalStudents] = await db.select({ count: count() }).from(users).where(eq(users.role, 'student'));
    const [activeCourses] = await db.select({ count: count() }).from(courses).where(eq(courses.status, 'active'));
    
    return {
      totalStudents: totalStudents.count,
      activeCourses: activeCourses.count,
      monthlyRevenue: 0,
    };
  }

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(desc(activities.createdAt)).limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async getCoursesByUserCategories(userId: string): Promise<Course[]> {
    const user = await this.getUser(userId);
    if (!user?.assignedCategories || user.assignedCategories.length === 0) {
      return [];
    }

    return await db
      .select()
      .from(courses)
      .where(and(
        eq(courses.status, 'active'),
        inArray(courses.category, user.assignedCategories)
      ))
      .orderBy(desc(courses.createdAt));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role)).orderBy(desc(users.createdAt));
  }

  // Missing methods for routes compatibility
  async getEnrollments(): Promise<any[]> { return []; }
  async getConsultants(): Promise<any[]> { return []; }
  async createConsultant(data: any): Promise<any> { return {}; }
  async updateConsultant(id: string, data: any): Promise<any> { return {}; }
  async deleteConsultant(id: string): Promise<void> { }
  async getSales(): Promise<any[]> { return []; }
  async getIntegrations(): Promise<any[]> { return []; }
  async createIntegration(data: any): Promise<any> { return {}; }
}

export const storage = new DatabaseStorage();