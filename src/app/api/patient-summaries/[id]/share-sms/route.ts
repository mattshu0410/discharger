import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { SendSMSSchema } from '@/api/patient-access-keys/types';
import { logger } from '@/libs/Logger';
import { generateAccessKey } from '@/libs/patient-access';
import { createServerSupabaseClient } from '@/libs/supabase-server';
import { twilioService } from '@/libs/twilio';

/**
 * POST /api/patient-summaries/[id]/share-sms
 * Send SMS with access link to a phone number
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
    const validation = SendSMSSchema.safeParse({
      summary_id: summaryId,
      ...body,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid request' },
        { status: 400 },
      );
    }

    const { phone_number, role, patient_name } = validation.data;
    const supabase = createServerSupabaseClient();

    // Verify the summary belongs to the authenticated user
    const { data: summary, error: summaryError } = await supabase
      .from('patient_summaries')
      .select('id, doctor_id')
      .eq('id', summaryId)
      .eq('doctor_id', userId)
      .single();

    if (summaryError || !summary) {
      logger.warn('Unauthorized access to patient summary for SMS', { summaryId, userId });
      return NextResponse.json({ error: 'Summary not found' }, { status: 404 });
    }

    // Validate phone number format
    const formattedPhone = twilioService.validateAndFormatPhoneNumber(phone_number);
    if (!formattedPhone) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // Generate access key and URL
    const accessResult = await generateAccessKey(
      {
        summaryId,
        role,
        phoneNumber: formattedPhone,
      },
      request,
    );

    if (!accessResult.success) {
      return NextResponse.json({ error: accessResult.error }, { status: 500 });
    }

    const { accessUrl } = accessResult;

    // Send SMS
    const smsResult = await twilioService.sendPatientAccessSMS(
      formattedPhone,
      patient_name,
      accessUrl,
      role,
    );

    if (!smsResult.success) {
      logger.error('Failed to send SMS:', smsResult.error);
      return NextResponse.json(
        { error: smsResult.error || 'Failed to send SMS' },
        { status: 500 },
      );
    }

    logger.info('SMS sent successfully', {
      summaryId,
      phone: formattedPhone,
      role,
      messageId: smsResult.messageId,
      userId,
    });

    return NextResponse.json({
      success: true,
      message_id: smsResult.messageId,
      access_url: accessUrl,
    });
  } catch (error) {
    logger.error('SMS sharing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
