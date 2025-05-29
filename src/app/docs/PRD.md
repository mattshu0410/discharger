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
* `@` hotkey opens searchable document selector:

  * Search updates results live.
  * `Enter` selects first result.
  * Arrow keys allow navigation.
  * Added document appears as tag below input field.
* `/` hotkey for inserting snippets (e.g., `/orthonote`).
* "Generate Discharge" button:

  * Sends input context.
  * Matches documents via vector similarity.
  * Adds relevant documents to context automatically.
* Context auto-saves:

  * On patient switch or app close.
  * Debounced local state updates during typing.

#### Right Panel: Discharge Summary Viewer

* Parses structured JSON response to readable HTML sections.
* Each section has a **copy button**.
* Clicking any output section:

  * Highlights source in context viewer.
  * Based on in-prompt citations parsed from LLM output.

#### Bottom Panel: Context Viewer

* Displays all sources in context:

  * Clear UI distinction between guidelines and notes.

### 2. Documents & Memory

* **Tab: My Documents**

  * Searchable index of pre-existing guidelines.
  * Upload button to add new PDFs.
  * Option to make uploaded PDF shareable.
  * Table view with metadata:

    * Filename, Summary, Uploader, Date Uploaded, Source (User or Community), Share Status

### 3. Snippets

* User-defined text shortcuts.
* Inserted via `/` prefix.

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

* **Raw PDFs** → stored in **AWS S3**
* **Text chunks + embeddings** → stored in **Supabase**:

  ```
  pdf_id | chunk_index | text_chunk   | page_number | embedding       | metadata
  -------------------------------------------------------------------------------
  abc123 | 0           | "Chunk text" | 1           | [0.123, ...]     | {...}
  ```
* Processed using **Langchain** (text + vector extraction)

### User Access Logic

* **Signed-in users**: Full feature access.
* **Unsigned users**:

  * Can generate discharge summary.
  * Output is **blurred**.
  * Prompted to **login** to view full output.

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
