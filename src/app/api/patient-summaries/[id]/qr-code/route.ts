import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AccessKeyRoleSchema } from '@/api/patient-access-keys/types';
import { logger } from '@/libs/Logger';
import { generateAccessKey } from '@/libs/patient-access';
import { createServerSupabaseClient } from '@/libs/supabase-server';

const QRCodeSchema = z.object({
  role: AccessKeyRoleSchema,
});

/**
 * POST /api/patient-summaries/[id]/qr-code
 * Generate QR code access link for a patient summary
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: summaryId } = await params;
    const body = await request.json();

    // Validate request
    const validation = QRCodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid request' },
        { status: 400 },
      );
    }

    const { role } = validation.data;
    const supabase = createServerSupabaseClient();

    // Verify the summary belongs to the authenticated user
    const { data: summary, error: summaryError } = await supabase
      .from('patient_summaries')
      .select('id, doctor_id')
      .eq('id', summaryId)
      .eq('doctor_id', userId)
      .single();

    if (summaryError || !summary) {
      logger.warn('Unauthorized access to patient summary for QR code', { summaryId, userId });
      return NextResponse.json({ error: 'Summary not found' }, { status: 404 });
    }

    // Generate access key and URL (without phone number for QR codes)
    const accessResult = await generateAccessKey(
      {
        summaryId,
        role,
      },
      request,
    );

    if (!accessResult.success) {
      return NextResponse.json({ error: accessResult.error }, { status: 500 });
    }

    logger.info('QR code access link generated successfully', {
      summaryId,
      role,
      userId,
    });

    return NextResponse.json({
      success: true,
      access_url: accessResult.accessUrl,
      access_key: accessResult.accessKey,
    });
  } catch (error) {
    logger.error('QR code generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
