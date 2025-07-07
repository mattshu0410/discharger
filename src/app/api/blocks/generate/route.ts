import type { BlockType } from '@/types/blocks';
import { currentUser } from '@clerk/nextjs/server';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createDynamicBlockSchema, SUPPORTED_BLOCK_TYPES } from '@/libs/blockSchemas';

export const dynamic = 'force-dynamic';

const systemPrompt = `You are a medical AI assistant that transforms discharge summaries into patient-friendly blocks.

Your task is to extract and organize information into structured blocks that patients can easily understand and act upon.

Guidelines:
- Use simple, patient-friendly language
- Be specific about dosages, frequencies, and durations
- Prioritize tasks by importance (high/medium/low)
- Include all follow-up appointments mentioned
- Extract ALL warning symptoms/red flags
- Group medications by status (new/changed/unchanged/stopped)
- Set dueDate for tasks as ISO strings relative to today when timeframes are mentioned
- Generate unique descriptive IDs for each item (e.g., "med_aspirin", "task_follow_up", "appt_cardiology")

Output Format:
- Return a root object with 'blocks' array and 'metadata' object
- Generate multiple blocks of different types as requested
- Each block should have type, title, and data fields only
- Ensure all medical terms are explained in simple language`;

const createUserPrompt = (blockTypes: BlockType[]) => {
  const blockDescriptions = {
    medication: '- medication blocks: List all medications with clear instructions',
    task: '- task blocks: Recovery tasks and self-care instructions',
    redFlag: '- redFlag blocks: Warning symptoms that require immediate medical attention',
    appointment: '- appointment blocks: Follow-up appointments and clinic visits',
    text: '- text blocks: Additional important information',
  };

  const requestedBlocks = blockTypes.map(type => blockDescriptions[type]).join('\n');

  return `Extract structured blocks from this discharge summary:

{dischargeSummary}

Generate these block types (create one block of each type that has relevant information):
${requestedBlocks}

Transform this into patient-friendly blocks that help the patient understand:
1. What medications to take and how (if medication blocks requested)
2. What they need to do for recovery (if task blocks requested)
3. When to seek immediate help (if redFlag blocks requested)
4. What appointments they need to attend (if appointment blocks requested)

Return a JSON object with:
- blocks: array containing one block of each requested type (only include blocks that have relevant content)
- metadata: object with patientName, dischargeDate, primaryDiagnosis (if found)`;
};

export async function POST(req: Request) {
  try {
    const { dischargeSummary, blockTypes = SUPPORTED_BLOCK_TYPES } = await req.json();

    if (!dischargeSummary || typeof dischargeSummary !== 'string') {
      return Response.json(
        { error: 'dischargeSummary is required and must be a string' },
        { status: 400 },
      );
    }

    if (!Array.isArray(blockTypes) || blockTypes.length === 0) {
      return Response.json(
        { error: 'blockTypes must be a non-empty array' },
        { status: 400 },
      );
    }

    // Validate block types using shared schema
    const invalidTypes = blockTypes.filter(type => !SUPPORTED_BLOCK_TYPES.includes(type));
    if (invalidTypes.length > 0) {
      return Response.json(
        { error: `Invalid block types: ${invalidTypes.join(', ')}. Supported types: ${SUPPORTED_BLOCK_TYPES.join(', ')}` },
        { status: 400 },
      );
    }

    // Get the current user
    const user = await currentUser();
    if (!user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      temperature: 0.3,
    });

    // Create dynamic schema based on requested block types
    const blockSchema = createDynamicBlockSchema(blockTypes);

    // Create structured output model with dynamic schema
    const structuredModel = model.withStructuredOutput(blockSchema, {
      name: 'block_generation',
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      ['user', createUserPrompt(blockTypes)],
    ]);

    const chain = prompt.pipe(structuredModel);
    const llmResponse = await chain.invoke({
      dischargeSummary,
    });

    // Add metadata fields to blocks (what LLM doesn't generate)
    const blocksWithMetadata = llmResponse.blocks.map((block, index) => ({
      id: `block_${Date.now()}_${index}`,
      type: block.type,
      title: block.title,
      isEditable: true,
      isRequired: true,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
      },
      data: block.data,
    }));

    return Response.json(
      {
        blocks: blocksWithMetadata,
        metadata: llmResponse.metadata,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Block generation error:', error);
    return Response.json(
      { error: 'Failed to generate blocks' },
      { status: 500 },
    );
  }
}
