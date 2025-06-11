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
- Request/Response types with Zod validation
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

### Phase 2: Core Interactivity 🚧 [STATUS: Not Started]
- [ ] Implement copy-to-clipboard for each section
- [ ] Build working feedback input component
- [ ] Add feedback → regeneration flow
- [ ] Create citation markers in content (visual only)
- [ ] Build basic context viewer with document tabs
- [ ] Add feedback history display

### Phase 3: Advanced Citations 🔮 [STATUS: Not Started]
- [ ] Implement citation popovers with details
- [ ] Add bidirectional citation highlighting
- [ ] Build citation relevance indicators
- [ ] Create smooth scrolling to citations
- [ ] Add citation filtering/search

### Phase 4: Rules System 🔮 [STATUS: Not Started]
- [ ] Design rule suggestion algorithm
- [ ] Build rule suggestion banner
- [ ] Create rule management interface
- [ ] Implement rule application in prompts
- [ ] Add rule categorization system

### Phase 5: Polish & Optimization 🔮 [STATUS: Not Started]
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
- **Inline Markers**: Small numbered superscripts in content
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

### Current Status: Phase 1 Complete
- [x] Architecture design complete
- [x] Type definitions drafted
- [x] Component hierarchy planned
- [x] Phase 1 implementation complete
- [ ] Phase 2 implementation started

### Next Steps
1. Test the basic discharge generation flow
2. Start Phase 2: Core Interactivity
3. Implement copy-to-clipboard functionality
4. Build working feedback input system

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
├── types/discharge.ts (✅ Complete)
├── stores/dischargeSummaryStore.ts (✅ Complete)
├── components/DischargeSummary/
│   ├── DischargeSummaryPanel.tsx (✅ Complete)
│   ├── DischargeSummaryHeader.tsx (✅ Complete)
│   ├── DischargeSummaryContent.tsx (✅ Complete)
│   ├── DischargeSummarySection.tsx (✅ Complete)
│   ├── FeedbackInput.tsx (✅ Complete - placeholder)
│   └── index.ts (✅ Complete)
└── app/api/discharge/route.ts (✅ Fixed with Zod)
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

---

Last Updated: 2024-01-11
Status: Phase 1 Complete - Ready for Testing
