import { sql } from 'drizzle-orm';
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
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  telefon: varchar("telefon"),
  role: varchar("role").notNull().default('student'), // 'student', 'admin', 'instructor', 'consultant'
  assignedCategories: text("assigned_categories").array().default(sql`ARRAY[]::text[]`), // course categories assigned to student
  // Manual student fields
  tcKimlikNo: varchar("tc_kimlik_no"),
  password: varchar("password"), // For manual students only
  adı: varchar("adi"),
  soyadı: varchar("soyadi"),
  doğumTarihi: date("dogum_tarihi"),
  bitişTarihi: date("bitis_tarihi"), // Course access expiration date
  // Additional student fields
  cinsiyet: varchar("cinsiyet"), // 'Erkek', 'Kadın'
  meslek: varchar("meslek"), // 'Özel Sektör', 'Kamu', 'Serbest Meslek', etc.
  kayıtTarihi: date("kayit_tarihi"), // Registration date
  isMernisOnaylı: boolean("is_mernis_onayli").default(false),
  isÜniversiteOnaylı: boolean("is_universite_onayli").default(false),
  isEDevletOnaylı: boolean("is_edevlet_onayli").default(false),
  isUluslararasıSertifikasyon: boolean("is_uluslararasi_sertifikasyon").default(false),
  selectedCourses: text("selected_courses").array().default(sql`ARRAY[]::text[]`), // Course IDs
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).default('0'),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default('0'),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }).default('0'),
  isManualStudent: boolean("is_manual_student").default(false),
  createdBy: varchar("created_by"), // Kursiyeri kim oluşturdu
  lastLogin: timestamp("last_login").defaultNow(), // Son giriş tarihi
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(), // Kurs ismi
  description: text("description"), // Kurs açıklama
  instructorId: varchar("instructor_id").references(() => users.id),
  price: decimal("price", { precision: 10, scale: 2 }), // Ücret
  totalLessons: integer("total_lessons").default(0), // Toplam ders sayısı (15 ders gibi)
  status: varchar("status").notNull().default('active'), // 'active', 'inactive'
  category: varchar("category").notNull().default('Genel'), // course category for assignment
  thumbnail: varchar("thumbnail"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Kurs dersleri tablosu - Her kursun birden fazla dersi olabilir
export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  title: varchar("title").notNull(), // "Eğitim bölümünün ismini giriniz" alanı
  orderIndex: integer("order_index").notNull(), // Ders sıralaması (1, 2, 3...)
  pdfUrl: varchar("pdf_url"), // PDF dosyasının Object Storage URL'i
  pdfFileName: varchar("pdf_file_name"), // Orijinal PDF dosya adı
  duration: integer("duration"), // Ders süresi (dakika)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => users.id),
  courseId: varchar("course_id").references(() => courses.id),
  progress: integer("progress").default(0), // percentage 0-100
  status: varchar("status").notNull().default('active'), // 'active', 'completed', 'paused'
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  lastActivity: timestamp("last_activity").defaultNow(),
});

export const exams = pgTable("exams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id),
  title: varchar("title").notNull(),
  description: text("description"),
  maxScore: integer("max_score").default(100),
  createdAt: timestamp("created_at").defaultNow(),
});

export const examQuestions = pgTable("exam_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  examId: varchar("exam_id").references(() => exams.id),
  questionText: text("question_text").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: varchar("correct_answer").notNull(), // 'A', 'B', 'C', or 'D'
  orderIndex: integer("order_index").notNull(), // Question order
  createdAt: timestamp("created_at").defaultNow(),
});

export const examResults = pgTable("exam_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  examId: varchar("exam_id").references(() => exams.id),
  studentId: varchar("student_id").references(() => users.id),
  score: integer("score"),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(), // 'course_created', 'course_updated', 'course_deleted', 'student_added', etc.
  description: text("description").notNull(),
  entityId: varchar("entity_id"), // ID of affected entity (course id, student id, etc.)
  entityType: varchar("entity_type"), // 'course', 'student', 'integration', etc.
  metadata: jsonb("metadata"), // Additional data like old/new values
  createdAt: timestamp("created_at").defaultNow(),
});

// Sales and consultants tables
export const consultants = pgTable("consultants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tcNo: varchar("tc_no").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  title: varchar("title").notNull().default('Danışman'), // 'Danışman' (limited access), 'Müdür' (full admin access)
  email: varchar("email"),
  phone: varchar("phone"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id),
  studentId: varchar("student_id").references(() => users.id),
  courseId: varchar("course_id").references(() => courses.id),
  saleAmount: decimal("sale_amount", { precision: 10, scale: 2 }).notNull(),
  collectedAmount: decimal("collected_amount", { precision: 10, scale: 2 }).default('0'),
  remainingAmount: decimal("remaining_amount", { precision: 10, scale: 2 }).default('0'),
  saleDate: date("sale_date").defaultNow(),
  paymentStatus: varchar("payment_status").notNull().default('pending'), // 'pending', 'partial', 'completed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const integrations = pgTable("integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // 'sms', 'payment'
  name: varchar("name").notNull(),
  config: jsonb("config").notNull(), // Store API keys and settings
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  coursesInstructed: many(courses),
  enrollments: many(enrollments),
  examResults: many(examResults),
  activities: many(activities),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  lessons: many(lessons), // Kursa ait dersler
  enrollments: many(enrollments),
  exams: many(exams),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(users, {
    fields: [enrollments.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const examsRelations = relations(exams, ({ one, many }) => ({
  course: one(courses, {
    fields: [exams.courseId],
    references: [courses.id],
  }),
  questions: many(examQuestions),
  results: many(examResults),
}));

export const examQuestionsRelations = relations(examQuestions, ({ one }) => ({
  exam: one(exams, {
    fields: [examQuestions.examId],
    references: [exams.id],
  }),
}));

export const examResultsRelations = relations(examResults, ({ one }) => ({
  exam: one(exams, {
    fields: [examResults.examId],
    references: [exams.id],
  }),
  student: one(users, {
    fields: [examResults.studentId],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const consultantsRelations = relations(consultants, ({ one, many }) => ({
  user: one(users, {
    fields: [consultants.userId],
    references: [users.id],
  }),
  sales: many(sales),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  consultant: one(consultants, {
    fields: [sales.consultantId],
    references: [consultants.id],
  }),
  student: one(users, {
    fields: [sales.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [sales.courseId],
    references: [courses.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
  lastActivity: true,
});

export const insertExamSchema = createInsertSchema(exams).omit({
  id: true,
  createdAt: true,
});

export const insertExamQuestionSchema = createInsertSchema(examQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertExamResultSchema = createInsertSchema(examResults).omit({
  id: true,
  completedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertConsultantSchema = createInsertSchema(consultants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Exam = typeof exams.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;
export type ExamQuestion = typeof examQuestions.$inferSelect;
export type InsertExamQuestion = z.infer<typeof insertExamQuestionSchema>;
export type ExamResult = typeof examResults.$inferSelect;
export type InsertExamResult = z.infer<typeof insertExamResultSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Consultant = typeof consultants.$inferSelect;
export type InsertConsultant = z.infer<typeof insertConsultantSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;

// Notification schemas
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(), // "email", "sms", "system"
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  status: varchar("status").default("pending"), // "pending", "sent", "failed"
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationTemplates = pgTable("notification_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  type: varchar("type").notNull(), // "email", "sms"
  subject: varchar("subject"), // For emails
  content: text("content").notNull(),
  variables: jsonb("variables").default([]), // Available template variables
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notificationSettings = pgTable("notification_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(true),
  courseReminders: boolean("course_reminders").default(true),
  examNotifications: boolean("exam_notifications").default(true),
  systemUpdates: boolean("system_updates").default(true),
  marketingEmails: boolean("marketing_emails").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type InsertNotificationTemplate = typeof notificationTemplates.$inferInsert;
export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type InsertNotificationSettings = typeof notificationSettings.$inferInsert;
