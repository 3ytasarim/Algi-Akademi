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

## STUDENT INTERFACE IMPROVEMENTS AND DYNAMIC NOTIFICATIONS COMPLETED (August 12, 2025)
✓ Completely restructured student dashboard to use StudentSidebar instead of LayoutWrapper
✓ Fixed sidebar menu structure: "Kurslarım", "Sınavlarım", "Kişisel Bilgilerim" as separate menu items
✓ Implemented dynamic notification system in TopBar showing real student activities
✓ Added notification dropdown with real-time activity count and detailed activity list
✓ Activity icons and timestamps for different activity types (password changes, course reading, etc.)
✓ Connected password change activity creation to backend for real activity tracking
✓ Fixed JSX structure issues in student-dashboard and student-course-details pages
✓ Updated all student pages to use consistent StudentSidebar + TopBar layout
✓ Removed static/fake courses from sidebar - now shows only database courses assigned to student
✓ Kurslarım dropdown shows only courses assigned during "Kursiyer Tanımlama" process
✓ Added fallback message "Henüz kurs atanmamış" when no courses are assigned
✓ Fixed TypeScript issues in TopBar component for activities array handling
✓ LAYOUT FIX: Changed student pages layout from margin-based to flexbox structure
✓ Updated student-dashboard, student-course-details layouts to use flex containers
✓ Changed sidebar from fixed positioning with margin to relative flexbox layout
✓ Fixed main content area positioning - no longer shifts down inappropriately
✓ Layout now matches admin panel structure for consistent user experience
✓ ADMIN NAVBAR STYLE APPLIED: Implemented exact admin navbar design with red gradient
✓ Added collapse/expand functionality with proper margin adjustments for main content
✓ Fixed sidebar-content connection - no more floating appearance
✓ Responsive layout with smooth transitions between collapsed and expanded states
✓ Build successfully completed - ready for production deployment

## LAST LOGIN DATE/TIME FEATURE COMPLETED (August 12, 2025)
✓ Added lastLogin timestamp field to users table schema
✓ Implemented updateUserLastLogin method in DatabaseStorage
✓ Updated /api/auth/user endpoint to track last login on each authentication check
✓ Redesigned category card as "Son Giriş Tarih ve Zaman" with animations
✓ Date format: DD.MM.YYYY in large text, time HH:MM:SS in green animated text
✓ Added hover scale effect, pulse animations for clock icon and time display
✓ Animated fade-in for login data, bounce animation for placeholder data
✓ Added "Aktif" status indicator with pulsing green dot
✓ Moved category count to footer section of the card
✓ Removed "Toplam Kategori" display from last login card for cleaner look
✓ Changed "Bölüm Sayısı" to "Ders Sayısı" and "X saat" to "X ders" in course cards
✓ Database migration completed successfully with npm run db:push
✓ Backend returns updated user data with lastLogin timestamp after authentication

# Previous Changes

## STUDENT COURSE MATERIALS INTEGRATION COMPLETED (August 12, 2025)
✓ Replaced fake activities with real course-related activities in Son Aktiviteler section
✓ Activities now show actual course assignments: "Kurs tanımlandı", "İlerleme kaydedildi", system notifications
✓ Added new activity types: course_assigned, course_progress, system_notification with proper icons
✓ Changed course button from "Kursa Devam Et" to "Kurs İçeriğini Gör" with FileText icon
✓ Created new StudentCourseDetails page showing course sections and PDF materials
✓ Added backend endpoint `/api/student/course/:courseTitle/sections` to fetch real course data
✓ Course sections now display admin panel uploaded materials (e.g., "Gastronomi 1", "Gastronomi 2")
✓ PDF buttons changed from "İndir" to "Oku" - opens PDFs in new tab for viewing
✓ Real-time course section parsing from database jsonb field with multiple format support
✓ Activities generated from student's actual enrolled courses via getCoursesByUserCategories
✓ Course statistics show real data: total materials, sections, duration from database

## STUDENT DASHBOARD IMPROVEMENTS (August 12, 2025)
✓ Changed "İlerleme" to "Bölüm Sayısı" showing actual course duration/section count
✓ Enhanced backend student course fetching with fallback logic for missing categories
✓ Added comprehensive debugging for course sections parsing (string, array, object types)
✓ Improved student authentication by TC kimlik no fallback when user ID fails
✓ Added detailed console logging for troubleshooting course data fetching issues

## PDF MATERIAL INTEGRATION COMPLETED (August 12, 2025)
✓ Setup object storage for PDF file uploads and serving
✓ Integrated multer for multipart file uploads in backend
✓ Created course creation endpoint with PDF upload support to Google Cloud Storage
✓ Updated frontend course form to use FormData for file uploads
✓ PDF files now properly stored in object storage with public URLs
✓ Course sections display real PDF materials with working "Oku" buttons
✓ Admin-uploaded PDFs properly accessible to students through object storage URLs