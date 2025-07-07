import type { BlockType } from '@/types/blocks';
import { z } from 'zod';

// Define individual block data schemas that both generation and translation can use
export const blockDataSchemas = {
  medication: z.object({
    medications: z.array(z.object({
      id: z.string().describe('Unique ID for the medication'),
      name: z.string().describe('Medication formatted as "generic_name (brand_name, strength, route & release_mechanism, dosage_form)" required terms are generic_name, strength, route.'),
      dosage: z.string().describe('Dosage amount formatted e.g. 1 tablet(s) or 2 sachet(s)'),
      frequency: z.string().describe('Frequency formatted as e.g. ONCE daily, THREE times a day, ONCE daily morning'),
      duration: z.string().describe('How long to take for'),
      status: z.enum(['new', 'changed', 'unchanged', 'stopped']).describe('Medication status'),
      instructions: z.string().optional().describe('The indication for use of medication. Any other instructions e.g. swallow whole, do not cut, chew, crush, etc.'),
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

// Supported block types (hardcoded as requested)
export const SUPPORTED_BLOCK_TYPES: BlockType[] = ['medication', 'task', 'redFlag', 'appointment'];

// Create dynamic schema for block generation (multiple blocks of different types)
export const createDynamicBlockSchema = (blockTypes: BlockType[]) => {
  // Validate that all requested block types are supported
  const invalidTypes = blockTypes.filter(type => !SUPPORTED_BLOCK_TYPES.includes(type));
  if (invalidTypes.length > 0) {
    throw new Error(`Unsupported block types: ${invalidTypes.join(', ')}`);
  }

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

// Create schema for translation - expects complete blocks with metadata and returns the same
export const createTranslationSchema = (blockTypes: BlockType[]) => {
  // Validate that all requested block types are supported
  const invalidTypes = blockTypes.filter(type => !SUPPORTED_BLOCK_TYPES.includes(type));
  if (invalidTypes.length > 0) {
    throw new Error(`Unsupported block types: ${invalidTypes.join(', ')}`);
  }

  // Create full block schemas (with metadata) that can be any of the requested types
  const blockSchemas = blockTypes.map((blockType) => {
    const dataSchema = blockDataSchemas[blockType];
    if (!dataSchema) {
      throw new Error(`Unknown block type: ${blockType}`);
    }

    return z.object({
      id: z.string().describe('Block ID - preserve exactly'),
      type: z.string().describe(`Block type, must be "${blockType}"`),
      title: z.string().describe('Block title - translate this'),
      isEditable: z.boolean().describe('Editable flag - preserve exactly'),
      isRequired: z.boolean().describe('Required flag - preserve exactly'),
      metadata: z.object({
        createdAt: z.union([z.string(), z.date()]).describe('Creation date - preserve exactly'),
        updatedAt: z.union([z.string(), z.date()]).describe('Update date - preserve exactly'),
        version: z.string().describe('Version - preserve exactly'),
      }).describe('Block metadata - preserve all fields exactly'),
      data: dataSchema.describe('Block data - translate user-facing text only'),
    });
  });

  // Union of all requested block types
  const blockUnion = blockSchemas.length === 1
    ? blockSchemas[0]
    : z.union(blockSchemas as any);

  // Translation schema expects and returns complete blocks
  return z.object({
    translated_blocks: z.array(blockUnion as any).describe('Array of translated blocks with preserved structure'),
  });
};

// Get block types from an array of blocks (useful for translation)
export const getBlockTypesFromBlocks = (blocks: any[]): BlockType[] => {
  const types = blocks.map(block => block.type).filter(type => SUPPORTED_BLOCK_TYPES.includes(type));
  return [...new Set(types)] as BlockType[]; // Remove duplicates
};
