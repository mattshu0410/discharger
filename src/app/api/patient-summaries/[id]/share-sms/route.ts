import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { SendSMSSchema } from '@/api/patient-access-keys/types';
import { logger } from '@/libs/Logger';
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

    // Create or get existing access key
    let accessKey;
    const { data: existingKey, error: existingError } = await supabase
      .from('patient_access_keys')
      .select('*')
      .eq('summary_id', summaryId)
      .eq('phone_number', formattedPhone)
      .eq('is_active', true)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      logger.error('Error checking existing access key for SMS:', existingError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (existingKey) {
      // Update role if different
      if (existingKey.role !== role) {
        const { data: updatedKey, error: updateError } = await supabase
          .from('patient_access_keys')
          .update({ role })
          .eq('id', existingKey.id)
          .select()
          .single();

        if (updateError) {
          logger.error('Error updating access key role for SMS:', updateError);
          return NextResponse.json({ error: 'Failed to update access key' }, { status: 500 });
        }
        accessKey = updatedKey;
      } else {
        accessKey = existingKey;
      }
    } else {
      // Create new access key
      const { data: newKey, error: createError } = await supabase
        .from('patient_access_keys')
        .insert({
          summary_id: summaryId,
          phone_number: formattedPhone,
          role,
        })
        .select()
        .single();

      if (createError) {
        logger.error('Error creating access key for SMS:', createError);
        return NextResponse.json({ error: 'Failed to create access key' }, { status: 500 });
      }
      accessKey = newKey;
    }

    // Generate access URL
    const baseUrl = process.env.NODE_ENV === 'production'
      ? `https://${request.headers.get('host')}`
      : 'http://localhost:3000';

    const accessUrl = `${baseUrl}/patient/${summaryId}?access=${accessKey.access_key}`;

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
