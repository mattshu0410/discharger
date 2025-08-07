import type { DischargeSection, GenerateDischargeSummaryRequest, GenerateDischargeSummaryResponse } from '@/types/discharge';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
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

const systemTemplate = `You are a medical AI assistant that converts electronic health record notes into concise discharge summaries with appropriate citations.
CITATION SYSTEM
- Use <CIT id="c1">keyword</CIT> for clinical information from electronic health record notes
- Keep citations short (1-3 words maximum)
- Cite key diagnoses, symptoms, findings, and treatments
- Each citation ID used only once (c1, c2, c3, etc.)
- IMPORTANT: Citations should be seamlessly integrated into the text without adding extra spaces before or after the citation tags
OUTPUT STRUCTURE
- Generate two main sections:
1. ADMISSION SUMMARY
- Format: "Dear Doctor, Thank you for your ongoing care of [patient], a [age]-year-old [gender] who presented to the Emergency Department at [hospital] on [date] with [chief complaint]."
- Content (use line breaks for readability):
- Primary <CIT id="c1">diagnosis</CIT> and key <CIT id="c2">symptoms</CIT>
- Relevant examination findings and investigations
- Treatment provided in ED
- Clinical reasoning for discharge decision
2. DISCHARGE PLAN
- Format: Use proper line breaks and formatting:
- Discharge destination
- Medications (if any):
  - List new medications with full dosing details
  - "Please continue the following medications:"
- Follow-up arrangements:
  - GP review timeframe
  - Specialist referrals if needed
- Safety netting:
  - "Please seek medical attention if..."
  - List specific red flag symptoms
- Sign-off: "Kind Regards, Dr [Name], Emergency Medicine JMO"
WRITING GUIDELINES
- Write concisely for GP audience
- Use professional medical language
- Base content directly on note information
- Don't invent details not in the source
- Focus on clinically relevant information for ongoing care
- Use line breaks (\\n) to separate different pieces of information for better readability
- Format lists and key points on separate lines
- Ensure citations flow naturally within sentences without disrupting spacing
EXAMPLE CITATION USAGE
- Patient presented with <CIT id="c1">chronic sciatica</CIT> pain
- Examination revealed <CIT id="c2">positive straight leg raise</CIT> bilaterally
- <CIT id="c3">CT brain</CIT> imaging showed no abnormalities
- Treated with <CIT id="c4">IV stemetil</CIT> for nausea
EXAMPLE DISCHARGE SUMMARY
{exampleDischargeSummary}

Keep it simple, accurate, and clinically focused. Use proper formatting with line breaks for better readability.`;

const generateNewSummaryTemplate = `Administrative Information: {administrative}

Patient Clinical Context: {context}

Selected Documents: {documentContents}

Generate a comprehensive discharge summary with inline citations. Use <CIT id="c1">text</CIT> for patient context and <CIT id="d1">text</CIT> for documents.`;

const modifyExistingTemplate = `Current Discharge Summary:
{currentSummary}

Administrative Information: {administrative}

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

    // Step 1: Get user profile, hospital information, and exemplar report
    let administrativeInfo = '';
    let exemplarReport = '';
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          full_name,
          title,
          department,
          hospital_id,
          exemplar_report,
          hospitals (
            name,
            address,
            phone,
            fax,
            local_health_district
          )
        `)
        .eq('id', user.id)
        .single();

      if (profile) {
        const hospitalInfo = profile.hospitals as any;
        administrativeInfo = [
          profile.full_name && `Physician: ${profile.full_name}`,
          profile.title && `Position: ${profile.title}`,
          profile.department && `Department: ${profile.department}`,
          hospitalInfo?.name && `Hospital: ${hospitalInfo.name}`,
          hospitalInfo?.address && `Address: ${hospitalInfo.address}`,
          hospitalInfo?.phone && `Phone: ${hospitalInfo.phone}`,
          hospitalInfo?.fax && `Fax: ${hospitalInfo.fax}`,
          hospitalInfo?.local_health_district && `Health District: ${hospitalInfo.local_health_district}`,
        ].filter(Boolean).join('\n');

        // Get exemplar report with priority logic
        if (profile.exemplar_report) {
          // Priority 1: User's custom exemplar report
          exemplarReport = profile.exemplar_report;
        } else if (profile.department) {
          // Priority 2: Department-specific exemplar
          try {
            const departmentPath = join(process.cwd(), 'tests', 'discharger', profile.department.toLowerCase().replace(/\s+/g, '-'), 'reports', '1.txt');

            if (existsSync(departmentPath)) {
              exemplarReport = readFileSync(departmentPath, 'utf8');
            } else {
              // Priority 3: Fall back to emergency medicine exemplar
              const defaultPath = join(process.cwd(), 'tests', 'discharger', 'emergency-medicine', 'reports', '1.txt');
              exemplarReport = readFileSync(defaultPath, 'utf8');
            }
          } catch (error) {
            console.error('Error reading department exemplar report:', error);
            // Fall back to emergency medicine exemplar
            try {
              const defaultPath = join(process.cwd(), 'tests', 'discharger', 'emergency-medicine', 'reports', '1.txt');
              exemplarReport = readFileSync(defaultPath, 'utf8');
            } catch (fallbackError) {
              console.error('Error reading default exemplar report:', fallbackError);
              exemplarReport = 'No exemplar report available.';
            }
          }
        } else {
          // Priority 3: Default to emergency medicine exemplar
          try {
            const defaultPath = join(process.cwd(), 'tests', 'discharger', 'emergency-medicine', 'reports', '1.txt');
            exemplarReport = readFileSync(defaultPath, 'utf8');
          } catch (error) {
            console.error('Error reading default exemplar report:', error);
            exemplarReport = 'No exemplar report available.';
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user profile for administrative info:', error);
      // Continue without administrative info if there's an error
      // Try to get default exemplar report
      try {
        const defaultPath = join(process.cwd(), 'tests', 'discharger', 'emergency-medicine', 'reports', '1.txt');
        exemplarReport = readFileSync(defaultPath, 'utf8');
      } catch (fallbackError) {
        console.error('Error reading default exemplar report:', fallbackError);
        exemplarReport = 'No exemplar report available.';
      }
    }

    // Step 2: Perform RAG similarity search if context is provided
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
        // console.warn('RAG found document IDs:', ragDocumentIds);
      } catch (error) {
        console.error('RAG search error:', error);
        // Continue without RAG results if there's an error
      }
    }

    // Step 3: Combine user-selected documents with RAG-retrieved documents
    const allDocumentIds = [...new Set([...documentIds, ...ragDocumentIds])];
    // console.warn('All document IDs to retrieve:', allDocumentIds);

    // Step 4: Retrieve full text for all documents
    let documentContents = 'No documents available.';
    const availableDocuments = new Map<string, string>(); // Map UUID to filename for validation
    const missingDocuments: string[] = [];

    if (allDocumentIds.length > 0) {
      const { data: documents, error } = await supabase
        .from('documents')
        .select('id, filename, full_text')
        .in('id', allDocumentIds);

      if (error) {
        console.error('Error fetching documents:', error);
      } else if (documents && documents.length > 0) {
        // Check which documents are missing (graceful handling of unavailable documents)
        const foundDocumentIds = new Set(documents.map(doc => doc.id));
        missingDocuments.push(...allDocumentIds.filter(id => !foundDocumentIds.has(id)));

        if (missingDocuments.length > 0) {
          // console.warn(`Some referenced documents are no longer available: ${missingDocuments.join(', ')}`);
        }

        // Format available documents for the prompt with UUIDs for LLM reference
        documentContents = documents
          .map((doc) => {
            availableDocuments.set(doc.id, doc.filename); // Store for validation
            return `Document UUID: ${doc.id} (Filename: ${doc.filename}):\n${doc.full_text || 'No content available'}`;
          })
          .join('\n\n---\n\n');

        // Add note about missing documents if any
        if (missingDocuments.length > 0) {
          documentContents += `\n\n[Note: ${missingDocuments.length} previously referenced document(s) are no longer available and have been excluded from this generation.]`;
        }

        // console.warn(`Retrieved ${documents.length} documents with full text. ${missingDocuments.length} documents unavailable.`);
      } else {
        // All documents are missing
        missingDocuments.push(...allDocumentIds);
        // console.warn(`All referenced documents (${allDocumentIds.length}) are no longer available`);
        documentContents = '[Note: Previously referenced documents are no longer available. Generating discharge summary based on clinical context only.]';
      }
    }

    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash-preview-05-20',
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
        administrative: administrativeInfo,
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
        administrative: administrativeInfo,
        context,
        documentContents,
        exampleDischargeSummary: exemplarReport,
      };
    }

    const chain = prompt.pipe(structuredModel);
    const llmResponse = await chain.invoke(invokeParams);

    // DEBUG: Log the raw LLM response
    // console.warn('=== DEBUG: Raw LLM Response ===');
    // console.warn(JSON.stringify(llmResponse, null, 2));
    // console.warn('=== END DEBUG ===');

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
            // console.warn(`LLM referenced unknown document UUID: ${citation.documentUuid}`);
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
          llmModel: 'gemini-2.5-flash',
          documentIds: Array.from(availableDocuments.keys()), // Only include actually available documents
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
