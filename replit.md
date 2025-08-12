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