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

### Database Schema (Drizzle ORM)
- PostgreSQL with support for both production and local development (PGlite)
- Key tables: `user_profiles`, `patients`, `documents`, `document_chunks`, `discharge_summaries`
- Row-level security for patient data isolation
- UUID-based primary keys for enhanced security

### Component Architecture
- Next.js 15 App Router with parallel route groups for layouts
- Shadcn UI components with Tailwind CSS v4
- Form handling with React Hook Form + Zod validation
- File uploads handled via custom FileUpload component
- PDF rendering with react-pdf and PDF.js

### AI Integration
- LangChain for orchestration with support for multiple LLMs
- Primary: Google Gemini 1.5 Flash for discharge generation
- OpenAI text-embedding-3-large for document embeddings
- RAG pipeline for retrieving relevant medical guidelines

### Development Tools
- **Dev Seeding**: `/dev` page with tools to seed realistic test data
- **Real PDFs**: Pregnancy/preeclampsia medical guidelines for testing
- **Storage Management**: Automatic cleanup of development data including storage files
- **Environment Detection**: Development-only endpoints with NODE_ENV checks

## Current Architecture State

Based on recent commits, the system has evolved through several major phases:

### Phase 1: Foundation (Initial commits)
- Basic Zustand + React Query state management setup
- Initial Supabase integration
- PRD documentation

### Phase 2: UI Enhancement (Recent)
- Snippet selector with `/` hotkey navigation
- Document selector with `@` hotkey and live search
- Action menu implementation (cursor refocus still buggy)
- Sidebar routing redesign

### Phase 3: Security & Storage (Latest)
- Clerk + Supabase authentication integration
- Private storage bucket with signed URLs
- Document upload system with metadata support
- PDF preview modal with react-pdf
- Development tools with real PDF seeding

## PRD

See `app/docs/PRD.md` for detailed product requirements and feature implementation status.

## Environment Variables

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_CLERK_*`: Authentication
- `NEXT_PUBLIC_SUPABASE_*`: Vector store and file storage
- `GOOGLE_API_KEY`: For Gemini
- `OPENAI_API_KEY`: For embeddings

## Current Focus Areas

Based on open GitHub issues and recent development, current priorities include:

### Phase 1: Core Discharge Summary System (HIGH PRIORITY)
1. 🏥 **Enhanced Discharge API** ([Issue #3](https://github.com/mattshu0410/discharger/issues/3))
   - Implement structured JSON response format with sections and citations
   - Integrate vector search for document retrieval during generation
   - Build comprehensive prompt template system with medical sections
   - Add citation tracking linking summary content to source documents

2. 🏥 **Interactive Discharge Component** ([Issue #3](https://github.com/mattshu0410/discharger/issues/3))
   - Replace placeholder `DischargeSummary.tsx` with full interactive component
   - Implement section-based rendering with copy-to-clipboard functionality
   - Add feedback input system for regeneration with user guidance
   - Create Zustand store for discharge summary state management

### Phase 2: User Experience & Integration (MEDIUM PRIORITY)
3. 🔗 **Citation System & Context Viewer Integration** ([Issue #3](https://github.com/mattshu0410/discharger/issues/3))
   - Bidirectional highlighting between discharge sections and source documents
   - Citation detail popups showing source context and relevance scores
   - Visual citation indicators in summary sections

4. ⚙️ **Rule Management System** ([Issue #3](https://github.com/mattshu0410/discharger/issues/3))
   - User-defined formatting rules from feedback patterns
   - Rule categorization and management interface
   - Automatic rule application in future discharge generations

### Phase 3: Polish & Performance (LOW PRIORITY)
5. 🔄 **Action Menu Polish**: Fix cursor refocus issues in textarea
6. ⚡ **Performance Optimization**: Large document set handling and LLM response caching
7. 📋 **Testing Infrastructure**: Comprehensive test coverage for discharge generation flow

### Completed ✅
- **Document Upload Security**: Complete Clerk + Supabase integration
- **PDF Preview System**: Full-featured document preview with zoom/scroll
- **Storage Management**: Proper cleanup and signed URL access

## Known Issues
- Action menu cursor refocus to textarea needs improvement
- Document selector may need performance optimization for large document sets
- Type mismatches between Date objects and string expectations in some components

## Important File Locations

### Core Application
- **Patient Management**: `src/components/PatientForm.tsx`
- **Document System**:
  - Upload: `src/app/api/documents/route.ts`
  - Delete: `src/app/api/documents/[id]/route.ts`
  - Signed URLs: `src/app/api/documents/[id]/signed-url/route.ts`
  - Preview: `src/components/DocumentPreviewModal.tsx`
- **Selectors**:
  - Documents: `src/components/DocumentSelector.tsx`
  - Snippets: `src/components/SnippetSelector.tsx`
- **Memory Page**: `src/app/(auth)/(sidebar)/memory/`

### API & Data
- **React Query Hooks**: `src/api/*/queries.ts`
- **Database Schema**: `src/models/Schema.ts`
- **Store Definitions**: `src/stores/`
- **Discharge Generation**: `src/app/api/discharge/route.ts`

### Development
- **Dev Tools**: `src/app/(auth)/(sidebar)/dev/`
- **Seed Data**: `src/app/api/dev/seed-user-data/route.ts`
- **Test Assets**: `public/assets/files/` (medical PDFs)

### Authentication & Storage
- **Supabase Clients**:
  - Client-side: `src/libs/supabase-client.ts`
  - Server-side: `src/libs/supabase-server.ts`
- **Document Processing**: `src/libs/documentProcessor.ts`
- **Vector Store**: `src/libs/vectorStore.ts`

## Development Workflow

1. **Feature Development**: Use `/dev` page to seed realistic test data
2. **Document Testing**: Upload actual medical PDFs for realistic testing scenarios
3. **State Management**: Follow React Query patterns for server state, Zustand for client state
4. **Type Safety**: All API boundaries validated with Zod schemas
5. **Security**: Test with proper RLS policies and signed URL expiration
