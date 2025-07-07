import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/libs/supabase-server';

export const dynamic = 'force-dynamic';

// Zod schema for updating patient summaries
const updatePatientSummarySchema = z.object({
  blocks: z.array(z.any()).optional(), // Block array - will be validated against Block type
  discharge_text: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  patient_user_id: z.string().optional(), // For when patient authentication is implemented
  preferred_locale: z.string().optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await currentUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('patient_summaries')
      .select(`
        id,
        patient_id,
        doctor_id,
        patient_user_id,
        blocks,
        discharge_text,
        status,
        preferred_locale,
        created_at,
        updated_at,
        patients (
          id,
          name,
          age,
          sex
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching patient summary:', error);
      return Response.json({ error: 'Patient summary not found' }, { status: 404 });
    }

    // Check access permissions
    const hasAccess = data.doctor_id === user.id || data.patient_user_id === user.id;
    if (!hasAccess) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    return Response.json({ summary: data });
  } catch (error) {
    console.error('Error in GET /api/patient-summaries/[id]:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await currentUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const updates = updatePatientSummarySchema.parse(body);

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

    // If blocks are being updated, delete all existing translations
    if (updates.blocks) {
      const { error: deleteError } = await supabase
        .from('summary_translations')
        .delete()
        .eq('patient_summary_id', id);

      if (deleteError) {
        console.error('Error deleting translations:', deleteError);
        // Continue with update even if translation deletion fails
      }
    }

    // Update the summary
    const { data, error } = await supabase
      .from('patient_summaries')
      .update({
        ...updates,
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
        preferred_locale,
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
      console.error('Error updating patient summary:', error);
      return Response.json({ error: 'Failed to update patient summary' }, { status: 500 });
    }

    return Response.json({ summary: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }

    console.error('Error in PATCH /api/patient-summaries/[id]:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await currentUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();

    // First verify the summary exists and user has access
    const { data: existingSummary, error: fetchError } = await supabase
      .from('patient_summaries')
      .select('id, doctor_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingSummary) {
      return Response.json({ error: 'Patient summary not found' }, { status: 404 });
    }

    // Check access permissions - only doctors can delete
    if (existingSummary.doctor_id !== user.id) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete the summary
    const { error } = await supabase
      .from('patient_summaries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting patient summary:', error);
      return Response.json({ error: 'Failed to delete patient summary' }, { status: 500 });
    }

    return Response.json({ message: 'Patient summary deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/patient-summaries/[id]:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
