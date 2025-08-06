-- Algı Akademi Database Schema
-- PostgreSQL database schema for complete deployment

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table (for authentication)
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions(expire);

-- Users table (students, instructors, admins)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    telefon VARCHAR,
    role VARCHAR NOT NULL DEFAULT 'student',
    assigned_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    tc_kimlik_no VARCHAR,
    password VARCHAR,
    adi VARCHAR,
    soyadi VARCHAR,
    dogum_tarihi DATE,
    bitis_tarihi DATE,
    cinsiyet VARCHAR,
    meslek VARCHAR,
    kayit_tarihi DATE,
    is_mernis_onayli BOOLEAN DEFAULT FALSE,
    is_universite_onayli BOOLEAN DEFAULT FALSE,
    is_edevlet_onayli BOOLEAN DEFAULT FALSE,
    is_uluslararasi_sertifikasyon BOOLEAN DEFAULT FALSE,
    selected_courses TEXT[] DEFAULT ARRAY[]::TEXT[],
    total_price DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_price DECIMAL(10,2) DEFAULT 0,
    is_manual_student BOOLEAN DEFAULT FALSE,
    created_by VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    description TEXT,
    instructor_id VARCHAR REFERENCES users(id),
    price DECIMAL(10,2),
    duration INTEGER,
    sections JSONB DEFAULT '[]',
    status VARCHAR NOT NULL DEFAULT 'active',
    category VARCHAR NOT NULL DEFAULT 'Genel',
    thumbnail VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR REFERENCES users(id),
    course_id VARCHAR REFERENCES courses(id),
    progress INTEGER DEFAULT 0,
    status VARCHAR NOT NULL DEFAULT 'active',
    enrolled_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW()
);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id VARCHAR REFERENCES courses(id),
    title VARCHAR NOT NULL,
    description TEXT,
    max_score INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Exam Results table
CREATE TABLE IF NOT EXISTS exam_results (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id VARCHAR REFERENCES exams(id),
    student_id VARCHAR REFERENCES users(id),
    score INTEGER,
    completed_at TIMESTAMP DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR REFERENCES users(id),
    type VARCHAR NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Consultants table
CREATE TABLE IF NOT EXISTS consultants (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    tc_no VARCHAR UNIQUE NOT NULL,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    title VARCHAR NOT NULL DEFAULT 'Danışman',
    email VARCHAR,
    phone VARCHAR,
    user_id VARCHAR REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id VARCHAR REFERENCES consultants(id),
    student_id VARCHAR REFERENCES users(id),
    course_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    total_amount DECIMAL(10,2) DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 0,
    commission_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR NOT NULL DEFAULT 'pending',
    payment_method VARCHAR,
    payment_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Notification tables
CREATE TABLE IF NOT EXISTS notification_templates (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    subject VARCHAR,
    body TEXT NOT NULL,
    type VARCHAR NOT NULL DEFAULT 'email',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_settings (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR REFERENCES users(id),
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR REFERENCES users(id),
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR NOT NULL DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sample data for testing
INSERT INTO users (id, email, first_name, last_name, role, password) 
VALUES ('admin', 'admin@algiakademi.com', 'Admin', 'User', 'admin', '112233')
ON CONFLICT (id) DO NOTHING;

-- Sample courses
INSERT INTO courses (id, title, description, price, duration, category) VALUES
('course-1', 'Yazılım Geliştirme Temelleri', 'Yazılım geliştirmenin temel kavramları ve uygulamaları', 1500.00, 40, 'Yazılım'),
('course-2', 'Dijital Pazarlama', 'Modern dijital pazarlama stratejileri ve araçları', 1200.00, 30, 'Pazarlama'),
('course-3', 'Veri Analizi', 'Büyük veri analizi ve görselleştirme teknikleri', 1800.00, 50, 'Analiz')
ON CONFLICT (id) DO NOTHING;