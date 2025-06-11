import type { DischargeSection, GenerateDischargeSummaryRequest, GenerateDischargeSummaryResponse } from '@/types/discharge';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Define Zod schema for structured output
const dischargeSectionsSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string().describe('The section title (e.g., \'Admission Diagnosis\', \'Hospital Course\')'),
      content: z.string().describe('The detailed medical content for this section'),
    }),
  ).describe('Array of discharge summary sections'),
});

const systemTemplate = `You are a medical AI assistant that generates and modifies discharge summaries.

When generating a NEW discharge summary:
- Generate a comprehensive discharge summary based on the clinical context provided
- Create appropriate sections based on the clinical context
- Common sections include: Admission Diagnosis, Hospital Course, Discharge Diagnosis, Medications, Follow-up Instructions, Diet and Activity, Patient Education
- Make the content comprehensive and medically appropriate
- Use clear, professional language

When MODIFYING an existing discharge summary (feedback provided):
- Review the current discharge summary and the specific feedback provided
- ONLY modify the sections or content that the feedback explicitly requests to change
- Keep all other sections and content exactly the same
- Maintain the same section structure and organization
- Apply the feedback precisely while preserving the medical accuracy of unchanged content`;

const generateNewSummaryTemplate = `Patient Context: {context}

Generate a comprehensive discharge summary with appropriate sections.`;

const modifyExistingTemplate = `Current Discharge Summary:
{currentSummary}

Patient Context: {context}

Specific Feedback to Address: {feedback}

Please modify ONLY the parts of the discharge summary that the feedback specifically addresses. Keep all other content exactly the same. Return the complete modified discharge summary with all sections.`;

export async function POST(req: Request) {
  try {
    const { patientId, context, documentIds = [], feedback = '', currentSummary }: GenerateDischargeSummaryRequest = await req.json();

    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
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
      citations: [], // Will be populated later when RAG is implemented
    }));

    const result: GenerateDischargeSummaryResponse = {
      summary: {
        id: dischargeSummaryId,
        patientId: patientId || null,
        sections,
        metadata: {
          generatedAt: currentTimestamp,
          llmModel: 'gemini-1.5-flash',
          documentIds,
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
