import type {
  CreatePatientSummaryInput,
  ListPatientSummariesParams,
  ListPatientSummariesResponse,
  PatientSummary,
  PatientSummaryResponse,
  UpdatePatientSummaryInput,
} from './types';
import type { Block } from '@/types/blocks';

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
export const getPatientSummary = async (id: string): Promise<PatientSummary> => {
  const response = await fetch(`/api/patient-summaries/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch patient summary');
  }

  const result: PatientSummaryResponse = await response.json();
  return result.summary;
};

// Update patient summary
export const updatePatientSummary = async (id: string, data: UpdatePatientSummaryInput): Promise<PatientSummary> => {
  const response = await fetch(`/api/patient-summaries/${id}`, {
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
  const response = await fetch(`/api/patient-summaries/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete patient summary');
  }
};
