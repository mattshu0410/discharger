import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { CreateAccessKeySchema } from '@/api/patient-access-keys/types';
import { logger } from '@/libs/Logger';
import { createServerSupabaseClient } from '@/libs/supabase-server';
import { twilioService } from '@/libs/twilio';

/**
 * GET /api/patient-summaries/[id]/access-keys
 * Get all access keys for a patient summary
 */
export async function GET(
  { params }: { params: { id: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: summaryId } = await params;
    const supabase = createServerSupabaseClient();

    // Verify the summary belongs to the authenticated user
    const { data: summary, error: summaryError } = await supabase
      .from('patient_summaries')
      .select('id, doctor_id')
      .eq('id', summaryId)
      .eq('doctor_id', userId)
      .single();

    if (summaryError || !summary) {
      logger.warn('Unauthorized access to patient summary', { summaryId, userId });
      return NextResponse.json({ error: 'Summary not found' }, { status: 404 });
    }

    // Get access keys (RLS will automatically filter for this doctor's summaries)
    const { data: accessKeys, error } = await supabase
      .from('patient_access_keys')
      .select('*')
      .eq('summary_id', summaryId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch access keys:', error);
      return NextResponse.json({ error: 'Failed to fetch access keys' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      access_keys: accessKeys,
    });
  } catch (error) {
    logger.error('Access keys GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/patient-summaries/[id]/access-keys
 * Create or retrieve an access key for a phone number and role
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: summaryId } = await params;
    const body = await request.json();

    // Validate request
    const validation = CreateAccessKeySchema.safeParse({
      summary_id: summaryId,
      ...body,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid request' },
        { status: 400 },
      );
    }

    const { phone_number, role } = validation.data;
    const supabase = createServerSupabaseClient();

    // Verify the summary belongs to the authenticated user
    const { data: summary, error: summaryError } = await supabase
      .from('patient_summaries')
      .select('id, doctor_id')
      .eq('id', summaryId)
      .eq('doctor_id', userId)
      .single();

    if (summaryError || !summary) {
      logger.warn('Unauthorized access to patient summary', { summaryId, userId });
      return NextResponse.json({ error: 'Summary not found' }, { status: 404 });
    }

    // Validate phone number format
    const formattedPhone = twilioService.validateAndFormatPhoneNumber(phone_number);
    if (!formattedPhone) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // Check if access key already exists for this phone number and summary
    const { data: existingKey, error: existingError } = await supabase
      .from('patient_access_keys')
      .select('*')
      .eq('summary_id', summaryId)
      .eq('phone_number', formattedPhone)
      .eq('is_active', true)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      logger.error('Error checking existing access key:', existingError);
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
          logger.error('Error updating access key role:', updateError);
          return NextResponse.json({ error: 'Failed to update access key' }, { status: 500 });
        }

        const baseUrl = process.env.NODE_ENV === 'production'
          ? `https://${request.headers.get('host')}`
          : 'http://localhost:3000';

        const accessUrl = `${baseUrl}/patient/${summaryId}?access=${updatedKey.access_key}`;

        return NextResponse.json({
          success: true,
          access_key: updatedKey,
          access_url: accessUrl,
          was_existing: true,
        });
      }

      // Return existing key
      const baseUrl = process.env.NODE_ENV === 'production'
        ? `https://${request.headers.get('host')}`
        : 'http://localhost:3000';

      const accessUrl = `${baseUrl}/patient/${summaryId}?access=${existingKey.access_key}`;

      return NextResponse.json({
        success: true,
        access_key: existingKey,
        access_url: accessUrl,
        was_existing: true,
      });
    }

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
      logger.error('Error creating access key:', createError);
      return NextResponse.json({ error: 'Failed to create access key' }, { status: 500 });
    }

    const baseUrl = process.env.NODE_ENV === 'production'
      ? `https://${request.headers.get('host')}`
      : 'http://localhost:3000';

    const accessUrl = `${baseUrl}/patient/${summaryId}?access=${newKey.access_key}`;

    logger.info('Access key created successfully', {
      summaryId,
      phone: formattedPhone,
      role,
      userId,
    });

    return NextResponse.json({
      success: true,
      access_key: newKey,
      access_url: accessUrl,
      was_existing: false,
    });
  } catch (error) {
    logger.error('Access keys POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
