# Core Application Structure
src/app/ - App Router
- layout.tsx = Root layour with providers (PostHog, React Query, Patient Context)
- docs/ = Documentation, including PRD

# Frontend
- (auth) = Clerk-authenticated pages
src/components/ - React Components
- ui/ = Shadcn UI components
- analytics/ = PostHog analytics integration
- query/ = React Query client provider
styles/ = Styles for frontend

# Backend
- src/api/ - API Client Layer
- app/api/ = Server-side API routes (Includes auth, docs, patients, snippets, discharge LLM, pdfloader, counter)

# State Management
src/stores/ - Zustand Stores
- patientStore.ts = Patient data, context, UI state
- uiStore.ts = UI-specific state management

src/hooks/ - React Query Hooks
- patients.ts, documents.ts, snippets.ts, users.ts

# Data
src/types/ - TypeScript Definitions
- index.ts = Core domain types
- files.ts = File-handling types

# Database
supabase/ - Supabase configuration and migrations
- migrations/ Database scheme changes

# Infrastructure
src/utils/ - Shared Utility Functions
src/validations/ - Data Validation
src/templates/ - LLM Prompt Templates

# Tests
tests/ - Test suite
- e2e/ = Playwright End-to-end tests
- integration/ = Integration tests

# Other
- instrumentation.ts = Sentry for error monitoring and performance tracking
- middleware.ts = Arcjet, Clerk - Runs before every app request to check security and auth

# How do things work?

## Request Lifecycle
1. Request comes in
2. → middleware.ts (security + auth check)
3. → If allowed, request continues to your app
4. → instrumentation.ts (already running, captures any errors)
5. → Your page/API route executes
6. → Response sent back

## API Calls
Component → React Query Hook    →   API Route →  Database
    ↓             ↓                    ↓            ↓
src/components → src/api/queries → src/app/api → Supabase
- src/api = React Queries which manage the server state
