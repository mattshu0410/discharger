import { currentUser } from '@clerk/nextjs/server';
import { createAccessKeySupabaseClient } from '@/libs/supabase-access-key';
import { createServerSupabaseClient } from '@/libs/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: patientSummaryId } = await params;
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

    // Get all translations for this patient summary - RLS policies handle access control
    const { data: translations, error } = await supabase
      .from('summary_translations')
      .select('*')
      .eq('patient_summary_id', patientSummaryId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching translations:', error);
      return Response.json({ error: 'Failed to fetch translations' }, { status: 500 });
    }

    return Response.json({ translations: translations || [] });
  } catch (error) {
    console.error('Error in GET /api/patient-summaries/[id]/translations:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
