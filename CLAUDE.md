# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Discharger is a medical discharge summary generator that uses LangChain and Google Gemini AI to help healthcare professionals create comprehensive, citation-backed discharge summaries. The application combines patient notes with relevant medical guidelines using RAG (Retrieval-Augmented Generation) for accuracy and explainability.

## Development Commands

### Core Development
```bash
# Start development server with Spotlight debugging
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check-types

# Linting
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues

# Testing
npm run test        # Run unit tests with Vitest
npm run test:e2e    # Run E2E tests with Playwright
```

### Database Management
```bash
# Generate database migrations (creates SQL migration files)
npm run db:generate

# Push migrations to database
npm run db:migrate

# Open Supabase Studio for database inspection
npm run db:studio

# Alternative Supabase commands:
supabase db diff -f <migration_name>  # Generate migration
supabase db push                      # Push to database
supabase studio                       # Open studio
```

## Architecture Overview

### Authentication & Security
- **Authentication**: Clerk for user management with JWT tokens
- **Database Security**: Row-level security (RLS) policies for data isolation
- **File Storage**: Private Supabase Storage bucket with signed URL access
- **Session Management**: Clerk sessions integrated with Supabase client

### State Management
- **Client State**: Zustand stores with persist middleware
  - `patientStore`: Current patient selection, context editing, document management
  - `uiStore`: Modal states, sidebar visibility, UI preferences, document preview
- **Server State**: React Query (TanStack Query v5)
  - Documents, patients, snippets, users - all use custom hooks in `src/api/`

### Document Management System
1. **Upload Flow**: Multi-file upload with metadata (summary, tags, share status)
2. **Storage**: Private Supabase Storage with user-specific folder structure
3. **Access Control**: Signed URLs with 5-minute expiration for secure file access
4. **Preview**: React PDF with continuous scroll, zoom controls, and metadata panel
5. **Cleanup**: Automatic storage cleanup when documents are deleted

### Key Architectural Patterns
1. **Auto-save Patient Context**: Uses debounced updates (500ms) to save patient context automatically
2. **Optimistic Updates**: UI updates locally before server confirmation for responsive UX
3. **Vector Search**: Documents are chunked and embedded for similarity search using Supabase pgvector
4. **Type Safety**: End-to-end TypeScript with Zod validation for all forms and API boundaries
5. **React Query Patterns**: Standardized query keys, error handling, and cache invalidation

### Component Architecture
- Next.js 15 App Router with parallel route groups for layouts
- Shadcn UI components with Tailwind CSS v4
- Form handling with React Hook Form + Zod validation
- File uploads handled via custom FileUpload component
- PDF rendering with react-pdf and PDF.js

### AI Integration
- LangChain for orchestration with support for multiple LLMs
- Primary: Google Gemini 2.0 Flash for discharge generation and block generation
- OpenAI text-embedding-3-large for document embeddings
- RAG pipeline for retrieving relevant medical guidelines
- **Block Generation System**: AI-powered transformation of discharge summaries into patient-friendly blocks

### Development Tools
- **Dev Seeding**: `/dev` page with tools to seed realistic test data
- **Real PDFs**: Pregnancy/preeclampsia medical guidelines for testing
- **Storage Management**: Automatic cleanup of development data including storage files
- **Environment Detection**: Development-only endpoints with NODE_ENV checks

## PRD

See `app/docs/PRD.md` for detailed product requirements and feature implementation status.

## Environment Variables

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_CLERK_*`: Authentication
- `NEXT_PUBLIC_SUPABASE_*`: Vector store and file storage
- `GOOGLE_API_KEY`: For Gemini
- `OPENAI_API_KEY`: For embeddings

## Project File Structure & Organization

### Application Architecture (`src/app/`)

#### **Route Groups & Layouts**
- **`(auth)/`** - Authenticated user area with Clerk integration
  - **`(center)/`** - Centered layouts for auth pages (sign-in/sign-up)
  - **`(sidebar)/`** - Main app with sidebar navigation
    - `/` - Main discharge summary composer
    - `/composer` - Patient-facing discharge block editor
    - `/memory` - Document management and upload system
    - `/dev` - Development tools and data seeding
    - `/admin`, `/profile`, `/snippets` - Additional features
- **`patient/[summaryId]`** - Public patient portal (mobile-optimized)
- **`api/`** - Next.js API routes for backend functionality

#### **Key API Endpoints**
- **Documents**: `/api/documents/*` - CRUD, upload, signed URLs
- **Discharge**: `/api/discharge` - AI-powered summary generation  
- **Blocks**: `/api/blocks/generate` - AI-powered block generation from discharge summaries
- **Patient Summaries**: `/api/patient-summaries/*` - Block-based patient summaries with CRUD operations
- **Patients**: `/api/patients/*` - Patient management with RLS
- **Medical Data**: `/api/snippets/*`, `/api/hospitals/*`
- **Dev Tools**: `/api/dev/*` - Data seeding utilities

### Component Architecture (`src/components/`)

#### **Core Application Components**
- **`PatientForm.tsx`** - Main patient data entry with auto-save, hotkey selectors
- **`Sidebar.tsx`** - Navigation with patient list and context switching
- **`DataTable.tsx`** - Reusable table with sorting, pagination, CRUD actions
- **`AutoSaveIndicator.tsx`** - Visual feedback for form persistence

#### **Feature-Specific Component Groups**
- **`DischargeSummary/`** - AI summary generation and display
  - Content rendering, header controls, section management, feedback input
- **`ContextViewer/`** - Patient context and document viewing
  - Header, document list panel, user context display
- **`DevicePreviewer/`** - Mobile device mockups for patient portal
  - iPhone frame, responsive scaling, device variants
- **`PatientSimplified/`** - Patient-facing interface components
- **`blocks/`** - Medical content blocks (appointments, medications, tasks, alerts)

#### **UI Foundation (`ui/`)**
- **Shadcn UI Library** (18 components): Form, input, button, dialog, table, etc.
- **`file-upload.tsx`** - Advanced drag/drop upload with progress tracking
- **Form Components** - React Hook Form + Zod validation integration

#### **Advanced Selectors**
- **`DocumentSelector.tsx`** - `@` hotkey document insertion with search
- **`SnippetSelector.tsx`** - `/` hotkey template insertion with filtering
- **`DocumentPreviewModal.tsx`** - Full PDF viewer with react-pdf, zoom, metadata

### Data Layer & Utilities (`src/libs/`, `src/models/`)

#### **Database & Storage**
- **`supabase-client.ts`** - Browser client with Clerk JWT integration
- **`supabase-server.ts`** - Server client for API routes and components
- **`vectorStore.ts`** - RAG search with OpenAI embeddings + pgvector

#### **AI & Document Processing**
- **`documentProcessor.ts`** - Multi-format parsing (PDF, DOCX) with chunking
- **LangChain Integration** - Google Gemini for generation, structured outputs

#### **Infrastructure**
- **`Env.ts`** - Type-safe environment validation (T3 pattern)
- **`Logger.ts`** - Centralized logging (Pino + Logtail/console)
- **`Arcjet.ts`** - Rate limiting and security protection
- **`onboarding-steps.ts`** - Interactive user tour with NextStepJS

### State Management (`src/stores/`)
- **`patientStore`** - Current patient, context editing, document management
- **`uiStore`** - Modal states, sidebar visibility, UI preferences
- **`dischargeSummaryStore`** - AI summary state and feedback

### API Integration (`src/api/`)
- **React Query Hooks** - Custom hooks for all server state (documents, patients, snippets, users, blocks, patient-summaries)
- **Standardized Patterns** - Query keys, error handling, cache invalidation
- **Type Safety** - End-to-end TypeScript with Zod validation

### Development & Testing

#### **Quality Assurance**
- **Testing**: Vitest (unit) + Playwright (E2E) with comprehensive setup
- **Linting**: ESLint with Antfu config, TypeScript strict mode
- **Git Workflow**: Husky hooks, lint-staged, conventional commits

#### **Development Tools**
- **`/dev` Page** - Realistic data seeding with medical PDFs
- **Database Management** - Supabase CLI integration, migration scripts
- **Build Analysis** - Bundle analyzer, performance monitoring
- **Environment** - Local Supabase stack, PGlite for testing

### Infrastructure & Deployment

#### **Core Technologies**
- **Framework**: Next.js 15 with App Router + React 19
- **Styling**: Tailwind CSS v4 + Shadcn UI components
- **Database**: PostgreSQL (Supabase) with pgvector for embeddings
- **Authentication**: Clerk with JWT + Supabase RLS policies
- **AI/ML**: LangChain + Google Gemini + OpenAI embeddings

#### **Monitoring & Analytics**
- **Error Tracking**: Sentry with source maps
- **User Analytics**: PostHog with proxy configuration
- **Logging**: Structured logging with Pino + Logtail
- **Performance**: Vercel monitoring + bundle analysis

#### **Security & Performance**
- **Rate Limiting**: Arcjet protection
- **File Storage**: Private Supabase Storage with 5-minute signed URLs
- **Data Isolation**: User-scoped RLS policies
- **Caching**: React Query + Next.js automatic optimization

## Development Workflow

1. **Feature Development**: Use `/dev` page to seed realistic test data
2. **Document Testing**: Upload actual medical PDFs for realistic testing scenarios
3. **State Management**: Follow React Query patterns for server state, Zustand for client state
4. **Type Safety**: All API boundaries validated with Zod schemas
5. **Security**: Test with proper RLS policies and signed URL expiration
