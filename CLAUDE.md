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
# Generate database migrations
npm run db:generate

# Run migrations (production)
npm run db:migrate

# Open Drizzle Studio for database inspection
npm run db:studio
```

## Architecture Overview

### State Management
- **Client State**: Zustand stores with persist middleware
  - `patientStore`: Current patient selection, context editing, document management
  - `uiStore`: Modal states, sidebar visibility, UI preferences
- **Server State**: React Query (TanStack Query v5)
  - Documents, patients, snippets, users - all use custom hooks in `src/hooks/`

### Key Architectural Patterns
1. **Auto-save Patient Context**: Uses debounced updates (500ms) to save patient context automatically
2. **Optimistic Updates**: UI updates locally before server confirmation for responsive UX
3. **Vector Search**: Documents are chunked and embedded for similarity search using Supabase pgvector
4. **Type Safety**: End-to-end TypeScript with Zod validation for all forms and API boundaries

### Database Schema (Drizzle ORM)
- PostgreSQL with support for both production and local development (PGlite)
- Key tables: `user_profiles`, `patients`, `documents`, `document_chunks`, `discharge_summaries`
- Row-level security for patient data isolation

### Component Architecture
- Next.js 15 App Router with parallel route groups for layouts
- Shadcn UI components with Tailwind CSS v4
- Form handling with React Hook Form + Zod validation
- File uploads handled via React Dropzone

### AI Integration
- LangChain for orchestration with support for multiple LLMs
- Primary: Google Gemini 1.5 Flash for discharge generation
- OpenAI text-embedding-3-large for document embeddings
- RAG pipeline for retrieving relevant medical guidelines

### Testing Strategy
- The team is currently not familiar with good practice for testing.
- The following tools are from the original boilerplate.
- Unit tests: Vitest with React Testing Library
- E2E tests: Playwright
- Visual regression: Percy
- API monitoring: Checkly

## Current Focus Areas

Based on recent commits, the team is working on:
1. Refactoring state management (Zustand + React Query migration)
2. Fixing textarea focus issues in the action menu
3. Building out the document selector with hotkey support (`@` for documents, `/` for snippets)

## PRD

See app/docs/PRD.md

## Environment Variables

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_CLERK_*`: Authentication
- `NEXT_PUBLIC_SUPABASE_*`: Vector store and file storage
- `GOOGLE_API_KEY`: For Gemini
- `OPENAI_API_KEY`: For embeddings

## Known Issues
- Action menu cursor refocus to textarea is buggy (mentioned in recent commit)
- Document selector may need performance optimization for large document sets

## Important File Locations
- Patient form logic: `src/components/PatientForm.tsx`
- Document selector: `src/components/DocumentSelector.tsx`
- Discharge generation API: `src/app/api/discharge/route.ts`
- Database schema: `src/models/Schema.ts`
- Store definitions: `src/stores/`
