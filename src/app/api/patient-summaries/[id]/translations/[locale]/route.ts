import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/libs/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; locale: string }> }) {
  try {
    const { id: patientSummaryId, locale } = await params;
    const user = await currentUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Check access permissions
    const hasAccess = summary.doctor_id === user.id || summary.patient_user_id === user.id;
    if (!hasAccess) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get the specific translation
    const { data: translation, error } = await supabase
      .from('summary_translations')
      .select('*')
      .eq('patient_summary_id', patientSummaryId)
      .eq('locale', locale)
      .single();

    if (error) {
      console.error('Error fetching translation:', error);
      return Response.json({ error: 'Translation not found' }, { status: 404 });
    }

    return Response.json({ translation });
  } catch (error) {
    console.error('Error in GET /api/patient-summaries/[id]/translations/[locale]:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
