# Discharge Summary Implementation Plan

## Overview
This document outlines the implementation plan for the discharge summary functionality in Discharger. It serves as both a roadmap and progress tracker for building out this core feature incrementally.

## Architecture Overview

### State Management Structure

#### New Zustand Store: `dischargeSummaryStore`
```typescript
type DischargeSummaryState = {
  // Core discharge data
  currentSummary: DischargeSummary | null;
  isGenerating: boolean;
  lastGeneratedAt: Date | null;

  // Feedback & regeneration
  feedbackHistory: FeedbackItem[];
  pendingFeedback: string;
  isRegenerating: boolean;

  // Citations & highlighting
  highlightedCitation: Citation | null;
  highlightedSection: string | null;

  // Rules (future)
  suggestedRule: Rule | null;

  // Actions
  setDischargeSummary: (summary: DischargeSummary) => void;
  addFeedback: (feedback: string) => void;
  highlightCitation: (citation: Citation | null) => void;
  clearSummary: () => void;
};
```

### Core Type Definitions

```typescript
type DischargeSummary = {
  id: string;
  patientId: string;
  sections: DischargeSection[];
  metadata: {
    generatedAt: Date;
    llmModel: string;
    documentIds: string[];
    feedbackApplied: string[];
  };
};

type DischargeSection = {
  id: string;
  title: string;
  content: string;
  order: number;
  citations: Citation[];
  isEditable?: boolean; // Future: inline editing
};

type Citation = {
  id: string;
  documentId: string;
  chunkId?: string;
  text: string; // The cited text snippet
  context: string; // Surrounding context
  relevanceScore: number;
  pageNumber?: number;
};

type FeedbackItem = {
  id: string;
  text: string;
  appliedAt: Date;
  resultedInRule?: boolean;
};

type Rule = {
  id: string;
  name: string;
  description: string;
  pattern: string;
  createdFrom?: string; // feedback ID
  isActive: boolean;
};
```

## Component Architecture

### Component Hierarchy
```
DischargeSummaryPanel (Right Panel)
├── DischargeSummaryHeader
│   ├── GeneratedTimestamp
│   └── RegenerateButton
├── DischargeSummaryContent
│   └── DischargeSummarySection (multiple)
│       ├── SectionHeader
│       │   ├── Title
│       │   └── CopyButton
│       ├── SectionContent
│       │   └── CitationMarker (inline)
│       └── SectionActions (future)
├── FeedbackInput
│   ├── TextInput
│   ├── SubmitButton
│   └── RuleSuggestionBanner (future)
└── LoadingState / EmptyState

ContextViewer (Bottom Panel)
├── DocumentTabs
│   └── DocumentTab (per source)
├── DocumentContent
│   ├── HighlightedPassages
│   └── FullText
└── CitationIndicators
```

## API Layer Design

### React Query Hooks
```typescript
// src/api/discharge/queries.ts
- useGenerateDischargeSummary()
- useRegenerateDischargeSummary()
- useGetDischargeSummary()
- useSaveFeedbackRule() (future)

// src/api/discharge/types.ts
- Request Response types with Zod validation
- DischargeSummarySchema
- FeedbackSchema
- CitationSchema
```

### API Endpoint Enhancement
- `/api/discharge` - Modified to return structured JSON
- Response format includes sections, citations, and metadata
- Support for feedback parameter in regeneration

## Data Flow

### 1. Generation Flow
```
PatientForm → Generate Button Click
    ↓
API Call (context + selected documents + patient ID)
    ↓
LLM Processing (with RAG)
    ↓
Structured JSON Response
    ↓
Update dischargeSummaryStore
    ↓
UI Components React to State
```

### 2. Feedback Flow
```
User Types Feedback → pendingFeedback updates
    ↓
Submit Feedback → API Call with original context + feedback
    ↓
LLM Regenerates with Additional Instructions
    ↓
New Summary Replaces Old
    ↓
Feedback Added to History
    ↓
(Optional) Rule Suggestion Banner
```

### 3. Citation Flow
```
Click Citation in Summary
    ↓
Store Updates highlightedCitation
    ↓
ContextViewer Scrolls to Source
    ↓
Highlights Matching Text
    ↓
(Bidirectional - works both ways)
```

## Implementation Phases

### Phase 1: Foundation ✅ [STATUS: Complete]
- [x] Create `dischargeSummaryStore` with basic state
- [x] Create types file with core interfaces
- [x] Build basic `DischargeSummaryPanel` component
- [x] Add placeholder sections with mock data
- [x] Update `/api/discharge` to return structured JSON
- [x] Implement loading and empty states
- [x] Connect store to PatientForm generation

### Phase 2: Core Interactivity ✅ [STATUS: Complete]
- [x] Implement copy-to-clipboard for each section
- [x] Build working feedback input component
- [x] Add feedback → regeneration flow
- [x] Create citation markers in content (visual only)
- [x] Build basic context viewer with document tabs
- [ ] Add feedback history display

### Phase 3: Advanced Citations ✅ [STATUS: Complete]
- [x] Implement enhanced citation display with context
- [x] Add bidirectional citation highlighting
- [x] Build citation relevance indicators
- [x] Integrate RAG-based document retrieval
- [x] Store and retrieve full document text
- [x] **Fix citation-to-document mapping**: Separate citation IDs from document UUIDs

### Phase 3: Advanced Citations ✅ [STATUS: Complete]
- [x] Implement enhanced citation display with context
- [x] Add bidirectional citation highlighting
- [x] Build citation relevance indicators
- [x] Integrate RAG-based document retrieval
- [x] Store and retrieve full document text
- [x] **Fix citation-to-document mapping**: Separate citation IDs from document UUIDs

### Phase 4: Update Discharge in Supabase ✅ [STATUS: Complete]

#### Overview
This phase focuses on persisting discharge summaries and document associations to Supabase, enabling users to access their previous work when switching between patients. It also addresses document visibility and sharing.

#### Implementation Plan

##### 4.1 Save Discharge Summaries to Supabase ✅
- [x] Update `useUpdatePatient` hook to accept discharge_text field
- [x] Modify PatientForm to save the discharge summary JSON to patients.discharge_text after generation
- [x] Store the full DischargeSummary object as JSON (includes sections, citations, metadata)

##### 4.2 Load Discharge on Patient Switch ✅
- [x] Use existing `usePatient` hook to fetch patient data with discharge_text
- [x] Update Sidebar.tsx to trigger discharge loading when patient is selected
- [x] Modify dischargeSummaryStore to handle loading saved summaries
- [x] Clear discharge summary when switching away from a patient

##### 4.3 Save Document IDs to Patients ✅
- [x] Update PatientForm to sync document IDs with Supabase when documents are attached
- [x] Save document_ids when documents are attached via @ selector
- [x] Update document_ids when RAG-retrieved documents are added post-generation
- [x] Load saved document IDs when switching patients using `useDocumentsByIds`

##### 4.4 Fix Document Visibility (RLS) ✅
- [x] Review current RLS policies on documents table - properly configured
- [x] Ensure documents are only visible to their owners + public documents
- [x] RLS policies automatically handle filtering in API endpoints

##### 4.5 Public Document Sharing ✅
- [x] RLS policies already support public documents (share_status = 'public')
- [x] Create document update API endpoint for toggling share status
- [x] Add visibility toggle column in memory page with public/private badges
- [x] Update document queries to include public documents from other users
- [x] Add visual indicators for document ownership and visibility

#### Technical Approach

**Data Flow:**
1. **Discharge Generation** → Save to patients.discharge_text as JSON
2. **Patient Switch** → Load discharge_text → Parse JSON → Update dischargeSummaryStore
3. **Document Selection** → Update local state → Sync to patients.document_ids
4. **Document Visibility** → RLS policies enforce user_id matching (except public docs)

**Key Considerations:**
- discharge_text stores the complete DischargeSummary object as JSON
- document_ids is a JSONB array of document UUIDs (good choice for flexibility)
- RLS policies handle security at the database level
- Public documents need special handling in queries and UI

### Phase 5: Rules System 🔮 [STATUS: Not Started]
 - [ ] Design rule suggestion algorithm
 - [ ] Build rule suggestion banner
 - [ ] Create rule management interface
 - [ ] Implement rule application in prompts
 - [ ] Add rule categorization system

### Phase 6: Polish & Optimization 🔮 [STATUS: Not Started]
- [ ] Add section reordering capability
- [ ] Implement section customization
- [ ] Add export functionality
- [ ] Optimize for long summaries (virtualization)
- [ ] Add keyboard shortcuts
- [ ] Implement undo/redo for feedback

## Technical Decisions

### 1. State Management
- **Why Zustand**: Lightweight, TypeScript-friendly, works well with React Query
- **Store Design**: Separate discharge store to avoid bloating patient store
- **Persistence**: Only persist feedback history and rules, regenerate summary

### 2. Component Design
- **Modularity**: Each section as independent component for reusability
- **Composition**: Small, focused components composed into larger ones
- **Performance**: Memoization for expensive renders, virtualization for long lists

### 3. API Design
- **Structured Response**: JSON with clear section boundaries and citations
- **Streaming**: Consider streaming for long summaries (future)
- **Caching**: React Query handles caching with appropriate invalidation

### 4. Citation System  
- **Inline Highlighting**: Citation text highlighted inline with colored backgrounds
- **No Markers**: Removed [C1] style markers for cleaner UI
- **Bidirectional**: Click either summary or source to highlight both
- **Performance**: Index citations for fast lookup

## File Structure

```
src/
├── stores/
│   └── dischargeSummaryStore.ts
├── api/
│   └── discharge/
│       ├── queries.ts
│       ├── types.ts
│       └── hooks.ts
├── components/
│   ├── DischargeSummary/
│   │   ├── DischargeSummaryPanel.tsx
│   │   ├── DischargeSummaryHeader.tsx
│   │   ├── DischargeSummaryContent.tsx
│   │   ├── DischargeSummarySection.tsx
│   │   ├── FeedbackInput.tsx
│   │   └── index.ts
│   └── ContextViewer/
│       ├── ContextViewer.tsx
│       ├── DocumentTabs.tsx
│       ├── DocumentContent.tsx
│       └── index.ts
└── types/
    └── discharge.ts
```

## Progress Tracking

### Current Status: Phase 2 Complete ✅
- [x] Architecture design complete
- [x] Type definitions with discriminated union Citation types
- [x] Component hierarchy fully implemented
- [x] Phase 1 implementation complete
- [x] Phase 2 implementation complete
- [x] Working inline citation highlighting system
- [x] Bidirectional citation navigation
- [x] Context viewer with source highlighting

### What Works Now
1. ✅ **End-to-End Discharge Generation**: Patient context → LLM → Structured sections
2. ✅ **Inline Citation Highlighting**: `<CIT>` tags render as blue/green clickable highlights
3. ✅ **Bidirectional Navigation**: Click citation → auto-opens context viewer with highlighted source
4. ✅ **Working Feedback System**: Type feedback → regenerates summary with modifications
5. ✅ **Copy-to-Clipboard**: Each section can be copied individually
6. ✅ **Type Safety**: Full TypeScript coverage with discriminated union types
7. ✅ **Gemini 2.0 Compatibility**: Simplified Zod schema that works with Google's model

### Next Steps (Phase 3)
1. Connect to real document content via vector search
2. Implement citation popovers with more details
3. Add smooth scrolling to highlighted citations
4. Build feedback history display

## Notes & Considerations

### Performance
- Consider virtualization for summaries > 10 sections
- Debounce feedback input to avoid excessive re-renders
- Lazy load citation details

### Accessibility
- Ensure keyboard navigation for citations
- Screen reader support for section navigation
- Clear focus indicators

### Future Enhancements
- Voice dictation for feedback
- AI-suggested feedback based on common patterns
- Section templates library
- Collaborative editing (multiple providers)
- Version history with diff view

## Scratch Board

### Phase 1 Implementation Details (COMPLETED)

#### LangChain Structured Output Fix
**Problem**: Original implementation used JSON in prompt template, causing LangChain to interpret `{}` braces as template variables, resulting in "Single '}' in template" error.

**Solution**: Implemented LangChain's structured output with Zod schema:

```typescript
// Define Zod schema for variable number of sections
const dischargeSectionsSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string().describe('The section title (e.g., \'Admission Diagnosis\', \'Hospital Course\')'),
      content: z.string().describe('The detailed medical content for this section')
    })
  ).describe('Array of discharge summary sections')
});

// Use structured output instead of manual JSON parsing
const structuredModel = model.withStructuredOutput(dischargeSectionsSchema, {
  name: 'discharge_summary_sections'
});
```

**Key Benefits**:
- No manual JSON parsing required
- Automatic validation and type safety
- Variable number of sections supported
- LangChain handles malformed responses gracefully
- No template variable conflicts

#### Architecture Separation of Concerns

**LLM Responsibilities**:
- Generate medical content only
- Create appropriate section titles
- Provide comprehensive clinical information
- No metadata generation (IDs, timestamps, etc.)

**API Responsibilities**:
- Generate unique IDs for summaries and sections
- Add timestamps and metadata
- Handle patient ID association
- Manage document ID tracking
- Error handling and fallbacks

**Store Responsibilities**:
- Manage UI state (loading, errors)
- Handle feedback input and history
- Manage citation highlighting
- Coordinate between components

#### Component Integration

**File Structure Created**:
```
src/
├── types/discharge.ts (✅ Complete - with discriminated union Citation types)
├── stores/dischargeSummaryStore.ts (✅ Complete)
├── components/DischargeSummary/
│   ├── DischargeSummaryPanel.tsx (✅ Complete)
│   ├── DischargeSummaryHeader.tsx (✅ Complete)
│   ├── DischargeSummaryContent.tsx (✅ Complete)
│   ├── DischargeSummarySection.tsx (✅ Complete - with inline citation highlighting)
│   ├── FeedbackInput.tsx (✅ Complete - functional regeneration)
│   └── index.ts (✅ Complete)
├── components/ContextViewer/
│   ├── ContextViewer.tsx (✅ Complete)
│   ├── ContextViewerHeader.tsx (✅ Complete)
│   ├── UserContextPanel.tsx (✅ Complete)
│   ├── DocumentListPanel.tsx (✅ Complete)
│   └── index.ts (✅ Complete)
└── app/api/discharge/route.ts (✅ Fixed with Zod and inline citations)
```

**Integration Points**:
- `PatientForm.tsx`: Updated to use discharge store and new API response format
- `page.tsx`: Connected `DischargeSummaryPanel` to main layout
- Store exports: Added discharge store to main store index

#### State Management Flow

**Generation Flow**:
1. User clicks "Generate Discharge Summary" in PatientForm
2. PatientForm calls API with context, documentIds, patientId
3. API creates structured prompt and invokes LLM with Zod schema
4. LLM returns structured sections array
5. API wraps with metadata (timestamps, IDs, etc.)
6. PatientForm receives response and updates discharge store
7. DischargeSummaryPanel reacts to store changes and displays sections

**Error Handling**:
- API-level: Zod validation and LangChain error handling
- Store-level: Error state management
- UI-level: Loading, error, and empty states

### Open Questions
1. Should feedback be stored permanently or just for session?
2. How many feedback iterations to store in history?
3. Should citations link to exact page/paragraph in PDFs?
4. Rule naming - automatic or user-defined?

### Design Decisions Log
- **2024-01-11**: Used LangChain structured output with Zod to fix template parsing
- **2024-01-11**: Separated LLM content generation from API metadata handling
- **2024-01-11**: Implemented modular component architecture for future extensibility
- **2024-01-11**: Decided on separate store for discharge functionality

### API Response Structure Draft
```json
{
  "id": "discharge_123",
  "patientId": "patient_456",
  "sections": [
    {
      "id": "section_1",
      "title": "Admission Diagnosis",
      "content": "Patient admitted with acute exacerbation of heart failure[1]...",
      "order": 1,
      "citations": [
        {
          "id": "cite_1",
          "marker": "[1]",
          "documentId": "doc_789",
          "text": "acute exacerbation of heart failure",
          "context": "...presented to ED with acute exacerbation of heart failure characterized by...",
          "relevanceScore": 0.95
        }
      ]
    }
  ],
  "metadata": {
    "generatedAt": "2024-01-XX",
    "llmModel": "gemini-1.5-flash",
    "documentIds": ["doc_789", "doc_790"]
  }
}
```

### Future Developer Guide

#### To Continue Development (Phase 2):

1. **Working Copy-to-Clipboard**:
   - `DischargeSummarySection.tsx` already has placeholder copy functionality
   - Test and enhance the `navigator.clipboard.writeText()` implementation

2. **Functional Feedback System**:
   - `FeedbackInput.tsx` has placeholder submit logic
   - Implement API call to regenerate with feedback parameter
   - Connect to discharge store's feedback management

3. **Citation Integration** (Phase 3):
   - Add RAG/vector search to API route
   - Populate `citations` array in sections
   - Implement citation highlighting in content

#### Common Issues & Solutions:

**LangChain Template Errors**:
- Always use `withStructuredOutput()` for JSON responses
- Avoid `{}` braces in prompt templates
- Use Zod schemas for complex structures

**State Management**:
- Discharge store is separate from patient store for modularity
- Use React Query for server state, Zustand for client state
- Loading states are managed in both stores for different purposes

**Component Architecture**:
- Each section is independent for future customization
- All components accept props for testability
- Store connections are isolated to top-level components

### Phase 2 Implementation Details (COMPLETED)

#### Citation System Redesign
**Problem**: Original [C1] style markers were cluttering the discharge summary text.

**Solution**: Implemented inline citation highlighting with `<CIT>` tags:

```typescript
// LLM output format
<CIT id="c1">highlighted medical claim text</CIT>

// Zod schema simplified for Gemini compatibility
const citationSchema = z.object({
  id: z.string(),
  text: z.string(), 
  context: z.string()
});
```

**Key Changes**:
- Removed `marker` field from Citation types
- LLM generates inline `<CIT>` tags instead of superscript markers
- API enriches citations with metadata (sourceType, documentId, etc.)
- UI parses `<CIT>` tags and renders highlighted, clickable text
- Blue highlighting for user context, green for documents

#### Discriminated Union Citation Types
```typescript
type Citation = ContextCitation | DocumentCitation;

type ContextCitation = {
  id: string;
  text: string;
  context: string;
  relevanceScore: number;
  sourceType: 'user-context';
  contextSection?: string;
};

type DocumentCitation = {
  id: string;
  text: string;
  context: string;
  relevanceScore: number;
  sourceType: 'selected-document' | 'retrieved-document';
  documentId: string;
  chunkId?: string;
  pageNumber?: number;
};
```

#### Context Viewer Implementation
- Split view for user context vs documents
- Click citation → highlights source text
- Auto-opens context viewer on citation click
- Clean UI without redundant "Highlighted Citation" boxes

#### Gemini 2.0 Compatibility Issues
- Discriminated unions not supported in Zod schema for Gemini
- Solution: Simplified schema, determine sourceType from ID prefix
- LLM generates: c1, c2 for context; d1, d2 for documents
- API processes and adds proper sourceType

### Phase 3 Implementation Details (COMPLETED)

#### Document Full Text Storage
**Problem**: Need to store and retrieve full document text for proper citation context.

**Solution**: 
1. Added `full_text` column to documents table in Supabase
2. Updated `documentProcessor.ts` to extract full text from PDFs/DOCX files
3. Modified document upload API to store full text in database

#### RAG Integration for Document Retrieval
**Implementation**:
1. Used `VectorStoreRetriever` from LangChain for similarity search
2. Combined user-selected documents with RAG-retrieved documents
3. Retrieved full text for all relevant documents to pass to LLM

**Key Code Changes**:
- `src/app/api/discharge/route.ts`: Added RAG similarity search
- `src/libs/documentProcessor.ts`: Added fullText extraction
- `src/app/api/documents/route.ts`: Store full text on upload

#### Citation Mapping System [UPDATED - Phase 3.1]
**Problem**: Original system created 1:1 mapping between citation IDs (d1, d2, d3) and document UUIDs, preventing multiple citations from referencing the same document.

**Original flawed approach**:
```typescript
// OLD: 1:1 mapping prevents multiple citations per document
let documentMap = new Map<number, string>();
documents.forEach((doc, index) => {
  const docNumber = index + 1;
  documentMap.set(docNumber, doc.id); // d1 → uuid1, d2 → uuid2, etc.
});
```

**New Solution**: Separate citation IDs from document identification
- **Citation IDs** (d1, d2, d3): Used for LLM parsing and UI interaction
- **Document UUIDs**: Included in prompt context and stored in `DocumentCitation.documentId`
- **Many-to-one relationship**: Multiple citations (d1, d5, d7) can reference same document

```typescript
// NEW: Include document UUIDs in prompt, populate documentId correctly
const documentWithUuid = {
  id: 'd1',                    // Citation ID for LLM parsing
  documentId: 'uuid-abc-123',  // Actual document UUID from prompt context
  context: '...',
  sourceType: 'selected-document'
};
```

#### Enhanced Context Viewer
**Updates**:
- Added full_text to Document type definition
- Enhanced DocumentListPanel to show citation context
- Improved citation display with source information
- Distinguished between user-selected and RAG-retrieved documents

## Key Files Reference

### Core API Endpoints

#### `/src/app/api/discharge/route.ts`
**Purpose**: Main discharge summary generation endpoint
- Handles POST requests for generating/regenerating discharge summaries
- Performs RAG similarity search on patient context
- Retrieves full text from selected and RAG-discovered documents
- Formats documents for LLM prompt with proper citation IDs (d1, d2, etc.)
- Maps LLM-generated citation IDs to actual document UUIDs
- Returns structured JSON with sections, citations, and metadata

#### `/src/app/api/documents/route.ts`
**Purpose**: Document management endpoint
- POST: Handles file uploads, extracts full text, stores in database and vector store
- GET: Retrieves documents with search/filter capabilities
- Stores document metadata and full_text in Supabase
- Creates vector embeddings for RAG search

#### `/src/app/api/documents/[id]/route.ts`
**Purpose**: Individual document operations
- DELETE: Removes document from database and storage
- Handles cleanup of vector embeddings

#### `/src/app/api/documents/[id]/signed-url/route.ts`
**Purpose**: Secure document access
- Generates signed URLs for private document access
- 5-minute expiration for security

### State Management

#### `/src/stores/dischargeSummaryStore.ts`
**Purpose**: Central state for discharge summary feature
- Manages current discharge summary and generation state
- Handles feedback input and regeneration flow
- Tracks highlighted citations for context viewer
- Coordinates UI state between components

#### `/src/stores/patientStore.ts`
**Purpose**: Patient-related state management
- Tracks current patient selection
- Manages patient context (auto-save with debouncing)
- Handles selected documents for current patient
- Integrates with discharge generation flow

### Type Definitions

#### `/src/types/discharge.ts`
**Purpose**: TypeScript definitions for discharge system
- `DischargeSummary`: Main summary structure with sections and metadata
- `DischargeSection`: Individual section with citations
- `Citation`: Discriminated union for context vs document citations
- Request/response types for API endpoints

#### `/src/types/index.ts`
**Purpose**: Core application types
- `Document`: Document model with full_text field
- `Patient`: Patient model with context and discharge text
- Other core types (Snippet, UserProfile, etc.)

### Components - Discharge Summary

#### `/src/components/DischargeSummary/DischargeSummaryPanel.tsx`
**Purpose**: Main container for discharge summary display
- Orchestrates header, content, and feedback components
- Connects to discharge store for state
- Handles loading and empty states

#### `/src/components/DischargeSummary/DischargeSummarySection.tsx`
**Purpose**: Individual section rendering
- Parses and renders inline citations (`<CIT>` tags)
- Handles citation click events
- Copy-to-clipboard functionality
- Highlights citations on hover/click

#### `/src/components/DischargeSummary/FeedbackInput.tsx`
**Purpose**: User feedback interface
- Text input for modification instructions
- Triggers regeneration with feedback
- Updates discharge store with pending feedback

### Components - Context Viewer

#### `/src/components/ContextViewer/ContextViewer.tsx`
**Purpose**: Bottom panel container
- Switches between user context and document views
- Responds to citation highlights from discharge summary

#### `/src/components/ContextViewer/DocumentListPanel.tsx`
**Purpose**: Document citation display
- Shows highlighted citation with full context
- Lists all selected documents
- Indicates citation source (user-selected vs RAG-retrieved)
- Visual highlighting of relevant document

#### `/src/components/ContextViewer/UserContextPanel.tsx`
**Purpose**: User context citation display
- Highlights cited text within patient context
- Shows surrounding context for citations

### Document Processing

#### `/src/libs/documentProcessor.ts`
**Purpose**: File processing for uploads
- Extracts text from PDFs and DOCX files
- Splits documents into chunks for vector storage
- Returns full text for database storage
- Adds metadata (page numbers, chunk indices)

#### `/src/libs/vectorStore.ts`
**Purpose**: Vector storage interface
- Creates Supabase vector store with OpenAI embeddings
- Configures user-specific filtering
- Interfaces with match_documents function

### Database & Storage

#### Supabase Tables:
- `documents`: Stores document metadata and full_text
- `document_vecs`: Vector embeddings for RAG search
- `patients`: Patient records with context
- `profiles`: User profiles and preferences

#### Supabase Functions:
- `match_documents`: Performs vector similarity search
- Returns matching chunks with similarity scores

### Integration Points

#### `/src/components/PatientForm.tsx`
**Purpose**: Main patient interface
- Text area for patient context with auto-save
- Document selector integration
- "Generate Discharge Summary" button
- Calls discharge API and updates store

#### `/src/app/(auth)/(sidebar)/page.tsx`
**Purpose**: Main application layout
- Three-panel layout (Patient Form, Discharge Summary, Context Viewer)
- Responsive design with resizable panels
- Integrates all major components

### Utilities

#### `/src/utils/debounce.ts`
**Purpose**: Debouncing utility
- Used for auto-saving patient context
- Prevents excessive API calls during typing

### Environment Configuration
- `OPENAI_API_KEY`: For text embeddings
- `GOOGLE_API_KEY`: For Gemini LLM
- `NEXT_PUBLIC_SUPABASE_*`: Database connection
- `NEXT_PUBLIC_CLERK_*`: Authentication

---

Last Updated: 2025-01-14
Status: Phase 3 Complete - Document Citations Working
