import type { BlockType } from '@/types/blocks';
import { currentUser } from '@clerk/nextjs/server';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Define individual block data schemas (only what LLM should generate)
const blockDataSchemas = {
  medication: z.object({
    medications: z.array(z.object({
      id: z.string().describe('Unique ID for the medication'),
      name: z.string().describe('Medication name'),
      dosage: z.string().describe('Dosage amount and unit'),
      frequency: z.string().describe('How often to take'),
      duration: z.string().describe('How long to take for'),
      status: z.enum(['new', 'changed', 'unchanged', 'stopped']).describe('Medication status'),
      instructions: z.string().optional().describe('Special instructions'),
    })),
    groupBy: z.string().describe('Always set to "status"'),
  }),

  task: z.object({
    tasks: z.array(z.object({
      id: z.string().describe('Unique ID for the task'),
      title: z.string().describe('Task title'),
      description: z.string().describe('Detailed task description'),
      priority: z.enum(['high', 'medium', 'low']).describe('Task priority'),
      completed: z.boolean().describe('Task completion status, default false'),
      dueDate: z.string().optional().describe('ISO date string for due date'),
      completedAt: z.string().optional().describe('ISO date string when completed'),
    })),
    enableReminders: z.boolean().describe('Enable task reminders, default true'),
    groupBy: z.enum(['priority', 'dueDate']).describe('How to group tasks, default priority'),
  }),

  redFlag: z.object({
    symptoms: z.array(z.object({
      id: z.string().describe('Unique ID for the symptom'),
      symptom: z.string().describe('Warning symptom'),
      description: z.string().describe('What to do if this occurs'),
    })),
  }),

  appointment: z.object({
    appointments: z.array(z.object({
      id: z.string().describe('Unique ID for the appointment'),
      clinicName: z.string().describe('Clinic or doctor name'),
      description: z.string().describe('Purpose of appointment'),
      status: z.enum(['patient_to_book', 'clinic_will_call', 'already_booked']),
      date: z.string().optional().describe('ISO date string if scheduled'),
    })),
  }),

  text: z.object({
    content: z.string().describe('Text content'),
    format: z.enum(['plain', 'rich']).describe('Text format, default plain'),
  }),
};

// Create dynamic schema for multiple blocks of different types
const createDynamicBlockSchema = (blockTypes: BlockType[]) => {
  // Create a block schema that can be any of the requested types
  const blockSchemas = blockTypes.map((blockType) => {
    const dataSchema = blockDataSchemas[blockType];
    if (!dataSchema) {
      throw new Error(`Unknown block type: ${blockType}`);
    }

    return z.object({
      type: z.string().describe(`Block type, must be "${blockType}"`),
      title: z.string().describe('Block title'),
      data: dataSchema,
    });
  });

  // Union of all requested block types (allows multiple different blocks in the array)
  const blockUnion = blockSchemas.length === 1
    ? blockSchemas[0]
    : z.union(blockSchemas as any);

  // Root schema - array of blocks + metadata
  const schema = z.object({
    blocks: z.array(blockUnion as any).describe('Array of blocks extracted from discharge summary'),
    metadata: z.object({
      patientName: z.string().optional().describe('Patient name if found'),
      dischargeDate: z.string().optional().describe('Discharge date if found'),
      primaryDiagnosis: z.string().optional().describe('Primary diagnosis if found'),
    }).describe('Additional metadata extracted from discharge summary'),
  });

  return schema;
};

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
    const { dischargeSummary, blockTypes = ['medication', 'task', 'redFlag', 'appointment'] } = await req.json();

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

    // Validate block types
    const validBlockTypes: BlockType[] = ['medication', 'task', 'redFlag', 'appointment', 'text'];
    const invalidTypes = blockTypes.filter(type => !validBlockTypes.includes(type));
    if (invalidTypes.length > 0) {
      return Response.json(
        { error: `Invalid block types: ${invalidTypes.join(', ')}` },
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
