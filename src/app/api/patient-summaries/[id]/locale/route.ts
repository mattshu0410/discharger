import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/libs/supabase-server';

export const dynamic = 'force-dynamic';

// Zod schema for locale update
const updateLocaleSchema = z.object({
  preferred_locale: z.enum(['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar']),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: patientSummaryId } = await params;
    const user = await currentUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { preferred_locale } = updateLocaleSchema.parse(body);

    const supabase = createServerSupabaseClient();

    // First verify the user has access to the patient summary
    const { data: summary, error: summaryError } = await supabase
      .from('patient_summaries')
      .select('id, doctor_id, patient_user_id')
      .eq('id', patientSummaryId)
      .single();

    if (summaryError || !summary) {
      return Response.json({ error: 'Patient summary not found' }, { status: 404 });
    }

    // Check access permissions - both doctors and patients can update locale preference
    const hasAccess = summary.doctor_id === user.id || summary.patient_user_id === user.id;
    if (!hasAccess) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update the locale preference
    const { data, error } = await supabase
      .from('patient_summaries')
      .update({
        preferred_locale,
        updated_at: new Date().toISOString(),
      })
      .eq('id', patientSummaryId)
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
      console.error('Error updating locale preference:', error);
      return Response.json({ error: 'Failed to update locale preference' }, { status: 500 });
    }

    return Response.json({ summary: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }

    console.error('Error in PATCH /api/patient-summaries/[id]/locale:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
