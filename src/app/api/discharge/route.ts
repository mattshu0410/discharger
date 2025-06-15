import type { DischargeSection, GenerateDischargeSummaryRequest, GenerateDischargeSummaryResponse } from '@/types/discharge';
import { currentUser } from '@clerk/nextjs/server';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/libs/supabase-server';
import { getVectorStore } from '@/libs/vectorStore';

export const dynamic = 'force-dynamic';

// Define Zod schema for LLM output (only what LLM should generate)
const citationSchema = z.object({
  id: z.string().describe('Unique citation ID like c1, d1, etc.'),
  context: z.string().describe('Surrounding context for the citation'),
  documentUuid: z.string().optional().describe('Document UUID for document citations (required for d1, d2, etc.)'),
});

const dischargeSectionsSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string().describe('The section title (e.g., \'Admission Diagnosis\', \'Hospital Course\')'),
      content: z.string().describe('Content with inline citations using <CIT id="c1">highlighted text</CIT> format'),
      citations: z.array(citationSchema).describe('Citations for this section with proper source attribution'),
    }),
  ).describe('Array of discharge summary sections with embedded nested citation arrays.'),
});

const systemTemplate = `You are a medical AI assistant that generates discharge summaries with proper citations.

CITATION REQUIREMENTS:
- Use inline citations with <CIT id="c1">highlighted text</CIT> format
- Use IDs starting with "c" for user-typed clinical context (c1, c2, etc.)
- Use IDs starting with "d" for uploaded documents (d1, d2, etc.)
- For document citations (d1, d2, etc.), you MUST include the documentUuid field with the exact UUID from the document
- For context citations (c1, c2, etc.), do NOT include documentUuid field
- Wrap the exact text being cited with <CIT> tags and provide matching citation objects
- Be specific about what text is being cited and why it's relevant
- Every significant medical claim should have an appropriate citation

When generating a NEW discharge summary:
- The overall structure of the discharge summary is separate objects for each section, each with a title, content, and array of citations.
- You absolutely must generate a new object in the array for each separate section of the discharge summary.
- Create appropriate sections based on clinical context
- Common sections: Admission Diagnosis, Hospital Course, Discharge Diagnosis, Medications, Follow-up Instructions, Diet and Activity, Patient Education
- At minimum you must generate a section for the following:
  - Summary of Care
    - Date of Admission
    - Date of Discharge
    - Admitted Under
    - Diagnosis
  - Discharge Plan
    - Follow-up Instructions
    - Medication Changes
      - New
      - Ceased
    - Red Flag Symptoms
- You have text from patient clinical context and a text from uploaded documents.
- Generate comprehensive discharge summary with embedded citations
- When you reference or rely on a specific piece of clinical context or document cite as: 
  - <CIT id="c1">text</CIT> for clinical context
  - <CIT id="d1">text</CIT> for documents
  - The text in the <CIT> is part of your answer not the original reference text.
  - The id is unique and must be used only once in the discharge summary e.g. c1, c2, c3, c4 etc.
  - Only add <CIT> tags to the text around key phrases of your answer that are specifically medical claims or references.
  - E.g. He presented with <CIT id="c4">increasing shortness of breath and wheezining</CIT>.
        "Remember: The text inside <CIT> is your final answer's snippet, not the chunk text itself.
        "The user question is below."
- Use clear, professional language with proper attribution
When MODIFYING an existing discharge summary (feedback provided):
- Review current discharge summary and specific feedback provided
- ONLY modify sections/content that feedback explicitly requests to change
- Maintain existing citations unless feedback specifically addresses them
- Add new citations as needed for any new content
- Preserve medical accuracy of unchanged content`;

const generateNewSummaryTemplate = `Patient Clinical Context: {context}

Selected Documents: {documentContents}

Generate a comprehensive discharge summary with inline citations. Use <CIT id="c1">text</CIT> for patient context and <CIT id="d1">text</CIT> for documents.`;

const modifyExistingTemplate = `Current Discharge Summary:
{currentSummary}

Patient Clinical Context: {context}

Selected Documents: {documentContents}

Specific Feedback to Address: {feedback}

Please modify ONLY the parts of the discharge summary that the feedback specifically addresses. Keep all other content exactly the same. Return the complete modified discharge summary with all sections.`;

export async function POST(req: Request) {
  try {
    const { patientId, context, documentIds = [], feedback = '', currentSummary }: GenerateDischargeSummaryRequest = await req.json();

    // Get the current user
    const user = await currentUser();
    if (!user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const supabase = createServerSupabaseClient();

    // Step 1: Perform RAG similarity search if context is provided
    let ragDocumentIds: string[] = [];
    if (context && context.trim().length > 0) {
      try {
        const vectorStore = await getVectorStore(user.id);
        const similarDocs = await vectorStore.similaritySearch(context, 5); // Get top 5 similar chunks

        // Extract unique document IDs from the similar chunks
        const uniqueDocIds = new Set<string>();
        similarDocs.forEach((doc) => {
          if (doc.metadata?.document_id) {
            uniqueDocIds.add(doc.metadata.document_id);
          }
        });
        ragDocumentIds = Array.from(uniqueDocIds);
        console.warn('RAG found document IDs:', ragDocumentIds);
      } catch (error) {
        console.error('RAG search error:', error);
        // Continue without RAG results if there's an error
      }
    }

    // Step 2: Combine user-selected documents with RAG-retrieved documents
    const allDocumentIds = [...new Set([...documentIds, ...ragDocumentIds])];
    console.warn('All document IDs to retrieve:', allDocumentIds);

    // Step 3: Retrieve full text for all documents
    let documentContents = 'No documents available.';
    const availableDocuments = new Map<string, string>(); // Map UUID to filename for validation

    if (allDocumentIds.length > 0) {
      const { data: documents, error } = await supabase
        .from('documents')
        .select('id, filename, full_text')
        .in('id', allDocumentIds);

      if (error) {
        console.error('Error fetching documents:', error);
      } else if (documents && documents.length > 0) {
        // Format documents for the prompt with UUIDs for LLM reference
        documentContents = documents
          .map((doc) => {
            availableDocuments.set(doc.id, doc.filename); // Store for validation
            return `Document UUID: ${doc.id} (Filename: ${doc.filename}):\n${doc.full_text || 'No content available'}`;
          })
          .join('\n\n---\n\n');
        console.warn(`Retrieved ${documents.length} documents with full text`);
      }
    }

    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      temperature: 0.3,
    });

    // Create structured output model with Zod schema
    const structuredModel = model.withStructuredOutput(dischargeSectionsSchema, {
      name: 'discharge_summary_sections',
    });

    let prompt: ChatPromptTemplate;
    let invokeParams: Record<string, string>;

    // Determine if this is a new generation or modification
    const isModification = feedback && currentSummary;

    if (isModification) {
      // Modification flow: include current summary and specific feedback
      prompt = ChatPromptTemplate.fromMessages([
        ['system', systemTemplate],
        ['user', modifyExistingTemplate],
      ]);

      // Format current summary for LLM
      const formattedCurrentSummary = currentSummary.sections
        .map(section => `## ${section.title}\n\n${section.content}`)
        .join('\n\n');

      invokeParams = {
        currentSummary: formattedCurrentSummary,
        context,
        documentContents,
        feedback,
      };
    } else {
      // New generation flow
      prompt = ChatPromptTemplate.fromMessages([
        ['system', systemTemplate],
        ['user', generateNewSummaryTemplate],
      ]);

      invokeParams = {
        context,
        documentContents,
      };
    }

    const chain = prompt.pipe(structuredModel);
    const llmResponse = await chain.invoke(invokeParams);

    // Build structured response with API-generated metadata
    const dischargeSummaryId = `discharge_${Date.now()}`;
    const currentTimestamp = new Date();

    const sections: DischargeSection[] = llmResponse.sections.map((section, index) => ({
      id: `section_${dischargeSummaryId}_${index + 1}`,
      title: section.title,
      content: section.content,
      order: index + 1,
      citations: section.citations.map((citation) => {
        // Determine source type from ID prefix (c1, c2 = context; d1, d2 = document)
        const isContextCitation = citation.id.startsWith('c');

        const baseCitation = {
          id: citation.id, // Use original LLM ID (c1, d1, etc.) directly
          context: citation.context,
          relevanceScore: 1.0, // Default high relevance for now
        };

        if (isContextCitation) {
          return {
            ...baseCitation,
            sourceType: 'user-context' as const,
            contextSection: 'main', // Default section
          };
        } else {
          // Use document UUID from LLM response, validate it exists
          const documentId = citation.documentUuid || 'unknown-doc-id';
          const isValidDocument = availableDocuments.has(documentId);

          if (!isValidDocument && citation.documentUuid) {
            console.warn(`LLM referenced unknown document UUID: ${citation.documentUuid}`);
          }

          return {
            ...baseCitation,
            sourceType: 'selected-document' as const,
            documentId,
            chunkId: undefined,
            pageNumber: undefined,
          };
        }
      }),
    }));

    const result: GenerateDischargeSummaryResponse = {
      summary: {
        id: dischargeSummaryId,
        patientId: patientId || null,
        sections,
        metadata: {
          generatedAt: currentTimestamp,
          llmModel: 'gemini-2.0-flash',
          documentIds: allDocumentIds, // Include both selected and RAG-retrieved documents
          feedbackApplied: isModification && feedback
            ? [...(currentSummary?.metadata.feedbackApplied || []), feedback]
            : [],
        },
      },
    };

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Discharge generation error:', error);
    return Response.json(
      { error: 'Failed to generate discharge summary' },
      { status: 500 },
    );
  }
}
