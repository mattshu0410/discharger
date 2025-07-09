import type {
  CreatePatientSummaryInput,
  ListPatientSummariesParams,
  ListPatientSummariesResponse,
  PatientSummary,
  PatientSummaryResponse,
  SummaryTranslation,
  SupportedLocale,
  TranslateRequest,
  TranslationResponse,
  UpdatePatientSummaryInput,
} from './types';
import type { Block } from '@/types/blocks';
// import { logger } from '@/libs/Logger';

// Create new patient summary
export const createPatientSummary = async (data: CreatePatientSummaryInput): Promise<PatientSummary> => {
  const response = await fetch('/api/patient-summaries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create patient summary');
  }

  const result: PatientSummaryResponse = await response.json();
  return result.summary;
};

// List patient summaries
export const listPatientSummaries = async (params: ListPatientSummariesParams = {}): Promise<ListPatientSummariesResponse> => {
  const searchParams = new URLSearchParams();

  if (params.patientId) {
    searchParams.append('patientId', params.patientId);
  }
  if (params.status) {
    searchParams.append('status', params.status);
  }
  if (params.limit) {
    searchParams.append('limit', params.limit.toString());
  }
  if (params.offset) {
    searchParams.append('offset', params.offset.toString());
  }

  const response = await fetch(`/api/patient-summaries?${searchParams.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch patient summaries');
  }

  const result: ListPatientSummariesResponse = await response.json();
  return result;
};

// Get single patient summary
export const getPatientSummary = async (id: string, options?: { accessKey?: string }): Promise<PatientSummary> => {
  const url = new URL(`/api/patient-summaries/${id}/summary`, window.location.origin);

  if (options?.accessKey) {
    url.searchParams.append('access_key', options.accessKey);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch patient summary');
  }

  const result: PatientSummaryResponse = await response.json();
  return result.summary;
};

// Update patient summary
export const updatePatientSummary = async (id: string, data: UpdatePatientSummaryInput): Promise<PatientSummary> => {
  const response = await fetch(`/api/patient-summaries/${id}/summary`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update patient summary');
  }

  const result: PatientSummaryResponse = await response.json();
  return result.summary;
};

// Update patient summary blocks only
export const updatePatientSummaryBlocks = async (id: string, blocks: Block[]): Promise<PatientSummary> => {
  const response = await fetch(`/api/patient-summaries/${id}/blocks`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update blocks');
  }

  const result: PatientSummaryResponse = await response.json();
  return result.summary;
};

// Delete patient summary
export const deletePatientSummary = async (id: string): Promise<void> => {
  const response = await fetch(`/api/patient-summaries/${id}/summary`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete patient summary');
  }
};

// Get translation for patient summary
export const getPatientSummaryTranslation = async (
  patientSummaryId: string,
  locale: SupportedLocale,
  accessKey?: string,
): Promise<SummaryTranslation> => {
  const url = new URL(`/api/patient-summaries/${patientSummaryId}/translations/${locale}`, window.location.origin);

  // Add access key as query parameter if provided
  if (accessKey) {
    url.searchParams.set('access_key', accessKey);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch translation');
  }

  const result: TranslationResponse = await response.json();
  return result.translation;
};

// Create or update translation for patient summary
export const translatePatientSummary = async (data: TranslateRequest): Promise<SummaryTranslation> => {
  // logger.debug('translatePatientSummary called with:', {
  //   patient_summary_id: data.patient_summary_id,
  //   target_locale: data.target_locale,
  //   has_access_key: !!data.access_key,
  //   access_key_length: data.access_key?.length,
  // });

  const requestBody = { target_locale: data.target_locale };

  // Build URL with access key as query parameter if provided (for public access)
  const url = new URL(`/api/patient-summaries/${data.patient_summary_id}/translate`, window.location.origin);
  if (data.access_key) {
    url.searchParams.set('access_key', data.access_key);
    // logger.debug('Access key included in URL params');
  }

  // logger.debug('Making POST request to:', url.toString());
  // logger.debug('Request body:', requestBody);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  // logger.debug('Response status:', response.status, response.statusText);
  // logger.debug('Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    // logger.debug('Response not OK, attempting to parse error...');
    try {
      const error = await response.json();
      // logger.debug('Parsed error response:', error);
      throw new Error(error.error || 'Failed to translate patient summary');
    } catch {
      // logger.debug('Failed to parse error as JSON, getting text...');
      // logger.debug('Raw error response:', `${text.substring(0, 500)}...`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  // logger.debug('Translation successful, parsing response...');
  const result: TranslationResponse = await response.json();
  // logger.debug('Translation result:', { translationId: result.translation?.id });
  return result.translation;
};

// List available translations for patient summary
export const listPatientSummaryTranslations = async (
  patientSummaryId: string,
  accessKey?: string,
): Promise<SummaryTranslation[]> => {
  const url = new URL(`/api/patient-summaries/${patientSummaryId}/translations`, window.location.origin);

  // Add access key as query parameter if provided
  if (accessKey) {
    url.searchParams.set('access_key', accessKey);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch translations');
  }

  const result: { translations: SummaryTranslation[] } = await response.json();
  return result.translations;
};

// Update patient summary locale preference
export const updatePatientSummaryLocale = async (
  id: string,
  locale: SupportedLocale,
): Promise<PatientSummary> => {
  const response = await fetch(`/api/patient-summaries/${id}/locale`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferred_locale: locale }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update locale preference');
  }

  const result: PatientSummaryResponse = await response.json();
  return result.summary;
};
