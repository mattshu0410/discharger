import type {
  CreateAccessKeyRequest,
  CreateAccessKeyResponse,
  DeactivateAccessKeyRequest,
  DeactivateAccessKeyResponse,
  GenerateQRCodeRequest,
  GenerateQRCodeResponse,
  ListAccessKeysResponse,
  SendSMSRequest,
  SendSMSResponse,
} from './types';
// import { logger } from '@/libs/Logger';

/**
 * Get all access keys for a specific patient summary
 */
export async function getPatientAccessKeys(summaryId: string): Promise<ListAccessKeysResponse> {
  try {
    const response = await fetch(`/api/patient-summaries/${summaryId}/access-keys`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return {
        success: false,
        error: errorData || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      access_keys: data.access_keys,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch access keys',
    };
  }
}

/**
 * Create or retrieve an access key for a phone number and role
 */
export async function createAccessKey(request: CreateAccessKeyRequest): Promise<CreateAccessKeyResponse> {
  try {
    const response = await fetch(`/api/patient-summaries/${request.summary_id}/access-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: request.phone_number,
        role: request.role,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return {
        success: false,
        error: errorData || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      access_key: data.access_key,
      access_url: data.access_url,
      was_existing: data.was_existing,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create access key',
    };
  }
}

/**
 * Send SMS with access link
 */
export async function sendPatientAccessSMS(request: SendSMSRequest): Promise<SendSMSResponse> {
  try {
    const response = await fetch(`/api/patient-summaries/${request.summary_id}/share-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: request.phone_number,
        role: request.role,
        patient_name: request.patient_name,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return {
        success: false,
        error: errorData || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message_id: data.message_id,
      access_url: data.access_url,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS',
    };
  }
}

/**
 * Deactivate an access key
 */
export async function deactivateAccessKey(request: DeactivateAccessKeyRequest): Promise<DeactivateAccessKeyResponse> {
  try {
    const response = await fetch(`/api/patient-access-keys/${request.access_key_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return {
        success: false,
        error: errorData || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deactivate access key',
    };
  }
}

/**
 * Generate QR code access link
 */
export async function generateQRCode(request: GenerateQRCodeRequest): Promise<GenerateQRCodeResponse> {
  try {
    const response = await fetch(`/api/patient-summaries/${request.summary_id}/qr-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: request.role,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return {
        success: false,
        error: errorData || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      access_url: data.access_url,
      access_key: data.access_key,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate QR code',
    };
  }
}

/**
 * Get patient summary by access key (public endpoint)
 */
export async function getPatientSummaryByAccessKey(accessKey: string) {
  try {
    // logger.debug('Called getPatientSummaryByAccessKey', accessKey);
    const url = `/api/patient-summaries/access/${accessKey}`;
    // logger.debug('Making fetch request to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // logger.debug('Fetch response received:', response.status, response.ok);

    if (!response.ok) {
      const errorData = await response.text();
      // logger.debug('errorData', errorData);
      throw new Error(errorData || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to fetch patient summary');
  }
}
