# Product Requirements Document (PRD)

## Product Title: Discharger

---

## Overview

This application enables medical professionals to efficiently generate discharge summaries using clinical notes and relevant documents. It integrates structured context input, document tagging, and snippet features, supported by a modern web stack. The core functionality leverages LLMs with RAG (retrieval-augmented generation) techniques for precise, explainable output.

---

## Technical Stack

* **Framework**: Next.js (React 19)
* **State Management**: Zustand
* **Data Fetching**: React Query
* **Styling/UI**: Tailwind CSS v5, Shadcn UI
* **Backend**: Supabase (PostgreSQL with pgvector)
* **Authentication**: Clerk
* **Form Validation**: Zod
* **LLM Integration**: Langchain
* **File Storage**: AWS S3
* **Analytics**: PostHog
* **Onboarding**: Intro.js

---

## MVP Feature Set

### 1. Main Page

#### Sidebar

* **Patient View**: Displays all patients created by the user.
* **Settings**

  * Memory
  * Snippets
  * Profile

#### Left Panel: Context Input

* Paste patient notes.

* `@` hotkey opens searchable document selector: ✅
  * Search updates results live. ✅
  * `Enter` selects first result. ✅
  * Arrow keys allow navigation. ✅
  * Added document appears as tag below input field. ✅
* `/` hotkey for inserting snippets (e.g., `/orthonote`). ✅
  * Features as per document selector ✅
  * Tabbing after adding a snippet auto-highlights the next whole square bracketed items e.g. [FINDINGS] in sequence ✅
  * This allows people to insert a snippet tab to first [ITEM], type something to replace, tab again to the next bracket items ✅

* "Generate Discharge" button:

  * Encodes typed patient context and matches chunks via vector similarity.
  * Retrieves parent documents of matched chunks and combines with user added documents
  * Displays additional documents in the PatientForm
  * Prompts LLM to return structured JSON
  * The prompt is a templated structure based on LangChain template with
    * Current Clinical Context
    * Latest Discharge Summary (initially empty)
    * Combined Relevant Documents w/ Full Text
    * Extra Feedback Provided by User (initially empty)
    * Rules saved from Memory

* Context auto-saves:

  * On patient switch or app close.
  * Debounced local state updates during typing.

#### Right Panel: Discharge Summary Viewer

* Parses structured JSON response from LLM to readable separate HTML sections.
* Mini one way input in the bottom that serves as a quick way to give instructions to modify the output be re-running the LLM.
* When users provides a feedback e.g. "All medications should be formatted as "medication | dosage | frequency"
  * This is inserted into templated prompt and discharge summary is regenerated
  * Feedback should ideally only affect elements reference and keep other parts of the summary the same
  * There will be a small floating banner above the feedback input box that asks something like "would you like this to be rule..."
  * A clean version of the rule is saved into Memory

* Each section has a **copy button**. ✅
* Clicking any output section:

  * Highlights source in context viewer. ✅
  * Based on in-prompt citations parsed from LLM output. ✅

#### Bottom Panel: Context Viewer

* Displays all sources in context: ✅

  * Clear UI distinction between guidelines and notes. ✅

#### Citations Feature Function

*

### 2. Documents & Memory

* **Tab: My Documents**

  * Searchable index of pre-existing guidelines.
  * Upload button to add new PDFs.
  * Option to make uploaded PDF shareable.
  * All new PDFs uploaded should be vectorised and stored. ✅
  * Table view with metadata:

    * Filename, Summary, Uploader, Date Uploaded, Source (User or Community), Share Status

### 3. Snippets

* User-defined text shortcuts. ✅
* Inserted via `/` prefix. ✅
* Allow users to create and manage snippets ✅

### 4. Profile

* Authenticated via Clerk.
* Data isolation:

  * Patients
  * Snippets
  * Uploaded PDFs
  * Profile details

---

## Technical Architecture

### Document Ingestion

* All uploaded PDFs/documents will be both embedded with vectors stored in table w/ pgvector AND stored in **Supabase Storage** as parsed raw text and as raw PDF
* Resumable uploads should be used.
* All CRUD of documents in Storage table should be exclusively through Supabase API
* In Memory, one table action is looking at the PDF in a pop-up modal which retrieves from Storage.

* **Text chunks + embeddings** → stored in **Supabase**:
  ```
  pdf_id | chunk_index | text_chunk   | page_number | embedding       | metadata
  -------------------------------------------------------------------------------
  abc123 | 0           | "Chunk text" | 1           | [0.123, ...]     | {...}
  ```
* Processed using **Langchain** (text + vector extraction)

### Document Retrieval

* We will use Parent Document Retrieval
* We will use embedding similarity search than retrieve the full text from Supabase Storage
* Remember that they can only search over vectors that are either public or belong to PDFs they uploaded

#### Research
* There is some research to suggest rank fusion of BM25 and embedding similarity performs best
* Beyond that adding contextual retrieval (i.e. storying LLM generated context with each chunk) + reranker after rank fusion boosts performance even more
* https://www.anthropic.com/news/contextual-retrieval
* However given the long-context window, it's possible Parent Document Retrieval (PDR) may just be the solution.
* Therefore, for our use case, I will use PDR mostly because it is pretty straightforward and will get us to MVP.

### User Access Logic

* **Signed-in users**: Full feature access.
* **Unsigned users**:

  * Can generate discharge summary.
  * Output is **blurred**.
  * Prompted to **login** to view full output.
  * Currently, for build purposes default user_id is 00000000-0000-0000-0000-000000000000.

---

## Potential Future Features

* **Presets**: Save document sets for reuse.
* **Upload Incentives**: Gain more summary uses by uploading PDFs.
* **Community Library**:

  * Browse shared PDFs.
  * Favorite documents appear first in `@` searches.

---

## User Journeys

### A. Generate Discharge Summary

1. User logs in.
2. Navigates to a patient.
3. Pastes clinical notes.
4. Tags relevant documents with `@`.
5. Adds snippets via `/`.
6. Clicks "Generate Discharge".
7. Views generated summary and citation-based attributions.

### B. Upload Document to Memory

1. Goes to "My Documents".
2. Clicks upload, selects PDF.
3. Enters metadata and chooses sharing option.
4. File is processed, indexed, and searchable.

---

## Analytics & Tracking

* **PostHog** to monitor:

  * Feature usage (e.g., generate, upload, tag)
  * Drop-off points in onboarding
  * Snippet frequency and document access

---

## Success Metrics

* % of summaries generated with citations
* Avg. time to generate summary
* Upload to use conversion ratio
* Snippet and document reuse frequency

---

## Launch Requirements

* PDF preprocessing pipeline via Langchain
* Supabase tables for patients, documents, snippets, profiles
* React Query hooks for all CRUD operations
* Component integration for sidebar, inputs, viewer panels
* LLM prompt templates for summarization and citations
* Authentication gating for premium output visibility
* Styling consistency across Tailwind & Shadcn components

---

## Notes

* Emphasis on **usability**, **explainability**, and **speed**.
* Future extensions to collaborative patient views, versioned discharges, or guideline bundles possible.

---

End of PRD.
