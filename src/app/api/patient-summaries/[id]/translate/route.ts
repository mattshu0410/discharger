import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createAccessKeySupabaseClient } from '@/libs/supabase-access-key';
import { createServerSupabaseClient } from '@/libs/supabase-server';
import { translationService } from '@/libs/translationService';

export const dynamic = 'force-dynamic';

// Zod schema for translation request body
const translateRequestSchema = z.object({
  target_locale: z.enum(['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar']),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  console.warn('[DEBUG] POST /api/patient-summaries/[id]/translate endpoint hit');
  console.warn('[DEBUG] Request URL:', req.url);
  console.warn('[DEBUG] Request method:', req.method);

  try {
    const { id: patientSummaryId } = await params;
    console.warn('[DEBUG] Patient Summary ID from params:', patientSummaryId);

    const body = await req.json();
    console.warn('[DEBUG] Request body received:', body);

    // Parse request body
    const { target_locale } = translateRequestSchema.parse(body);

    // Get access key from URL parameters
    const url = new URL(req.url);
    const access_key = url.searchParams.get('access_key');

    console.warn('[DEBUG] Parsed and validated:', {
      target_locale,
      has_access_key: !!access_key,
      access_key_length: access_key?.length,
    });

    // Determine which client to use
    let supabase;

    // Try Clerk auth first
    try {
      const user = await currentUser();
      if (user) {
        ;
        // Use standard authenticated client
        supabase = createServerSupabaseClient();
      }
    } catch (error) {
      console.warn('[DEBUG] Clerk auth failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    // If no Clerk auth and access key provided, use access key client
    if (!supabase && access_key) {
      ;
      supabase = createAccessKeySupabaseClient(access_key);
    }

    ;

    // If no auth method available, return unauthorized
    if (!supabase) {
      ;
      return Response.json({ error: 'Unauthorized - authentication required' }, { status: 401 });
    }

    ;
    // Now we can query with RLS policies handling the access control
    const { data: summary, error: summaryError } = await supabase
      .from('patient_summaries')
      .select('id, blocks, preferred_locale')
      .eq('id', patientSummaryId)
      .single();

    console.warn('[DEBUG] Patient summary query result:', {
      hasData: !!summary,
      error: summaryError?.message,
      summaryId: summary?.id,
    });

    if (summaryError || !summary) {
      ;
      // RLS policies will return no data if access is denied
      return Response.json({ error: 'Patient summary not found or access denied' }, { status: 404 });
    }

    ;
    // Check if translation already exists
    const { data: existingTranslation, error: existingError } = await supabase
      .from('summary_translations')
      .select('id')
      .eq('patient_summary_id', patientSummaryId)
      .eq('locale', target_locale)
      .single();

    console.warn('[DEBUG] Existing translation check:', {
      exists: !!existingTranslation,
      error: existingError?.message,
    });

    if (existingTranslation) {
      ;
      return Response.json({ error: 'Translation already exists for this locale' }, { status: 409 });
    }

    ;
    // Translate the blocks using the translation service
    const translatedBlocks = await translationService.translateBlocks(
      summary.blocks,
      target_locale,
      summary.preferred_locale as any, // Source locale from patient summary
    );
    ;

    ;
    // Create the translation - RLS policies will handle access control
    const { data: translation, error } = await supabase
      .from('summary_translations')
      .insert({
        patient_summary_id: patientSummaryId,
        locale: target_locale,
        translated_blocks: translatedBlocks,
      })
      .select('*')
      .single();

    if (error) {
      console.error('[DEBUG] Error creating translation:', error);
      return Response.json({ error: 'Failed to create translation' }, { status: 500 });
    }

    ;
    return Response.json({ translation }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      ;
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }

    console.error('[DEBUG] Unexpected error in translate endpoint:', error);
    console.error('[DEBUG] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
