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
- Don't be lazy. Cite throughout all sections.
- Use inline citations with <CIT id="c1">highlighted text</CIT> format
- Use IDs starting with "d" for uploaded documents (d1, d2, etc.)
- For document citations (d1, d2, etc.), you MUST include the documentUuid field with the exact UUID from the document
- For references to documents you don't need to write out page number, document names or give justification or explain medical concepts. Just reference it for conceptual information.
- Use IDs starting with "c" for user-typed clinical context (c1, c2, etc.)
- For context citations (c1, c2, etc.), do NOT include documentUuid field
- Every citation should have a corresponding citation object in the citations array.
- Wrap the exact text being cited with <CIT> tags and provide matching citation objects
- Be specific about what text is being cited and why it's relevant
- Every significant medical claim should have an appropriate citation

ADMINISTRATIVE INFORMATION:
- Use the provided administrative information to create a professional letterhead for the discharge summary in this order
- The letterhead should first have the Hospital Details
  - Facility: 
  - Local Health District:
  - Address:
  - Phone:
  - Fax:
- Then the admission details and provider.
  - Admission Date:
  - To be Discharged:
  - Physician Name:
  - Title:
  - Department:
- Then the Patient Details. If any are not available simply omit them. Do not make up any information.
  - Patient Full Name:
  - Deceased statement (if applicable)
  - Date of Birth (Age in years):
  - Sex:
  - Residential Address:
  - Telephone (work and home, if available):
  - MRN:
  - Indigenous status:
  - Interpreter required:
- This information should inform the professional context but not be directly cited with <CIT> tags
- Do not include any other information in the letterhead.

GENERAL GUIDELINES FOR DISCHARGE SUMMARY:
- Use carriage returns to separate dotpoints
- All dotpoints start with *
- The overall structure of the discharge summary is separate objects for each section, each with a title, content, and array of citations.
- You absolutely must generate a new object in the array for each separate section of the discharge summary.
- Create appropriate sections based on clinical context. The National Guidelines for Discharge Summaries are as follows:
  - Administrative Information
  - Introduction + Summary of Care
    - "Dear Dr. X, thank you for reviewing [patient name] a [patient age] year old [patient sex] to be discharged on [discharge date] from [department] at [facility]. The summary of their presentation and condition is documented below." 
    -  Cover the following concepts in dotpoint format. Each dotpoint should be a complete sentence rather than starting with Item:
      - Principal diagnosis
      - Reason for presention i.e. symptoms that led to the admission and events including any treatment en route/before
      - Secondary diagnoses i.e. the list of problems and diagnoses in addition to the principal diagnosis that was treated at the hospital
      - Additional complications i.e. any additional patient condition or adverse events that affected the hospital treatment
      - Past medical history i.e. previous patient conditions that are relevant to treatment provided at hospital and important for primary healthcare provider to be aware of.
      - Summary of salient points of the patient care.
        - Which departments were consulted e.g. Orthopedics, Cardiology, etc.
        - Positive findings on imaging, labs, etc.
        - Major procedures performed, including any complications, and any other significant events.
        - Any other significant events or findings that are relevant to the patient's care.
  - Discharge Plan
    - Should be in a dotpoint format.
    - Only for items that is a clinic/service/specialist write referral sent, patient will be contacted regarding this appointment
    - Do NOT include medications.
    - You must then cover the following in dotpoint format:
      - Any follow up with specific clinics or services
      - Any follow up pathology or labs that need ot be done
      - Any referrals to other services or specialists
  - Issues List
    - Not always necessary if the presentation is not complex
    - Include relevant pathology/imaging, bedside findings or subjective tests e.g. ECOG, of significance but do not make up any values. Include specific dates where available.
    - Include relevant negative findings from above tests
    - Finish with plan for ongoing care and follow up appointments
  - Allergies/Adverse Reactions
    - Include any allergies or adverse reactions to medications or treatments that were noted.
    - Include the type of reaction e.g. allergic, adverse, etc.
    - Describe the negative effect e.g. urticaria, anaphylaxis, etc.
  - Medications
    - Go over four
      - New medications
      - Changed medications
      - Unchanged medications
      - Ceased medications should end with capitalised "CEASED" at end of each line
    - List medications in alphabetical order
    - Where a medicines list was not obtained, the section should NOT be left blank, this should be indicated with a line saying: Medication list unable to be obtained during admission OR medication reconciliation has not been completed for this patient OR patient is not on regular medication.
    - Medication should include generic name (Australian commercial name, strength, type of tablet e.g. Modified Release, Immediate Release) dosage, route, frequency. Use full names and do not abbreviate.
  - Information Provided to the Patient
    - Describe any education/information that was provided to the patient during their stay.
    - You can write education that is relevant to the patient's condition and the department and leave it to the operator to decide what to include
    - Understanding of instructions and health literacy. Awareness of condition and management.

GUIDELINES FOR IN-LINE CITATIONS:
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

    // Step 1: Get user profile and hospital information for administrative section
    let administrativeInfo = '';
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          full_name,
          title,
          department,
          hospital_id,
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
      }
    } catch (error) {
      console.error('Error fetching user profile for administrative info:', error);
      // Continue without administrative info if there's an error
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
