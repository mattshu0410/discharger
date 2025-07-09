import type { NextRequest } from 'next/server';
import { logger } from '@/libs/Logger';
import { createServerSupabaseClient } from '@/libs/supabase-server';

export type AccessKeyOptions = {
  summaryId: string;
  role: 'patient' | 'caregiver';
  phoneNumber?: string;
};

export type AccessKeyResult = {
  success: true;
  accessKey: string;
  accessUrl: string;
} | {
  success: false;
  error: string;
};

/**
 * Generate or retrieve an access key and URL for a patient summary
 * Can be used for both SMS (with phone number) and QR codes (without phone number)
 */
export async function generateAccessKey(
  options: AccessKeyOptions,
  request: NextRequest,
): Promise<AccessKeyResult> {
  try {
    const { summaryId, role, phoneNumber } = options;
    const supabase = createServerSupabaseClient();

    // Create or get existing access key
    let accessKey;

    if (phoneNumber) {
      // For SMS - check for existing key by phone number
      const { data: existingKey, error: existingError } = await supabase
        .from('patient_access_keys')
        .select('*')
        .eq('summary_id', summaryId)
        .eq('phone_number', phoneNumber)
        .eq('is_active', true)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        logger.error('Error checking existing access key:', existingError);
        return { success: false, error: 'Database error' };
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
            return { success: false, error: 'Failed to update access key' };
          }
          accessKey = updatedKey;
        } else {
          accessKey = existingKey;
        }
      } else {
        // Create new access key with phone number
        const { data: newKey, error: createError } = await supabase
          .from('patient_access_keys')
          .insert({
            summary_id: summaryId,
            phone_number: phoneNumber,
            role,
          })
          .select()
          .single();

        if (createError) {
          logger.error('Error creating access key:', createError);
          return { success: false, error: 'Failed to create access key' };
        }
        accessKey = newKey;
      }
    } else {
      // For QR codes - always create a new key without phone number
      const { data: newKey, error: createError } = await supabase
        .from('patient_access_keys')
        .insert({
          summary_id: summaryId,
          role,
        })
        .select()
        .single();

      if (createError) {
        logger.error('Error creating access key for QR:', createError);
        logger.debug(createError);
        return { success: false, error: 'Failed to create access key' };
      }
      accessKey = newKey;
    }

    // Generate access URL
    const baseUrl = process.env.NODE_ENV === 'production'
      ? `https://${request.headers.get('host')}`
      : 'http://localhost:3000';

    const accessUrl = `${baseUrl}/patient/${summaryId}?access=${accessKey.access_key}`;

    return {
      success: true,
      accessKey: accessKey.access_key,
      accessUrl,
    };
  } catch (error) {
    logger.error('Error generating access key:', error);
    return { success: false, error: 'Internal server error' };
  }
}
