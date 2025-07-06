import type { Block } from '@/types/blocks';

export type PatientSummary = {
  id: string;
  patient_id: string;
  doctor_id: string;
  patient_user_id?: string;
  blocks: Block[];
  discharge_text?: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  patients?: {
    id: string;
    name: string;
    age: number;
    sex: string;
  };
};

export type CreatePatientSummaryInput = {
  patient_id: string;
  blocks: Block[];
  discharge_text?: string;
  status?: 'draft' | 'published' | 'archived';
};

export type UpdatePatientSummaryInput = {
  blocks?: Block[];
  discharge_text?: string;
  status?: 'draft' | 'published' | 'archived';
  patient_user_id?: string;
};

export type ListPatientSummariesParams = {
  patientId?: string;
  status?: 'draft' | 'published' | 'archived';
  limit?: number;
  offset?: number;
};

export type ListPatientSummariesResponse = {
  summaries: PatientSummary[];
};

export type PatientSummaryResponse = {
  summary: PatientSummary;
};
