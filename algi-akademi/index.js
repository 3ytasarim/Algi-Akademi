var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activities: () => activities,
  activitiesRelations: () => activitiesRelations,
  consultants: () => consultants,
  consultantsRelations: () => consultantsRelations,
  courses: () => courses,
  coursesRelations: () => coursesRelations,
  enrollments: () => enrollments,
  enrollmentsRelations: () => enrollmentsRelations,
  examResults: () => examResults,
  examResultsRelations: () => examResultsRelations,
  exams: () => exams,
  examsRelations: () => examsRelations,
  insertActivitySchema: () => insertActivitySchema,
  insertConsultantSchema: () => insertConsultantSchema,
  insertCourseSchema: () => insertCourseSchema,
  insertEnrollmentSchema: () => insertEnrollmentSchema,
  insertExamResultSchema: () => insertExamResultSchema,
  insertExamSchema: () => insertExamSchema,
  insertIntegrationSchema: () => insertIntegrationSchema,
  insertSaleSchema: () => insertSaleSchema,
  insertUserSchema: () => insertUserSchema,
  integrations: () => integrations,
  notificationSettings: () => notificationSettings,
  notificationTemplates: () => notificationTemplates,
  notifications: () => notifications,
  sales: () => sales,
  salesRelations: () => salesRelations,
  sessions: () => sessions,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  date
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  telefon: varchar("telefon"),
  role: varchar("role").notNull().default("student"),
  // 'student', 'admin', 'instructor'
  assignedCategories: text("assigned_categories").array().default(sql`ARRAY[]::text[]`),
  // course categories assigned to student
  // Manual student fields
  tcKimlikNo: varchar("tc_kimlik_no"),
  password: varchar("password"),
  // For manual students only
  ad\u0131: varchar("adi"),
  soyad\u0131: varchar("soyadi"),
  do\u011FumTarihi: date("dogum_tarihi"),
  biti\u015FTarihi: date("bitis_tarihi"),
  // Course access expiration date
  // Additional student fields
  cinsiyet: varchar("cinsiyet"),
  // 'Erkek', 'Kadın'
  meslek: varchar("meslek"),
  // 'Özel Sektör', 'Kamu', 'Serbest Meslek', etc.
  kay\u0131tTarihi: date("kayit_tarihi"),
  // Registration date
  isMernisOnayl\u0131: boolean("is_mernis_onayli").default(false),
  is\u00DCniversiteOnayl\u0131: boolean("is_universite_onayli").default(false),
  isEDevletOnayl\u0131: boolean("is_edevlet_onayli").default(false),
  isUluslararas\u0131Sertifikasyon: boolean("is_uluslararasi_sertifikasyon").default(false),
  selectedCourses: text("selected_courses").array().default(sql`ARRAY[]::text[]`),
  // Course IDs
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }).default("0"),
  isManualStudent: boolean("is_manual_student").default(false),
  createdBy: varchar("created_by"),
  // Kursiyeri kim oluşturdu
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  instructorId: varchar("instructor_id").references(() => users.id),
  price: decimal("price", { precision: 10, scale: 2 }),
  duration: integer("duration"),
  // section count (toplam ders sayısı)
  sections: jsonb("sections").default("[]"),
  // array of sections with name and pdf info
  status: varchar("status").notNull().default("active"),
  // 'active', 'inactive', 'starting'
  category: varchar("category").notNull().default("Genel"),
  // course category for assignment
  thumbnail: varchar("thumbnail"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => users.id),
  courseId: varchar("course_id").references(() => courses.id),
  progress: integer("progress").default(0),
  // percentage 0-100
  status: varchar("status").notNull().default("active"),
  // 'active', 'completed', 'paused'
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  lastActivity: timestamp("last_activity").defaultNow()
});
var exams = pgTable("exams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id),
  title: varchar("title").notNull(),
  description: text("description"),
  maxScore: integer("max_score").default(100),
  createdAt: timestamp("created_at").defaultNow()
});
var examResults = pgTable("exam_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  examId: varchar("exam_id").references(() => exams.id),
  studentId: varchar("student_id").references(() => users.id),
  score: integer("score"),
  completedAt: timestamp("completed_at").defaultNow()
});
var activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(),
  // 'course_created', 'course_updated', 'course_deleted', 'student_added', etc.
  description: text("description").notNull(),
  entityId: varchar("entity_id"),
  // ID of affected entity (course id, student id, etc.)
  entityType: varchar("entity_type"),
  // 'course', 'student', 'integration', etc.
  metadata: jsonb("metadata"),
  // Additional data like old/new values
  createdAt: timestamp("created_at").defaultNow()
});
var consultants = pgTable("consultants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tcNo: varchar("tc_no").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  title: varchar("title").notNull().default("Dan\u0131\u015Fman"),
  // 'Danışman', 'Uzman', 'Koordinatör'
  email: varchar("email"),
  phone: varchar("phone"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id),
  studentId: varchar("student_id").references(() => users.id),
  courseId: varchar("course_id").references(() => courses.id),
  saleAmount: decimal("sale_amount", { precision: 10, scale: 2 }).notNull(),
  collectedAmount: decimal("collected_amount", { precision: 10, scale: 2 }).default("0"),
  remainingAmount: decimal("remaining_amount", { precision: 10, scale: 2 }).default("0"),
  saleDate: date("sale_date").defaultNow(),
  paymentStatus: varchar("payment_status").notNull().default("pending"),
  // 'pending', 'partial', 'completed'
  createdAt: timestamp("created_at").defaultNow()
});
var integrations = pgTable("integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(),
  // 'sms', 'payment'
  name: varchar("name").notNull(),
  config: jsonb("config").notNull(),
  // Store API keys and settings
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  coursesInstructed: many(courses),
  enrollments: many(enrollments),
  examResults: many(examResults),
  activities: many(activities)
}));
var coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id]
  }),
  enrollments: many(enrollments),
  exams: many(exams)
}));
var enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(users, {
    fields: [enrollments.studentId],
    references: [users.id]
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id]
  })
}));
var examsRelations = relations(exams, ({ one, many }) => ({
  course: one(courses, {
    fields: [exams.courseId],
    references: [courses.id]
  }),
  results: many(examResults)
}));
var examResultsRelations = relations(examResults, ({ one }) => ({
  exam: one(exams, {
    fields: [examResults.examId],
    references: [exams.id]
  }),
  student: one(users, {
    fields: [examResults.studentId],
    references: [users.id]
  })
}));
var activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id]
  })
}));
var consultantsRelations = relations(consultants, ({ one, many }) => ({
  user: one(users, {
    fields: [consultants.userId],
    references: [users.id]
  }),
  sales: many(sales)
}));
var salesRelations = relations(sales, ({ one }) => ({
  consultant: one(consultants, {
    fields: [sales.consultantId],
    references: [consultants.id]
  }),
  student: one(users, {
    fields: [sales.studentId],
    references: [users.id]
  }),
  course: one(courses, {
    fields: [sales.courseId],
    references: [courses.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
  lastActivity: true
});
var insertExamSchema = createInsertSchema(exams).omit({
  id: true,
  createdAt: true
});
var insertExamResultSchema = createInsertSchema(examResults).omit({
  id: true,
  completedAt: true
});
var insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true
});
var insertConsultantSchema = createInsertSchema(consultants).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true
});
var insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(),
  // "email", "sms", "system"
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  status: varchar("status").default("pending"),
  // "pending", "sent", "failed"
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var notificationTemplates = pgTable("notification_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  type: varchar("type").notNull(),
  // "email", "sms"
  subject: varchar("subject"),
  // For emails
  content: text("content").notNull(),
  variables: jsonb("variables").default([]),
  // Available template variables
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var notificationSettings = pgTable("notification_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(true),
  courseReminders: boolean("course_reminders").default(true),
  examNotifications: boolean("exam_notifications").default(true),
  systemUpdates: boolean("system_updates").default(true),
  marketingEmails: boolean("marketing_emails").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, count, and, sql as sql2 } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations (required for Replit Auth)
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const userDataWithDefaults = {
      ...userData,
      role: userData.role || "student"
    };
    const [user] = await db.insert(users).values(userDataWithDefaults).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userDataWithDefaults,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // Course operations
  async getCourses() {
    return await db.select().from(courses).orderBy(desc(courses.createdAt));
  }
  async getCourse(id) {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }
  async createCourse(course) {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }
  async updateCourse(id, course) {
    const [updatedCourse] = await db.update(courses).set({ ...course, updatedAt: /* @__PURE__ */ new Date() }).where(eq(courses.id, id)).returning();
    return updatedCourse;
  }
  async deleteCourse(id) {
    await db.delete(courses).where(eq(courses.id, id));
  }
  // Enrollment operations
  async getEnrollments() {
    const results = await db.select().from(enrollments).leftJoin(users, eq(enrollments.studentId, users.id)).leftJoin(courses, eq(enrollments.courseId, courses.id)).orderBy(desc(enrollments.lastActivity));
    return results.map((result) => ({
      ...result.enrollments,
      student: result.users,
      course: result.courses
    }));
  }
  async getEnrollmentsByStudent(studentId) {
    const results = await db.select().from(enrollments).leftJoin(courses, eq(enrollments.courseId, courses.id)).where(eq(enrollments.studentId, studentId));
    return results.map((result) => ({
      ...result.enrollments,
      course: result.courses
    }));
  }
  async getCoursesByUserCategories(userId) {
    const user = await this.getUser(userId);
    if (!user?.assignedCategories || user.assignedCategories.length === 0) {
      return [];
    }
    return await db.select().from(courses).where(
      and(
        eq(courses.status, "active"),
        sql2`${courses.category} = ANY(${user.assignedCategories})`
      )
    ).orderBy(desc(courses.createdAt));
  }
  async getUsersByRole(role) {
    return await db.select().from(users).where(eq(users.role, role)).orderBy(desc(users.createdAt));
  }
  async getEnrollmentsByCourse(courseId) {
    const results = await db.select().from(enrollments).leftJoin(users, eq(enrollments.studentId, users.id)).where(eq(enrollments.courseId, courseId));
    return results.map((result) => ({
      ...result.enrollments,
      student: result.users
    }));
  }
  async createEnrollment(enrollment) {
    const [newEnrollment] = await db.insert(enrollments).values(enrollment).returning();
    return newEnrollment;
  }
  async updateEnrollment(id, enrollment) {
    const [updatedEnrollment] = await db.update(enrollments).set({ ...enrollment, lastActivity: /* @__PURE__ */ new Date() }).where(eq(enrollments.id, id)).returning();
    return updatedEnrollment;
  }
  // Exam operations
  async getExams() {
    return await db.select().from(exams).orderBy(desc(exams.createdAt));
  }
  async getExamsByCourse(courseId) {
    return await db.select().from(exams).where(eq(exams.courseId, courseId));
  }
  async createExam(exam) {
    const [newExam] = await db.insert(exams).values(exam).returning();
    return newExam;
  }
  // Exam result operations
  async getExamResults() {
    const results = await db.select().from(examResults).leftJoin(exams, eq(examResults.examId, exams.id)).leftJoin(users, eq(examResults.studentId, users.id)).orderBy(desc(examResults.completedAt));
    return results.map((result) => ({
      ...result.exam_results,
      exam: result.exams,
      student: result.users
    }));
  }
  async getExamResultsByStudent(studentId) {
    const results = await db.select().from(examResults).leftJoin(exams, eq(examResults.examId, exams.id)).where(eq(examResults.studentId, studentId));
    return results.map((result) => ({
      ...result.exam_results,
      exam: result.exams
    }));
  }
  async createExamResult(result) {
    const [newResult] = await db.insert(examResults).values(result).returning();
    return newResult;
  }
  // Activity operations
  async getRecentActivities(limit = 10) {
    return await db.select().from(activities).orderBy(desc(activities.createdAt)).limit(limit);
  }
  async createActivity(activity) {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }
  // Dashboard stats
  async getDashboardStats() {
    const [totalRegistrations] = await db.select({ count: count() }).from(users).where(eq(users.role, "student"));
    const allStudents = await db.select().from(users).where(eq(users.role, "student"));
    const realStudents = allStudents.filter(
      (student) => student.ad\u0131 || student.firstName || student.tcKimlikNo
    );
    const [courseCount] = await db.select({ count: count() }).from(courses).where(eq(courses.status, "active"));
    const currentMonth = (/* @__PURE__ */ new Date()).getMonth();
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const monthlyStudents = await db.select().from(users).where(
      and(
        eq(users.role, "student"),
        sql2`EXTRACT(MONTH FROM ${users.createdAt}) = ${currentMonth + 1}`,
        sql2`EXTRACT(YEAR FROM ${users.createdAt}) = ${currentYear}`
      )
    );
    const monthlyRevenue = monthlyStudents.reduce((total, student) => {
      const finalPrice = parseFloat(student.finalPrice || "0");
      return total + finalPrice;
    }, 0);
    return {
      totalRegistrations: totalRegistrations.count,
      totalStudents: realStudents.length,
      activeCourses: courseCount.count,
      monthlyRevenue
    };
  }
  // Consultant operations
  async getConsultants() {
    return await db.select().from(consultants).orderBy(desc(consultants.createdAt));
  }
  async getConsultant(id) {
    const [consultant] = await db.select().from(consultants).where(eq(consultants.id, id));
    return consultant;
  }
  async createConsultant(consultant) {
    const [newConsultant] = await db.insert(consultants).values(consultant).returning();
    return newConsultant;
  }
  async updateConsultant(id, consultant) {
    const [updatedConsultant] = await db.update(consultants).set({ ...consultant, updatedAt: /* @__PURE__ */ new Date() }).where(eq(consultants.id, id)).returning();
    return updatedConsultant;
  }
  async deleteConsultant(id) {
    await db.delete(consultants).where(eq(consultants.id, id));
  }
  // Sales operations
  async getSales() {
    const results = await db.select().from(sales).leftJoin(consultants, eq(sales.consultantId, consultants.id)).leftJoin(users, eq(sales.studentId, users.id)).leftJoin(courses, eq(sales.courseId, courses.id)).orderBy(desc(sales.createdAt));
    return results.map((result) => ({
      ...result.sales,
      consultant: result.consultants,
      student: result.users,
      course: result.courses
    }));
  }
  async createSale(sale) {
    const [newSale] = await db.insert(sales).values(sale).returning();
    return newSale;
  }
  // Integration operations
  async getIntegrations() {
    return await db.select().from(integrations).orderBy(desc(integrations.createdAt));
  }
  async createIntegration(integration) {
    const [newIntegration] = await db.insert(integrations).values(integration).returning();
    return newIntegration;
  }
  async updateIntegration(id, integration) {
    const [updatedIntegration] = await db.update(integrations).set({ ...integration, updatedAt: /* @__PURE__ */ new Date() }).where(eq(integrations.id, id)).returning();
    return updatedIntegration;
  }
  // Student operations implementation
  async getStudents() {
    return this.getUsersByRole("student");
  }
  async createStudent(studentData) {
    const [student] = await db.insert(users).values({
      email: studentData.email,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      tcKimlikNo: studentData.tcKimlikNo,
      password: studentData.password,
      ad\u0131: studentData.ad\u0131,
      soyad\u0131: studentData.soyad\u0131,
      do\u011FumTarihi: studentData.do\u011FumTarihi,
      telefon: studentData.telefon,
      cinsiyet: studentData.cinsiyet,
      meslek: studentData.meslek,
      kay\u0131tTarihi: studentData.kay\u0131tTarihi,
      biti\u015FTarihi: studentData.biti\u015FTarihi,
      isMernisOnayl\u0131: studentData.isMernisOnayl\u0131,
      is\u00DCniversiteOnayl\u0131: studentData.is\u00DCniversiteOnayl\u0131,
      isEDevletOnayl\u0131: studentData.isEDevletOnayl\u0131,
      isUluslararas\u0131Sertifikasyon: studentData.isUluslararas\u0131Sertifikasyon,
      selectedCourses: studentData.selectedCourses || [],
      totalPrice: studentData.totalPrice,
      discountAmount: studentData.discountAmount,
      finalPrice: studentData.finalPrice,
      role: "student",
      isManualStudent: studentData.isManualStudent || true
    }).returning();
    return student;
  }
  async updateStudent(id, studentData) {
    const [updatedStudent] = await db.update(users).set({
      email: studentData.email,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      tcKimlikNo: studentData.tcKimlikNo,
      ad\u0131: studentData.ad\u0131,
      soyad\u0131: studentData.soyad\u0131,
      do\u011FumTarihi: studentData.do\u011FumTarihi,
      telefon: studentData.telefon,
      cinsiyet: studentData.cinsiyet,
      meslek: studentData.meslek,
      kay\u0131tTarihi: studentData.kay\u0131tTarihi,
      biti\u015FTarihi: studentData.biti\u015FTarihi,
      isMernisOnayl\u0131: studentData.isMernisOnayl\u0131,
      is\u00DCniversiteOnayl\u0131: studentData.is\u00DCniversiteOnayl\u0131,
      isEDevletOnayl\u0131: studentData.isEDevletOnayl\u0131,
      isUluslararas\u0131Sertifikasyon: studentData.isUluslararas\u0131Sertifikasyon,
      selectedCourses: studentData.selectedCourses || [],
      totalPrice: studentData.totalPrice,
      discountAmount: studentData.discountAmount,
      finalPrice: studentData.finalPrice,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, id)).returning();
    return updatedStudent;
  }
  async deleteStudent(id) {
    await db.delete(users).where(eq(users.id, id));
  }
  async getStudentByTcNo(tcKimlikNo) {
    const [student] = await db.select().from(users).where(eq(users.tcKimlikNo, tcKimlikNo));
    return student;
  }
  // Notification operations
  async getNotifications() {
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }
  async createNotification(data) {
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
  }
  async getNotificationTemplates() {
    return await db.select().from(notificationTemplates).where(eq(notificationTemplates.isActive, true)).orderBy(desc(notificationTemplates.createdAt));
  }
  async createNotificationTemplate(data) {
    const [template] = await db.insert(notificationTemplates).values(data).returning();
    return template;
  }
  async getNotificationSettings(userId) {
    const [settings] = await db.select().from(notificationSettings).where(eq(notificationSettings.userId, userId));
    return settings || {
      emailEnabled: true,
      smsEnabled: true,
      courseReminders: true,
      examNotifications: true,
      systemUpdates: true,
      marketingEmails: false
    };
  }
  async updateNotificationSettings(userId, data) {
    const [settings] = await db.insert(notificationSettings).values({ userId, ...data }).onConflictDoUpdate({
      target: notificationSettings.userId,
      set: { ...data, updatedAt: /* @__PURE__ */ new Date() }
    }).returning();
    return settings;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.use((req, res, next) => {
    if (!req.session.auth) {
      req.session.auth = { isAuthenticated: false, user: null };
    }
    next();
  });
  app2.get("/api/auth/user", async (req, res) => {
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
  app2.post("/api/auth/admin-login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (username === "admin" && password === "112233") {
        req.session.auth = {
          isAuthenticated: true,
          user: {
            id: "admin",
            username: "admin",
            role: "admin",
            firstName: "Admin",
            lastName: "User"
          }
        };
        res.json({
          message: "Giri\u015F ba\u015Far\u0131l\u0131",
          user: req.session.auth.user
        });
      } else {
        res.status(401).json({ message: "Ge\xE7ersiz kullan\u0131c\u0131 ad\u0131 veya \u015Fifre" });
      }
    } catch (error) {
      console.error("Error in admin login:", error);
      res.status(500).json({ message: "Giri\u015F i\u015Flemi ba\u015Far\u0131s\u0131z" });
    }
  });
  app2.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.auth = { isAuthenticated: false, user: null };
      res.json({ message: "\xC7\u0131k\u0131\u015F ba\u015Far\u0131l\u0131" });
    } catch (error) {
      console.error("Error in logout:", error);
      res.status(500).json({ message: "\xC7\u0131k\u0131\u015F i\u015Flemi ba\u015Far\u0131s\u0131z" });
    }
  });
  app2.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/api/courses", async (req, res) => {
    try {
      const courses2 = await storage.getCourses();
      res.json(courses2);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });
  app2.get("/api/courses/:id", async (req, res) => {
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
  app2.post("/api/courses", async (req, res) => {
    try {
      const validatedData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(validatedData);
      if (req.session.auth?.isAuthenticated) {
        await storage.createActivity({
          userId: req.session.auth.user.id,
          type: "course_created",
          description: `${req.session.auth.user.firstName || "Admin"} yeni kurs olu\u015Fturdu: ${course.title}`,
          entityId: course.id,
          entityType: "course",
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
  app2.put("/api/courses/:id", async (req, res) => {
    try {
      if (!req.session.auth || !req.session.auth.isAuthenticated) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const validatedData = insertCourseSchema.parse(req.body);
      const course = await storage.updateCourse(req.params.id, validatedData);
      if (req.session.auth?.isAuthenticated) {
        await storage.createActivity({
          userId: req.session.auth.user.id,
          type: "course_updated",
          description: `${req.session.auth.user.firstName || "Admin"} kursu g\xFCncelledi: ${course.title}`,
          entityId: course.id,
          entityType: "course",
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
  app2.delete("/api/courses/:id", async (req, res) => {
    try {
      if (!req.session.auth || !req.session.auth.isAuthenticated) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      await storage.deleteCourse(req.params.id);
      try {
        await storage.createActivity({
          userId: req.session.auth.user.id,
          type: "course_deleted",
          description: `${req.session.auth.user.firstName || "Admin"} kursu sildi: ${course.title}`,
          entityId: req.params.id,
          entityType: "course",
          metadata: { courseTitle: course.title, deletedAt: (/* @__PURE__ */ new Date()).toISOString() }
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
  app2.get("/api/enrollments", async (req, res) => {
    try {
      const enrollments2 = await storage.getEnrollments();
      res.json(enrollments2);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });
  app2.get("/api/activities", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const activities2 = await storage.getRecentActivities(limit);
      res.json(activities2);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });
  app2.get("/api/consultants", async (req, res) => {
    try {
      const consultants2 = await storage.getConsultants();
      res.json(consultants2);
    } catch (error) {
      console.error("Error fetching consultants:", error);
      res.status(500).json({ message: "Failed to fetch consultants" });
    }
  });
  app2.post("/api/consultants", async (req, res) => {
    try {
      const consultant = await storage.createConsultant(req.body);
      res.status(201).json(consultant);
    } catch (error) {
      console.error("Error creating consultant:", error);
      res.status(500).json({ message: "Failed to create consultant" });
    }
  });
  app2.put("/api/consultants/:id", async (req, res) => {
    try {
      const consultant = await storage.updateConsultant(req.params.id, req.body);
      res.json(consultant);
    } catch (error) {
      console.error("Error updating consultant:", error);
      res.status(500).json({ message: "Failed to update consultant" });
    }
  });
  app2.delete("/api/consultants/:id", async (req, res) => {
    try {
      await storage.deleteConsultant(req.params.id);
      res.json({ message: "Consultant deleted successfully" });
    } catch (error) {
      console.error("Error deleting consultant:", error);
      res.status(500).json({ message: "Failed to delete consultant" });
    }
  });
  app2.get("/api/sales", async (req, res) => {
    try {
      const sales2 = await storage.getSales();
      res.json(sales2);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });
  app2.get("/api/integrations", async (req, res) => {
    try {
      const integrations2 = await storage.getIntegrations();
      res.json(integrations2);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });
  app2.post("/api/integrations", async (req, res) => {
    try {
      const integration = await storage.createIntegration(req.body);
      if (req.session.auth?.isAuthenticated) {
        try {
          await storage.createActivity({
            userId: req.session.auth.user.id,
            type: "integration_updated",
            description: `${req.session.auth.user.firstName || "Admin"} entegrasyon ayarlar\u0131n\u0131 g\xFCncelledi: ${integration.name}`,
            entityId: integration.id,
            entityType: "integration",
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
  app2.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });
  app2.post("/api/students", async (req, res) => {
    try {
      console.log("Creating student with data:", req.body);
      const student = await storage.createStudent({
        ad\u0131: req.body.ad\u0131,
        soyad\u0131: req.body.soyad\u0131,
        email: req.body.email,
        tcKimlikNo: req.body.tcKimlikNo,
        do\u011FumTarihi: req.body.do\u011FumTarihi,
        telefon: req.body.telefon,
        cinsiyet: req.body.cinsiyet,
        meslek: req.body.meslek,
        kay\u0131tTarihi: req.body.kay\u0131tTarihi,
        biti\u015FTarihi: req.body.biti\u015FTarihi,
        isMernisOnayl\u0131: req.body.isMernisOnayl\u0131 === true || req.body.isMernisOnayl\u0131 === "true",
        is\u00DCniversiteOnayl\u0131: req.body.is\u00DCniversiteOnayl\u0131 === true || req.body.is\u00DCniversiteOnayl\u0131 === "true",
        isEDevletOnayl\u0131: req.body.isEDevletOnayl\u0131 === true || req.body.isEDevletOnayl\u0131 === "true",
        isUluslararas\u0131Sertifikasyon: req.body.isUluslararas\u0131Sertifikasyon === true || req.body.isUluslararas\u0131Sertifikasyon === "true",
        selectedCourses: Array.isArray(req.body.selectedCourses) ? req.body.selectedCourses : [],
        totalPrice: req.body.totalPrice || "0",
        discountAmount: req.body.discountAmount || "0",
        finalPrice: req.body.finalPrice || "0",
        isManualStudent: true,
        password: "112233"
        // Default password for manual students
      });
      console.log("Student created successfully:", student.id);
      if (req.session.auth?.isAuthenticated) {
        try {
          await storage.createActivity({
            userId: req.session.auth.user.id,
            type: "student_added",
            description: `${req.session.auth.user.firstName || "Admin"} yeni kursiyer ekledi: ${student.ad\u0131} ${student.soyad\u0131}`,
            entityId: student.id,
            entityType: "student",
            metadata: {
              studentName: `${student.ad\u0131} ${student.soyad\u0131}`,
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
        message: "Kursiyer ba\u015Far\u0131yla kaydedildi",
        student
      });
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({
        success: false,
        message: "Kursiyer kayd\u0131 s\u0131ras\u0131nda bir hata olu\u015Ftu"
      });
    }
  });
  app2.put("/api/students/:id", async (req, res) => {
    try {
      const studentId = req.params.id;
      console.log("Updating student with ID:", studentId, "Data:", req.body);
      const updatedStudent = await storage.updateStudent(studentId, {
        ad\u0131: req.body.ad\u0131,
        soyad\u0131: req.body.soyad\u0131,
        email: req.body.email,
        tcKimlikNo: req.body.tcKimlikNo,
        do\u011FumTarihi: req.body.do\u011FumTarihi,
        telefon: req.body.telefon,
        cinsiyet: req.body.cinsiyet,
        meslek: req.body.meslek,
        kay\u0131tTarihi: req.body.kay\u0131tTarihi,
        biti\u015FTarihi: req.body.biti\u015FTarihi,
        isMernisOnayl\u0131: req.body.isMernisOnayl\u0131 === true || req.body.isMernisOnayl\u0131 === "true",
        is\u00DCniversiteOnayl\u0131: req.body.is\u00DCniversiteOnayl\u0131 === true || req.body.is\u00DCniversiteOnayl\u0131 === "true",
        isEDevletOnayl\u0131: req.body.isEDevletOnayl\u0131 === true || req.body.isEDevletOnayl\u0131 === "true",
        isUluslararas\u0131Sertifikasyon: req.body.isUluslararas\u0131Sertifikasyon === true || req.body.isUluslararas\u0131Sertifikasyon === "true",
        selectedCourses: Array.isArray(req.body.selectedCourses) ? req.body.selectedCourses : [],
        totalPrice: req.body.totalPrice || "0",
        discountAmount: req.body.discountAmount || "0",
        finalPrice: req.body.finalPrice || "0"
      });
      console.log("Student updated successfully:", updatedStudent.id);
      if (req.session.auth?.isAuthenticated) {
        try {
          await storage.createActivity({
            userId: req.session.auth.user.id,
            type: "student_updated",
            description: `${req.session.auth.user.firstName || "Admin"} kursiyer bilgilerini g\xFCncelledi: ${updatedStudent.ad\u0131} ${updatedStudent.soyad\u0131}`,
            entityId: updatedStudent.id,
            entityType: "student",
            metadata: {
              studentName: `${updatedStudent.ad\u0131} ${updatedStudent.soyad\u0131}`,
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            }
          });
        } catch (error) {
          console.log("Skipping activity creation:", error);
        }
      }
      res.status(200).json({
        success: true,
        message: "Kursiyer ba\u015Far\u0131yla g\xFCncellendi",
        student: updatedStudent
      });
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({
        success: false,
        message: "Kursiyer g\xFCncellenirken bir hata olu\u015Ftu"
      });
    }
  });
  app2.delete("/api/students/:id", async (req, res) => {
    try {
      const studentId = req.params.id;
      console.log("Deleting student with ID:", studentId);
      const students = await storage.getStudents();
      const student = students.find((s) => s.id === studentId);
      await storage.deleteStudent(studentId);
      if (req.session.auth?.isAuthenticated && student) {
        try {
          await storage.createActivity({
            userId: req.session.auth.user.id,
            type: "student_deleted",
            description: `${req.session.auth.user.firstName || "Admin"} kursiyer kayd\u0131n\u0131 sildi: ${student.ad\u0131} ${student.soyad\u0131}`,
            entityId: studentId,
            entityType: "student",
            metadata: {
              studentName: `${student.ad\u0131} ${student.soyad\u0131}`,
              deletedAt: (/* @__PURE__ */ new Date()).toISOString()
            }
          });
        } catch (error) {
          console.log("Skipping activity creation:", error);
        }
      }
      console.log("Student deleted successfully:", studentId);
      res.status(200).json({
        success: true,
        message: "Kursiyer ba\u015Far\u0131yla silindi"
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({
        success: false,
        message: "Kursiyer silinirken bir hata olu\u015Ftu"
      });
    }
  });
  app2.post("/api/auth/student-login", async (req, res) => {
    try {
      const { tcKimlikNo, password } = req.body;
      if (password === "112233") {
        const students = await storage.getStudents();
        const student = students.find((s) => s.tcKimlikNo === tcKimlikNo);
        if (student) {
          req.session.auth = {
            user: {
              id: student.id,
              tcKimlikNo: student.tcKimlikNo,
              firstName: student.firstName || student.ad\u0131,
              lastName: student.lastName || student.soyad\u0131,
              role: "student"
            },
            isAuthenticated: true
          };
          res.json({
            message: "Giri\u015F ba\u015Far\u0131l\u0131",
            user: {
              id: student.id,
              tcKimlikNo: student.tcKimlikNo,
              firstName: student.firstName || student.ad\u0131,
              lastName: student.lastName || student.soyad\u0131,
              role: "student"
            }
          });
        } else {
          res.status(401).json({ message: "Bu T.C. kimlik no ile kay\u0131tl\u0131 kullan\u0131c\u0131 bulunamad\u0131" });
        }
      } else {
        res.status(401).json({ message: "Ge\xE7ersiz \u015Fifre" });
      }
    } catch (error) {
      console.error("Student login error:", error);
      res.status(500).json({ message: "Giri\u015F s\u0131ras\u0131nda bir hata olu\u015Ftu" });
    }
  });
  app2.get("/api/student/courses", async (req, res) => {
    try {
      if (!req.session.auth?.isAuthenticated || req.session.auth.user.role !== "student") {
        return res.status(401).json({ message: "\xD6\u011Frenci giri\u015Fi gerekli" });
      }
      const studentId = req.session.auth.user.id;
      const students = await storage.getStudents();
      const student = students.find((s) => s.id === studentId);
      if (!student) {
        return res.status(404).json({ message: "\xD6\u011Frenci bulunamad\u0131" });
      }
      const allCourses = await storage.getCourses();
      const studentCourses = allCourses.filter(
        (course) => student.selectedCourses && student.selectedCourses.includes(course.id)
      );
      res.json(studentCourses);
    } catch (error) {
      console.error("Error fetching student courses:", error);
      res.status(500).json({ message: "Failed to fetch student courses" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
var isProduction = process.env.NODE_ENV === "production";
var sessionConfig;
if (isProduction && process.env.DATABASE_URL) {
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: 24 * 60 * 60 * 1e3,
    // 24 hours
    tableName: "sessions"
  });
  sessionConfig = {
    secret: process.env.SESSION_SECRET || "alg\u0131-akademi-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      // HTTPS not required for replit.app
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  };
} else {
  sessionConfig = {
    secret: "alg\u0131-akademi-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  };
}
app.use(session(sessionConfig));
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
