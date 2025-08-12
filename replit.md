# Overview

Algı Akademi is a comprehensive CRM-based educational management system designed with dual interfaces: an Admin dashboard for management and a Student dashboard for learning activities. Its purpose is to streamline educational operations, from course management and student enrollment to sales tracking and performance analysis. The system aims to provide a professional and intuitive user experience with Turkish language support and modern UI design, enhancing educational delivery and administrative efficiency.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite

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
- **Authorization**: Role-based access control (student, instructor, admin)
- **Security**: HTTP-only cookies

## Database Design
- **Primary Database**: PostgreSQL with Neon serverless connection
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Entities**: Users (admin/student), Courses, Enrollments, Exams, Exam Results, Activities, Consultants, Sales, Integrations
- **Relationships**: Proper foreign key constraints

## Development Workflow
- **Monorepo Structure**: Shared TypeScript types between client and server
- **Path Aliases**: Configured for clean imports (@/, @shared/, @assets/)
- **Type Safety**: End-to-end TypeScript with strict configuration

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

## Development Tools
- **Vite Plugins**: React plugin, Runtime error overlay, Cartographer
- **Drizzle Kit**: Database schema management and migrations
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Build & Deployment
- **ESBuild**: Fast bundling for server-side code
- **Vite Build**: Optimized frontend production builds
- **Static Assets**: Served through Express
- **Deployment Configuration**: Autoscale deployment (required for Node.js runtime and backend API)

# Recent Changes (August 12, 2025)

## STUDENT COURSE MATERIALS INTEGRATION COMPLETED (August 12, 2025)
✓ Replaced fake activities with real course-related activities in Son Aktiviteler section
✓ Activities now show actual course assignments: "Kurs tanımlandı", "İlerleme kaydedildi", system notifications
✓ Added new activity types: course_assigned, course_progress, system_notification with proper icons
✓ Changed course button from "Kursa Devam Et" to "Kurs İçeriğini Gör" with FileText icon
✓ Created new StudentCourseDetails page showing course sections and PDF materials
✓ Added backend endpoint `/api/student/course/:courseTitle/sections` to fetch real course data
✓ Course sections now display admin panel uploaded materials (e.g., "Gastronomi 1", "Gastronomi 2")
✓ PDF buttons changed from "İndir" to "Oku" - opens PDFs in new tab for viewing
✓ Real-time course section parsing from database jsonb field
✓ Activities generated from student's actual enrolled courses via getCoursesByUserCategories
✓ Course statistics show real data: total materials, sections, duration from database