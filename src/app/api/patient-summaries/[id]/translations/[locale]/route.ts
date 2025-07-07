import { currentUser } from '@clerk/nextjs/server';
import { createAccessKeySupabaseClient } from '@/libs/supabase-access-key';
import { createServerSupabaseClient } from '@/libs/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string; locale: string }> }) {
  try {
    const { id: patientSummaryId, locale } = await params;
    const url = new URL(req.url);
    const accessKey = url.searchParams.get('access_key');

    // Determine which client to use
    let supabase;

    // Try Clerk auth first
    try {
      const user = await currentUser();
      if (user) {
        supabase = createServerSupabaseClient();
      }
    } catch {
      // No Clerk auth
    }

    // If no Clerk auth and access key provided, use access key client
    if (!supabase && accessKey) {
      supabase = createAccessKeySupabaseClient(accessKey);
    }

    // If no auth method available, return unauthorized
    if (!supabase) {
      return Response.json({ error: 'Unauthorized - authentication required' }, { status: 401 });
    }

    // Get the specific translation - RLS policies handle access control
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
