import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/libs/supabase-server';
import { translationService } from '@/libs/translationService';

export const dynamic = 'force-dynamic';

// Zod schema for translation request
const translateRequestSchema = z.object({
  target_locale: z.enum(['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar']),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: patientSummaryId } = await params;
    const user = await currentUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { target_locale } = translateRequestSchema.parse(body);

    const supabase = createServerSupabaseClient();

    // First verify the user has access to the patient summary and get the blocks
    const { data: summary, error: summaryError } = await supabase
      .from('patient_summaries')
      .select('id, doctor_id, patient_user_id, blocks, preferred_locale')
      .eq('id', patientSummaryId)
      .single();

    if (summaryError || !summary) {
      return Response.json({ error: 'Patient summary not found' }, { status: 404 });
    }

    // Check access permissions - both doctors and patients can create translations
    const hasAccess = summary.doctor_id === user.id || summary.patient_user_id === user.id;
    if (!hasAccess) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if translation already exists
    const { data: existingTranslation } = await supabase
      .from('summary_translations')
      .select('id')
      .eq('patient_summary_id', patientSummaryId)
      .eq('locale', target_locale)
      .single();

    if (existingTranslation) {
      return Response.json({ error: 'Translation already exists for this locale' }, { status: 409 });
    }

    // Translate the blocks using the translation service
    const translatedBlocks = await translationService.translateBlocks(
      summary.blocks,
      target_locale,
      summary.preferred_locale as any, // Source locale from patient summary
    );

    // Create the translation
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
      console.error('Error creating translation:', error);
      return Response.json({ error: 'Failed to create translation' }, { status: 500 });
    }

    return Response.json({ translation }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }

    console.error('Error in POST /api/patient-summaries/[id]/translate:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
