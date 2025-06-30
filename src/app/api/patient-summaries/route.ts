import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/libs/supabase-server';

export const dynamic = 'force-dynamic';

// Zod schema for creating patient summaries
const createPatientSummarySchema = z.object({
  patient_id: z.string().uuid(),
  blocks: z.array(z.any()), // Block array - will be validated against Block type
  discharge_text: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

// Zod schema for query parameters
const listQuerySchema = z.object({
  patientId: z.string().uuid().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
});

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const { patientId, status, limit = 50, offset = 0 } = listQuerySchema.parse(queryParams);

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('patient_summaries')
      .select(`
        id,
        patient_id,
        doctor_id,
        patient_user_id,
        blocks,
        discharge_text,
        status,
        created_at,
        updated_at,
        patients (
          id,
          name,
          age,
          sex
        )
      `)
      .eq('doctor_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching patient summaries:', error);
      return Response.json({ error: 'Failed to fetch patient summaries' }, { status: 500 });
    }

    return Response.json({ summaries: data || [] });
  } catch (error) {
    console.error('Error in GET /api/patient-summaries:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { patient_id, blocks, discharge_text, status } = createPatientSummarySchema.parse(body);

    const supabase = createServerSupabaseClient();

    // Verify that the patient belongs to the current user
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patient_id)
      .eq('user_id', user.id)
      .single();

    if (patientError || !patient) {
      return Response.json({ error: 'Patient not found or access denied' }, { status: 404 });
    }

    // Create the patient summary
    const { data, error } = await supabase
      .from('patient_summaries')
      .insert({
        patient_id,
        doctor_id: user.id,
        blocks,
        discharge_text,
        status,
      })
      .select(`
        id,
        patient_id,
        doctor_id,
        patient_user_id,
        blocks,
        discharge_text,
        status,
        created_at,
        updated_at,
        patients (
          id,
          name,
          age,
          sex
        )
      `)
      .single();

    if (error) {
      console.error('Error creating patient summary:', error);
      return Response.json({ error: 'Failed to create patient summary' }, { status: 500 });
    }

    return Response.json({ summary: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }

    console.error('Error in POST /api/patient-summaries:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
