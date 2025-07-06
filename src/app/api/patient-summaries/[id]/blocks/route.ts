import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/libs/supabase-server';

export const dynamic = 'force-dynamic';

// Zod schema for updating blocks
const updateBlocksSchema = z.object({
  blocks: z.array(z.any()), // Block array - will be validated against Block type
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await currentUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { blocks } = updateBlocksSchema.parse(body);

    const supabase = createServerSupabaseClient();

    // First verify the summary exists and user has access
    const { data: existingSummary, error: fetchError } = await supabase
      .from('patient_summaries')
      .select('id, doctor_id, patient_user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingSummary) {
      return Response.json({ error: 'Patient summary not found' }, { status: 404 });
    }

    // Check access permissions - only doctors can edit for now
    if (existingSummary.doctor_id !== user.id) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update only the blocks
    const { data, error } = await supabase
      .from('patient_summaries')
      .update({
        blocks,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
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
      console.error('Error updating patient summary blocks:', error);
      return Response.json({ error: 'Failed to update blocks' }, { status: 500 });
    }

    return Response.json({ summary: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }

    console.error('Error in PATCH /api/patient-summaries/[id]/blocks:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
