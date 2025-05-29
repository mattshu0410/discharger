Technical
- NextJS as the react framework
- React 19
- Zustand for state management
- React Query for data fetching
- Tailwind CSS v5
- Shadcn UI components
- Supabase postgresql for backend as a service
- pgvector extension for vector stores.
- Clerk for authentication
- Zod to qualify form inputs
- Langchain as for API requests to models
- AWS S3 for original document storage
- PostHog for analytics
- Using Intro.js for onboarding

MVP Features
- Main Page
-- sidebar
1. patients view
2. settings -> Memory, Snippets, Profile
-- inputting context (left panel)
1. user can copy and paste in patient notes
2. user can tag documents to be added to context with @ hotkey which brings up an in-context dropdown with search where they type out the concept of the document they are looking for. As they search, results change but typing enter will select the first result in the search results. They can navigate up and down search results using up and down arrow key. Once document is added shows visually as a tag at the bottom of the input window with the title of the document in the tag.
3. user can use saved snippets by / hotkey followed by e.g. /orthonote
4. clicking generate discharge also passes the patient note and uses vector similarity to determine if there are clinical guidelines from the existing database of documents that should be added as context
5. automatic saving to database entered context on switching patient or closing app, debounced saving to client side state during typing

-- discharge summary viewer (right panel)
1. Returned structured JSON is parsed into a HTML block output for each section with a copy paste button e.g. Medications
2. Clicking on any part of the text shows in the context viewer the document attribution e.g. where in the original context this output comes from. The way to achieve this will be through including request for citations in the prompt and parsing the LLM return to process the citation.

-- context viewer (bottom)
1. See all the different documents, pasted clinical notes that were in the original context. Should be formatted such that it's clear from UI what is a guideline and what is a entered clinical note

- documents & memory
-- Tab My Documents
1. database of pre-existing clinical guidelines with associated summaries which are searchable via the @ hotkey
2. ability to upload own PDFs to be stored in Memory
3. all PDFs uploaded can be made available to all users and stored in the wider database, with provenance of uploader kept if user indicates shareable
4. Table viewer of 'my' PDFs with a search bar and a button to upload new PDFs with all relevant metadata in the table as appropriate UI.

- snippets
1. snippets are a way to store commonly used text snippets e.g. /orthonote

- profile
1. every user can only access their own patients
2. every user can only access their own snippets
3. every user can only access their own profile
4. every user can only access their own memory

Technical Decisions
- We will pass documents in it's entirety into context of language model
- For document storage we will store raw PDFs in AWS S3
- We will store chunked extracted raw text + embeddings in Supabase
- We will use Langchain to process the documents and extract the text and embeddings
- New users that aren't signed in can generate discharges but it doesn't show the full discharge, just blurred and says 'login to see full discharge'

e.g.
pdf_id	chunk_index	text_chunk	page_number	embedding	metadata
abc123	0	"Chunk 1 text…"	1	[0.123, …]	{...}
abc123	1	"Chunk 2 text…"	1	[0.456, …]	{...}

Potential Future Features
- Ability to save presets of documents to load
- Uploading a PDF earns you more discharge uses
- Browse Community Documents - ability to browse community uploaded PDFs, click to retrieve original PDF from AWS S3 to read and to add to favourites which appear at the top of the search results in the context viewer
