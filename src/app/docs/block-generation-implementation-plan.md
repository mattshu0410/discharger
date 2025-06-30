# Block Generation Implementation Plan

## Overview
Implement an AI-powered block generation system that transforms discharge summaries into structured, patient-friendly blocks for the patient portal.

## Architecture Components

### 1. Database Schema
```sql
-- New table for patient summaries with block data
CREATE TABLE patient_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES user_profiles(id),
  
  -- Block data
  blocks JSONB NOT NULL, -- Array of blocks following types/blocks.ts structure
  
  -- Source data
  discharge_text TEXT, -- Original discharge summary text
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'))
);

-- Add RLS policies
ALTER TABLE patient_summaries ENABLE ROW LEVEL SECURITY;

-- Policy for doctors to manage their summaries
CREATE POLICY "Doctors can manage their summaries" ON patient_summaries
  FOR ALL USING (doctor_id = auth.uid());

-- Policy for patients to view their summaries
CREATE POLICY "Patients can view their summaries" ON patient_summaries
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients WHERE clerk_user_id = auth.uid()
    )
  );
```

### 2. API Structure

#### `/api/blocks/generate/route.ts`
- POST endpoint to generate blocks from discharge summary
- Uses Langchain with structured output
- Input: discharge summary text
- Output: array of blocks matching types/blocks.ts

#### `/api/patient-summaries/route.ts`
- GET: List patient summaries
- POST: Create new patient summary with blocks

#### `/api/patient-summaries/[id]/route.ts`
- GET: Get specific patient summary
- PATCH: Update patient summary blocks
- DELETE: Delete patient summary

#### `/api/patient-summaries/[id]/blocks/route.ts`
- PATCH: Update individual blocks within a summary

### 3. LLM Schema Design

```typescript
// Root level must be an object, not anyOf
const createBlockGenerationSchema = () => {
  // Individual block data schemas
  const medicationDataSchema = z.object({
    medications: z.array(z.object({
      name: z.string().describe('Medication name'),
      dosage: z.string().describe('Dosage amount and unit'),
      frequency: z.string().describe('How often to take'),
      duration: z.string().describe('How long to take for'),
      status: z.enum(['new', 'changed', 'unchanged', 'stopped']).describe('Medication status'),
      instructions: z.string().optional().describe('Special instructions'),
    })),
    groupBy: z.literal('status'),
  });

  const taskDataSchema = z.object({
    tasks: z.array(z.object({
      title: z.string().describe('Task title'),
      description: z.string().describe('Detailed task description'),
      priority: z.enum(['high', 'medium', 'low']).describe('Task priority'),
      dueDate: z.string().optional().describe('ISO date string for due date'),
    })),
    enableReminders: z.boolean().default(true),
    groupBy: z.literal('priority'),
  });

  const redFlagDataSchema = z.object({
    symptoms: z.array(z.object({
      symptom: z.string().describe('Warning symptom'),
      description: z.string().describe('What to do if this occurs'),
    })),
  });

  const appointmentDataSchema = z.object({
    appointments: z.array(z.object({
      clinicName: z.string().describe('Clinic or doctor name'),
      description: z.string().describe('Purpose of appointment'),
      status: z.enum(['patient_to_book', 'clinic_will_call', 'already_booked']),
      date: z.string().optional().describe('ISO date string if scheduled'),
    })),
  });

  const textDataSchema = z.object({
    content: z.string().describe('Text content'),
    format: z.literal('plain'),
  });

  // Root schema - must be an object at top level
  const blockGenerationSchema = z.object({
    blocks: z.array(z.object({
      type: z.string().describe('Block type'),
      title: z.string().describe('Block title'),
      isEditable: z.boolean().default(true),
      isRequired: z.boolean().default(true),
      data: z.any(), // Will be validated based on type
    })).describe('Array of blocks extracted from discharge summary'),
    metadata: z.object({
      patientName: z.string().optional().describe('Patient name if found'),
      dischargeDate: z.string().optional().describe('Discharge date if found'),
      primaryDiagnosis: z.string().optional().describe('Primary diagnosis if found'),
    }).describe('Additional metadata extracted from discharge summary'),
  });

  // For runtime validation after LLM generation
  const validateBlockData = (block: any) => {
    switch (block.type) {
      case 'medication':
        return medicationDataSchema.parse(block.data);
      case 'task':
        return taskDataSchema.parse(block.data);
      case 'redFlag':
        return redFlagDataSchema.parse(block.data);
      case 'appointment':
        return appointmentDataSchema.parse(block.data);
      case 'text':
        return textDataSchema.parse(block.data);
      default:
        throw new Error(`Unknown block type: ${block.type}`);
    }
  };

  return { blockGenerationSchema, validateBlockData };
};
```

### 4. React Query Integration

#### `/src/api/blocks/queries.ts`
```typescript
// Generate blocks from discharge summary
export const generateBlocks = async (dischargeSummary: string) => {
  const response = await fetch('/api/blocks/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dischargeSummary }),
  });
  if (!response.ok) throw new Error('Failed to generate blocks');
  return response.json();
};
```

#### `/src/api/blocks/hooks.ts`
```typescript
export const useGenerateBlocks = () => {
  return useMutation({
    mutationFn: generateBlocks,
  });
};
```

#### `/src/api/patient-summaries/queries.ts`
```typescript
// CRUD operations for patient summaries
export const createPatientSummary = async (data: CreatePatientSummaryInput) => {
  const response = await fetch('/api/patient-summaries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create patient summary');
  return response.json();
};

export const updatePatientSummaryBlocks = async (id: string, blocks: Block[]) => {
  const response = await fetch(`/api/patient-summaries/${id}/blocks`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks }),
  });
  if (!response.ok) throw new Error('Failed to update blocks');
  return response.json();
};

export const getPatientSummary = async (id: string) => {
  const response = await fetch(`/api/patient-summaries/${id}`);
  if (!response.ok) throw new Error('Failed to fetch patient summary');
  return response.json();
};

export const listPatientSummaries = async (patientId?: string) => {
  const params = patientId ? `?patientId=${patientId}` : '';
  const response = await fetch(`/api/patient-summaries${params}`);
  if (!response.ok) throw new Error('Failed to fetch patient summaries');
  return response.json();
};
```

#### `/src/api/patient-summaries/hooks.ts`
```typescript
export const useCreatePatientSummary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPatientSummary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-summaries'] });
    },
  });
};

export const useUpdatePatientSummaryBlocks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, blocks }: { id: string; blocks: Block[] }) => 
      updatePatientSummaryBlocks(id, blocks),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['patient-summaries', id] });
    },
  });
};

export const usePatientSummary = (id: string) => {
  return useQuery({
    queryKey: ['patient-summaries', id],
    queryFn: () => getPatientSummary(id),
    enabled: !!id,
  });
};

export const usePatientSummaries = (patientId?: string) => {
  return useQuery({
    queryKey: ['patient-summaries', { patientId }],
    queryFn: () => listPatientSummaries(patientId),
  });
};
```

### 5. LangChain Prompt Template

```typescript
const systemPrompt = `You are a medical AI assistant that transforms discharge summaries into patient-friendly blocks.

Your task is to extract and organize information into structured blocks that patients can easily understand and act upon.

Block Types Available:
1. medication - List all medications with clear instructions
2. task - Recovery tasks and self-care instructions  
3. redFlag - Warning symptoms that require immediate medical attention
4. appointment - Follow-up appointments and clinic visits
5. text - Additional important information

Guidelines:
- Use simple, patient-friendly language
- Be specific about dosages, frequencies, and durations
- Prioritize tasks by importance (high/medium/low)
- Include all follow-up appointments mentioned
- Extract ALL warning symptoms/red flags
- Group medications by status (new/changed/unchanged/stopped)
- Set dueDate for tasks as ISO strings relative to today when timeframes are mentioned

Output Format:
- Return a root object with 'blocks' array and 'metadata' object
- Order blocks by importance: redFlag, medication, appointment, task, text
- Each block should have type, title, isEditable, isRequired, and data fields
- Ensure all medical terms are explained in simple language`;

const userPrompt = `Extract structured blocks from this discharge summary:

{dischargeSummary}

Transform this into patient-friendly blocks that help the patient understand:
1. What medications to take and how
2. What they need to do for recovery
3. When to seek immediate help
4. What appointments they need to attend

Return a JSON object with:
- blocks: array of block objects
- metadata: object with patientName, dischargeDate, primaryDiagnosis (if found)`;
```

### 6. Implementation Flow

1. **Database Setup**
   - Create patient_summaries table
   - Set up RLS policies
   - Create indexes for performance

2. **API Implementation**
   - Block generation endpoint with LangChain
   - CRUD endpoints for patient summaries
   - Block update endpoints

3. **React Query Integration**
   - Create query/mutation hooks
   - Add to existing query structure

4. **UI Integration**
   - Update handleGenerate in composer page
   - Integrate with block update logic
   - Add loading states and error handling

5. **Testing Considerations**
   - Unit tests for block generation logic
   - Integration tests for API endpoints
   - E2E tests for full workflow

## Next Steps

1. Create database migration for patient_summaries table
2. Implement block generation API endpoint
3. Create CRUD API endpoints
4. Add React Query hooks
5. Update composer page to use new APIs
6. Add error handling and validation
7. Test with various discharge summary formats