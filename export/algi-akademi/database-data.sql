-- Algı Akademi - Complete Database Data Export
-- Run this after database-schema.sql

-- Clear existing data (optional)
TRUNCATE users, courses, enrollments, exams, exam_results, activities, consultants, sales, integrations CASCADE;

-- Users data
INSERT INTO users (id, email, first_name, last_name, role, adi, soyadi, password, created_at) VALUES
('admin', 'admin@algiacademy.com', 'Admin', 'User', 'admin', 'Admin', 'Kullanıcı', '112233', NOW()),
('45819635', '3ytasarim@gmail.com', 'Admin', 'User', 'admin', 'Admin', 'Kullanıcı', '112233', NOW()),
('584ab19f-e85d-465e-b290-265b3d9acd60', 'test@test.com', 'Test', 'Student', 'student', 'Rauf Onur', 'Çullu', NULL, NOW());

-- Sample courses with Turkish content
INSERT INTO courses (id, title, description, price, duration, category, status) VALUES
('course-1', 'Yazılım Geliştirme Temelleri', 'Modern yazılım geliştirme teknikleri ve best practices', 1500.00, 40, 'Yazılım', 'active'),
('course-2', 'Dijital Pazarlama Stratejileri', 'Sosyal medya, SEO ve dijital reklamcılık', 1200.00, 30, 'Pazarlama', 'active'),
('course-3', 'Veri Analizi ve Görselleştirme', 'Python ve R ile veri analizi', 1800.00, 50, 'Analiz', 'active'),
('course-4', 'UI/UX Tasarım Fundamentals', 'Kullanıcı deneyimi tasarımı ve prototipleme', 1400.00, 35, 'Tasarım', 'active'),
('course-5', 'Proje Yönetimi ve Agile', 'Scrum, Kanban ve proje yönetim araçları', 1300.00, 25, 'Yönetim', 'active');

-- Sample enrollments
INSERT INTO enrollments (id, student_id, course_id, progress, status) VALUES
(gen_random_uuid(), '584ab19f-e85d-465e-b290-265b3d9acd60', 'course-1', 25, 'active'),
(gen_random_uuid(), '584ab19f-e85d-465e-b290-265b3d9acd60', 'course-2', 0, 'active');

-- Sample activities
INSERT INTO activities (id, user_id, type, description) VALUES
(gen_random_uuid(), '584ab19f-e85d-465e-b290-265b3d9acd60', 'enrollment', 'Yazılım Geliştirme Temelleri kursuna kayıt oldu'),
(gen_random_uuid(), '584ab19f-e85d-465e-b290-265b3d9acd60', 'enrollment', 'Dijital Pazarlama Stratejileri kursuna kayıt oldu'),
(gen_random_uuid(), 'admin', 'course_created', 'Yeni kurs oluşturuldu: UI/UX Tasarım Fundamentals');

-- Sample consultants
INSERT INTO consultants (id, tc_no, first_name, last_name, title, email, phone) VALUES
(gen_random_uuid(), '12345678901', 'Ayşe', 'Demir', 'Uzman Danışman', 'ayse.demir@algiacademy.com', '0532 123 45 67'),
(gen_random_uuid(), '98765432109', 'Mehmet', 'Kaya', 'Satış Danışmanı', 'mehmet.kaya@algiacademy.com', '0533 987 65 43');

-- Sample integrations
INSERT INTO integrations (id, type, name, config, is_active) VALUES
(gen_random_uuid(), 'sms', 'Twilio SMS', '{"api_key": "", "account_sid": "", "phone_number": ""}', false),
(gen_random_uuid(), 'payment', 'Stripe Payment', '{"public_key": "", "secret_key": ""}', false),
(gen_random_uuid(), 'email', 'SendGrid Email', '{"api_key": "", "from_email": ""}', false);