# Overview
Algı Akademi is a comprehensive CRM-based educational management system with Admin and Student dashboards. Its purpose is to streamline educational operations, from course management and student enrollment to sales tracking and performance analysis. The system aims to provide a professional and intuitive user experience with Turkish language support and modern UI design, enhancing educational delivery and administrative efficiency.

# User Preferences
Preferred communication style: Simple, everyday language.

**CRITICAL: Production Database Connection**
- All database operations MUST use: postgresql://neondb_owner:npg_sa6Fi0IofpNq@ep-square-bar-aemr0mg3.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
- User's actual production data is in this database
- Real "Deneme" course ID: 1b0542d6-cf0f-4916-9c4b-033468e7cfb4

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite
- **UI/UX Decisions**: Professional and intuitive design with Turkish language support, consistent layout between admin and student panels (flexbox for layout, admin navbar style applied to student pages), dynamic notifications, real-time countdown timer.

## Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API endpoints
- **Development**: Hot reload with tsx

## Authentication & Authorization
- **Provider**: Replit OpenID Connect (OIDC) integration
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Authorization**: Role-based access control (student, instructor, admin, consultant)
- **Security**: HTTP-only cookies
- **Features**: Automatic user creation on consultant addition, last login timestamp tracking.

## Database Design
- **Primary Database**: PostgreSQL with Neon serverless connection
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Entities**: Users (admin/student/consultant), Courses, Enrollments, Exams, Exam Questions, Exam Results, Activities, Sales, Integrations, Lessons.
- **Relationships**: Proper foreign key constraints with cascade delete (exam deletion automatically removes associated questions).
- **Schema Features**: `lastLogin` timestamp in users table, `lessons` table for multi-lesson courses, `totalLessons` in courses table, `examQuestions` table with CASCADE DELETE for exam-question relationship.

## Development Workflow
- **Monorepo Structure**: Shared TypeScript types between client and server
- **Path Aliases**: Configured for clean imports (@/, @shared/, @assets/)
- **Type Safety**: End-to-end TypeScript with strict configuration
- **Monorepo Structure**: Shared TypeScript types between client and server
- **Path Aliases**: Configured for clean imports (@/, @shared/, @assets/)
- **Type Safety**: End-to-end TypeScript with strict configuration

## Core Features
- **Course Management**: Creation and editing of courses with multiple lessons and individual PDF upload capabilities.
- **Student Management**: Enrollment, profile management, activity tracking, and dynamic course content display.
- **PDF Management**: Integration with object storage for real PDF file uploads and serving.
- **User Roles**: Admin, Student, Consultant roles with distinct access levels and functionalities.
- **Reporting/Analytics**: Real-time activity notifications and performance tracking.
- **SMS Integration**: 
  - Automatic welcome SMS sending when new students are created
  - Database-backed SMS templates system with 4 professional templates (welcome, password reset, course start, payment reminder)
  - Admin panel SMS sending: Select any student → Choose template → Auto-fill variables (isim, tc, sifre, link) → Send via NetGSM
  - Template variables support for dynamic content
  - Auto-seeding of templates on server startup for production database
- **Exam Management System**: Complete exam system with multiple-choice questions (A/B/C/D options), course association, edit/delete functionality, and student-specific exam display based on enrolled courses.

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting

## Authentication Services
- **Replit Identity**: OIDC-based authentication provider

## UI & Component Libraries
- **Radix UI**: Accessible, unstyled UI primitives
- **Lucide React**: Icon library
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **shadcn/ui**: UI components built with Radix UI and Tailwind CSS

## Development Tools
- **Vite Plugins**: React plugin, Runtime error overlay, Cartographer
- **Drizzle Kit**: Database schema management and migrations
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **Multer**: For handling multipart file uploads in the backend.

## Build & Deployment
- **ESBuild**: Fast bundling for server-side code
- **Vite Build**: Optimized frontend production builds
- **Static Assets**: Served through Express
- **Deployment Configuration**: Autoscale deployment (required for Node.js runtime and backend API)
- **Google Cloud Storage (GCS)**: For object storage of PDF files.