# Overview

This is a comprehensive CRM-based educational management system (Algı Akademi) with dual-interface design: Admin dashboard for management operations and Student dashboard for learning activities. Built with React, Express.js, and PostgreSQL, featuring Turkish language support and modern professional UI design.

## Recent Changes (August 7, 2025)

✓ Created complete production Node.js Express API server (algi-akademi/index.js)
✓ Built full CRUD endpoints for students and courses (INSERT, UPDATE, DELETE)
✓ Added in-memory database system for production persistence
✓ Implemented authentication endpoints (/api/auth/login, /api/auth/user)
✓ Fixed modal dark mode issues with CSS overrides
✓ Created proper deployment structure requiring Autoscale Deployment (not static)
✓ All API endpoints return JSON responses instead of HTML fallback
✓ Database operations persist in memory during production session
✓ Production deployment requires Node.js runtime (Autoscale or Reserved VM)

### Production Database Testing (August 7, 2025)
✓ Database connectivity confirmed - 12 users (10 students, 2 admins) in production
✓ Direct SQL Update and Delete operations work perfectly
✓ Frontend Update/Delete mutations properly configured with React Query
✓ API routes (PUT /api/students/:id, DELETE /api/students/:id) correctly implemented
✓ Storage layer (updateStudent, deleteStudent) connected to PostgreSQL
✓ Issue identified: Frontend CRUD operations not reaching backend in production
✓ Fixed duplicate close buttons in modal dialogs using CSS selectors

## Previous Changes (August 5, 2025)

✓ Implemented complete admin dashboard with 9 specialized pages
✓ Added student dashboard with course enrollment tracking
✓ Created comprehensive database schema for consultants, sales, and integrations
✓ Built responsive reports system with sales and consultant analytics
✓ Integrated SMS and payment gateway configuration pages
✓ Added exam results management and student registration workflows
✓ Implemented role-based routing (admin vs student interfaces)

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component system
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API endpoints with error handling middleware
- **Development**: Hot reload with tsx for server-side development

## Authentication & Authorization
- **Provider**: Replit OpenID Connect (OIDC) integration
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Authorization**: Role-based access control (student, instructor, admin)
- **Security**: HTTP-only cookies with secure flag for production

## Database Design
- **Primary Database**: PostgreSQL with Neon serverless connection
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Entities**:
  - Users (with role-based permissions: admin/student)
  - Courses (with instructor assignments and pricing)
  - Enrollments (student-course relationships with progress tracking)
  - Exams (course-specific assessments with scoring)
  - Exam Results (student performance tracking)
  - Activities (course interactions and audit logs)
  - Consultants (sales staff and advisors with contact info)
  - Sales (course sales tracking with payment status)
  - Integrations (SMS and payment gateway configurations)
- **Relationships**: Proper foreign key constraints and relational integrity

## Development Workflow
- **Monorepo Structure**: Shared TypeScript types between client and server
- **Path Aliases**: Configured for clean imports (@/, @shared/, @assets/)
- **Hot Reload**: Vite HMR for frontend, tsx for backend development
- **Type Safety**: End-to-end TypeScript with strict configuration

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Connection Management**: WebSocket-based connections for serverless compatibility

## Authentication Services
- **Replit Identity**: OIDC-based authentication provider
- **OpenID Client**: Standard OIDC implementation for secure authentication flows

## UI & Component Libraries
- **Radix UI**: Accessible, unstyled UI primitives
- **Lucide React**: Consistent icon library
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form handling with validation

## Development Tools
- **Vite Plugins**: 
  - React plugin for JSX transformation
  - Runtime error overlay for development
  - Cartographer for Replit integration
- **Drizzle Kit**: Database schema management and migrations
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Build & Deployment
- **ESBuild**: Fast bundling for server-side code
- **Vite Build**: Optimized frontend production builds to `dist/public`
- **Static Assets**: Served through Express with proper routing fallback
- **Deployment Configuration**: 
  - **Type**: Autoscale (required for Node.js runtime and backend API)
  - **Build Command**: `npm run build`
  - **Run Command**: `npm start`
  - Frontend builds to `dist/public`, server builds to `dist/index.js`
  - Full-stack deployment with PostgreSQL database support

## Recent Updates
- **January 2025**: Fixed deployment configuration for Autoscale deployment
- **DOM Fix**: Resolved nested anchor tag validation warnings in Sidebar component
- **Deployment Issue**: Changed from Static to Autoscale to support Node.js runtime and backend functionality